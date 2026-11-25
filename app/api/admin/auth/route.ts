import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const submitted = typeof body.password === "string" ? body.password.trim() : "";

    if (!submitted) {
      return NextResponse.json(
        { success: false, error: "Please enter the executive admin access key." },
        { status: 400 }
      );
    }

    const candidates = [
      process.env.ADMIN_PASSWORD,
      ...(process.env.ADMIN_ACCESS_KEYS ? process.env.ADMIN_ACCESS_KEYS.split(",") : []),
    ]
      .map((val) => (val || "").trim())
      .filter(Boolean);

    if (candidates.length === 0) {
      return NextResponse.json(
        { success: false, error: "ADMIN_PASSWORD is not configured on the server." },
        { status: 500 }
      );
    }

    const isMatch = candidates.some((key) => safeCompare(submitted, key));
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid admin access key." },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication check failed." },
      { status: 500 }
    );
  }
}
