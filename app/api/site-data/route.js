import { NextResponse } from "next/server";
import { fetchSiteDataFromAdmin } from "@/lib/admin-api";
import { WEBSITE_ID, COMPANY_ID } from "@/lib/catalog-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || searchParams.get("page") || "home";
    const page = searchParams.get("page") || "";
    const websiteId = searchParams.get("websiteId") || WEBSITE_ID;
    const companyId = searchParams.get("companyId") || COMPANY_ID;

    const pageData = await fetchSiteDataFromAdmin(websiteId, type, page, companyId);

    return NextResponse.json(
      {
        success: true,
        type,
        websiteId,
        companyId,
        data: pageData || null,
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
    console.error("API /api/site-data error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal Server Error",
        data: null,
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
