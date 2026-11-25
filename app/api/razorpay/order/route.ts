import { NextRequest, NextResponse } from "next/server";
import { getEventEditions } from "@/lib/editions";

export const dynamic = "force-dynamic";

export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  return NextResponse.json({
    success: true,
    configured: Boolean(keyId),
    isTestMode: keyId.startsWith("rzp_test_"),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, teamSize } = body;

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay keys are not configured on the server." },
        { status: 500 }
      );
    }

    const editions = await getEventEditions();
    const matched = editions.find((e) => e.slug === eventName);
    const isShePitch =
      matched?.series === "shepitch_chennai" ||
      matched?.series === "shepitch_coimbatore" ||
      String(eventName || "").includes("shepitch");

    const pricingMode = matched?.pricingMode ?? (isShePitch ? "per_member" : "flat_team");
    const feeAmount = matched?.feeAmount ?? (isShePitch ? 99 : 199);
    const parsedSize = Math.max(1, Number(teamSize || 2));
    const totalInr = pricingMode === "per_member" ? parsedSize * feeAmount : feeAmount;
    const amountPaise = Math.round(totalInr * 100);

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    let orderId: string | undefined = undefined;
    try {
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt,
          notes: {
            event: String(eventName || ""),
            teamSize: String(parsedSize),
          },
        }),
      });
      if (rzpRes.ok) {
        const orderData = await rzpRes.json();
        orderId = orderData.id;
      } else {
        const errData = await rzpRes.json().catch(() => ({}));
        console.error("Razorpay order creation failed:", errData);
      }
    } catch (orderErr) {
      console.error("Razorpay order API network error:", orderErr);
    }

    return NextResponse.json({
      success: true,
      keyId,
      orderId,
      amount: amountPaise,
      amountInr: totalInr,
      currency: "INR",
      isTestMode: keyId.startsWith("rzp_test_"),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initialize payment order" },
      { status: 500 }
    );
  }
}
