import { NextResponse } from "next/server";
import { submitProductQueryToAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await submitProductQueryToAdmin(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API /api/product-query error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit product query" },
      { status: 500 }
    );
  }
}
