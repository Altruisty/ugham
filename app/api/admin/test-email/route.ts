import { NextRequest, NextResponse } from "next/server";
import {
  verifySmtpConnection,
  sendMail,
  sendOtpEmail,
  sendMemberWelcomeEmail,
  getSmtpConfig,
  getBrevoDispatches,
} from "@/lib/email";
import { RegistrationRecord } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await verifySmtpConnection();

    // Compute today's date in Asia/Kolkata (IST) so Brevo free-tier daily count resets accurately at midnight IST
    const getIstDateString = (d: Date) =>
      d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    // Query Brevo REST API v3 for live aggregated statistics if API key is provided
    let brevoLiveDelivered: number | null = null;
    const apiKey =
      process.env.BREVO_API_KEY ||
      (process.env.SMTP_PASS?.startsWith("xkeysib-") ? process.env.SMTP_PASS : "");

    const todayStr = getIstDateString(new Date());

    if (apiKey) {
      try {
        const apiRes = await fetch(
          `https://api.brevo.com/v3/smtp/statistics/aggregatedReport?startDate=${todayStr}&endDate=${todayStr}`,
          {
            headers: {
              "api-key": apiKey,
              accept: "application/json",
            },
          }
        );
        if (apiRes.ok) {
          const stats = await apiRes.json();
          brevoLiveDelivered = stats.delivered ?? stats.requests ?? null;
        }
      } catch (e) {
        // Fallback to local dispatch log
      }
    }

    const dispatches = getBrevoDispatches();
    const todayDispatches = dispatches.filter((d: any) => {
      if (!d.timestamp) return false;
      try {
        return getIstDateString(new Date(d.timestamp)) === todayStr;
      } catch {
        return false;
      }
    });

    // Real-time today's dispatch count (resets cleanly to 0 at midnight IST; no hardcoded minimum)
    const emailsToday =
      brevoLiveDelivered !== null
        ? brevoLiveDelivered
        : todayDispatches.length;
    const dailyLimit = 300;
    const remainingToday = Math.max(0, dailyLimit - emailsToday);

    return NextResponse.json({
      ...result,
      emailsToday,
      todayDateIst: todayStr,
      dailyLimit,
      remainingToday,
      dispatchedEmails: dispatches,
      brevoLiveConnected: brevoLiveDelivered !== null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { connected: false, message: err.message || "Failed to verify SMTP connection" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const recipient = (body.recipientEmail || body.to || body.email || "").trim();
    const testType = body.testType || body.type || "ping";

    if (!recipient || !recipient.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid recipient email address is required (e.g. name@gmail.com)" },
        { status: 400 }
      );
    }

    const config = getSmtpConfig();

    if (testType === "otp") {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const res = await sendOtpEmail(recipient, code, "Brevo SMTP Domain Verification");
      
      let errorClarification = res.error;
      if (res.error?.includes("525") || res.error?.includes("Unauthorized IP address")) {
        errorClarification = "Brevo Error 525 (5.7.1 Unauthorized IP address): In Brevo Dashboard -> SMTP & API -> Authorized IP addresses, remove the restricted IP to allow sending from anywhere, or whitelist your current server IP.";
      }

      return NextResponse.json({
        success: res.success,
        type: "otp",
        code,
        messageId: res.messageId,
        simulated: res.simulated,
        error: errorClarification,
        from: `"${config.fromName}" <${config.fromAddress}>`,
        to: recipient,
        message: res.success
          ? (res.simulated ? "Test OTP simulated successfully (Credentials pending)" : "Test OTP delivered successfully via Brevo")
          : (errorClarification || "OTP delivery failed"),
      });
    }

    if (testType === "registration") {
      const mockRecord: RegistrationRecord = {
        id: "UGH-TEST-" + Date.now().toString(36).toUpperCase(),
        event_name: "shepitch",
        track: "Project Pitch",
        domain: "AI & DEEP TECH",
        team_name: "NovaInnovators (Test)",
        leader_name: "Test Participant",
        leader_email: recipient,
        mobile: "+919876543210",
        college_name: "Indian Institute of Technology (IIT) Madras",
        year_of_study: "Final Year",
        department: "Computer Science",
        team_size: 3,
        amount_paid: 297,
        payment_id: "pay_test_" + Date.now(),
        members: [
          { name: "Test Participant", email: recipient, role: "Leader" },
          { name: "Alex Morgan", email: "alex.tech@example.com", role: "Member" },
          { name: "Priya Sharma", email: "priya.ai@example.com", role: "Member" },
        ],
        email_status: "sent",
        created_at: new Date().toISOString(),
      };

      const res = await sendMemberWelcomeEmail(mockRecord, {
        name: "Test Participant",
        email: recipient,
        role: "Leader",
      });

      let errorClarification = res.error;
      if (res.error?.includes("525") || res.error?.includes("Unauthorized IP address")) {
        errorClarification = "Brevo Error 525 (5.7.1 Unauthorized IP address): In Brevo Dashboard -> SMTP & API -> Authorized IP addresses, remove the restricted IP to allow sending from anywhere, or whitelist your current server IP.";
      }

      return NextResponse.json({
        success: res.success,
        type: "registration",
        messageId: res.messageId,
        simulated: res.simulated,
        error: errorClarification,
        from: `"${config.fromName}" <${config.fromAddress}>`,
        to: recipient,
        message: res.success
          ? (res.simulated ? "Test welcome credentials email simulated successfully" : "Registration & credentials email delivered successfully via Brevo")
          : (errorClarification || "Registration email delivery failed"),
      });
    }

    // Default "ping" diagnostic test email
    const res = await sendMail({
      to: recipient,
      subject: `[BREVO VERIFICATION] Test Email from ${config.fromAddress}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #111827; padding: 40px 20px;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 36px 32px; box-sizing: border-box;">
            <div style="font-size: 18px; font-weight: 900; letter-spacing: 2px; color: #000000; text-transform: uppercase; margin-bottom: 4px;">UGHAM</div>
            <div style="font-size: 11px; font-weight: 700; color: #6b7280; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 24px;">Brevo SMTP Relay Verification</div>
            <h2 style="font-size: 20px; font-weight: 800; color: #000000; margin: 0 0 12px 0;">Relay Connection Verified</h2>
            <p style="color: #4b5563; font-size: 14.5px; line-height: 1.6; margin: 0 0 24px 0;">
              This diagnostic transmission confirms that your Brevo SMTP relay with custom authenticated domain <strong>ugham.com</strong> is active on Port 587 with STARTTLS encryption.
            </p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 18px 20px; border-radius: 8px; margin-bottom: 24px; font-size: 13.5px; line-height: 1.8;">
              <div><strong style="color: #111827;">Sender:</strong> "${config.fromName}" &lt;${config.fromAddress}&gt;</div>
              <div><strong style="color: #111827;">Reply-To:</strong> ${config.replyTo}</div>
              <div><strong style="color: #111827;">Relay Server:</strong> ${config.host}:${config.port} (STARTTLS)</div>
              <div><strong style="color: #111827;">Timestamp:</strong> ${new Date().toUTCString()}</div>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
              &copy; 2026 Ugham Innovation Studio • Authenticated Domain Transmission (events@ugham.com)
            </p>
          </div>
        </div>
      `,
      text: `UGHAM BREVO SMTP VERIFIED\n\nThis confirms that your Brevo SMTP relay with custom domain ugham.com is operational.\n\nSender: ${config.fromAddress}\nReply-To: ${config.replyTo}`,
    });

    let errorClarification = res.error;
    if (res.error?.includes("525") || res.error?.includes("Unauthorized IP address")) {
      errorClarification = "Brevo Error 525 (5.7.1 Unauthorized IP address): In Brevo Dashboard -> SMTP & API -> Authorized IP addresses, remove the restricted IP to allow sending from anywhere, or whitelist your current server IP.";
    }

    return NextResponse.json({
      success: res.success,
      type: "ping",
      messageId: res.messageId,
      simulated: res.simulated,
      error: errorClarification,
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: recipient,
      message: res.success
        ? (res.simulated ? "Ping test simulated successfully (Credentials pending)" : "Ping email delivered successfully via Brevo relay")
        : (errorClarification || "Ping delivery failed"),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to dispatch test email" },
      { status: 500 }
    );
  }
}
