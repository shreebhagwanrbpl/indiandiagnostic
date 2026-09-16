const { adminDb } = require('../lib/firebase-admin.js');

async function benchmark() {
  const companyId = 'rajbiosis';
  const websiteId = 'indiandiagnostic';

  console.log('1. Testing companies/categories...');
  let t0 = Date.now();
  const compCatsSnap = await adminDb.collection(`companies/${companyId}/categories`).get();
  console.log(`   Companies categories: ${compCatsSnap.docs.length} docs in ${Date.now() - t0}ms`);

  console.log('2. Testing websites/categoryproducts/categories...');
  t0 = Date.now();
  const webCatsSnap = await adminDb.collection(`websites/${websiteId}/pages/categoryproducts/categories`).get();
  console.log(`   Web categories: ${webCatsSnap.docs.length} docs in ${Date.now() - t0}ms`);

  console.log('3. Testing websites subcategories in parallel...');
  t0 = Date.now();
  const subQueries = webCatsSnap.docs.map(async (c) => {
    return adminDb.collection(`websites/${websiteId}/pages/categoryproducts/categories/${c.id}/subcategories`).get();
  });
  const webSubs = await Promise.all(subQueries);
  let totalWebProds = 0;
  webSubs.forEach(s => s.docs.forEach(d => {
    totalWebProds += (d.data()?.products || []).length;
  }));
  console.log(`   Web subcategories done: ${totalWebProds} products in ${Date.now() - t0}ms`);

  console.log('4. Testing companies/products...');
  t0 = Date.now();
  const compProdsSnap = await adminDb.collection(`companies/${companyId}/products`).get();
  console.log(`   Company products: ${compProdsSnap.docs.length} docs in ${Date.now() - t0}ms`);

  console.log('5. Testing websites/pages/products...');
  t0 = Date.now();
  const normalSnap = await adminDb.doc(`websites/${websiteId}/pages/products`).get();
  console.log(`   Normal products: ${(normalSnap.data()?.products || []).length} products in ${Date.now() - t0}ms`);
}

benchmark().catch(console.error);
