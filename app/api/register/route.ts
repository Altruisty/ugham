import { NextRequest, NextResponse } from "next/server";
import { saveRegistration, updateEmailStatus, RegistrationRecord, TeamMember } from "@/lib/db";
import { sendMemberWelcomeEmail, sendSequentialEmails } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      eventName,
      track,
      domain,
      teamName,
      leaderName,
      leaderEmail,
      mobile,
      collegeName,
      yearOfStudy,
      department,
      teamSize,
      members,
      paymentId,
    } = body;

    // Validation
    if (!eventName || !teamName || !leaderName || !leaderEmail || !mobile || !collegeName || !yearOfStudy || !department || !domain) {
      return NextResponse.json(
        { error: "Missing required fields. Please fill in all fields." },
        { status: 400 }
      );
    }

    if (eventName === "shepitch") {
      if (teamSize < 3 || teamSize > 4) {
        return NextResponse.json(
          { error: "ShePitch requires 3 to 4 team members." },
          { status: 400 }
        );
      }
      if (!track || (track !== "Project Pitch" && track !== "Idea Pitch")) {
        return NextResponse.json(
          { error: "Please select either Project Pitch or Idea Pitch for ShePitch." },
          { status: 400 }
        );
      }
    } else if (eventName === "hackpick") {
      if (teamSize < 2 || teamSize > 3) {
        return NextResponse.json(
          { error: "HackPick requires 2 to 3 team members." },
          { status: 400 }
        );
      }
    }

    // Pricing calculation
    const amountPaid = eventName === "shepitch" ? teamSize * 99 : 199;

    // Assemble team members
    const allMembers: TeamMember[] = [
      { name: leaderName, email: leaderEmail, phone: mobile, role: "Leader" },
      ...(Array.isArray(members) ? members : []),
    ];

    // Ensure all member emails are present
    for (let i = 0; i < allMembers.length; i++) {
      if (!allMembers[i].email || !allMembers[i].email.includes("@")) {
        return NextResponse.json(
          { error: `Valid email is required for all members (Member ${i + 1}).` },
          { status: 400 }
        );
      }
    }

    const regId = "UGH-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

    const record: RegistrationRecord = {
      id: regId,
      event_name: eventName,
      track: eventName === "shepitch" ? track : undefined,
      domain,
      team_name: teamName,
      leader_name: leaderName,
      leader_email: leaderEmail,
      mobile,
      college_name: collegeName,
      year_of_study: yearOfStudy,
      department,
      team_size: teamSize,
      amount_paid: amountPaid,
      payment_id: paymentId || "RZP_MOCK_" + Date.now(),
      members: allMembers,
      email_status: "sending",
      created_at: new Date().toISOString(),
    };

    // Save to Database first
    await saveRegistration(record);

    // Controlled background email dispatch via Brevo SMTP with rate limits
    (async () => {
      try {
        const tasks = allMembers.map((m) => () => sendMemberWelcomeEmail(record, m));
        const results = await sendSequentialEmails(tasks, 300);
        const allSuccess = results.every((r) => r.success);
        await updateEmailStatus(record.id, allSuccess ? "sent" : "failed");
      } catch (err) {
        console.error("Error in background email dispatch:", err);
        await updateEmailStatus(record.id, "failed");
      }
    })();

    return NextResponse.json({
      success: true,
      registrationId: regId,
      eventName: eventName === "shepitch" ? "ShePitch" : "HackPick",
      teamName,
      amountPaid,
      defaultPassword: "UGHAM2026",
      members: allMembers.map((m) => ({
        name: m.name,
        email: m.email,
        username: m.email,
        password: "UGHAM2026",
      })),
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process registration" },
      { status: 500 }
    );
  }
}
