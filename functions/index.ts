import { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';
import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';
import { LocationsService } from './services/locations.service';
import { TransactionsService } from './services/transactions.service';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
var jwksClient = require('jwks-rsa');

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

const jwtPrincipal = async (authHeader: string) => {
  const jwToken = authHeader.split(/ /)[1];
  // We only decode to get the kid in the header.
  const decodedToken: jwt.Jwt | null = jwt.decode(jwToken, { complete: true });
  if (!decodedToken) {
    throw new Error('Could not decode JWT');
  }
  var client = jwksClient({
    jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
  });

  const kid = decodedToken.header.kid;
  const key = await client.getSigningKey(kid);
  const signingKey = key.getPublicKey();

  try {
    return jwt.verify(jwToken, signingKey);
  } catch (err) {
    console.error('Something bad happened when trying to verify token: ' + err);
    throw err;
  }
};

const isCorsPreflight = (req: any, res: any): boolean => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET,POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return true;
  }
  return false;
};

const extractSubject = (req: any) => {
  const params = req.path.split('/');
  return params[params.length - 1];
};

export const locations: HttpFunction = async (req: any, res) => {
  try {
    if (isCorsPreflight(req, res)) {
      return;
    }

    // Get the JWT principal
    const thisUser: any = await jwtPrincipal(req.headers.authorization);
    const thisUserId = thisUser.email;
    console.log(JSON.stringify(thisUser));

    const type = extractSubject(req);
    console.log(`Looking for type ${type}`);

    console.log('Checking for Postgres pool');
    if (!pgPool) {
      console.log('Starting up Postgres Pool');
      pgPool = await createUnixSocketPool({});
      console.log('Postgres Pool Started');
    }

    console.log('Running query');

    // register-member is an outlier since it doesn't return anything
    let locations = [];
    if (type === 'register-me') {
      await LocationsService.registerMe(pgPool, thisUserId);
    } else {
      locations =
        type === 'sublocations'
          ? await LocationsService.sublocations(
              pgPool,
              _.toInteger(req.query.parent_location_id)
            )
          : await LocationsService.locationsWithType(pgPool, type, thisUserId);
    }
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
    if (isCorsPreflight(req, res)) {
      return;
    }

    const thisUser: any = await jwtPrincipal(req.headers.authorization);
    const thisUserId = thisUser.email;

    if (req.method !== 'POST') {
      throw new Error('Must post transaction here');
    }
    const type = extractSubject(req);
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
          thisUserId,
          req.body.qty,
          req.body.from_location_id
        );
        break;
      case 'return-container':
        await TransactionsService.returnContainer(
          pgPool,
          thisUserId,
          req.body.qty_metal,
          req.body.qty_plastic,
          req.body.to_location_id
        );
        break;
      default:
        break;
    }
    console.log('Trx ended');
    res.json(null);
  } catch (err: any) {
    const wrappedError = new Error(err);
    console.error(`${err.stack}\n${wrappedError.stack}`);
    res.status(500).json({ error: 'An error occurred in that transaction' });
  }
};

export const admin: HttpFunction = async (req: any, res) => {
  try {
    if (isCorsPreflight(req, res)) {
      return;
    }

    console.log('Checking for Postgres pool');
    if (!pgPool) {
      console.log('Starting up Postgres Pool');
      pgPool = await createUnixSocketPool({});
      console.log('Postgres Pool Started');
    }

    const type = extractSubject(req);
    console.log(`Transcation type ${type}`);

    // All admin points are locked down except /locations, which is needed for the sidebar
    if (type !== 'locations') {
      const thisUser: any = await jwtPrincipal(req.headers.authorization);
      const thisUserId = thisUser.email;

      const adminRecord = LocationsService.locationByName(
        pgPool,
        'admin',
        thisUserId
      );

      if (!adminRecord) {
        res
          .status(403)
          .json({ error: 'You are not authorized to use this API' });
      }
    }

    console.log('Running trx');

    switch (type) {
      case 'transactions':
        switch (req.method) {
          case 'GET':
            const trx = await TransactionsService.getHistory(
              pgPool,
              req.query.location_id,
              req.query.from,
              req.query.to
            );
            res.json(trx);
            break;
          case 'POST':
            await TransactionsService.adminTransaction(
              pgPool,
              req.body.from_location_id,
              req.body.to_location_id,
              req.body.qty_metal,
              req.body.qty_plastic
            );
            res.status(204).send('');
            break;
        }
        break;
      case 'invoice':
        const invoice = await TransactionsService.getInvoice(
          pgPool,
          req.query.location_id,
          req.query.from,
          req.query.to
        );
        res.json(invoice);
        break;
      case 'locations-with-qtys':
        const locationGroupsWithQtys =
          await LocationsService.getNonmemberLocationGroupsWithQtys(pgPool);
        res.json(locationGroupsWithQtys);
        break;
      case 'locations':
        const locationGroups =
          await LocationsService.getNonmemberLocationGroups(pgPool);
        res.json(locationGroups);
        break;
    }
    console.log('Trx ended');
  } catch (err: any) {
    const wrappedError = new Error(err);
    console.error(`${err.stack}\n${wrappedError.stack}`);
    res.status(500).json({ error: 'An error occurred in that transaction' });
  }
};
