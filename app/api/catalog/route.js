import { NextResponse } from "next/server";
import { getAggregatedCatalogServer, WEBSITE_ID, COMPANY_ID } from "@/lib/data-fetcher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId") || WEBSITE_ID;
    const companyId = searchParams.get("companyId") || COMPANY_ID;

    const catalogData = await getAggregatedCatalogServer(websiteId, companyId);

    return NextResponse.json(catalogData, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("API /api/catalog error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch catalog",
        message: error?.message || "Internal Server Error",
        products: [],
        categories: [],
        total: 0,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
