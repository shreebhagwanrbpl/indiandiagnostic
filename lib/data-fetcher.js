import { adminDb } from "./firebase-admin.js";

export const WEBSITE_ID = process.env.NEXT_PUBLIC_WEBSITE_ID || "indiandiagnostic";
export const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || "rajbiosis";
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Raj Biosis";

export const slugify = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

/**
 * Strict website visibility check:
 * Product is ONLY visible if:
 * 1. isPublished is not explicitly false
 * 2. websiteIds is an array containing WEBSITE_ID or "all"
 */
export function isProductVisibleOnCurrentSite(prod, websiteId = WEBSITE_ID) {
  if (!prod) return false;
  if (prod.isPublished === false) return false;

  const wIds = prod.websiteIds;
  if (!Array.isArray(wIds) || wIds.length === 0) {
    return false;
  }

  return wIds.includes("all") || wIds.includes(websiteId);
}

/**
 * Server-side Catalog Aggregator:
 * Reads from:
 * 1. companies/[COMPANY_ID]/categories + nested subcategories
 * 2. websites/[WEBSITE_ID]/pages/categoryproducts/categories + nested subcategories
 * 3. companies/[COMPANY_ID]/products
 * 4. websites/[WEBSITE_ID]/pages/products (normal products)
 */
export async function getAggregatedCatalogServer(websiteId = WEBSITE_ID, companyId = COMPANY_ID) {
  const categoryProductsList = [];
  const normalProductsList = [];
  const categoriesMap = new Map(); // slug -> { id, name, category, slug, subcategories: Map }

  try {
    // 1. Fetch Company Master Categories & Subcategories
    try {
      const compCatsSnap = await adminDb.collection(`companies/${companyId}/categories`).get();
      if (compCatsSnap && compCatsSnap.docs) {
        for (const catDoc of compCatsSnap.docs) {
          const catData = catDoc.data() || {};
          const catName = catData.name || catData.category || catDoc.id;
          const catSlug = catData.slug || slugify(catName);

          if (!categoriesMap.has(catSlug)) {
            categoriesMap.set(catSlug, {
              id: catDoc.id,
              name: catName,
              category: catName,
              slug: catSlug,
              websiteIds: catData.websiteIds || ["all"],
              subcategories: new Map(),
            });
          }
        }

        const compSubQueries = compCatsSnap.docs.map(async (catDoc) => {
          try {
            const subSnap = await adminDb.collection(`companies/${companyId}/categories/${catDoc.id}/subcategories`).get();
            return { catDoc, subSnap };
          } catch (subErr) {
            return { catDoc, subSnap: { docs: [] } };
          }
        });

        const compSubResults = await Promise.all(compSubQueries);
        for (const { catDoc, subSnap } of compSubResults) {
          const catData = catDoc.data() || {};
          const catName = catData.name || catData.category || catDoc.id;
          const catSlug = catData.slug || slugify(catName);
          const catEntry = categoriesMap.get(catSlug);

          if (catEntry && subSnap && subSnap.docs) {
            for (const subDoc of subSnap.docs) {
              const subData = subDoc.data() || {};
              const subName = subData.name || subData.subCategory || subDoc.id;
              const subSlug = subData.slug || slugify(subName);
              catEntry.subcategories.set(subSlug, {
                id: subDoc.id,
                name: subName,
                subCategory: subName,
                slug: subSlug,
                categoryId: catDoc.id,
                websiteIds: subData.websiteIds || ["all"],
              });
            }
          }
        }
      }
    } catch (compErr) {
      console.warn("Error reading company master categories:", compErr);
    }

    // 2. Fetch Website Category Products (websites/[websiteId]/pages/categoryproducts/categories)
    try {
      const webCatsSnap = await adminDb.collection(`websites/${websiteId}/pages/categoryproducts/categories`).get();
      if (webCatsSnap && webCatsSnap.docs) {
        const subQueries = webCatsSnap.docs.map(async (categoryDoc) => {
          const categoryData = categoryDoc.data() || {};
          const catName = categoryData.category || categoryData.name || categoryDoc.id;
          const catSlug = slugify(catName);

          if (!categoriesMap.has(catSlug)) {
            categoriesMap.set(catSlug, {
              id: categoryDoc.id,
              name: catName,
              category: catName,
              slug: catSlug,
              websiteIds: categoryData.websiteIds || [websiteId],
              subcategories: new Map(),
            });
          }

          try {
            const subSnap = await adminDb.collection(
              `websites/${websiteId}/pages/categoryproducts/categories/${categoryDoc.id}/subcategories`
            ).get();

            return {
              categoryDoc,
              categoryData,
              catName,
              catSlug,
              subSnap,
            };
          } catch (e) {
            return {
              categoryDoc,
              categoryData,
              catName,
              catSlug,
              subSnap: { docs: [] },
            };
          }
        });

        const results = await Promise.all(subQueries);

        for (const { catName, catSlug, subSnap } of results) {
          const catEntry = categoriesMap.get(catSlug);

          subSnap.docs.forEach((subDoc) => {
            const subData = subDoc.data() || {};
            const subName = subData.subCategory || subData.name || subDoc.id;
            const subSlug = slugify(subName);

            if (catEntry && !catEntry.subcategories.has(subSlug)) {
              catEntry.subcategories.set(subSlug, {
                id: subDoc.id,
                name: subName,
                subCategory: subName,
                slug: subSlug,
                categoryId: catEntry.id,
                websiteIds: subData.websiteIds || [websiteId],
              });
            }

            const rawProducts = subData.products || [];
            rawProducts.forEach((item) => {
              const itemTitle = item.title || item.name || item.instrument || item.model || "Medical Equipment";
              const itemSlug = item.slug?.trim() ? item.slug : slugify(itemTitle);
              
              // Standardize websiteIds if missing on website-specific doc
              const itemWebsiteIds = Array.isArray(item.websiteIds) && item.websiteIds.length > 0
                ? item.websiteIds
                : [websiteId];

              categoryProductsList.push({
                ...item,
                id: item.id || item.categoryProductId || `${catSlug}-${subSlug}-${itemSlug}`,
                categoryProductId: item.categoryProductId || item.id || "",
                title: itemTitle,
                name: itemTitle,
                slug: itemSlug,
                category: catName,
                subCategory: subName,
                type: "category",
                websiteIds: itemWebsiteIds,
                images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
                video: item.video || "",
                pdf: item.pdf || "",
              });
            });
          });
        }
      }
    } catch (webCatErr) {
      console.warn("Error reading website category products:", webCatErr);
    }

    // 3. Fetch Company Master Products (companies/[companyId]/products)
    try {
      const compProdsSnap = await adminDb.collection(`companies/${companyId}/products`).get();
      if (compProdsSnap && compProdsSnap.docs) {
        compProdsSnap.docs.forEach((prodDoc) => {
          const item = prodDoc.data() || {};
          const itemTitle = item.title || item.name || item.instrument || item.model || "Medical Equipment";
          const itemSlug = item.slug?.trim() ? item.slug : slugify(itemTitle);

          categoryProductsList.push({
            ...item,
            id: prodDoc.id,
            categoryProductId: item.categoryProductId || prodDoc.id,
            title: itemTitle,
            name: itemTitle,
            slug: itemSlug,
            type: item.type || "category",
            category: item.category || "General",
            subCategory: item.subCategory || item.subcategory || "General",
            websiteIds: Array.isArray(item.websiteIds) ? item.websiteIds : ["all"],
            images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
            video: item.video || "",
            pdf: item.pdf || "",
          });
        });
      }
    } catch (compProdErr) {
      console.warn("Error reading company products:", compProdErr);
    }

    // 4. Fetch Normal Products (websites/[websiteId]/pages/products)
    try {
      const normalSnap = await adminDb.doc(`websites/${websiteId}/pages/products`).get();
      if (normalSnap.exists) {
        const rawNormal = normalSnap.data()?.products || [];
        rawNormal.forEach((item) => {
          const itemTitle = item.title || item.instrument || item.model || "Medical Equipment";
          const itemSlug = item.slug?.trim() ? item.slug : slugify(itemTitle);

          normalProductsList.push({
            ...item,
            id: item.productId ? `prod-${item.productId}` : itemSlug,
            productId: item.productId || "",
            title: itemTitle,
            name: itemTitle,
            slug: itemSlug,
            category: item.category || "Normal Products",
            subCategory: item.subCategory || "General",
            type: "normal",
            websiteIds: Array.isArray(item.websiteIds) && item.websiteIds.length > 0 ? item.websiteIds : [websiteId],
            images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
            video: item.video || "",
            pdf: item.pdf || "",
          });
        });
      }
    } catch (normalErr) {
      console.warn("Error reading normal products:", normalErr);
    }

  } catch (globalErr) {
    console.error("Global Catalog Aggregation Error:", globalErr);
  }

  // Deduplicate products across all collections
  const uniqueProductsMap = new Map();

  const addUnique = (prod) => {
    // Check strict visibility first
    if (!isProductVisibleOnCurrentSite(prod, websiteId)) {
      return;
    }

    const key = prod.slug || prod.categoryProductId || prod.productId || prod.id;
    if (!key) return;

    if (!uniqueProductsMap.has(key)) {
      uniqueProductsMap.set(key, prod);
    } else {
      // Merge properties if already present
      const existing = uniqueProductsMap.get(key);
      uniqueProductsMap.set(key, {
        ...existing,
        ...prod,
        images: prod.images && prod.images.length > 0 ? prod.images : existing.images,
      });
    }
  };

  categoryProductsList.forEach(addUnique);
  normalProductsList.forEach(addUnique);

  const finalProducts = Array.from(uniqueProductsMap.values());

  // Format categories list
  const finalCategories = Array.from(categoriesMap.values()).map((cat) => ({
    ...cat,
    subcategories: Array.from(cat.subcategories.values()),
  }));

  return {
    products: finalProducts,
    categories: finalCategories,
    categoryProducts: finalProducts.filter((p) => p.type === "category"),
    normalProducts: finalProducts.filter((p) => p.type === "normal"),
    total: finalProducts.length,
    websiteId,
    companyId,
    timestamp: new Date().toISOString(),
  };
}

let serverMemoryCache = null;
let serverCacheTime = 0;
let activeServerCatalogPromise = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in server memory

/**
 * Isomorphic Fetch Full Catalog
 */
export async function fetchFullCatalog(forceRefresh = false) {
  // Client-Side Execution
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/catalog", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch catalog: ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error("Client fetchFullCatalog error:", e);
      return { products: [], categories: [], total: 0 };
    }
  }

  // Server-Side Execution
  const now = Date.now();
  if (!forceRefresh && serverMemoryCache && now - serverCacheTime < CACHE_TTL_MS) {
    return serverMemoryCache;
  }

  // Deduplicate concurrent fetch promises
  if (activeServerCatalogPromise) {
    return activeServerCatalogPromise;
  }

  activeServerCatalogPromise = getAggregatedCatalogServer()
    .then((catalog) => {
      serverMemoryCache = catalog;
      serverCacheTime = Date.now();
      activeServerCatalogPromise = null;
      return catalog;
    })
    .catch((err) => {
      activeServerCatalogPromise = null;
      if (serverMemoryCache) return serverMemoryCache;
      throw err;
    });

  return activeServerCatalogPromise;
}

/**
 * Fetch Product By Slug
 */
export async function fetchProductBySlug(slug, forceRefresh = false) {
  if (!slug) return null;
  const decodedRaw = decodeURIComponent(String(slug)).trim();
  const targetLower = decodedRaw.toLowerCase();
  const normalizedTarget = slugify(decodedRaw);

  const catalog = await fetchFullCatalog(forceRefresh);
  const found = (catalog.products || []).find((p) => {
    const pSlugRaw = (p.slug || "").toLowerCase().trim();
    const pSlugNorm = slugify(p.slug || "");
    const pTitleNorm = slugify(p.title || p.name || p.instrument || p.model || "");
    const pId = (p.id || "").toString().toLowerCase().trim();
    const pCatProdId = (p.categoryProductId || "").toString().toLowerCase().trim();
    const pProdId = (p.productId || "").toString().toLowerCase().trim();

    return (
      pSlugRaw === targetLower ||
      pSlugNorm === normalizedTarget ||
      pTitleNorm === normalizedTarget ||
      pTitleNorm === targetLower ||
      pId === targetLower ||
      pCatProdId === targetLower ||
      pProdId === targetLower ||
      slugify(pId) === normalizedTarget ||
      slugify(pCatProdId) === normalizedTarget
    );
  });

  if (found && isProductVisibleOnCurrentSite(found)) {
    return found;
  }

  return null;
}

/**
 * Backward compatibility alias
 */
export const fetchItemBySlug = fetchProductBySlug;

/**
 * Fetch Categories
 */
export async function fetchCategories(forceRefresh = false) {
  const catalog = await fetchFullCatalog(forceRefresh);
  return catalog.categories || [];
}
