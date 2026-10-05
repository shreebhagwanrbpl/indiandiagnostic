import {
  WEBSITE_ID,
  COMPANY_ID,
  COMPANY_NAME,
  isItemVisibleOnWebsite,
  slugify,
  makeSlug,
  normalizeSlug,
  normalizeDomainId,
  normalizeProduct,
} from "./catalog-utils.js";

export {
  WEBSITE_ID,
  COMPANY_ID,
  COMPANY_NAME,
  isItemVisibleOnWebsite,
  slugify,
  makeSlug,
  normalizeSlug,
  normalizeDomainId,
  normalizeProduct,
};

export const isProductVisibleOnCurrentSite = isItemVisibleOnWebsite;
export const KNOWN_COMPANIES = [COMPANY_ID];

let clientCatalogCache = null;
let clientCatalogPromise = null;
let lastCatalogFetch = 0;
const CLIENT_CACHE_TTL = 15000;

export async function fetchFullCatalogData() {
  if (typeof window === "undefined") {
    const { fetchFullCatalogData: fetchServerData } = await import("./db-server.js");
    return await fetchServerData();
  }

  const now = Date.now();
  if (clientCatalogCache && now - lastCatalogFetch < CLIENT_CACHE_TTL) {
    return clientCatalogCache;
  }

  if (clientCatalogPromise) {
    return clientCatalogPromise;
  }

  clientCatalogPromise = (async () => {
    try {
      const res = await fetch("/api/catalog", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch catalog: " + res.status);
      }
      const data = await res.json();
      clientCatalogCache = data;
      lastCatalogFetch = Date.now();
      return data;
    } catch (err) {
      console.error("[data-fetcher] Error in fetchFullCatalogData:", err);
      return { products: [], categoryProducts: [], categoryList: [], total: 0 };
    } finally {
      clientCatalogPromise = null;
    }
  })();

  return clientCatalogPromise;
}

export async function fetchFullCatalog(forceRefresh = false) {
  if (typeof window === "undefined") {
    const { fetchFullCatalogData: fetchServerData } = await import("./db-server.js");
    const data = await fetchServerData();
    return data;
  }

  if (forceRefresh) {
    clientCatalogCache = null;
  }

  const data = await fetchFullCatalogData();
  return data;
}

export async function getCategoriesData() {
  const data = await fetchFullCatalogData();
  return {
    categoryList: data?.categoryList || [],
    categoryProducts: data?.categoryProducts || data?.products || [],
  };
}

export async function fetchProductBySlug(slug, forceRefresh = false) {
  if (!slug) return null;

  if (typeof window === "undefined") {
    const { getProductBySlug } = await import("./db-server.js");
    return await getProductBySlug(slug);
  }

  const catalog = await fetchFullCatalog(forceRefresh);
  const products = catalog.products || catalog.categoryProducts || [];
  const target = normalizeSlug(slug);

  return (
    products.find(
      (p) =>
        normalizeSlug(p.slug) === target ||
        normalizeSlug(p.id) === target ||
        normalizeSlug(p.categoryProductId) === target ||
        normalizeSlug(p.productId) === target
    ) || null
  );
}

export const fetchItemBySlug = fetchProductBySlug;
export const getProductBySlug = fetchProductBySlug;

export async function fetchCategories(forceRefresh = false) {
  const catalog = await fetchFullCatalog(forceRefresh);
  return catalog.categories || catalog.categoryList || [];
}

export async function fetchSitePageData(pageName) {
  if (!pageName) return null;

  if (typeof window === "undefined") {
    const { getHomeData, getServicesData, getContactData } = await import("./db-server.js");
    if (pageName === "home") return await getHomeData();
    if (pageName === "services") return await getServicesData();
    if (pageName === "contact") return await getContactData();
    return null;
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
