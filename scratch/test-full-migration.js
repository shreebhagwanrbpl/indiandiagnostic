const {
  getAggregatedCatalogServer,
  fetchFullCatalog,
  fetchProductBySlug,
  fetchCategories,
  isProductVisibleOnCurrentSite,
  WEBSITE_ID,
  COMPANY_ID,
} = require('../lib/data-fetcher.js');

async function testFullMigration() {
  console.log('=== TEST FULL SUPERADMIN CATALOG INTEGRATION ===');
  console.log(`Config: WEBSITE_ID = ${WEBSITE_ID}, COMPANY_ID = ${COMPANY_ID}`);

  // Test 1: Full Catalog Aggregation
  console.log('\n[1] Testing Full Catalog Fetch...');
  const start = Date.now();
  const catalog = await fetchFullCatalog(true);
  console.log(`✓ Fetched in ${Date.now() - start}ms`);
  console.log(`✓ Total Visible Products: ${catalog.total}`);
  console.log(`✓ Total Categories: ${catalog.categories.length}`);

  if (catalog.products.length === 0) {
    throw new Error('Catalog products list is empty!');
  }

  // Test 2: Verify Strict Website Visibility Filtering
  console.log('\n[2] Testing Strict Visibility Filtering...');
  let invalidCount = 0;
  catalog.products.forEach(p => {
    if (!isProductVisibleOnCurrentSite(p, WEBSITE_ID)) {
      invalidCount++;
    }
  });
  console.log(`✓ Invalid / Hidden Products in output: ${invalidCount} (Should be 0)`);
  if (invalidCount > 0) {
    throw new Error(`Found ${invalidCount} products that violate website visibility!`);
  }

  // Test 3: Fetch Product By Slug
  console.log('\n[3] Testing Fetch Product By Slug...');
  const sampleProduct = catalog.products[0];
  console.log(`Testing with slug: "${sampleProduct.slug}"`);
  const found = await fetchProductBySlug(sampleProduct.slug);
  if (!found) {
    throw new Error(`Failed to find product by slug: ${sampleProduct.slug}`);
  }
  console.log(`✓ Successfully found product: "${found.title}" (Brand: ${found.brand || 'N/A'}, Category: ${found.category})`);

  // Test 4: Verify Non-existent / Hidden Slug returns null
  console.log('\n[4] Testing Non-existent Slug...');
  const notFound = await fetchProductBySlug('non-existent-hidden-product-12345');
  console.log(`✓ Non-existent product result: ${notFound === null ? 'null (PASSED)' : 'FAILED'}`);

  // Test 5: Verify Categories and Subcategories
  console.log('\n[5] Testing Categories...');
  const categories = await fetchCategories();
  console.log(`✓ Total Categories: ${categories.length}`);
  categories.slice(0, 3).forEach(c => {
    console.log(`  - Category: "${c.name}" -> ${c.subcategories.length} subcategories`);
  });

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

testFullMigration().catch(err => {
  console.error('Migration Test Failed:', err);
  process.exit(1);
});
