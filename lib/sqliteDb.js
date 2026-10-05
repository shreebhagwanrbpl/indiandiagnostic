import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";
import {
  WEBSITE_ID,
  COMPANY_ID,
  SQLITE_DB_PATH,
  isItemVisibleOnWebsite,
  slugify,
} from "./catalog-utils.js";

let dbInstance = null;

/**
 * Resolves the catalog.db SQLite database file path from multiple candidate locations
 */
export function getSqliteDbPath() {
  const envPath = process.env.SQLITE_DB_PATH;
  const cwd = process.cwd();

  const candidates = [
    envPath ? (path.isAbsolute(envPath) ? envPath : path.resolve(cwd, envPath)) : null,
    path.resolve(cwd, SQLITE_DB_PATH),
    path.resolve(cwd, "../SuperAdminRBPL/data/catalog.db"),
    path.resolve(cwd, "../../SuperAdminRBPL/data/catalog.db"),
    path.resolve(cwd, "data/catalog.db"),
    "C:/Users/Admin/Documents/GitHub/SuperAdminRBPL/data/catalog.db",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch (e) {
      // Ignore
    }
  }

  return candidates[0] || path.resolve(cwd, "../SuperAdminRBPL/data/catalog.db");
}

/**
 * Returns the singleton DatabaseSync instance configured with WAL read_uncommitted pragmas
 */
export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getSqliteDbPath();

  try {
    const db = new DatabaseSync(dbPath, { readOnly: true });

    // WAL mode pragmas for zero-delay read (<2ms)
    db.exec("PRAGMA query_only = ON;");
    db.exec("PRAGMA read_uncommitted = ON;");

    dbInstance = db;
    return dbInstance;
  } catch (error) {
    console.error("[sqliteDb] Error opening SQLite database at:", dbPath, error);
    return null;
  }
}

/**
 * Fetch a single document by exact path
 */
export function getDocument(docPath) {
  if (!docPath) return null;
  try {
    const db = getDb();
    if (!db) return null;

    const stmt = db.prepare("SELECT data FROM documents WHERE path = ?");
    const row = stmt.get(docPath);
    if (!row || !row.data) return null;

    return JSON.parse(row.data);
  } catch (err) {
    console.error(`[sqliteDb] getDocument error for '${docPath}':`, err);
    return null;
  }
}

/**
 * Fetch all documents in a collection path
 */
export function getCollection(collectionPath) {
  if (!collectionPath) return [];
  try {
    const db = getDb();
    if (!db) return [];

    const stmt = db.prepare("SELECT doc_id, data FROM documents WHERE collection_path = ?");
    const rows = stmt.all(collectionPath);
    return rows.map((r) => {
      try {
        const parsed = JSON.parse(r.data);
        return { id: r.doc_id, ...parsed };
      } catch (e) {
        return { id: r.doc_id };
      }
    });
  } catch (err) {
    console.error(`[sqliteDb] getCollection error for '${collectionPath}':`, err);
    return [];
  }
}

/**
 * Fetch page data for a website (home, contact, services, about, etc.)
 */
export function getWebsitePageData(pageType, websiteId = WEBSITE_ID, companyId = COMPANY_ID) {
  if (!pageType) return null;

  // Path candidate 1: websites/{companyId}/{websiteId}/pages/{pageType}
  const path1 = `websites/${companyId}/${websiteId}/pages/${pageType}`;
  const data1 = getDocument(path1);
  if (data1) return data1;

  // Path candidate 2: websites/{websiteId}/pages/{pageType}
  const path2 = `websites/${websiteId}/pages/${pageType}`;
  const data2 = getDocument(path2);
  if (data2) return data2;

  return null;
}

/**
 * Reads full catalog directly from SQLite with cascading visibility check
 */
export function getCatalogFromSQLite(websiteId = WEBSITE_ID, companyId = COMPANY_ID) {
  const finalProducts = [];
  const finalCategories = [];
  const uniqueProductsMap = new Map();

  try {
    const db = getDb();
    if (!db) {
      return { products: [], categories: [], total: 0, websiteId, companyId };
    }

    // 1. Fetch Categories for company
    const categoryDocs = getCollection(`companies/${companyId}/categories`);

    for (const catDoc of categoryDocs) {
      // Cascading Check: Is Category visible on current website?
      if (!isItemVisibleOnWebsite(catDoc, websiteId)) {
        continue; // Skip hidden category entirely -> all its subcategories & products hidden
      }

      const catName = catDoc.name || catDoc.category || catDoc.id;
      const catSlug = catDoc.slug || slugify(catName);
      const visibleSubcategories = [];

      // 2. Fetch Subcategories for this category
      const subcategoryDocs = getCollection(`companies/${companyId}/categories/${catDoc.id}/subcategories`);

      for (const subDoc of subcategoryDocs) {
        // Cascading Check: Is Subcategory visible on current website?
        if (!isItemVisibleOnWebsite(subDoc, websiteId)) {
          continue; // Skip hidden subcategory -> all its products hidden
        }

        const subName = subDoc.name || subDoc.subCategory || subDoc.id;
        const subSlug = subDoc.slug || slugify(subName);

        visibleSubcategories.push({
          id: subDoc.id,
          name: subName,
          subCategory: subName,
          slug: subSlug,
          categoryId: catDoc.id,
          companyId,
          websiteIds: subDoc.websiteIds || ["all"],
        });

        // 3. Extract products from subcategory doc (embedded products array)
        const embeddedProducts = Array.isArray(subDoc.products) ? subDoc.products : [];
        for (const item of embeddedProducts) {
          if (!isItemVisibleOnWebsite(item, websiteId)) {
            continue;
          }

          const itemTitle = (item.title || item.name || item.instrument || item.model || "").trim();
          if (!itemTitle) continue;

          const itemSlug = item.slug?.trim() ? item.slug.trim() : slugify(itemTitle);
          const pKey = item.id || item.categoryProductId || item.productId || `${catSlug}-${subSlug}-${itemSlug}`;

          const productObj = {
            ...item,
            id: pKey,
            categoryProductId: item.categoryProductId || item.id || pKey,
            title: itemTitle,
            name: itemTitle,
            slug: itemSlug,
            category: catName,
            subCategory: subName,
            categoryId: catDoc.id,
            subcategoryId: subDoc.id,
            companyId,
            type: item.type || "category",
            websiteIds: item.websiteIds || subDoc.websiteIds || catDoc.websiteIds || ["all"],
            images: Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.image ? [item.image] : ["/no-image.png"]),
            video: item.video || "",
            pdf: item.pdf || "",
            isPublished: item.isPublished !== false,
          };

          if (!uniqueProductsMap.has(pKey)) {
            uniqueProductsMap.set(pKey, productObj);
          }
        }

        // 4. Also check subcollection products if any: companies/{companyId}/categories/{catDoc.id}/subcategories/{subDoc.id}/products
        const subcollectionProducts = getCollection(`companies/${companyId}/categories/${catDoc.id}/subcategories/${subDoc.id}/products`);
        for (const item of subcollectionProducts) {
          if (!isItemVisibleOnWebsite(item, websiteId)) {
            continue;
          }

          const itemTitle = (item.title || item.name || item.instrument || item.model || "").trim();
          if (!itemTitle) continue;

          const itemSlug = item.slug?.trim() ? item.slug.trim() : slugify(itemTitle);
          const pKey = item.id || `${catSlug}-${subSlug}-${itemSlug}`;

          const productObj = {
            ...item,
            id: pKey,
            title: itemTitle,
            name: itemTitle,
            slug: itemSlug,
            category: catName,
            subCategory: subName,
            categoryId: catDoc.id,
            subcategoryId: subDoc.id,
            companyId,
            type: "category",
            images: Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.image ? [item.image] : ["/no-image.png"]),
            isPublished: item.isPublished !== false,
          };

          if (!uniqueProductsMap.has(pKey)) {
            uniqueProductsMap.set(pKey, productObj);
          }
        }
      }

      finalCategories.push({
        id: catDoc.id,
        name: catName,
        category: catName,
        slug: catSlug,
        companyId,
        websiteIds: catDoc.websiteIds || ["all"],
        subcategories: visibleSubcategories,
      });
    }

    // 5. Fetch Master / Standalone Products: companies/{companyId}/products
    const masterProductDocs = getCollection(`companies/${companyId}/products`);
    for (const item of masterProductDocs) {
      if (!isItemVisibleOnWebsite(item, websiteId)) {
        continue;
      }

      const itemTitle = (item.title || item.name || item.instrument || item.model || "").trim();
      if (!itemTitle) continue;

      const itemSlug = item.slug?.trim() ? item.slug.trim() : slugify(itemTitle);
      const pKey = item.id || `master-${itemSlug}`;

      const productObj = {
        ...item,
        id: pKey,
        title: itemTitle,
        name: itemTitle,
        slug: itemSlug,
        category: item.category || "General",
        subCategory: item.subCategory || "General",
        companyId,
        type: item.type || "normal",
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.image ? [item.image] : ["/no-image.png"]),
        isPublished: item.isPublished !== false,
      };

      if (!uniqueProductsMap.has(pKey)) {
        uniqueProductsMap.set(pKey, productObj);
      }
    }

    const allProducts = Array.from(uniqueProductsMap.values());

    return {
      products: allProducts,
      categories: finalCategories,
      categoryProducts: allProducts.filter((p) => p.type === "category"),
      normalProducts: allProducts.filter((p) => p.type === "normal"),
      total: allProducts.length,
      websiteId,
      companyId,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[sqliteDb] getCatalogFromSQLite error:", err);
    return {
      products: [],
      categories: [],
      total: 0,
      websiteId,
      companyId,
      timestamp: new Date().toISOString(),
    };
  }
}
