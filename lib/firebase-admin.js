import {
  doc,
  collection,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
} from "./firebase";

function createAdminDoc(path) {
  const docRef = doc(path);

  return {
    id: docRef.id,
    path: docRef.path,
    collection: (subCol) => createAdminCol(`${path}/${subCol}`),
    get: async () => {
      const snap = await getDoc(docRef);
      return {
        id: snap.id,
        exists: snap.exists(),
        data: () => snap.data(),
      };
    },
    set: (data) => setDoc(docRef, data),
    update: (data) => setDoc(docRef, data),
  };
}

function createAdminCol(path) {
  const colRef = collection(path);

  return {
    id: colRef.id,
    path: colRef.path,
    doc: (docId) => createAdminDoc(docId ? `${path}/${docId}` : `${path}/new`),
    get: async () => {
      const snap = await getDocs(colRef);
      return {
        empty: snap.empty,
        size: snap.size,
        docs: snap.docs.map((d) => ({
          id: d.id,
          exists: true,
          data: () => d.data(),
        })),
        forEach: (fn) => snap.docs.forEach(fn),
      };
    },
    add: (data) => addDoc(colRef, data),
  };
}

export const adminDb = {
  collection: (colName) => createAdminCol(colName),
  doc: (docPath) => createAdminDoc(docPath),
};

export default { adminDb };