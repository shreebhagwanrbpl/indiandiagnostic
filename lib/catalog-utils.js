/**
 * Single Source of Truth for Website Configuration & Visibility Utilities
 */

export const WEBSITE_ID = "indiandiagnostic";
export const COMPANY_ID = "rajbiosis";
export const COMPANY_NAME = "Raj Biosis";
export const SQLITE_DB_PATH = "../SuperAdminRBPL/data/catalog.db";

/**
 * Normalizes a domain or website ID:
 * Removes protocol, www, dots, hyphens, underscores, slashes, whitespace and returns lowercase.
 */
export function normalizeDomainId(id = "") {
  if (!id) return "";
  return String(id)
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Strict Exact Domain Matching & Visibility Check
 * Rules:
 * 1. isPublished === false -> false
 * 2. status === "inactive" or "draft" -> false
 * 3. websiteIds is an empty array [] -> false (0 access)
 * 4. websiteIds contains "all" or exact normalized target -> true
 * 5. websiteIds is undefined/null -> true (default visible)
 * 6. otherwise -> false (STRICT MATCH, NO LOOSE ALIAS LEAKS)
 */
export function isItemVisibleOnWebsite(item, targetWebsiteId = WEBSITE_ID) {
  if (!item) return false;

  // 1. Explicit publication check
  if (item.isPublished === false) return false;

  // 2. Status check
  if (item.status === "inactive" || item.status === "draft") return false;

  // 3. Website IDs check
  const rawWIds = item.websiteIds;

  // Undefined or null defaults to visible
  if (rawWIds === undefined || rawWIds === null) {
    return true;
  }

  if (Array.isArray(rawWIds)) {
    // Explicit empty array means no websites assigned
    if (rawWIds.length === 0) {
      return false;
    }

    const normalizedTarget = normalizeDomainId(targetWebsiteId || WEBSITE_ID);
    const normalizedWIds = rawWIds.map((w) => normalizeDomainId(w));

    return (
      normalizedWIds.includes("all") ||
      normalizedWIds.includes(normalizedTarget)
    );
  }

  // Single string websiteId
  if (typeof rawWIds === "string") {
    const norm = normalizeDomainId(rawWIds);
    if (!norm) return false;
    const normalizedTarget = normalizeDomainId(targetWebsiteId || WEBSITE_ID);
    return norm === "all" || norm === normalizedTarget;
  }

  return false;
}

/**
 * Alias for backward compatibility
 */
export const isProductVisibleOnCurrentSite = isItemVisibleOnWebsite;

/**
 * Standard Slugify utility
 */
export function slugify(text = "") {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Helper to parse comma / slash / newline separated or array items into a clean string array
 */
export function parseStringList(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .flatMap((item) => parseStringList(item))
      .map((s) => String(s).trim())
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/[,/\n|;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [String(input).trim()].filter(Boolean);
}

export function parsePhoneNumbers(input) {
  return parseStringList(input);
}

export function parseEmails(input) {
  return parseStringList(input);
}

export function cleanPhoneForWhatsApp(phone) {
  if (!phone) return "";
  const first = Array.isArray(phone) ? phone[0] : String(phone).split(/[,/\n|;]+/)[0];
  if (!first) return "";
  const cleaned = String(first).replace(/[^0-9]/g, "");
  if (!cleaned) return "";
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

export function getContactValue(contactInfo = [], label = "") {
  if (!Array.isArray(contactInfo)) return "";
  const match = contactInfo.find(
    (item) =>
      item?.label?.trim()?.toLowerCase() === label.trim().toLowerCase()
  );
  return match?.value ?? "";
}
