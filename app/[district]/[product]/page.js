import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function generateMetadata({ params }) {
  const { district, product } = await params; // ✅

  const city = district.replace(/-/g, " ");
  const productName = product.replace(/-/g, " ");

  return {
    title: `${productName} in ${city} | Best Price & Lab Solutions`,
    description: `Buy ${productName} in ${city}. Affordable, trusted diagnostic solutions with fast delivery.`,
    keywords: `${productName}, ${productName} in ${city}, lab equipment ${city}`,
  };
}

export default async function Page({ params }) {
  const { district, product } = await params; // ✅

  const snap = await getDoc(
    doc(db, "websites", "indiandiagnostic", "pages", "products")
  );

  const products = snap.data()?.products || [];

  const found = products.find(
    (p) =>
      p.title.toLowerCase().replace(/\s+/g, "-") === product
  );

  if (!found) {
    return <h1>Product not found</h1>;
  }

  const city = district.replace(/-/g, " ");

  return (
    <div style={{ padding: "120px 20px" }}>
      <h1>{found.title} in {city}</h1>

      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: found.title,
            description: found.desc,
            brand: found.brand,
            areaServed: city,
          }),
        }}
      />

      <p>{found.desc}</p>
      <p><b>Brand:</b> {found.brand}</p>
      <p><b>Usage:</b> {found.usage}</p>

      <img
        src={found.image || "/no-image.png"}
        width="300"
        alt={found.title}
      />
    </div>
  );
}