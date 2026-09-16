/**
 * Edge-Compatible Firestore REST Client
 * Zero external dependencies, 100% compliant with Cloudflare Workers / Edge / OpenNext runtime.
 * Eliminates all protobufjs / eval() / new Function() EvalError exceptions.
 */

const PROJECT_ID = "rajbiosis-central";
const API_KEY = "AIzaSyDGIJXX3MR1CxmIJbJHyVzbfRa0M0Sw6FQ";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export const db = {
  projectId: PROJECT_ID,
  apiKey: API_KEY,
  type: "firestore",
};

export const auth = {
  currentUser: null,
  onAuthStateChanged: (cb) => {
    if (typeof cb === "function") cb(null);
    return () => {};
  },
};

export const setLogLevel = () => {};
export const initializeApp = () => ({ db, auth });
export const getFirestore = () => db;
export const getAuth = () => auth;

/* ==========================================================================
   FIRESTORE VALUE SERIALIZATION / DESERIALIZATION
========================================================================== */

export function fromFirestoreValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val !== "object") return val;

  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return Number(val.doubleValue);
  if ("booleanValue" in val) return Boolean(val.booleanValue);
  if ("nullValue" in val) return null;
  if ("timestampValue" in val) return val.timestampValue;
  if ("arrayValue" in val) {
    return (val.arrayValue.values || []).map(fromFirestoreValue);
  }
  if ("mapValue" in val) {
    return fromFirestoreFields(val.mapValue.fields || {});
  }
  if ("referenceValue" in val) return val.referenceValue;
  if ("geoPointValue" in val) return val.geoPointValue;

  return val;
}

export function fromFirestoreFields(fields) {
  if (!fields || typeof fields !== "object") return {};
  const res = {};
  for (const [key, value] of Object.entries(fields)) {
    res[key] = fromFirestoreValue(value);
  }
  return res;
}

export function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val)
      ? { integerValue: val.toString() }
      : { doubleValue: val };
  }
  if (val instanceof Date) {
    return { timestampValue: val.toISOString() };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    return { mapValue: { fields: toFirestoreFields(val) } };
  }
  return { stringValue: String(val) };
}

export function toFirestoreFields(obj) {
  if (!obj || typeof obj !== "object") return {};
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      fields[k] = toFirestoreValue(v);
    }
  }
  return fields;
}

/* ==========================================================================
   REFERENCES
========================================================================== */

function cleanPath(segments) {
  return segments
    .filter(Boolean)
    .map((s) => {
      if (typeof s === "object" && s.path) return s.path;
      return String(s).replace(/^\/+|\/+$/g, "");
    })
    .filter(Boolean)
    .join("/");
}

export function doc(dbOrParent, ...pathSegments) {
  let initialPath = "";
  if (dbOrParent && typeof dbOrParent === "object" && dbOrParent.path) {
    initialPath = dbOrParent.path;
  } else if (typeof dbOrParent === "string") {
    pathSegments = [dbOrParent, ...pathSegments];
  }

  const fullPath = cleanPath([initialPath, ...pathSegments]);
  const parts = fullPath.split("/").filter(Boolean);
  const id = parts[parts.length - 1] || "";

  return {
    type: "doc",
    path: fullPath,
    id,
    parent: {
      type: "collection",
      path: parts.slice(0, -1).join("/"),
    },
  };
}

export function collection(dbOrParent, ...pathSegments) {
  let initialPath = "";
  if (dbOrParent && typeof dbOrParent === "object" && dbOrParent.path) {
    initialPath = dbOrParent.path;
  } else if (typeof dbOrParent === "string") {
    pathSegments = [dbOrParent, ...pathSegments];
  }

  const fullPath = cleanPath([initialPath, ...pathSegments]);
  const parts = fullPath.split("/").filter(Boolean);
  const id = parts[parts.length - 1] || "";

  return {
    type: "collection",
    path: fullPath,
    id,
  };
}

/* ==========================================================================
   CRUD OPERATIONS (EDGE FETCH)
========================================================================== */

export async function getDoc(docRef) {
  if (!docRef || !docRef.path) {
    return {
      exists: () => false,
      id: "",
      data: () => undefined,
    };
  }

  const url = `${BASE_URL}/${docRef.path}?key=${API_KEY}`;

  try {
    const fetchOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    };

    const res = await fetch(url, fetchOptions);

    if (res.status === 404) {
      return {
        exists: () => false,
        id: docRef.id,
        data: () => undefined,
      };
    }

    if (!res.ok) {
      console.warn(`Firestore getDoc error (${res.status}):`, await res.text());
      return {
        exists: () => false,
        id: docRef.id,
        data: () => undefined,
      };
    }

    const json = await res.json();
    const data = fromFirestoreFields(json.fields || {});

    return {
      exists: () => true,
      id: docRef.id || json.name?.split("/").pop() || "",
      data: () => data,
    };
  } catch (err) {
    console.error(`Firestore getDoc network error for ${docRef.path}:`, err);
    return {
      exists: () => false,
      id: docRef.id,
      data: () => undefined,
    };
  }
}

export async function getDocs(colRefOrQuery) {
  if (!colRefOrQuery || !colRefOrQuery.path) {
    return {
      empty: true,
      docs: [],
      size: 0,
      forEach: () => {},
    };
  }

  let allDocs = [];
  let pageToken = null;
  const pageSize = 300;

  try {
    do {
      let url = `${BASE_URL}/${colRefOrQuery.path}?pageSize=${pageSize}&key=${API_KEY}`;
      if (pageToken) {
        url += `&pageToken=${encodeURIComponent(pageToken)}`;
      }

      const fetchOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      };

      const res = await fetch(url, fetchOptions);

      if (res.status === 404) {
        break;
      }

      if (!res.ok) {
        console.warn(`Firestore getDocs error (${res.status}):`, await res.text());
        break;
      }

      const json = await res.json();
      const rawDocuments = json.documents || [];

      const mapped = rawDocuments.map((docItem) => {
        const id = docItem.name?.split("/").pop() || "";
        const data = fromFirestoreFields(docItem.fields || {});
        return {
          id,
          data: () => data,
          exists: () => true,
        };
      });

      allDocs = allDocs.concat(mapped);
      pageToken = json.nextPageToken || null;
    } while (pageToken);

    return {
      empty: allDocs.length === 0,
      docs: allDocs,
      size: allDocs.length,
      forEach: (callback) => allDocs.forEach(callback),
    };
  } catch (err) {
    console.error(`Firestore getDocs network error for ${colRefOrQuery.path}:`, err);
    return {
      empty: true,
      docs: [],
      size: 0,
      forEach: () => {},
    };
  }
}

export async function addDoc(colRef, data) {
  if (!colRef || !colRef.path) {
    throw new Error("Invalid collection reference");
  }

  const url = `${BASE_URL}/${colRef.path}?key=${API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: toFirestoreFields(data),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firestore addDoc failed (${res.status}): ${errorText}`);
  }

  const json = await res.json();
  const id = json.name?.split("/").pop() || "";

  return {
    id,
    path: `${colRef.path}/${id}`,
  };
}

export async function setDoc(docRef, data, options = {}) {
  if (!docRef || !docRef.path) {
    throw new Error("Invalid doc reference");
  }

  const url = `${BASE_URL}/${docRef.path}?key=${API_KEY}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: toFirestoreFields(data),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firestore setDoc failed (${res.status}): ${errorText}`);
  }

  return { id: docRef.id };
}

export function onSnapshot(ref, onNext, onError) {
  if (!ref) return () => {};

  let isMounted = true;

  const execute = async () => {
    try {
      if (ref.type === "doc") {
        const snap = await getDoc(ref);
        if (isMounted && typeof onNext === "function") onNext(snap);
      } else {
        const snap = await getDocs(ref);
        if (isMounted && typeof onNext === "function") onNext(snap);
      }
    } catch (err) {
      if (isMounted && typeof onError === "function") onError(err);
    }
  };

  execute();

  return () => {
    isMounted = false;
  };
}

export function serverTimestamp() {
  return new Date().toISOString();
}

export function query(colRef, ...constraints) {
  return {
    type: "query",
    path: colRef.path,
    id: colRef.id,
    constraints,
  };
}

export function where(field, op, value) {
  return { type: "where", field, op, value };
}

export function orderBy(field, direction = "asc") {
  return { type: "orderBy", field, direction };
}

export function limit(num) {
  return { type: "limit", limit: num };
}