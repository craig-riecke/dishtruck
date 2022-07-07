const Firestore = require('@google-cloud/firestore');
import * as dotenv from 'dotenv';

dotenv.config();

async function runMe() {
  // Get all dropoff-points from Firestore.  TODO: Factor out all common code later
  const firestore = new Firestore();

  const dropoffPointsDoc = firestore.collection(`dropoff-points`);
  const dropoffPoints: any = await dropoffPointsDoc.get();
  dropoffPoints.forEach((doc: any) => {
    console.log(doc.id, '=>', doc.data());
  });
}

runMe();
