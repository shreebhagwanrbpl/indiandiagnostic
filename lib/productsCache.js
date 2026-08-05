const DB_NAME = "indiandiagnostic_db";
const STORE_NAME = "products_store";
const CACHE_KEY = "products_cache";

let memoryCache = null;

const openDB = () => {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined") {
            reject(new Error("Cannot open IndexedDB on server-side"));
            return;
        }
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

export const getCache = async () => {
    if (memoryCache) return memoryCache;
    if (typeof window === "undefined") return null;

    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(CACHE_KEY);
            request.onsuccess = () => {
                memoryCache = request.result || null;
                resolve(memoryCache);
            };
            request.onerror = () => {
                resolve(null);
            };
        });
    } catch (e) {
        console.error("IndexedDB read error:", e);
        return null;
    }
};

export const setCache = async (data) => {
    memoryCache = data;
    if (typeof window === "undefined") return;

    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(data, CACHE_KEY);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (e) {
        console.error("IndexedDB write error:", e);
    }
};