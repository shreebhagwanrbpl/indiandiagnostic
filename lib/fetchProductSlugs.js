import { db, doc, getDoc, collection, getDocs } from "./firebase";

export const slugify = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

let cachedSlugs = null;

export async function fetchAllProductSlugs() {
  if (cachedSlugs && cachedSlugs.length > 0) {
    return cachedSlugs;
  }

  const slugs = new Set();

  try {
    // 1. Normal products
    const productsSnap = await getDoc(
      doc(db, "websites", "indiandiagnostic", "pages", "products")
    );
    if (productsSnap.exists()) {
      const raw = productsSnap.data()?.products || [];
      raw.forEach((item) => {
        const slug =
          item.slug?.trim() ||
          slugify(item.title || item.instrument || item.model || (item.productId ? `product-${item.productId}` : ""));
        if (slug) slugs.add(slug);
      });
    }

    // 2. Category products
    const categorySnap = await getDocs(
      collection(db, "websites", "indiandiagnostic", "pages", "categoryproducts", "categories")
    );

    const subQueries = categorySnap.docs.map((categoryDoc) => {
      return getDocs(
        collection(
          db,
          "websites",
          "indiandiagnostic",
          "pages",
          "categoryproducts",
          "categories",
          categoryDoc.id,
          "subcategories"
        )
      );
    });

    const results = await Promise.all(subQueries);
    results.forEach((subSnap) => {
      subSnap.forEach((subDoc) => {
        const subData = subDoc.data();
        (subData.products || []).forEach((item) => {
          const slug =
            item.slug?.trim() ||
            slugify(item.title || item.instrument || item.model || (item.productId ? `product-${item.productId}` : ""));
          if (slug) slugs.add(slug);
        });
      });
    });
  } catch (error) {
    console.error("Error fetching product slugs for static params:", error);
  }

  // Fallbacks
  slugs.add("autobio-autolumo-a1860");
  slugs.add("medical-equipment");
  slugs.add("diagnostic-analyzer");

  cachedSlugs = Array.from(slugs).map((slug) => ({ slug }));
  return cachedSlugs;
}
