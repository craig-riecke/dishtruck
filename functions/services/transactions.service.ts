import { LocationsService } from './locations.service';
import * as _ from 'lodash';
import { Client } from 'square';
import * as Nanoid from 'nanoid';
import { Firestore } from '@google-cloud/firestore';

export interface Balance {
  qty_plastic: number;
  qty_metal: number;
}

export interface Transaction {
  event_timestamp: Date;
  location_id: number;
  location_name: string;
  qty_plastic: number;
  qty_metal: number;
}

export interface TransactionHistory {
  location_name: string;
  location_type: string;
  balance_forward: Balance;
  transactions: Transaction[];
  balance_at_end: Balance;
  current_balance: Balance;
}

export class TransactionsService {
  public static async checkoutContainer(
    squareClient: Client,
    userId: string,
    qty: number,
    from_location_id: string
  ) {
    // Lookup from_location_id to make sure it's a valid food vendor
    const location = await LocationsService.getFoodVendorById(
      squareClient,
      from_location_id
    );

    // Don't allow ridiculous qtys
    if (qty < 1 || qty > 10) {
      throw new Error(`Can only check out from 1-10 containers at a time`);
    }

    // And don't allow them to check out more than the food vendor has - not sure if this is OK
    const dfc = location.default_container_type;
    if (
      (dfc === 'plastic' && qty > location.qty_plastic) ||
      (dfc === 'metal' && qty > location.qty_metal)
    ) {
      throw new Error(
        'You cannot get more dishes than the food vendor has on hand'
      );
    }
    const userRec = await LocationsService.getMemberByEmail(userId);
    if (!userRec) {
      throw new Error(`Cannot find user ${userId}`);
    }
    const catalogObjectId =
      dfc === 'plastic'
        ? process.env.SQUARE_ITEM_VARIATION_PLASTIC
        : process.env.SQUARE_ITEM_VARIATION_METAL;

    // Decrement inventory at the food vendor
    console.log('Sending inventory adjustment');
    const changes = [
      {
        type: 'ADJUSTMENT',
        adjustment: {
          fromState: 'IN_STOCK',
          toState: 'SOLD',
          locationId: from_location_id,
          catalogObjectId: catalogObjectId,
          quantity: qty.toString(),
          occurredAt: new Date().toISOString(),
          reference_id: `Checked out ${qty} ${dfc} containers to ${userId}`,
        },
      },
    ];
    console.log(changes);
    const response = await squareClient.inventoryApi.batchChangeInventory({
      idempotencyKey: Nanoid.nanoid(),
      changes,
    });

    console.log(response);

    // And increment qtys on the member record
    userRec.qty_checked_out_this_month += qty;
    switch (dfc) {
      case 'plastic':
        userRec.qty_plastic += qty;
        break;
      case 'metal':
        userRec.qty_metal += qty;
        break;
      default:
        break;
    }

    const firestore = new Firestore();
    await firestore.collection('members').doc(userRec.id).set(userRec);
  }

  public static async returnContainer(
    squareClient: Client,
    userId: string,
    qty_metal: number,
    qty_plastic: number,
    to_location_id: string
  ) {
    // Lookup from_location_id to make sure it's a valid dropoff location
    const location = await LocationsService.getDropoffPointById(
      squareClient,
      to_location_id
    );

    if (!location || location.type !== 'dropoff-point') {
      throw new Error(`${to_location_id} is not a valid dropoff location`);
    }
    // Don't allow ridiculous qtys
    if (
      qty_metal < 0 ||
      qty_metal > 50 ||
      qty_plastic < 0 ||
      qty_plastic > 50 ||
      qty_plastic + qty_metal < 1
    ) {
      throw new Error(`Can only dropoff from 1-50 containers at a time`);
    }

    const userRec = await LocationsService.getMemberByEmail(userId);
    if (!userRec) {
      throw new Error(`Cannot find user ${userId}`);
    }

    if (qty_metal > userRec.qty_metal || qty_plastic > userRec.qty_plastic) {
      throw new Error('You cannot return more dishes than you have');
    }

    // Increment inventory at the dropoff point
    console.log('Sending inventory adjustment');
    const changes = [];
    if (qty_plastic) {
      changes.push({
        type: 'ADJUSTMENT',
        adjustment: {
          fromState: 'NONE',
          toState: 'IN_STOCK',
          locationId: to_location_id,
          catalogObjectId: process.env.SQUARE_ITEM_VARIATION_PLASTIC || 'N/A',
          quantity: qty_plastic.toString(),
          occurredAt: new Date().toISOString(),
          reference_id: `${userId} returned ${qty_plastic} plastic containers`,
        },
      });
    }
    if (qty_metal) {
      changes.push({
        type: 'ADJUSTMENT',
        adjustment: {
          fromState: 'NONE',
          toState: 'IN_STOCK',
          locationId: to_location_id,
          catalogObjectId: process.env.SQUARE_ITEM_VARIATION_METAL || 'N/A',
          quantity: qty_metal.toString(),
          occurredAt: new Date().toISOString(),
          reference_id: `${userId} returned ${qty_metal} metal containers`,
        },
      });
    }

    console.log(changes);
    const response = await squareClient.inventoryApi.batchChangeInventory({
      idempotencyKey: Nanoid.nanoid(),
      changes,
    });

    console.log(response);

    // And decrement qtys on the member record (but not checked out)
    userRec.qty_plastic -= qty_plastic;
    userRec.qty_metal -= qty_metal;

    const firestore = new Firestore();
    await firestore.collection('members').doc(userRec.id).set(userRec);
  }

  public static async adminTransaction(
    squareClient: Client,
    userId: string,
    from_type: string,
    from_location_id: string,
    to_type: string,
    to_location_id: string,
    qty_metal: number,
    qty_plastic: number
  ) {
    const squareChanges = [];
    // First decrement the qty from the from location
    if (from_type === 'food-vendor' || from_type === 'dropoff-point') {
      // decrement from Square
      if (qty_plastic) {
        squareChanges.push({
          type: 'ADJUSTMENT',
          adjustment: {
            fromState: 'IN_STOCK',
            toState: 'SOLD',
            locationId: from_location_id,
            catalogObjectId: process.env.SQUARE_ITEM_VARIATION_PLASTIC || 'N/A',
            quantity: qty_plastic.toString(),
            occurredAt: new Date().toISOString(),
            reference_id: `${userId} moved ${qty_plastic} plastic containers from location ${from_location_id}`,
          },
        });
      }
      if (qty_metal) {
        squareChanges.push({
          type: 'ADJUSTMENT',
          adjustment: {
            fromState: 'IN_STOCK',
            toState: 'SOLD',
            locationId: from_location_id,
            catalogObjectId: process.env.SQUARE_ITEM_VARIATION_METAL || 'N/A',
            quantity: qty_metal.toString(),
            occurredAt: new Date().toISOString(),
            reference_id: `${userId} moved ${qty_metal} metal containers from location ${from_location_id}`,
          },
        });
      }
    } else if (from_type === 'special-location') {
      const specialLocations = await LocationsService.getSpecialLocations();
      specialLocations[from_location_id].qty_metal -= qty_metal;
      specialLocations[from_location_id].qty_plastic -= qty_plastic;
      await LocationsService.saveSpecialLocations(specialLocations);
    } else {
      throw new Error('Cannot move inventory from member or other locations');
    }

    // Second, increment the qty at the to location
    if (to_type === 'food-vendor' || to_type === 'dropoff-point') {
      // increment from Square
      if (qty_plastic) {
        squareChanges.push({
          type: 'ADJUSTMENT',
          adjustment: {
            fromState: 'NONE',
            toState: 'IN_STOCK',
            locationId: to_location_id,
            catalogObjectId: process.env.SQUARE_ITEM_VARIATION_PLASTIC || 'N/A',
            quantity: qty_plastic.toString(),
            occurredAt: new Date().toISOString(),
            reference_id: `${userId} moved ${qty_plastic} plastic containers to location ${to_location_id}`,
          },
        });
      }
      if (qty_metal) {
        squareChanges.push({
          type: 'ADJUSTMENT',
          adjustment: {
            fromState: 'NONE',
            toState: 'IN_STOCK',
            locationId: to_location_id,
            catalogObjectId: process.env.SQUARE_ITEM_VARIATION_METAL || 'N/A',
            quantity: qty_metal.toString(),
            occurredAt: new Date().toISOString(),
            reference_id: `${userId} moved ${qty_metal} metal containers to location ${to_location_id}`,
          },
        });
      }
    } else if (to_type === 'special-location') {
      const specialLocations = await LocationsService.getSpecialLocations();
      specialLocations[to_location_id].qty_metal += qty_metal;
      specialLocations[to_location_id].qty_plastic += qty_plastic;
      await LocationsService.saveSpecialLocations(specialLocations);
    } else {
      throw new Error('Cannot move inventory to member or other locations');
    }

    // Finally, issue all the Square transactions in a batch for speed and safety
    if (squareChanges.length > 0) {
      console.log(squareChanges);
      const response = await squareClient.inventoryApi.batchChangeInventory({
        idempotencyKey: Nanoid.nanoid(),
        changes: squareChanges,
      });
      console.log(response);
    }
  }
}
