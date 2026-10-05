import { NextResponse } from "next/server";
import { submitContactQueryToAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, subject, city } = body;

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, error: "Please fill all required fields (name, email, phone, message)" },
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

    const result = await submitContactQueryToAdmin({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      message: String(message).trim(),
      subject: String(subject || "").trim(),
      city: String(city || "Jaipur").trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        data: result?.data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API /api/contact-query error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
