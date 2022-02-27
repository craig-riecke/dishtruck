import { Pool } from 'pg';

export class LocationsService {
  public static async locationbyId(pgPool: Pool, id: number) {
    const recs = await pgPool.query('SELECT * FROM locations WHERE id=$1', [
      id,
    ]);
    return recs.rows[0] || null;
  }

  public static async locationsWithType(pgPool: Pool, type: string) {
    if (type === 'me') {
      // TODO: Derive member number from authn.
      return await this.locationbyId(pgPool, 8);
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
}
