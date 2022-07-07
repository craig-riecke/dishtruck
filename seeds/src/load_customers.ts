import { Client, Environment } from 'square';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as _ from 'lodash';
import { Firestore } from '@google-cloud/firestore';

dotenv.config();

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
});

async function createCustomers() {
  const customerFile = fs.readFileSync('./data/customers.json', 'utf-8');
  const customers = JSON.parse(customerFile);

  for (const customer of customers) {
    const response = await client.customersApi.createCustomer({
      ...customer,
      idempotencyKey: customer.emailAddress,
    });

    // Create a member with that same id in Firestore
    const firestore = new Firestore();
    const squareCustomer = response.result.customer;
    if (!squareCustomer?.id) {
      throw new Error(`WTF???`);
    }

    await firestore.collection('members').doc(squareCustomer.id).set({
      id: squareCustomer.id,
      email: squareCustomer.emailAddress,
      qty_metal: 0,
      qty_plastic: 0,
      transactions: [],
    });
  }
}

async function runMe() {
  try {
    await createCustomers();

    const response = await client.customersApi.listCustomers();
    console.log(response.result);
  } catch (error) {
    console.log(error);
  }
}

runMe();
