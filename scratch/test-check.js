const admin = require('firebase-admin');
const fs = require('fs');
const cert = JSON.parse(fs.readFileSync('firebase-service.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(cert) });
const db = admin.firestore();

async function check() {
  console.log('--- Checking companies ---');
  const compSnap = await db.collection('companies').get();
  console.log('Companies:', compSnap.docs.map(d => d.id));

  for (const compId of ['rajbiosis', 'human', 'global']) {
    const cats = await db.collection('companies').doc(compId).collection('categories').get();
    const prods = await db.collection('companies').doc(compId).collection('products').get();
    console.log(`Company ${compId}: ${cats.size} categories, ${prods.size} products`);
  }

  console.log('--- Checking websites/indiandiagnostic ---');
  const webCats = await db.collection('websites').doc('indiandiagnostic').collection('pages').doc('categoryproducts').collection('categories').get();
  console.log('indiandiagnostic categoryproducts categories:', webCats.size);

  const normalProds = await db.collection('websites').doc('indiandiagnostic').collection('pages').doc('products').get();
  console.log('indiandiagnostic normal products exists:', normalProds.exists, normalProds.exists ? (normalProds.data().products || []).length : 0);
}
check();
