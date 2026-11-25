import { NextResponse } from "next/server";
import { updateTeamStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const {
      id,
      round_status,
      internship_selected,
      internship_reason,
      jury_feedback,
      is_past_event,
      certificate_issued,
      certificate_title,
      certificate_issued_at,
    } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Registration ID required" }, { status: 400 });
    }

    await updateTeamStatus(id, {
      round_status,
      internship_selected,
      internship_reason,
      jury_feedback,
      is_past_event,
      certificate_issued,
      certificate_title,
      certificate_issued_at,
    });

    return NextResponse.json({ success: true, message: "Team status updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
