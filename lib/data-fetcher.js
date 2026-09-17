import { adminDb } from "./firebase-admin.js";

export const WEBSITE_ID = process.env.NEXT_PUBLIC_WEBSITE_ID || "indiandiagnostic";
export const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || "rajbiosis";
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Raj Biosis";

export const KNOWN_COMPANIES = ["rajbiosis", "human", "global"];

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

  const targetSite = String(websiteId || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const wIds = Array.isArray(prod.websiteIds)
    ? prod.websiteIds.map((s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]/g, ""))
    : [];

  if (wIds.length === 0) {
    return false;
  }

  return (
    wIds.includes("all") ||
    wIds.includes(targetSite)
  );
}

/**
 * Server-side Catalog Aggregator:
 * Reads from:
 * 1. companies/[companyId]/categories + nested subcategories across all companies
 * 2. companies/[companyId]/products across all companies
 * 3. websites/[websiteId]/pages/categoryproducts/categories + nested subcategories
 * 4. websites/[websiteId]/pages/products (normal products)
 */
export async function getAggregatedCatalogServer(websiteId = WEBSITE_ID, primaryCompanyId = COMPANY_ID) {
  const categoryProductsList = [];
  const normalProductsList = [];
  const categoriesMap = new Map(); // slug -> { id, name, category, slug, subcategories: Map }

  // Unique list of companies to scan (primary company first)
  const companiesToScan = Array.from(new Set([primaryCompanyId, ...KNOWN_COMPANIES]));

  try {
    // 1. Fetch Master Categories & Products across all companies in parallel
    const companyFetchPromises = companiesToScan.map(async (compId) => {
      // A. Master Categories & Subcategories
      try {
        const compCatsSnap = await adminDb.collection(`companies/${compId}/categories`).get();
        if (compCatsSnap && !compCatsSnap.empty) {
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
                companyId: compId,
                websiteIds: catData.websiteIds || ["all"],
                subcategories: new Map(),
              });
            }
          }

          const compSubQueries = compCatsSnap.docs.map(async (catDoc) => {
            try {
              const subSnap = await adminDb.collection(`companies/${compId}/categories/${catDoc.id}/subcategories`).get();
              return { catDoc, subSnap };
            } catch (subErr) {
              return { catDoc, subSnap: { docs: [] } };
            }
          });

          const compSubResults = await Promise.allSettled(compSubQueries);
          for (const res of compSubResults) {
            if (res.status !== "fulfilled") continue;
            const { catDoc, subSnap } = res.value;
            const catData = catDoc.data() || {};
            const catName = catData.name || catData.category || catDoc.id;
            const catSlug = catData.slug || slugify(catName);
            const catEntry = categoriesMap.get(catSlug);

            if (catEntry && subSnap && subSnap.docs) {
              for (const subDoc of subSnap.docs) {
                const subData = subDoc.data() || {};
                const subName = subData.name || subData.subCategory || subDoc.id;
                const subSlug = subData.slug || slugify(subName);
                if (!catEntry.subcategories.has(subSlug)) {
                  catEntry.subcategories.set(subSlug, {
                    id: subDoc.id,
                    name: subName,
                    subCategory: subName,
                    slug: subSlug,
                    categoryId: catDoc.id,
                    companyId: compId,
                    websiteIds: subData.websiteIds || ["all"],
                  });
                }

                // 1. Extract products array stored inside subcategory doc
                const rawProducts = Array.isArray(subData.products) ? subData.products : [];
                rawProducts.forEach((item) => {
                  const itemTitle = (item.title || item.name || item.instrument || item.model || "").trim();
                  if (!itemTitle) return;

                  const itemSlug = item.slug?.trim() ? item.slug : slugify(itemTitle);
                  const itemCat = item.category || catName;
                  const itemSub = item.subCategory || subName;
                  const itemWebsiteIds = Array.isArray(item.websiteIds) && item.websiteIds.length > 0
                    ? item.websiteIds
                    : (Array.isArray(subData.websiteIds) && subData.websiteIds.length > 0 ? subData.websiteIds : ["all"]);

                  categoryProductsList.push({
                    ...item,
                    id: item.id || item.categoryProductId || item.productId || `${catSlug}-${subSlug}-${itemSlug}`,
                    categoryProductId: item.categoryProductId || item.id || "",
                    title: itemTitle,
                    name: itemTitle,
                    slug: itemSlug,
                    category: itemCat,
                    subCategory: itemSub,
                    categoryId: catDoc.id,
                    subcategoryId: subDoc.id,
                    companyId: compId,
                    type: item.type || "category",
                    websiteIds: itemWebsiteIds,
                    images: Array.isArray(item.images) && item.images.length > 0 ? item.images : item.image ? [item.image] : [],
                    video: item.video || "",
                    pdf: item.pdf || "",
                    isPublished: item.isPublished !== false,
                  });
                });
              }
            }
          }
        }
      } catch (compCatErr) {
        console.warn(`Error reading master categories for company ${compId}:`, compCatErr?.message || compCatErr);
      }

      // B. Master Products
      try {
        const compProdsSnap = await adminDb.collection(`companies/${compId}/products`).get();
        if (compProdsSnap && !compProdsSnap.empty) {
          compProdsSnap.docs.forEach((prodDoc) => {
            const item = prodDoc.data() || {};
            const itemTitle = (item.title || item.name || item.instrument || item.model || "").trim();
            if (!itemTitle) return; // Skip incomplete or dummy records without title

            const itemSlug = item.slug?.trim() ? item.slug : slugify(itemTitle);
            const rawCat = item.category?.trim() || "Products";
            const rawSub = item.subCategory?.trim() || item.subcategory?.trim() || "General";

            categoryProductsList.push({
              ...item,
              id: prodDoc.id,
              categoryProductId: item.categoryProductId || prodDoc.id,
              title: itemTitle,
              name: itemTitle,
              slug: itemSlug,
              type: item.type || "category",
              category: rawCat,
              subCategory: rawSub,
              companyId: compId,
              websiteIds: Array.isArray(item.websiteIds) ? item.websiteIds : ["all"],
              images: Array.isArray(item.images) && item.images.length > 0 ? item.images : item.image ? [item.image] : [],
              video: item.video || "",
              pdf: item.pdf || "",
              isPublished: item.isPublished !== false,
            });
          });
        }
      } catch (compProdErr) {
        console.warn(`Error reading master products for company ${compId}:`, compProdErr?.message || compProdErr);
      }
    });

    // 2. Fetch Legacy Website Collections (non-blocking in parallel)
    const legacyFetchPromise = (async () => {
      try {
        const webCatsSnap = await adminDb.collection(`websites/${websiteId}/pages/categoryproducts/categories`).get();
        if (webCatsSnap && !webCatsSnap.empty) {
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

              return { categoryDoc, categoryData, catName, catSlug, subSnap };
            } catch (e) {
              return { categoryDoc, categoryData, catName, catSlug, subSnap: { docs: [] } };
            }
          });

          const results = await Promise.allSettled(subQueries);

          for (const r of results) {
            if (r.status !== "fulfilled") continue;
            const { catName, catSlug, subSnap } = r.value;
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
                const itemTitle = (item.title || item.name || item.instrument || item.model || "").trim();
                if (!itemTitle) return;
                const itemSlug = item.slug?.trim() ? item.slug : slugify(itemTitle);
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
                  images: Array.isArray(item.images) && item.images.length > 0 ? item.images : item.image ? [item.image] : [],
                  video: item.video || "",
                  pdf: item.pdf || "",
                  isPublished: item.isPublished !== false,
                });
              });
            });
          }
        }
      } catch (webCatErr) {
        // Non-fatal
      }

      // Legacy Normal Products
      try {
        const normalSnap = await adminDb.doc(`websites/${websiteId}/pages/products`).get();
        if (normalSnap.exists) {
          const rawNormal = normalSnap.data()?.products || [];
          rawNormal.forEach((item) => {
            const itemTitle = (item.title || item.name || item.instrument || item.model || "").trim();
            if (!itemTitle) return;
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
              images: Array.isArray(item.images) && item.images.length > 0 ? item.images : item.image ? [item.image] : [],
              video: item.video || "",
              pdf: item.pdf || "",
              isPublished: item.isPublished !== false,
            });
          });
        }
      } catch (normalErr) {
        // Non-fatal
      }
    })();

    // Run all fetches concurrently
    await Promise.allSettled([...companyFetchPromises, legacyFetchPromise]);

  } catch (globalErr) {
    console.error("Global Catalog Aggregation Error:", globalErr);
  }

  // Deduplicate and filter strictly visible products
  const uniqueProductsMap = new Map();

  const addUnique = (prod) => {
    // 1. Strict website visibility verification
    if (!isProductVisibleOnCurrentSite(prod, websiteId)) {
      return;
    }

    const key = prod.slug || prod.categoryProductId || prod.productId || prod.id;
    if (!key) return;

    if (!uniqueProductsMap.has(key)) {
      uniqueProductsMap.set(key, prod);
    } else {
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

  // Collect set of categories & subcategories with active visible products
  const activeCategoriesMap = new Map();

  finalProducts.forEach((prod) => {
    const catName = prod.category || "General";
    const catSlug = slugify(catName);
    const subName = prod.subCategory || "General";
    const subSlug = slugify(subName);

    if (!activeCategoriesMap.has(catSlug)) {
      activeCategoriesMap.set(catSlug, {
        id: catSlug,
        name: catName,
        category: catName,
        slug: catSlug,
        subcategories: new Map(),
      });
    }

    const catObj = activeCategoriesMap.get(catSlug);
    if (!catObj.subcategories.has(subSlug)) {
      catObj.subcategories.set(subSlug, {
        id: subSlug,
        name: subName,
        subCategory: subName,
        slug: subSlug,
        categoryId: catSlug,
      });
    }
  });

  const finalCategories = Array.from(activeCategoriesMap.values()).map((cat) => ({
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
    primaryCompanyId,
    timestamp: new Date().toISOString(),
  };
}

let serverMemoryCache = null;
let serverCacheTime = 0;
let activeServerCatalogPromise = null;
const CACHE_TTL_MS = 0; // 0ms for instant real-time sync with SuperAdmin updates


/**
 * Isomorphic Fetch Full Catalog
 */
export async function fetchFullCatalog(forceRefresh = false) {
  // Client-Side Execution
  if (typeof window !== "undefined") {
    try {
      const cacheBust = forceRefresh ? `?t=${Date.now()}` : "";
      const res = await fetch(`/api/catalog${cacheBust}`, {
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

  // Invalidate cache if forceRefresh is requested
  if (forceRefresh) {
    serverMemoryCache = null;
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
      console.warn("fetchFullCatalog server aggregation error:", err?.message || err);
      activeServerCatalogPromise = null;
      if (serverMemoryCache) return serverMemoryCache;
      return {
        products: [],
        categories: [],
        categoryProducts: [],
        normalProducts: [],
        total: 0,
        websiteId: WEBSITE_ID,
        primaryCompanyId: COMPANY_ID,
        timestamp: new Date().toISOString(),
      };
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
