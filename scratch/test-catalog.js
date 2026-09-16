const { getAggregatedCatalogServer } = require('../lib/data-fetcher.js');

async function testCatalog() {
  console.log('Testing getAggregatedCatalogServer()...');
  const start = Date.now();
  const catalog = await getAggregatedCatalogServer('indiandiagnostic', 'rajbiosis');
  console.log(`Time taken: ${Date.now() - start}ms`);
  console.log(`Total visible products: ${catalog.total}`);
  console.log(`Categories found: ${catalog.categories.length}`);
  catalog.categories.slice(0, 5).forEach(c => {
    console.log(`- Category: ${c.name} (${c.subcategories.length} subcategories)`);
  });

  if (catalog.products.length > 0) {
    console.log('Sample product:', {
      id: catalog.products[0].id,
      title: catalog.products[0].title,
      slug: catalog.products[0].slug,
      category: catalog.products[0].category,
      subCategory: catalog.products[0].subCategory,
      websiteIds: catalog.products[0].websiteIds,
    });
  }
}

testCatalog();
