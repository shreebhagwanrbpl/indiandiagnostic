import { NextResponse } from "next/server";
import { submitProductQueryToAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { productName, email, phone, city } = body;

    if (!email || !phone) {
      return NextResponse.json(
        { success: false, error: "Please enter your email and phone number" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const result = await submitProductQueryToAdmin({
      productName: String(productName || "Laboratory Equipment").trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      city: String(city || "India").trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Query submitted successfully",
        data: result?.data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API /api/product-query error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
