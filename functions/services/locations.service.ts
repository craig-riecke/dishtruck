import { Pool } from 'pg';
import * as _ from 'lodash';

export class LocationsService {
  public static async locationbyId(pgPool: Pool, id: number) {
    const recs = await pgPool.query('SELECT * FROM locations WHERE id=$1', [
      id,
    ]);
    return recs.rows[0] || null;
  }

  public static async locationByName(pgPool: Pool, type: string, name: string) {
    const recs = await pgPool.query(
      'SELECT * FROM locations WHERE type=$1 AND full_name=$2',
      [type, name]
    );
    return recs.rows[0] || null;
  }

  public static async locationsWithType(
    pgPool: Pool,
    type: string,
    userId: string
  ) {
    if (type === 'me') {
      const userRec = await this.locationByName(pgPool, 'member', userId);
      if (userRec) {
        return userRec;
      } else {
        return {
          type: 'unknown-member',
        };
      }
    }
    if (!['food-vendor', 'dropoff-point'].includes(type)) {
      throw new Error(
        'Cannot ask for locations other than food-vendor or dropoff-point'
      );
    }
    const recs = await pgPool.query(
      'SELECT * FROM locations WHERE type=$1 AND COALESCE(parent_location_id,0) = 0',
      [type]
    );
    return recs.rows;
  }

  public static async sublocations(pgPool: Pool, parent_location_id: number) {
    const recs = await pgPool.query(
      "SELECT * FROM locations WHERE type='food-vendor' AND parent_location_id = $1",
      [parent_location_id]
    );
    return recs.rows;
  }

  public static async registerMe(pgPool: Pool, userId: string) {
    // Make sure member doesn't already exist.  If so, then no-op
    const userRec = await this.locationByName(pgPool, 'member', userId);
    if (!userRec) {
      const insertTransactionSQL = `INSERT INTO locations(type, full_name, qty_metal, qty_plastic) VALUES ('member', $1, 0, 0)`;
      await pgPool.query(insertTransactionSQL, [userId]);
    }
  }

  public static async getNonmemberLocationGroupsWithQtys(pgPool: Pool) {
    const qry = await pgPool.query(
      "SELECT * FROM locations WHERE type IN ('warehouse','dropoff-point','shrinkage') OR (type = 'food-vendor' and not requires_sub_location)"
    );
    const recs = qry.rows;
    // Display these in the same order as they are onscreen
    let grps = [
      {
        group: 'Warehouse',
        locations: _.filter(recs, { type: 'warehouse' } as any),
        qty_metal: 0,
        qty_plastic: 0,
      },
      {
        group: 'Food Vendors',
        locations: _.filter(recs, { type: 'food-vendor' } as any),
        qty_metal: 0,
        qty_plastic: 0,
      },
      {
        group: 'Members',
        locations: [],
        qty_metal: 0,
        qty_plastic: 0,
      },
      {
        group: 'Dropoff Points',
        locations: _.filter(recs, { type: 'dropoff-point' } as any),
        qty_metal: 0,
        qty_plastic: 0,
      },
      {
        group: 'Shrinkage',
        locations: _.filter(recs, { type: 'shrinkage' } as any),
        qty_metal: 0,
        qty_plastic: 0,
      },
    ];
    grps = grps.map((grp) => ({
      ...grp,
      qty_metal: _.sum(_.map(grp.locations, 'qty_metal')),
      qty_plastic: _.sum(_.map(grp.locations, 'qty_plastic')),
    }));

    // Members are a special case - we don't get into details, only aggregate qtys
    const aggRecs = await pgPool.query(
      "SELECT SUM(qty_metal) as qty_metal, SUM(qty_plastic) as qty_plastic FROM locations WHERE type = 'member'"
    );
    grps[2].qty_metal = aggRecs.rows[0].qty_metal;
    grps[2].qty_plastic = aggRecs.rows[0].qty_plastic;
    return grps;
  }

  public static async getNonmemberLocationGroups(pgPool: Pool) {
    const qry = await pgPool.query(
      "SELECT * FROM locations WHERE type IN ('warehouse','dropoff-point','shrinkage') OR (type = 'food-vendor' and not requires_sub_location)"
    );
    const recs = qry.rows;
    // Display these in the same order as they are onscreen
    const grps = [
      {
        group: 'Warehouse',
        locations: _.filter(recs, { type: 'warehouse' } as any),
      },
      {
        group: 'Food Vendors',
        locations: _.filter(recs, { type: 'food-vendor' } as any),
      },
      {
        group: 'Dropoff Points',
        locations: _.filter(recs, { type: 'dropoff-point' } as any),
      },
      {
        group: 'Shrinkage',
        locations: _.filter(recs, { type: 'shrinkage' } as any),
      },
    ];

    return grps;
  }
}
