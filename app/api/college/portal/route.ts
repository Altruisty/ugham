import { NextResponse } from "next/server";
import { getRegistrations } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeName = searchParams.get("collegeName") || "";

    if (!collegeName.trim()) {
      return NextResponse.json(
        { success: false, error: "collegeName query parameter is required" },
        { status: 400 }
      );
    }

    const cleanCollege = collegeName.trim().toLowerCase();
    const allRegistrations = await getRegistrations();

    // Match registrations from this college
    const collegeTeams = allRegistrations.filter((r) => {
      const regCollege = (r.college_name || "").trim().toLowerCase();
      return (
        regCollege === cleanCollege ||
        regCollege.includes(cleanCollege) ||
        cleanCollege.includes(regCollege)
      );
    });

    const totalStudents = collegeTeams.reduce((sum, t) => sum + (t.team_size || 0), 0);
    const totalAmount = collegeTeams.reduce((sum, t) => sum + (t.amount_paid || 0), 0);

    const internshipSelectedTeams = collegeTeams.filter((t) => t.internship_selected);
    const teamsWithFeedback = collegeTeams.filter((t) => !!t.jury_feedback);

    return NextResponse.json({
      success: true,
      collegeName,
      totalTeams: collegeTeams.length,
      totalStudents,
      totalAmount,
      teams: collegeTeams,
      internshipSelectedTeams,
      teamsWithFeedback,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
