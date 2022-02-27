import { Pool, PoolClient } from 'pg';
import { LocationsService } from './locations.service';

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

  public static async checkoutContainer(
    pgPool: Pool,
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
    const qtyPlastic = qtyField === 'qty_plastic' ? qty : 0;
    const qtyMetal = qtyField === 'qty_metal' ? qty : 0;

    // TODO: Get member location id from authentication
    const to_location_id = 8;

    const client: PoolClient = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const insertTransactionSQL = `INSERT INTO transactions(type, from_location_id, to_location_id, qty_plastic, qty_metal) VALUES ($1,$2,$3,$4,$5)`;
      await client.query(insertTransactionSQL, [
        'food_vendor_to_user',
        from_location_id,
        to_location_id,
        qtyPlastic,
        qtyMetal,
      ]);

      // Adjust inventory totals on each side
      await this.adjustLocationQty(
        client,
        from_location_id,
        -qtyMetal,
        -qtyPlastic
      );
      await this.adjustLocationQty(
        client,
        to_location_id,
        qtyMetal,
        qtyPlastic
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

  public static async returnContainer(
    pgPool: Pool,
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

    // TODO: Get member location id from authentication
    const from_location_id = 8;

    // And don't allow them to return more than they have
    const member = await LocationsService.locationbyId(
      pgPool,
      from_location_id
    );
    if (qty_metal > member.qty_metal || qty_plastic > member.qty_plastic) {
      throw new Error('You cannot return more dishes than you have');
    }

    const client: PoolClient = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const insertTransactionSQL =
        'INSERT INTO transactions(type, from_location_id, to_location_id, qty_metal, qty_plastic) VALUES ($1,$2,$3,$4,$5)';
      await client.query(insertTransactionSQL, [
        'user_to_dropoff',
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
}
