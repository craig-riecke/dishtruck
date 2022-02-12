import { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';
import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';
import { LocationsService } from './services/locations.service';
import { TransactionsService } from './services/transactions.service';

dotenv.config();

export const helloWorld: HttpFunction = (req, res) => {
  res.json('Hello, World from TypeScript');
};

const createUnixSocketPool = async (config: PoolConfig | undefined) => {
  const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';

  // Establish a connection to the database
  return new Pool({
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    host:
      process.env.NODE_ENV === 'production'
        ? `${dbSocketPath}/${process.env.INSTANCE_CONNECTION_NAME}`
        : process.env.DB_HOST,
    ...config,
  });
};

let pgPool: Pool;

export const locations: HttpFunction = async (req: any, res) => {
  try {
    // Handle CORS for now.
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    }
    // This is not cool, but
    const params = req.path.split('/');
    const type = params[params.length - 1];
    console.log(`Looking for type ${type}`);

    console.log('Checking for Postgres pool');
    if (!pgPool) {
      console.log('Starting up Postgres Pool');
      pgPool = await createUnixSocketPool({});
      console.log('Postgres Pool Started');
    }

    console.log('Running query');
    const locations = await LocationsService.locationsWithType(pgPool, type);
    console.log('Query ended');
    res.json(locations);
  } catch (err: any) {
    const wrappedError = new Error(err);
    console.error(`${err.stack}\n${wrappedError.stack}`);
    res.status(500).json({ error: 'An error occurred looking up locations' });
  }
};

export const transactions: HttpFunction = async (req: any, res) => {
  try {
    // Handle CORS for now.
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      throw new Error('Must post transaction here');
    }
    const params = req.path.split('/');
    const type = params[params.length - 1];
    console.log(`Transcation type ${type}`);

    console.log('Checking for Postgres pool');
    if (!pgPool) {
      console.log('Starting up Postgres Pool');
      pgPool = await createUnixSocketPool({});
      console.log('Postgres Pool Started');
    }

    console.log('Running trx');
    switch (type) {
      case 'checkout-container':
        await TransactionsService.checkoutContainer(
          pgPool,
          req.body.qty,
          req.body.from_location_id
        );
        break;
      case 'return-container':
        await TransactionsService.returnContainer(
          pgPool,
          req.body.qty_metal,
          req.body.qty_plastic,
          req.body.to_location_id
        );
        break;
      default:
        break;
    }
    console.log('Trx ended');
    res.json(locations);
  } catch (err: any) {
    const wrappedError = new Error(err);
    console.error(`${err.stack}\n${wrappedError.stack}`);
    res.status(500).json({ error: 'An error occurred in that transaction' });
  }
};
