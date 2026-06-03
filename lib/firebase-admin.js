import admin
from "firebase-admin";

import serviceAccount
from "../firebase-service.json";

if (
  !admin.apps.length
) {
  admin.initializeApp({
    credential:
      admin.credential.cert(
        serviceAccount
      ),
  });
}

const adminDb =
  admin.firestore();

export { adminDb };