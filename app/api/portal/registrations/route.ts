import { NextRequest, NextResponse } from "next/server";
import { getRegistrations } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email query parameter is required" }, { status: 400 });
    }

    const allRegistrations = await getRegistrations();
    const userRegistrations = allRegistrations.filter((reg: any) => {
      const isLeader = reg.leader_email?.toLowerCase() === email;
      const isMember = Array.isArray(reg.members) && reg.members.some(
        (m: any) => m.email?.toLowerCase() === email
      );
      return isLeader || isMember;
    });

    return NextResponse.json({
      success: true,
      email,
      registrations: userRegistrations,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
