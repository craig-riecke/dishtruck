import { Client, Environment } from 'square';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as _ from 'lodash';

dotenv.config();
const tier = process.env.TIER;

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: tier === 'prod' ? Environment.Production : Environment.Sandbox,
});

async function createItems() {
  const itemFile = fs.readFileSync(`./data/${tier}/items.json`, 'utf-8');
  const items = JSON.parse(itemFile);

  for (const item of items) {
    await client.catalogApi.upsertCatalogObject({
      idempotencyKey: item.idempotencyKey,
      object: _.omit(item, 'idempotencyKey') as any,
    });
  }
}

async function runMe() {
  try {
    await createItems();

    const response = await client.catalogApi.listCatalog();
    console.log(response.result);
  } catch (error) {
    console.log(error);
  }
}

runMe();
