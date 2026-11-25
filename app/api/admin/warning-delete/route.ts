import { NextRequest, NextResponse } from "next/server";
import { deleteRegistrationsByIds } from "@/lib/db";
import { deleteCollege, deleteCollegeCredential } from "@/lib/colleges";
import { deleteBrevoDispatchesByIds } from "@/lib/email";

export const dynamic = "force-dynamic";

const WARNING_DELETE_PASSWORD = process.env.WARNING_DELETE_PASSWORD || "del@123";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target, ids, password } = body as {
      target: "teams" | "colleges" | "emails";
      ids: string[];
      password: string;
    };

    if (!password || password.trim() !== WARNING_DELETE_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Invalid deletion authorization password." },
        { status: 401 }
      );
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least one record to delete." },
        { status: 400 }
      );
    }

    if (target === "teams") {
      const deletedCount = await deleteRegistrationsByIds(ids);
      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedCount} selected team registration(s) permanently.`,
      });
    }

    if (target === "colleges") {
      for (const colName of ids) {
        await deleteCollege(colName);
        deleteCollegeCredential(colName);
      }
      return NextResponse.json({
        success: true,
        message: `Removed ${ids.length} college entry/credential record(s).`,
      });
    }

    if (target === "emails") {
      deleteBrevoDispatchesByIds(ids);
      return NextResponse.json({
        success: true,
        message: `Deleted ${ids.length} email log record(s) from transmission history.`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid deletion target." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Warning delete failed." },
      { status: 500 }
    );
  }
}
