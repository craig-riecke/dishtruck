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
      return await this.locationbyId(pgPool, 5);
    }
    if (!['affiliate', 'dropoff-point'].includes(type)) {
      throw new Error(
        'Cannot ask for locations other than affiliate or dropoff-point'
      );
    }
    const recs = await pgPool.query('SELECT * FROM locations WHERE type=$1', [
      type,
    ]);
    return recs.rows;
  }
}
