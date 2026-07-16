import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import districts from "@/lib/districts.json";

export async function GET() {
  // Categories
  const categorySnap = await getDocs(collection(db, "categories"));

  const categories = categorySnap.docs.map((doc) => {
    const data = doc.data();
    return data.name || data.categoryName || "Unknown";
  });

  const categoryText = categories
    .map((cat) => `- ${cat}`)
    .join("\n");

  // Products
  const productSnap = await getDocs(collection(db, "products"));

  const products = productSnap.docs
    .slice(0, 100)
    .map((doc) => {d
      const data = doc.data();
      return data.name || data.productName || "Unknown Product";
    });

  const productText = products
    .map((item) => `- ${item}`)
    .join("\n");

  // Districts
  const districtText = districts
    .map(
      (d) =>
        `- https://indiandiagnostic.com/${d.state}/${d.slug}`
    )
    .join("\n");

  const content = `# Indian Diagnostic

> India's Trusted Biomedical Equipment Supplier

## Website

https://indiandiagnostic.com

## Categories

${categoryText}

## Products

${productText}

## District Pages

${districtText}

## Sitemap

https://indiandiagnostic.com/sitemap.xml

## Robots

https://indiandiagnostic.com/robots.txt
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}