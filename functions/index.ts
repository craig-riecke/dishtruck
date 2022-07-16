import { Client, Environment } from 'square';
import { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';
import * as dotenv from 'dotenv';
import {
  DishtruckLocation,
  LocationsService,
} from './services/locations.service';
import { TransactionsService } from './services/transactions.service';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
var jwksClient = require('jwks-rsa');

require('source-map-support').install();

dotenv.config();
const tier = process.env.TIER;

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: tier === 'prod' ? Environment.Production : Environment.Sandbox,
});

export const helloWorld: HttpFunction = (req, res) => {
  res.json('Hello, World from TypeScript');
};

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

    console.log('Running query');

    // register-member is an outlier since it doesn't return anything
    let locations: any;
    if (type === 'register-me') {
      await LocationsService.registerMe(squareClient, thisUserId);
    } else {
      locations = await LocationsService.locationsWithType(
        squareClient,
        type,
        thisUserId
      );
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

    console.log('Running trx');
    switch (type) {
      case 'checkout-container':
        await TransactionsService.checkoutContainer(
          squareClient,
          thisUserId,
          req.body.qty,
          req.body.from_location_id
        );
        break;
      case 'return-container':
        await TransactionsService.returnContainer(
          squareClient,
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

    const type = extractSubject(req);
    console.log(`Transcation type ${type}`);

    // All admin points are locked down except /locations, which is needed for the sidebar
    let thisUserId = null;
    if (type !== 'locations') {
      const thisUser: any = await jwtPrincipal(req.headers.authorization);
      thisUserId = thisUser.email;

      const adminRecord = [
        'craig.riecke@gmail.com',
        'solkitchen1@gmail.com',
      ].includes(thisUserId);

      if (!adminRecord) {
        res
          .status(403)
          .json({ error: 'You are not authorized to use this API' });
      }
    }

    console.log('Running trx');

    let locations: DishtruckLocation;
    const id = req.query.id;
    switch (type) {
      case 'transactions':
        console.log(req.body);
        await TransactionsService.adminTransaction(
          squareClient,
          thisUserId,
          req.body.from_type,
          req.body.from_location_id,
          req.body.to_type,
          req.body.to_location_id,
          req.body.qty_metal,
          req.body.qty_plastic
        );
        res.status(204).send('');
        break;
      case 'locations-with-qtys':
        const locationGroupsWithQtys =
          await LocationsService.getNonmemberLocationGroupsWithQtys(
            squareClient
          );
        res.json(locationGroupsWithQtys);
        break;
      case 'locations':
        const locationGroups =
          await LocationsService.getNonmemberLocationGroups(squareClient);
        res.json(locationGroups);
        break;
      case 'food-vendor':
        locations = await LocationsService.getFoodVendorById(squareClient, id);
        res.json(locations);
        break;
      case 'dropoff-point':
        locations = await LocationsService.getDropoffPointById(
          squareClient,
          id
        );
        res.json(locations);
        break;
      case 'special-location':
        const allSpecialLocations =
          await LocationsService.getSpecialLocations();
        locations = allSpecialLocations[id];
        res.json(locations);
        break;
    }
    console.log('Trx ended');
  } catch (err: any) {
    const wrappedError = new Error(err);
    console.error(`${err.stack}\n${wrappedError.stack}`);
    res.status(500).json({ error: 'An error occurred in that transaction' });
  }
};
