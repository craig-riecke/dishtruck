import { Client, Environment } from 'square';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();
const tier = process.env.TIER;

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: tier === 'prod' ? Environment.Production : Environment.Sandbox,
});

async function createFoodVendors() {
  const foodVendorFile = fs.readFileSync(
    `./data/${tier}/food-vendors.json`,
    'utf-8'
  );
  const foodVendors = JSON.parse(foodVendorFile);

  for (const foodVendor of foodVendors) {
    await client.locationsApi.createLocation({
      location: {
        timezone: 'America/New_York',
        name: foodVendor.full_name,
        status: 'ACTIVE',
        country: 'US',
        languageCode: 'en-US',
        businessName: foodVendor.full_name,
        type: 'PHYSICAL',
      },
    });
  }
}

async function createDropoffPoints() {
  const dropoffPointFile = fs.readFileSync(
    `./data/${tier}/dropoff-points.json`,
    'utf-8'
  );
  const dropoffPoints = JSON.parse(dropoffPointFile);

  for (const dropoffPoint of dropoffPoints) {
    await client.locationsApi.createLocation({
      location: {
        timezone: 'America/New_York',
        name: dropoffPoint.full_name,
        status: 'ACTIVE',
        country: 'US',
        languageCode: 'en-US',
        businessName: dropoffPoint.full_name,
        type: 'PHYSICAL',
        address: {
          addressLine1: dropoffPoint.street_address,
          locality: dropoffPoint.city,
          administrativeDistrictLevel1: 'NY',
          postalCode: dropoffPoint.zip,
        },
        coordinates: {
          latitude: dropoffPoint.lat,
          longitude: dropoffPoint.lng,
        },
      },
    });
  }
}

async function runMe() {
  try {
    await createFoodVendors();
    await createDropoffPoints();

    const response = await client.locationsApi.listLocations();
    console.log(response.result);
  } catch (error) {
    console.log(error);
  }
}

runMe();
