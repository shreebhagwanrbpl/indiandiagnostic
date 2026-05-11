import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default async function Page({ params }) {

  const resolvedParams = await params;

  const district =
    resolvedParams?.district || "";

  const product =
    resolvedParams?.product || "";

  const snap = await getDoc(
    doc(
      db,
      "websites",
      "indiandiagnostic",
      "pages",
      "products"
    )
  );

  const products =
    snap.data()?.products || [];

  const found = products.find(
    (p) =>
      p.title
        .toLowerCase()
        .replace(/\s+/g, "-") === product
  );

  if (!found) {
    return <h1>Product not found</h1>;
  }

  const city = district.replace(/-/g, " ");

  return (
    <div style={{ padding: "120px 20px" }}>

      <h1>
        {found.title} in {city}
      </h1>

      <p>{found.desc}</p>

      <img
        src={found.image || "/no-image.png"}
        width="300"
        alt={found.title}
      />

    </div>
  );
}