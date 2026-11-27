import { NextRequest, NextResponse } from "next/server";
import { getSupportQueries, createSupportQuery, updateSupportQueryStatus } from "@/lib/support";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const email = (req.nextUrl.searchParams.get("email") || "").trim().toLowerCase();
    const allQueries = await getSupportQueries();
    const queries = email
      ? allQueries.filter((q) => q.userEmail.toLowerCase() === email)
      : allQueries;
    return NextResponse.json({ success: true, queries });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userName, userEmail, collegeName, category, title, message } = body;

    if (!userEmail || !title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title, query details, and user email are required." },
        { status: 400 }
      );
    }

    const query = await createSupportQuery({
      userName: userName || userEmail.split("@")[0] || "Participant",
      userEmail,
      collegeName,
      category,
      title,
      message,
    });

    return NextResponse.json({ success: true, query }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || (status !== "open" && status !== "solved")) {
      return NextResponse.json(
        { success: false, error: "Valid ticket ID and status ('open' or 'solved') are required." },
        { status: 400 }
      );
    }

    const queries = await updateSupportQueryStatus(id, status);
    return NextResponse.json({ success: true, queries });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
