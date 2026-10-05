import {
  WEBSITE_ID,
  COMPANY_ID,
  COMPANY_NAME,
  isItemVisibleOnWebsite,
  slugify,
} from "./catalog-utils.js";

export { WEBSITE_ID, COMPANY_ID, COMPANY_NAME, isItemVisibleOnWebsite, slugify };
export const isProductVisibleOnCurrentSite = isItemVisibleOnWebsite;
export const KNOWN_COMPANIES = [COMPANY_ID];

async function getServerSqlite() {
  if (typeof window !== "undefined") return null;
  try {
    const mod = "./sqliteDb.js";
    return await import(/* webpackIgnore: true */ mod);
  } catch (err) {
    try {
      const nodePath = await import("path");
      const fullPath = nodePath.resolve(process.cwd(), "lib/sqliteDb.js");
      const fileUrl = `file://${fullPath.replace(/\\/g, "/")}`;
      return await import(/* webpackIgnore: true */ fileUrl);
    } catch (e) {
      console.error("[data-fetcher] Failed to load sqliteDb module:", err);
      return null;
    }
  }
}

/**
 * Server-side direct SQLite catalog reader
 */
export async function getAggregatedCatalogServer(websiteId = WEBSITE_ID, primaryCompanyId = COMPANY_ID) {
  if (typeof window !== "undefined") {
    return {
      products: [],
      categories: [],
      categoryProducts: [],
      normalProducts: [],
      total: 0,
      websiteId,
      primaryCompanyId,
      timestamp: new Date().toISOString(),
    };
  }
  try {
    const sqlite = await getServerSqlite();
    if (sqlite?.getCatalogFromSQLite) {
      return sqlite.getCatalogFromSQLite(websiteId, primaryCompanyId);
    }
    return {
      products: [],
      categories: [],
      total: 0,
      websiteId,
      primaryCompanyId,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[data-fetcher] Server aggregation error:", err);
    return {
      products: [],
      categories: [],
      categoryProducts: [],
      normalProducts: [],
      total: 0,
      websiteId,
      primaryCompanyId,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Isomorphic Fetch Full Catalog:
 * - Client: fetches /api/catalog with no-cache for instant zero-delay sync
 * - Server: reads directly from SQLite in ~2ms
 */
export async function fetchFullCatalog(forceRefresh = false) {
  // Client-Side Execution
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/catalog?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch catalog: ${res.status}`);
      }

      return await res.json();
    } catch (e) {
      console.error("[data-fetcher] Client fetchFullCatalog error:", e);
      return { products: [], categories: [], total: 0 };
    }
  }

  // Server-Side Execution (Direct SQLite Read)
  return getAggregatedCatalogServer(WEBSITE_ID, COMPANY_ID);
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

  if (found && isItemVisibleOnWebsite(found, WEBSITE_ID)) {
    return found;
  }

  return null;
}

export const fetchItemBySlug = fetchProductBySlug;

/**
 * Fetch Categories
 */
export async function fetchCategories(forceRefresh = false) {
  const catalog = await fetchFullCatalog(forceRefresh);
  return catalog.categories || [];
}

/**
 * Fetch Page Data from SQLite
 */
export async function fetchSitePageData(pageName) {
  if (!pageName) return null;

  if (typeof window === "undefined") {
    try {
      const sqlite = await getServerSqlite();
      if (sqlite?.getWebsitePageData) {
        return sqlite.getWebsitePageData(pageName, WEBSITE_ID, COMPANY_ID);
      }
      return null;
    } catch (e) {
      console.warn(`[data-fetcher] server fetchSitePageData error (${pageName}):`, e);
      return null;
    }
  }

  try {
    const res = await fetch(`/api/site-data?type=${pageName}&t=${Date.now()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      return json?.data || null;
    }
  } catch (e) {
    console.warn(`[data-fetcher] client fetchSitePageData error (${pageName}):`, e);
  }
  return null;
}
