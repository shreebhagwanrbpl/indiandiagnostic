const admin = require("firebase-admin");
const districts = require("./lib/districts.json");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function uploadDistricts() {
  for (const item of districts) {
    await db
      .collection("districts")
      .doc(item.slug)
      .set(item);

    console.log(`Uploaded: ${item.slug}`);
  }

  console.log("All districts uploaded");
}

uploadDistricts();