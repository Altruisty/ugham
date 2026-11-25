import { NextResponse } from "next/server";
import { saveRoundSubmission } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { id, roundNumber, primaryLink, secondaryLink, notes } = await req.json();
    if (!id || !roundNumber || !primaryLink) {
      return NextResponse.json(
        { success: false, error: "Registration ID, round number, and primary link are required." },
        { status: 400 }
      );
    }

    const updated = await saveRoundSubmission(id, Number(roundNumber), {
      primaryLink: String(primaryLink).trim(),
      secondaryLink: secondaryLink ? String(secondaryLink).trim() : "",
      notes: notes ? String(notes).trim() : "",
      submittedAt: new Date().toISOString(),
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Registration record not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, registration: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
