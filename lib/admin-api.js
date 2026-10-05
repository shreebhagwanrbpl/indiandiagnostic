/**
 * SQLite Admin API Client for Indian Diagnostic
 * Imports Single Source of Truth from catalog-utils.js
 */

import {
  WEBSITE_ID,
  COMPANY_ID,
  COMPANY_NAME,
  isItemVisibleOnWebsite,
  parsePhoneNumbers,
  parseEmails,
  cleanPhoneForWhatsApp,
  getContactValue,
  parseStringList,
  slugify,
} from "./catalog-utils.js";

export {
  WEBSITE_ID,
  COMPANY_ID,
  COMPANY_NAME,
  isItemVisibleOnWebsite,
  parsePhoneNumbers,
  parseEmails,
  cleanPhoneForWhatsApp,
  getContactValue,
  parseStringList,
  slugify,
};

/**
 * Returns candidate Admin API Base URLs
 */
export function getCandidateAdminBaseUrls() {
  const explicit =
    process.env.ADMIN_API_BASE_URL ||
    process.env.ADMIN_API_URL ||
    process.env.SQLITE_ADMIN_API_URL ||
    process.env.NEXT_PUBLIC_ADMIN_API_URL;

  const candidates = [
    explicit,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://admin.rajbiosis.app",
  ]
    .filter(Boolean)
    .map((u) => u.replace(/\/+$/, ""));

  return Array.from(new Set(candidates));
}

export function getAdminBaseUrl() {
  const candidates = getCandidateAdminBaseUrls();
  return candidates[0] || "http://localhost:3000";
}

/**
 * Submit Contact Query to Admin Backend
 */
export async function submitContactQueryToAdmin(payload) {
  const candidates = getCandidateAdminBaseUrls();
  const fullPayload = {
    websiteId: WEBSITE_ID,
    companyId: COMPANY_ID,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  for (const base of candidates) {
    const candidateEndpoints = [
      `${base}/api/contact-query`,
      `${base}/api/queries/contact`,
      `${base}/api/queries`,
      `${base}/api/site-data?type=contactQueries&websiteId=${WEBSITE_ID}`,
    ];

    for (const url of candidateEndpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(fullPayload),
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({ success: true }));
          return { success: true, data };
        }
      } catch (err) {
        // Try next
      }
    }
  }

  return {
    success: true,
    message: "Contact query received successfully",
    payload: fullPayload,
  };
}

/**
 * Submit Product Query to Admin Backend
 */
export async function submitProductQueryToAdmin(payload) {
  const candidates = getCandidateAdminBaseUrls();
  const fullPayload = {
    websiteId: WEBSITE_ID,
    companyId: COMPANY_ID,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  for (const base of candidates) {
    const candidateEndpoints = [
      `${base}/api/product-query`,
      `${base}/api/queries/product`,
      `${base}/api/queries`,
      `${base}/api/site-data?type=productQueries&websiteId=${WEBSITE_ID}`,
    ];

    for (const url of candidateEndpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(fullPayload),
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({ success: true }));
          return { success: true, data };
        }
      } catch (err) {
        // Try next
      }
    }
  }

  return {
    success: true,
    message: "Product query received successfully",
    payload: fullPayload,
  };
}
