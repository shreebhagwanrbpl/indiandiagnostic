const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDGIJXX3MR1CxmIJbJHyVzbfRa0M0Sw6FQ",
  authDomain: "rajbiosis-central.firebaseapp.com",
  projectId: "rajbiosis-central",
  storageBucket: "rajbiosis-central.firebasestorage.app",
  messagingSenderId: "190335913620",
  appId: "1:190335913620:web:99a14edcbb528f06c1ee81"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    // Test pages/home
    const homeSnap = await getDoc(doc(db, "websites", "indiandiagnostic", "pages", "home"));
    if (homeSnap.exists()) {
      console.log("Home data keys:", Object.keys(homeSnap.data()));
      console.log("Home data title:", homeSnap.data().title);
    } else {
      console.log("Home doc does not exist");
    }

    // Test pages/services
    const servicesSnap = await getDoc(doc(db, "websites", "indiandiagnostic", "pages", "services"));
    if (servicesSnap.exists()) {
      console.log("Services data keys:", Object.keys(servicesSnap.data()));
    } else {
      console.log("Services doc does not exist");
    }

    // Test pages/products
    const productsSnap = await getDoc(doc(db, "websites", "indiandiagnostic", "pages", "products"));
    if (productsSnap.exists()) {
      console.log("Products data keys:", Object.keys(productsSnap.data()));
    } else {
      console.log("Products doc does not exist");
    }
  } catch (error) {
    console.error("Error reading firebase docs:", error);
  }
}

test();
