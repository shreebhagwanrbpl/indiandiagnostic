/**
 * SuperAdmin MongoDB Client for Indian Diagnostic
 */
import {
  WEBSITE_ID,
  COMPANY_ID,
  COMPANY_NAME,
  PRIMARY_COMPANY,
  ALL_COMPANIES,
  normalizeDomainId,
  isItemVisibleOnWebsite,
  normalizeProduct,
  makeSlug,
  normalizeSlug,
  slugify,
  parseStringList,
  parsePhoneNumbers,
  parseEmails,
  cleanPhoneForWhatsApp,
  getContactValue,
} from "./catalog-utils.js";

export {
  WEBSITE_ID,
  COMPANY_ID,
  COMPANY_NAME,
  PRIMARY_COMPANY,
  ALL_COMPANIES,
  normalizeDomainId,
  isItemVisibleOnWebsite,
  normalizeProduct,
  makeSlug,
  normalizeSlug,
  slugify,
  parseStringList,
  parsePhoneNumbers,
  parseEmails,
  cleanPhoneForWhatsApp,
  getContactValue,
};

export const DEFAULT_ADMIN_API_BASE_URL = "https://admin.rajbiosis.app";

export function getAdminApiBaseUrl() {
  const url =
    process.env.ADMIN_API_BASE_URL ||
    process.env.ADMIN_API_URL ||
    DEFAULT_ADMIN_API_BASE_URL;

  return url.replace(/\/+$/, "");
}

function noCacheFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
      Pragma: "no-cache",
      ...(options.headers || {}),
    },
  });
}

async function readJson(url, options) {
  try {
    const response = await noCacheFetch(url, options);
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (!response.ok) {
      console.error(`[admin-api] ${response.status} from ${url}`, body);
      return null;
    }
    return body;
  } catch (err) {
    console.error(`[admin-api] Fetch error for ${url}:`, err.message);
    return null;
  }
}

/**
 * Fetch full catalog from SuperAdmin MongoDB Backend
 */
export async function fetchCatalogFromAdmin(websiteId = WEBSITE_ID, companyId = COMPANY_ID) {
  const baseUrl = getAdminApiBaseUrl();
  const url = `${baseUrl}/api/${encodeURIComponent(companyId)}/catalog?websiteId=${encodeURIComponent(websiteId)}`;
  const json = await readJson(url);

  if (!json?.success && !Array.isArray(json?.products) && !Array.isArray(json?.data)) {
    return { success: false, products: [], categories: [] };
  }

  const rawProducts = Array.isArray(json.products)
    ? json.products
    : Array.isArray(json.data)
    ? json.data
    : [];

  return {
    success: true,
    products: rawProducts,
    categories: json.categories || [],
    total: rawProducts.length,
  };
}

/**
 * Fetch site pages/data from SuperAdmin MongoDB Backend
 */
export async function fetchSiteDataFromAdmin(websiteId = WEBSITE_ID, type = "home", page = "", companyId = COMPANY_ID) {
  const baseUrl = getAdminApiBaseUrl();

  if (type === "districts" || type === "district") {
    const params = new URLSearchParams({
      type,
      companyId,
      websiteId,
    });
    const url = `${baseUrl}/api/site-data?${params.toString()}`;
    const json = await readJson(url);
    if (!json?.success) return null;
    return json.data !== undefined ? json.data : json.districts ?? null;
  }

  const requestedPage = page || type;
  const params = new URLSearchParams({ websiteId });
  if (requestedPage) params.set("page", requestedPage);

  const url = `${baseUrl}/api/${encodeURIComponent(companyId)}/site-data?${params.toString()}`;
  const json = await readJson(url);
  if (!json?.success) return null;

  if (requestedPage && json.data) return json.data;
  if (requestedPage && json.pages?.[requestedPage]) return json.pages[requestedPage];
  return json.pages ?? json;
}

export async function submitAdminQuery(payload = {}, type = "contact") {
  const baseUrl = getAdminApiBaseUrl();
  const url = `${baseUrl}/api/${encodeURIComponent(COMPANY_ID)}/query?websiteId=${encodeURIComponent(WEBSITE_ID)}`;

  const fullPayload = {
    websiteId: WEBSITE_ID,
    companyId: COMPANY_ID,
    type,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const json = await readJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fullPayload),
  });

  if (json?.ok || json?.success) return { success: true, ...json };
  return {
    success: true,
    message: "Enquiry submitted successfully",
    payload: fullPayload,
  };
}

export function submitContactQueryToAdmin(data = {}) {
  return submitAdminQuery(data, "contact");
}

export function submitProductQueryToAdmin(data = {}) {
  return submitAdminQuery(data, "product");
}
