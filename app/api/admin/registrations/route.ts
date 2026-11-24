import { NextRequest, NextResponse } from "next/server";
import { getRegistrations, updateEmailStatus, getDatabaseStatus } from "@/lib/db";
import { sendMemberWelcomeEmail, sendSequentialEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const [list, dbStatus] = await Promise.all([
      getRegistrations(),
      getDatabaseStatus(),
    ]);
    return NextResponse.json({
      success: true,
      registrations: list,
      databaseStatus: dbStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId, memberEmail, action } = body;

    if (action === "resendMemberEmail" && registrationId && memberEmail) {
      const list = await getRegistrations();
      const record = list.find((r) => r.id === registrationId);

      if (!record) {
        return NextResponse.json({ error: "Registration record not found" }, { status: 404 });
      }

      const member = record.members.find((m) => m.email.toLowerCase() === memberEmail.toLowerCase());
      if (!member) {
        return NextResponse.json({ error: "Squad member email not found" }, { status: 404 });
      }

      const res = await sendMemberWelcomeEmail(record, member);
      return NextResponse.json({
        success: res.success,
        messageId: res.messageId,
        simulated: res.simulated,
        error: res.error,
        status: res.success ? "sent" : "failed",
      });
    }

    if (action === "resendEmail") {
      const list = await getRegistrations();
      const record = list.find((r) => r.id === registrationId);

      if (!record) {
        return NextResponse.json(
          { error: "Registration not found" },
          { status: 404 }
        );
      }

      await updateEmailStatus(record.id, "sending");

      const tasks = record.members.map((m) => () => sendMemberWelcomeEmail(record, m));
      const results = await sendSequentialEmails(tasks, 300);
      const allSuccess = results.every((r) => r.success);

      const finalStatus = allSuccess ? "sent" : "failed";
      await updateEmailStatus(record.id, finalStatus);

      return NextResponse.json({ success: true, status: finalStatus });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
