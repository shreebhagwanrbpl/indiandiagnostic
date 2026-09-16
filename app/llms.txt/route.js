import { NextResponse } from "next/server";
import { db, collection, getDocs } from "@/lib/firebase";

import districts from "@/lib/districts.json";

export const dynamic = "force-static";

export async function GET() {
  let categoryText = "- Diagnostic Instruments\n- Pathology Equipment\n- Biochemistry Analyzers\n- Medical Consumables";
  let productText = "- Auto Analyzers\n- Hematology Analyzers\n- Rapid Test Kits\n- ELISA Readers";

  try {
    const categorySnap = await getDocs(
      collection(
        db,
        "websites",
        "indiandiagnostic",
        "pages",
        "categoryproducts",
        "categories"
      )
    );
    if (!categorySnap.empty) {
      const categories = categorySnap.docs.map((doc) => {
        const data = doc.data();
        return data.category || data.name || data.categoryName || "Unknown";
      });
      categoryText = categories.map((cat) => `- ${cat}`).join("\n");
    }
  } catch (err) {
    console.warn("llms.txt firestore fetch fallback:", err);
  }


  const districtText = districts
    .slice(0, 50)
    .map((d) => `- https://indiandiagnostic.com/${d.slug}`)
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