import { Pool, PoolClient } from 'pg';
import { LocationsService } from './locations.service';

export interface Balance {
  qty_plastic: number;
  qty_metal: number;
}

export interface Transaction {
  event_timestamp: Date;
  location_id: number;
  location_name: string;
  qty_plastic: number;
  qty_metal: number;
}

export interface TransactionHistory {
  balance_forward: Balance;
  transactions: Transaction[];
  balance_at_end: Balance;
  current_balance: Balance;
}

export class TransactionsService {
  private static async adjustLocationQty(
    client: PoolClient,
    location_id: number,
    qty_metal: number,
    qty_plastic: number
  ) {
    const updateLocationSQL =
      'UPDATE locations SET qty_metal = qty_metal + $1, qty_plastic = qty_plastic + $2 WHERE id = $3';
    await client.query(updateLocationSQL, [
      qty_metal,
      qty_plastic,
      location_id,
    ]);
  }

  private static async inventoryTransaction(
    pgPool: Pool,
    type: string,
    from_location_id: number,
    to_location_id: number,
    qty_metal: number,
    qty_plastic: number
  ) {
    const client: PoolClient = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const insertTransactionSQL =
        'INSERT INTO transactions(type, from_location_id, to_location_id, qty_metal, qty_plastic) VALUES ($1,$2,$3,$4,$5)';
      await client.query(insertTransactionSQL, [
        type,
        from_location_id,
        to_location_id,
        qty_metal,
        qty_plastic,
      ]);

      // Adjust inventory totals on each side
      await this.adjustLocationQty(
        client,
        from_location_id,
        -qty_metal,
        -qty_plastic
      );
      await this.adjustLocationQty(
        client,
        to_location_id,
        qty_metal,
        qty_plastic
      );

      // And finish
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  public static async checkoutContainer(
    pgPool: Pool,
    userId: string,
    qty: number,
    from_location_id: number
  ) {
    // Lookup from_location_id to make sure it's a valid food vendor
    const location = await LocationsService.locationbyId(
      pgPool,
      from_location_id
    );
    if (
      !location ||
      location.type !== 'food-vendor' ||
      location.requires_sub_location
    ) {
      throw new Error(
        `${from_location_id} is not a valid food vendor location`
      );
    }

    // Don't allow ridiculous qtys
    if (qty < 1 || qty > 10) {
      throw new Error(`Can only check out from 1-10 containers at a time`);
    }

    // And don't allow them to check out more than the food vendor has - not sure if this is OK
    const qtyField = `qty_${location.default_container_type}`;
    if (qty > location[qtyField]) {
      throw new Error(
        'You cannot get more dishes than the food vendor has on hand'
      );
    }
    const qty_plastic = qtyField === 'qty_plastic' ? qty : 0;
    const qty_metal = qtyField === 'qty_metal' ? qty : 0;

    const userRec = await LocationsService.locationByName(
      pgPool,
      'member',
      userId
    );
    const to_location_id = userRec.id;

    await this.inventoryTransaction(
      pgPool,
      'food-vendor_to_member',
      from_location_id,
      to_location_id,
      qty_metal,
      qty_plastic
    );
  }

  public static async returnContainer(
    pgPool: Pool,
    userId: string,
    qty_metal: number,
    qty_plastic: number,
    to_location_id: number
  ) {
    const location = await LocationsService.locationbyId(
      pgPool,
      to_location_id
    );
    if (!location || location.type !== 'dropoff-point') {
      throw new Error(`${to_location_id} is not a valid dropoff location`);
    }

    // Don't allow ridiculous qtys
    if (
      qty_metal < 0 ||
      qty_metal > 50 ||
      qty_plastic < 0 ||
      qty_plastic > 50 ||
      qty_plastic + qty_metal < 1
    ) {
      throw new Error(`Can only dropoff from 1-50 containers at a time`);
    }

    const userRec = await LocationsService.locationByName(
      pgPool,
      'member',
      userId
    );
    const from_location_id = userRec.id;

    // And don't allow them to return more than they have
    const member = await LocationsService.locationbyId(
      pgPool,
      from_location_id
    );
    if (qty_metal > member.qty_metal || qty_plastic > member.qty_plastic) {
      throw new Error('You cannot return more dishes than you have');
    }

    await this.inventoryTransaction(
      pgPool,
      'member_to_dropoff-point',
      from_location_id,
      to_location_id,
      qty_metal,
      qty_plastic
    );
  }

  private static async computedBalance(
    pgPool: Pool,
    location_id: number,
    from: Date,
    to: Date
  ): Promise<Balance> {
    const sql = `
      WITH
        all_trx AS (
          SELECT
            event_timestamp,
            -qty_metal AS qm,
            -qty_plastic AS qp
          FROM
            transactions
          WHERE from_location_id = $1
          UNION ALL
          SELECT
            event_timestamp,
            qty_metal AS qm,
            qty_plastic AS qp
          FROM
            transactions
          WHERE to_location_id = $1
        )
      SELECT
        SUM(qm) AS qty_metal,
        SUM(qp) AS qty_plastic
      FROM
        all_trx
      WHERE
        event_timestamp BETWEEN $2 AND $3
    `;
    const recs = await pgPool.query(sql, [location_id, from, to]);
    return recs.rows[0] || null;
  }

  private static async computedTransactions(
    pgPool: Pool,
    location_id: number,
    from: Date,
    to: Date
  ): Promise<Transaction[]> {
    const sql = `
      WITH
        all_trx AS (
          SELECT
            event_timestamp,
            to_location_id as location_id,
            -qty_metal AS qm,
            -qty_plastic AS qp
          FROM
            transactions
          WHERE from_location_id = $1
          UNION ALL
          SELECT
            event_timestamp,
            from_location_id as location_id,
            qty_metal AS qm,
            qty_plastic AS qp
          FROM
            transactions
          WHERE to_location_id = $1
        )
      SELECT
        t.event_timestamp,
        t.location_id,
        loc.full_name as location_name,
        t.qm as qty_metal,
        t.qp as qty_plastic
      FROM
        all_trx t
        INNER JOIN locations loc ON t.location_id = loc.id
      WHERE
        event_timestamp BETWEEN $2 AND $3
      ORDER BY
        event_timestamp;
      `;
    const recs = await pgPool.query(sql, [location_id, from, to]);
    return recs.rows;
  }

  public static async getHistory(
    pgPool: Pool,
    location_id: number,
    from: Date,
    to: Date
  ): Promise<TransactionHistory> {
    const balance_forward = await this.computedBalance(
      pgPool,
      location_id,
      new Date('1970-01-01'),
      from
    );
    const transactions = await this.computedTransactions(
      pgPool,
      location_id,
      from,
      to
    );
    const balance_at_end = await this.computedBalance(
      pgPool,
      location_id,
      new Date('1970-01-01'),
      to
    );
    const location = await LocationsService.locationbyId(pgPool, location_id);
    const current_balance = {
      qty_metal: location.qty_metal,
      qty_plastic: location.qty_plastic,
    };
    return { balance_forward, transactions, balance_at_end, current_balance };
  }

  public static async adminTransaction(
    pgPool: Pool,
    from_location_id: number,
    to_location_id: number,
    qty_metal: number,
    qty_plastic: number
  ) {
    // We compute the type by looking up the locations
    const fromLocation = await LocationsService.locationbyId(
      pgPool,
      from_location_id
    );
    const fromLocationType = fromLocation.type;
    const toLocation = await LocationsService.locationbyId(
      pgPool,
      to_location_id
    );
    const toLocationType = toLocation.type;
    const type = `${fromLocationType}_to_${toLocationType}`;

    await this.inventoryTransaction(
      pgPool,
      type,
      from_location_id,
      to_location_id,
      qty_metal,
      qty_plastic
    );
  }
}
