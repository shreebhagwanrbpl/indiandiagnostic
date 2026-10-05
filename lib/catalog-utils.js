/**
 * Single Source of Truth for Website Configuration & Dynamic Visibility
 */

export const WEBSITE_ID = "indiandiagnostic";
export const COMPANY_ID = "rajbiosis";
export const COMPANY_NAME = "Indian Diagnostic";
export const PRIMARY_COMPANY = "rajbiosis";
export const ALL_COMPANIES = ["rajbiosis"];

export function normalizeDomainId(str = "") {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[\/\?#].*$/, "")
    .replace(/[^a-z0-9]/g, "");
}

export const TARGET_WEBSITE_NORM = normalizeDomainId(WEBSITE_ID);

export function isItemVisibleOnWebsite(item, websiteId = WEBSITE_ID) {
  if (!item) return false;
  if (item.isPublished === false) return false;
  if (item.status === "inactive" || item.status === "draft") return false;

  const targetNorm = normalizeDomainId(websiteId) || TARGET_WEBSITE_NORM;
  const rawWIds = item.websiteIds !== undefined ? item.websiteIds : item.data?.websiteIds;

  if (rawWIds === undefined || rawWIds === null) {
    return true;
  }

  if (Array.isArray(rawWIds)) {
    if (rawWIds.length === 0) {
      return false;
    }
    return rawWIds.some((site) => {
      const sNorm = normalizeDomainId(site);
      return sNorm === targetNorm || sNorm === "all" || sNorm === "indiandiagnosticscom";
    });
  }

  if (typeof rawWIds === "string") {
    const sNorm = normalizeDomainId(rawWIds);
    return sNorm === targetNorm || sNorm === "all" || sNorm === "indiandiagnosticscom";
  }

  return true;
}

export const isProductVisibleOnCurrentSite = isItemVisibleOnWebsite;

export const makeSlug = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");

export const slugify = makeSlug;

function safeDecode(str = "") {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export const normalizeSlug = (s = "") =>
  safeDecode(String(s || ""))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");

export function normalizeProduct(rawItem, categoryName = "", subCategoryName = "", uniqueId = "") {
  if (!rawItem || typeof rawItem !== "object") return null;

  const prod = rawItem.data && typeof rawItem.data === "object" ? { ...rawItem, ...rawItem.data } : rawItem;

  const title = (
    prod.title ||
    prod.name ||
    prod.productName ||
    prod.itemName ||
    rawItem.title ||
    rawItem.name ||
    "Untitled Product"
  ).trim();

  if (!title) return null;

  const slug = prod.slug || rawItem.slug || makeSlug(title);
  const desc = prod.desc || prod.description || prod.detail || prod.summary || rawItem.desc || rawItem.description || "";

  let rawImages = [];
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    rawImages = prod.images.filter(Boolean);
  } else if (Array.isArray(rawItem.images) && rawItem.images.length > 0) {
    rawImages = rawItem.images.filter(Boolean);
  } else if (prod.image) {
    rawImages = [prod.image];
  } else if (rawItem.image) {
    rawImages = [rawItem.image];
  } else if (prod.imageUrl) {
    rawImages = [prod.imageUrl];
  } else if (prod.imgUrl) {
    rawImages = [prod.imgUrl];
  }

  const primaryImage = rawImages[0] || "/no-image.png";

  const resolvedCat = (
    categoryName ||
    prod.category ||
    rawItem.category ||
    rawItem.categoryId ||
    "Diagnostic Products"
  ).trim();

  const resolvedSubCat = (
    subCategoryName ||
    prod.subCategory ||
    prod.subcategory ||
    rawItem.subCategory ||
    rawItem.subcategoryId ||
    "General"
  ).trim();

  const resolvedId = prod.id || rawItem.id || prod.productId || rawItem.productId || prod.categoryProductId || uniqueId || slug;

  return {
    ...prod,
    id: resolvedId,
    uid: uniqueId || resolvedId,
    categoryProductId: prod.categoryProductId || resolvedId,
    productId: prod.productId || rawItem.productId || resolvedId,
    title,
    name: title,
    slug,
    price: prod.price || rawItem.price || "",
    desc,
    description: desc,
    capacity: prod.capacity || "",
    throughput: prod.throughput || "",
    instrument: prod.instrument || "",
    model: prod.model || "",
    usage: prod.usage || "",
    brand: prod.brand || "Raj Biosis",
    parameters: prod.parameters || "",
    automation: prod.automation || "",
    availability: prod.availability || "In Stock",
    size: prod.size || "",
    category: resolvedCat,
    subCategory: resolvedSubCat,
    images: rawImages,
    originalImages: prod.originalImages || rawImages,
    image: primaryImage,
    video: prod.video || "",
    pdf: prod.pdf || "",
    isPublished: prod.isPublished !== false && rawItem.isPublished !== false,
    websiteIds: Array.isArray(rawItem.websiteIds)
      ? rawItem.websiteIds
      : Array.isArray(prod.websiteIds)
      ? prod.websiteIds
      : ["all"],
    companyId: prod.companyId || rawItem.organizationId || PRIMARY_COMPANY,
  };
}

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
