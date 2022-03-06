import { Pool } from 'pg';

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
}
