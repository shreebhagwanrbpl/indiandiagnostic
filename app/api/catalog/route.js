import { NextResponse } from "next/server";
import { fetchFullCatalog, WEBSITE_ID, COMPANY_ID } from "@/lib/data-fetcher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    const catalogData = await fetchFullCatalog(forceRefresh);

    return NextResponse.json(catalogData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
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
