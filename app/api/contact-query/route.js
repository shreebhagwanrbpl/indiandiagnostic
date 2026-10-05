import { NextResponse } from "next/server";
import { submitContactQueryToAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await submitContactQueryToAdmin(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API /api/contact-query error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit contact query" },
      { status: 500 }
    );
  }
}
