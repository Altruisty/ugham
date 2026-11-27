import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/email";

export const dynamic = "force-dynamic";

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const reason = String(body.reason || "").trim();

    if (!name || !email || !phone || !reason) {
      return NextResponse.json(
        { success: false, error: "All fields are required before submitting." },
        { status: 400 }
      );
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>New Ugham Contact Inquiry</title></head>
<body style="margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#7C3AED 0%,#C026D3 100%);color:#ffffff;">
      <div style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;opacity:0.9;">UGHAM PARTNER &amp; CONTACT DESK</div>
      <h2 style="margin:6px 0 0;font-size:20px;font-weight:800;">New Website Contact Submission</h2>
    </div>
    <div style="padding:28px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:10px 0;color:#64748b;font-weight:700;width:150px;">Full Name</td>
          <td style="padding:10px 0;color:#0f172a;font-weight:700;">${escapeHtml(name)}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9;">
          <td style="padding:10px 0;color:#64748b;font-weight:700;">Email Address</td>
          <td style="padding:10px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#7C3AED;font-weight:700;">${escapeHtml(email)}</a></td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9;">
          <td style="padding:10px 0;color:#64748b;font-weight:700;">Phone Number</td>
          <td style="padding:10px 0;color:#0f172a;font-weight:600;">${escapeHtml(phone)}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9;">
          <td style="padding:10px 0;color:#64748b;font-weight:700;">Inquiry Purpose</td>
          <td style="padding:10px 0;color:#0f172a;font-weight:700;">${escapeHtml(reason)}</td>
        </tr>
      </table>
      <p style="margin:20px 0 0;font-size:12.5px;color:#64748b;">
        Reply directly to this email to respond to <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}).
      </p>
    </div>
  </div>
</body>
</html>`;

    const text = `New Ugham Contact Inquiry\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nReason: ${reason}`;

    const result = await sendMail({
      to: "ughambusiness@gmail.com",
      replyTo: email,
      subject: `[UGHAM CONTACT] ${reason} — ${name}`,
      html,
      text,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Unable to deliver inquiry email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      simulated: Boolean(result.simulated),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send contact inquiry." },
      { status: 500 }
    );
  }
}
