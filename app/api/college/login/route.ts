import { NextResponse } from "next/server";
import { getCollegeCredentials } from "@/lib/colleges";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both College Username and Password" },
        { status: 400 }
      );
    }

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const credentials = getCollegeCredentials();
    const matched = credentials.find(
      (c) =>
        (c.username.toLowerCase() === cleanUser ||
         (c.contactEmail && c.contactEmail.toLowerCase() === cleanUser) ||
         c.collegeName.toLowerCase() === cleanUser) &&
        c.password === cleanPass
    );

    if (!matched) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid college credentials. Please check your username and access password, or contact Ugham Administration.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      college: {
        collegeName: matched.collegeName,
        username: matched.username,
        contactEmail: matched.contactEmail,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
