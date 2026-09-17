import { fetchFullCatalog, slugify } from "./data-fetcher.js";

let cachedSlugs = null;

export async function fetchAllProductSlugs() {
  if (cachedSlugs && cachedSlugs.length > 0) {
    return cachedSlugs;
  }

  const slugs = new Set();

  try {
    const catalog = await fetchFullCatalog();
    const visibleProducts = catalog.products || [];

    visibleProducts.forEach((item) => {
      const slug =
        (item.slug && item.slug.trim()) ||
        slugify(item.title || item.name || item.instrument || item.model || (item.productId ? `product-${item.productId}` : ""));
      if (slug) slugs.add(slug);
    });
  } catch (error) {
    console.error("Error fetching product slugs for static params:", error);
  cachedSlugs = Array.from(slugs).map((slug) => ({ slug }));
  return cachedSlugs;
}


