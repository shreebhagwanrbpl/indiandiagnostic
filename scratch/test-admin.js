const { adminDb } = require('../lib/firebase-admin');

async function testAdmin() {
  console.log('Testing adminDb...');

  try {
    const compCats = await adminDb.collection('companies/rajbiosis/categories').get();
    console.log(`companies/rajbiosis/categories count: ${compCats.docs.length}`);

    const compProds = await adminDb.collection('companies/rajbiosis/products').get();
    console.log(`companies/rajbiosis/products count: ${compProds.docs.length}`);

    const webCats = await adminDb.collection('websites/indiandiagnostic/pages/categoryproducts/categories').get();
    console.log(`websites/indiandiagnostic/pages/categoryproducts/categories count: ${webCats.docs.length}`);

    const normalProds = await adminDb.doc('websites/indiandiagnostic/pages/products').get();
    console.log(`websites/indiandiagnostic/pages/products exists: ${normalProds.exists}`);
    if (normalProds.exists) {
      console.log(`Normal products count: ${(normalProds.data().products || []).length}`);
    }
  } catch (err) {
    console.error('Error testing adminDb:', err);
  }
}

testAdmin();
