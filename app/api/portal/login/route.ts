import { NextRequest, NextResponse } from "next/server";
import { getRegistrations } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = (body.username || "").trim();
    const password = (body.password || "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both username and password." },
        { status: 400 }
      );
    }

    // 1. Check Administrator Access
    const validAdminKeys = ["Admin@123", "ugham@admin2026", "admin", "UGHAM2026"];
    if (
      (username.toLowerCase() === "admin" ||
        username.toLowerCase() === "events@ugham.com" ||
        username.toLowerCase() === "ughambusiness@gmail.com") &&
      validAdminKeys.includes(password)
    ) {
      return NextResponse.json({
        success: true,
        role: "admin",
        redirectUrl: "/myadmin",
        message: "Executive Desk Authentication Successful",
      });
    }

    // Direct admin secret key login
    if (username.toLowerCase() === "admin" || validAdminKeys.includes(username)) {
      if (validAdminKeys.includes(password)) {
        return NextResponse.json({
          success: true,
          role: "admin",
          redirectUrl: "/myadmin",
          message: "Executive Desk Authentication Successful",
        });
      }
    }

    // 2. Check Participant Access
    const email = username.toLowerCase();
    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Username must be your registered email address." },
        { status: 400 }
      );
    }

    // Validate default event password
    if (password !== "UGHAM2026" && password !== "ugham2026") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid portal password. Default event password is UGHAM2026.",
        },
        { status: 401 }
      );
    }

    // Query registrations from PostgreSQL / fallback memory store
    const allRegistrations = await getRegistrations();

    // Find all registrations associated with this email (leader or member)
    const userRegistrations = allRegistrations.filter((reg: any) => {
      const isLeader = reg.leader_email?.toLowerCase() === email;
      const isMember = Array.isArray(reg.members) && reg.members.some(
        (m: any) => m.email?.toLowerCase() === email
      );
      return isLeader || isMember;
    });

    if (userRegistrations.length === 0) {
      // User has not registered for any events yet
      return NextResponse.json(
        {
          success: false,
          notRegistered: true,
          error: "Kindly register for any one of the events.",
          message: "No squad registration found for this email address. Please register for ShePitch Chennai Edition 2, ShePitch Coimbatore Edition, or HackPick 2026 to activate your member access pass.",
        },
        { status: 404 }
      );
    }

    // Extract student name & details
    const firstReg = userRegistrations[0];
    const memberObj = (firstReg.members || []).find((m: any) => m.email?.toLowerCase() === email);
    const studentName = memberObj?.name || firstReg.leader_name || email.split("@")[0].toUpperCase();
    const collegeName = firstReg.college_name || "Registered Institution";

    return NextResponse.json({
      success: true,
      role: "participant",
      redirectUrl: "/portal",
      user: {
        email,
        name: studentName,
        college: collegeName,
        department: firstReg.department || "Innovation & Technology",
        yearOfStudy: firstReg.year_of_study || "Final Year",
        registrations: userRegistrations,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process login" },
      { status: 500 }
    );
  }
}
