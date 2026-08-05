const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc, collection, getDocs } = require("firebase/firestore");

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
  const startTime = Date.now();
  try {
    console.log("Fetching normal products...");
    const productsSnap = await getDoc(doc(db, "websites", "indiandiagnostic", "pages", "products"));
    let normalProducts = [];
    if (productsSnap.exists()) {
      normalProducts = productsSnap.data().products || [];
      console.log(`Normal products count: ${normalProducts.length}`);
    }

    console.log("Fetching categoryproducts/categories...");
    const categorySnap = await getDocs(
      collection(db, "websites", "indiandiagnostic", "pages", "categoryproducts", "categories")
    );
    console.log(`Found ${categorySnap.docs.length} categories.`);

    // Fetch all subcategories in parallel!
    const subQueries = categorySnap.docs.map(categoryDoc => {
      return getDocs(
        collection(
          db,
          "websites",
          "indiandiagnostic",
          "pages",
          "categoryproducts",
          "categories",
          categoryDoc.id,
          "subcategories"
        )
      ).then(subSnap => ({
        categoryDoc,
        subSnap
      }));
    });

    const results = await Promise.all(subQueries);
    let categoryProducts = [];

    for (const { categoryDoc, subSnap } of results) {
      const categoryData = categoryDoc.data();
      subSnap.forEach((subDoc) => {
        const subData = subDoc.data();
        (subData.products || []).forEach((item) => {
          categoryProducts.push({
            ...item,
            category: categoryData.category,
            subCategory: subData.subCategory,
          });
        });
      });
    }

    console.log(`Total products from categories: ${categoryProducts.length}`);
    console.log(`Time taken: ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error("Error reading firebase docs:", error);
  }
}

test();
