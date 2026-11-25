import { NextResponse } from "next/server";
import { getCollegeCredentials, saveCollegeCredential, deleteCollegeCredential, CollegeCredential } from "@/lib/colleges";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const credentials = getCollegeCredentials();
    return NextResponse.json({ success: true, credentials });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: CollegeCredential = await req.json();
    if (!body.collegeName || !body.username || !body.password) {
      return NextResponse.json(
        { success: false, error: "collegeName, username, and password are required" },
        { status: 400 }
      );
    }
    const updated = saveCollegeCredential({
      collegeName: body.collegeName.trim(),
      username: body.username.trim(),
      password: body.password.trim(),
      contactEmail: body.contactEmail ? body.contactEmail.trim() : undefined,
    });
    return NextResponse.json({ success: true, credentials: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeName = searchParams.get("collegeName") || "";
    if (!collegeName.trim()) {
      return NextResponse.json({ success: false, error: "collegeName is required" }, { status: 400 });
    }
    const updated = deleteCollegeCredential(collegeName);
    return NextResponse.json({ success: true, credentials: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
