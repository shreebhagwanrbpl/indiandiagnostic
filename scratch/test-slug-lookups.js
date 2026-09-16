const { fetchFullCatalog, fetchProductBySlug, slugify } = require('../lib/data-fetcher.js');

async function testAll() {
  console.log('Testing full catalog and slug lookups...');
  const cat = await fetchFullCatalog();
  console.log('Total catalog products:', cat.products.length);

  const testCases = [
    cat.products[0]?.slug,
    encodeURIComponent(cat.products[0]?.slug || ''),
    slugify(cat.products[0]?.title || ''),
    cat.products[1]?.slug,
    cat.products[2]?.slug,
  ];

  for (const tc of testCases) {
    if (!tc) continue;
    const found = await fetchProductBySlug(tc);
    console.log(`Lookup '${tc}' =>`, found ? `Found: "${found.title}"` : 'NOT FOUND');
  }

  console.log('\nTesting complete!');
}

testAll().catch(err => {
  console.error(err);
  process.exit(1);
});
