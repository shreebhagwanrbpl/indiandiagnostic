import { getCatalogFromSQLite, getWebsitePageData } from "./lib/sqliteDb.js";
import { fetchProductBySlug, fetchFullCatalog } from "./lib/data-fetcher.js";
import { WEBSITE_ID, COMPANY_ID, isItemVisibleOnWebsite } from "./lib/catalog-utils.js";

console.log("=== Testing SQLite Catalog Connection for Indian Diagnostic ===");
console.log(`WEBSITE_ID: ${WEBSITE_ID}`);
console.log(`COMPANY_ID: ${COMPANY_ID}`);

const start = performance.now();
const catalog = getCatalogFromSQLite(WEBSITE_ID, COMPANY_ID);
const duration = (performance.now() - start).toFixed(2);

console.log(`\nCatalog fetched in: ${duration} ms`);
console.log(`Total visible products: ${catalog.products.length}`);
console.log(`Total visible categories: ${catalog.categories.length}`);

if (catalog.categories.length > 0) {
  console.log("\nCategories & Subcategories:");
  catalog.categories.forEach(cat => {
    console.log(`- Category: ${cat.name} (${cat.subcategories.length} subcategories)`);
    cat.subcategories.forEach(sub => {
      console.log(`  * Subcategory: ${sub.name}`);
    });
  });
}

if (catalog.products.length > 0) {
  console.log("\nFirst 3 Products:");
  catalog.products.slice(0, 3).forEach((p, idx) => {
    console.log(` ${idx + 1}. [${p.id}] ${p.title} (${p.category} > ${p.subCategory}) [slug: ${p.slug}]`);
  });
}

// Test fetching by slug
async function testSlugLookup() {
  if (catalog.products.length > 0) {
    const testSlug = catalog.products[0].slug;
    console.log(`\nTesting fetchProductBySlug for slug: "${testSlug}"...`);
    const found = await fetchProductBySlug(testSlug);
    console.log(`Product lookup result: ${found ? `SUCCESS - Found: "${found.title}"` : "FAILED - Not found"}`);
  }
}

const homeData = getWebsitePageData("home", WEBSITE_ID, COMPANY_ID);
const contactData = getWebsitePageData("contact", WEBSITE_ID, COMPANY_ID);
const servicesData = getWebsitePageData("services", WEBSITE_ID, COMPANY_ID);

console.log("\nPage Data Verification:");
console.log(`- Home Page Data: ${homeData ? "FOUND" : "NOT FOUND"}`);
console.log(`- Contact Page Data: ${contactData ? `FOUND (${contactData.contactInfo?.length || 0} contact items)` : "NOT FOUND"}`);
console.log(`- Services Page Data: ${servicesData ? `FOUND (${servicesData.services?.length || 0} services)` : "NOT FOUND"}`);

await testSlugLookup();

console.log("\n=== Test Completed Successfully ===");
