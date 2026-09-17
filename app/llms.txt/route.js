import { NextResponse } from "next/server";
import { fetchCategories, fetchFullCatalog } from "@/lib/data-fetcher";
import districts from "@/lib/districts.json";

export const dynamic = "force-static";

export async function GET() {
  let categoryText = "- Diagnostic Instruments\n- Pathology Equipment\n- Biochemistry Analyzers\n- Medical Consumables";
  let productText = "- Auto Analyzers\n- Hematology Analyzers\n- Rapid Test Kits\n- ELISA Readers";

  try {
    const categories = await fetchCategories();
    if (categories && categories.length > 0) {
      categoryText = categories.map((cat) => `- ${cat.name || cat.category}`).join("\n");
    }

    const catalog = await fetchFullCatalog();
    if (catalog && catalog.products && catalog.products.length > 0) {
      productText = catalog.products.slice(0, 15).map((p) => `- ${p.title || p.name}`).join("\n");
    }
  } catch (err) {
    console.warn("llms.txt catalog fetch fallback:", err);
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