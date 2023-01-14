import { Firestore } from '@google-cloud/firestore';
import * as _ from 'lodash';
import { Client } from 'square';

export interface DishtruckLocation {
  id: string;
  email: string | null;
  type: 'member' | 'food-vendor' | 'dropoff-point' | 'unknown-member';
  full_name: string;
  qty_checked_out_this_month: number;
  qty_metal: number;
  qty_plastic: number;
  creation_date: Date;
  requires_sub_location: boolean;
  parent_location_id: number | null;
  default_container_type: string;
  lat: number | null;
  lng: number | null;
  street_address: string | null;
  city: string | null;
  zip: string | null;
}

export interface LocationOptions {
  includeQty: boolean;
}

export class LocationsService {
  private static async getFirestoreDocument(docPath: string): Promise<any> {
    const firestore = new Firestore();

    const doc = firestore.doc(docPath);
    return (await doc.get()).data();
  }

  public static async getMemberByEmail(
    userId: string
  ): Promise<DishtruckLocation | null> {
    const firestore = new Firestore();
    const membersRef = firestore.collection('members');
    const members = await membersRef
      .where('email', '==', userId)
      .limit(1)
      .get();
    if (members.size < 1) {
      return null;
    }
    const memberDoc = members.docs[0].data() as DishtruckLocation;
    return {
      id: memberDoc.id || 'N/A',
      email: memberDoc.email,
      type: 'member',
      full_name: userId,
      qty_checked_out_this_month: memberDoc.qty_checked_out_this_month || 0,
      qty_metal: memberDoc.qty_metal,
      qty_plastic: memberDoc.qty_plastic,
      creation_date: new Date(), // Don't give a crap about this.
      requires_sub_location: false,
      parent_location_id: null,
      default_container_type: '',
      lat: null,
      lng: null,
      street_address: null,
      city: null,
      zip: null,
    };
  }

  public static async getDropoffPointById(
    squareClient: Client,
    id: string
  ): Promise<DishtruckLocation> {
    const dropoffPoints = await this.getFirestoreDocument(`dropoff-points/all`);

    const dropoffPointDoc = _.find(dropoffPoints.locations, { id });
    if (!dropoffPointDoc) {
      throw new Error('That location is not a dropoff point');
    }

    // Get inventory values as well
    const plasticInventoryByLocation = await this.getInventoryCountsByLocation(
      squareClient,
      process.env.SQUARE_ITEM_VARIATION_PLASTIC || 'N/A'
    );
    const metalInventoryByLocation = await this.getInventoryCountsByLocation(
      squareClient,
      process.env.SQUARE_ITEM_VARIATION_METAL || 'N/A'
    );

    return {
      id: dropoffPointDoc.id || 'N/A',
      email: null,
      type: 'dropoff-point' as const,
      full_name: dropoffPointDoc.name || 'N/A',
      qty_checked_out_this_month: 0,
      qty_metal: metalInventoryByLocation[dropoffPointDoc.id || 'N/A'] || 0,
      qty_plastic: plasticInventoryByLocation[dropoffPointDoc.id || 'N/A'] || 0,
      creation_date: new Date(),
      requires_sub_location: false,
      parent_location_id: null,
      default_container_type: '',
      lat: dropoffPointDoc.lat || 0,
      lng: dropoffPointDoc.lng || 0,
      street_address: dropoffPointDoc.street_address || '',
      city: dropoffPointDoc.city || '',
      zip: dropoffPointDoc.zip || '',
    };
  }

  private static async getDropoffPoints(
    squareClient: Client,
    locationOptions: LocationOptions
  ): Promise<DishtruckLocation[]> {
    const dropoffPoints = await this.getFirestoreDocument(`dropoff-points/all`);

    // Get inventory values as well, if needed
    let plasticInventoryByLocation: _.Dictionary<any> = [];
    let metalInventoryByLocation: _.Dictionary<any> = [];
    if (locationOptions.includeQty) {
      plasticInventoryByLocation = await this.getInventoryCountsByLocation(
        squareClient,
        process.env.SQUARE_ITEM_VARIATION_PLASTIC || 'N/A'
      );
      metalInventoryByLocation = await this.getInventoryCountsByLocation(
        squareClient,
        process.env.SQUARE_ITEM_VARIATION_METAL || 'N/A'
      );
    }

    return _.map(dropoffPoints.locations, (dop) => ({
      id: dop.id || 'N/A',
      email: null,
      type: 'dropoff-point' as const,
      full_name: dop.name || 'N/A',
      qty_checked_out_this_month: 0,
      qty_metal: metalInventoryByLocation[dop.id || 'N/A'] || 0,
      qty_plastic: plasticInventoryByLocation[dop.id || 'N/A'] || 0,
      creation_date: new Date(), // Don't care anymore
      requires_sub_location: false,
      parent_location_id: null,
      default_container_type: '',
      lat: dop.lat || 0,
      lng: dop.lng || 0,
      street_address: dop.street_address || '',
      city: dop.city || '',
      zip: dop.zip || '',
    }));
  }

  private static async getInventoryCountsByLocation(
    squareClient: Client,
    itemVariationId: string
  ): Promise<_.Dictionary<any>> {
    const itemInventory =
      await squareClient.inventoryApi.retrieveInventoryCount(itemVariationId);
    return _.chain(itemInventory.result.counts)
      .map((loc: any) => [loc.locationId, _.toInteger(loc.quantity)])
      .fromPairs()
      .value();
  }

  public static async getFoodVendorById(
    squareClient: Client,
    id: string
  ): Promise<DishtruckLocation> {
    console.log(`Retrieving Locations document from Firestore`);
    const foodVendors = await this.getFirestoreDocument(`food-vendors/all`);

    const foodVendorDoc = _.find(foodVendors.locations, { id });
    if (!foodVendorDoc) {
      throw new Error('That location is not a food vendor');
    }

    // Get inventory values as well
    console.log(`Retrieving inventory of plastic`);
    const plasticInventoryByLocation = await this.getInventoryCountsByLocation(
      squareClient,
      process.env.SQUARE_ITEM_VARIATION_PLASTIC || 'N/A'
    );
    console.log(plasticInventoryByLocation);
    console.log(`Retrieving inventory of metal`);
    const metalInventoryByLocation = await this.getInventoryCountsByLocation(
      squareClient,
      process.env.SQUARE_ITEM_VARIATION_METAL || 'N/A'
    );
    console.log(metalInventoryByLocation);

    return {
      id: foodVendorDoc.id || 'N/A',
      email: null,
      type: 'food-vendor' as const,
      full_name: foodVendorDoc.name || 'N/A',
      qty_checked_out_this_month: 0,
      qty_metal: metalInventoryByLocation[foodVendorDoc.id || 'N/A'] || 0,
      qty_plastic: plasticInventoryByLocation[foodVendorDoc.id || 'N/A'] || 0,
      creation_date: new Date(),
      requires_sub_location: foodVendorDoc.requires_sub_location,
      parent_location_id: foodVendorDoc.parent_location_id,
      default_container_type: foodVendorDoc.default_container_type,
      lat: null,
      lng: null,
      street_address: foodVendorDoc.street_address || null,
      city: foodVendorDoc.city || null,
      zip: foodVendorDoc.zip || null,
    };
  }

  private static async getFoodVendors(
    squareClient: Client,
    filterFn: (x: any) => Boolean,
    locationOptions: LocationOptions
  ): Promise<DishtruckLocation[]> {
    const foodVendors = await this.getFirestoreDocument(`food-vendors/all`);

    // Get inventory values as well, if necessary
    let plasticInventoryByLocation: _.Dictionary<any> = [];
    let metalInventoryByLocation: _.Dictionary<any> = [];
    if (locationOptions.includeQty) {
      plasticInventoryByLocation = await this.getInventoryCountsByLocation(
        squareClient,
        process.env.SQUARE_ITEM_VARIATION_PLASTIC || 'N/A'
      );
      metalInventoryByLocation = await this.getInventoryCountsByLocation(
        squareClient,
        process.env.SQUARE_ITEM_VARIATION_METAL || 'N/A'
      );
    }

    return _.chain(foodVendors.locations)
      .filter(filterFn) // Only get top-level listings here
      .map((fv) => {
        const qty_metal = metalInventoryByLocation[fv.id] || 0;
        const qty_plastic = plasticInventoryByLocation[fv.id] || 0;
        return {
          id: fv.id,
          email: null,
          type: 'food-vendor' as const,
          full_name: fv.name,
          qty_checked_out_this_month: 0,
          qty_metal,
          qty_plastic,
          creation_date: new Date(),
          requires_sub_location: fv.requires_sub_location,
          parent_location_id: fv.parent_location_id,
          default_container_type: fv.default_container_type,
          lat: null,
          lng: null,
          street_address: fv.street_address,
          city: fv.city,
          zip: fv.zip,
        };
      })
      .value();
  }

  public static async locationsWithType(
    squareClient: Client,
    type: string,
    userId: string,
    locationOptions: LocationOptions
  ): Promise<DishtruckLocation | DishtruckLocation[] | null> {
    switch (type) {
      case 'me':
        return await this.getMemberByEmail(userId);
      case 'food-vendor':
        return await this.getFoodVendors(
          squareClient,
          (loc) => _.isNull(loc.parent_location_id),
          locationOptions
        );
      case 'dropoff-point':
        return await this.getDropoffPoints(squareClient, locationOptions);
      default:
        return [];
    }
  }

  public static async sublocations(
    squareClient: Client,
    parent_location_id: string,
    locationOptions: LocationOptions
  ): Promise<DishtruckLocation[]> {
    return await this.getFoodVendors(
      squareClient,
      (loc) => parent_location_id === loc.parent_location_id,
      locationOptions
    );
  }

  public static async registerMe(
    squareClient: Client,
    userId: string
  ): Promise<void> {
    // Make sure member doesn't already exist.  If so, then no-op
    const userRec = await this.getMemberByEmail(userId);
    if (!userRec) {
      const response = await squareClient.customersApi.createCustomer({
        emailAddress: userId,
        idempotencyKey: userId,
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
      });
    }
  }

  public static async getSpecialLocations() {
    return await this.getFirestoreDocument(`special-locations/all`);
  }

  public static async saveSpecialLocations(specialLocationsDoc: any) {
    const firestore = new Firestore();
    await firestore
      .collection('special-locations')
      .doc('all')
      .set(specialLocationsDoc);
  }

  public static async getNonmemberLocationGroupsWithQtys(squareClient: Client) {
    const foodVendorLocations = await this.getFoodVendors(
      squareClient,
      _.identity,
      { includeQty: true }
    );
    const dropoffLocations = await this.getDropoffPoints(squareClient, {
      includeQty: true,
    });
    const specialLocations = await this.getSpecialLocations();

    // Display these in the same order as they are onscreen
    let grps = [
      {
        group: 'Warehouse',
        locations: [specialLocations.warehouse],
        qty_metal: 0, // Adding these to the first element fixes the type
        qty_plastic: 0,
      },
      {
        group: 'Food Vendors',
        locations: foodVendorLocations,
      },
      {
        group: 'Members',
        locations: [],
      },
      {
        group: 'Dropoff Points',
        locations: dropoffLocations,
      },
      {
        group: 'Shrinkage',
        locations: [specialLocations.shrinkage],
      },
    ];
    grps = grps.map((grp) => ({
      ...grp,
      qty_metal: _.sum(_.map(grp.locations, 'qty_metal')),
      qty_plastic: _.sum(_.map(grp.locations, 'qty_plastic')),
    }));
    // Members are a special case - we don't get into details, only aggregate qtys.  Note this
    // might get really bad later if we have lots of members.
    const firestore = new Firestore();
    const querySnapshot = await firestore.collection('members').get();
    querySnapshot.docs.forEach(async (element) => {
      const doc = element.data();
      grps[2].qty_metal += doc.qty_metal;
      grps[2].qty_plastic += doc.qty_plastic;
    });
    return grps;
  }

  public static async getNonmemberLocationGroups(squareClient: Client) {
    const foodVendorLocations = await this.getFoodVendors(
      squareClient,
      _.identity,
      { includeQty: true }
    );
    const dropoffLocations = await this.getDropoffPoints(squareClient, {
      includeQty: true,
    });
    const specialLocations = await this.getSpecialLocations();

    // Display these in the same order as they are onscreen
    let grps = [
      {
        group: 'Warehouse',
        locations: [specialLocations.warehouse],
      },
      {
        group: 'Food Vendors',
        locations: foodVendorLocations,
      },
      {
        group: 'Dropoff Points',
        locations: dropoffLocations,
      },
      {
        group: 'Shrinkage',
        locations: [specialLocations.shrinkage],
      },
    ];
    return grps;
  }
}
