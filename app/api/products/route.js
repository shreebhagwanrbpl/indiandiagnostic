import { NextResponse } from "next/server";
import { fetchFullCatalogData } from "@/lib/db-server";
import { WEBSITE_ID, COMPANY_ID } from "@/lib/catalog-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetSite = searchParams.get("websiteId") || WEBSITE_ID;

    const catalogData = await fetchFullCatalogData(targetSite);

    return NextResponse.json(
      {
        success: true,
        products: catalogData.products || [],
        total: catalogData.total || 0,
        websiteId: targetSite,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("API /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        products: [],
        total: 0,
        error: error?.message || "Internal Server Error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
