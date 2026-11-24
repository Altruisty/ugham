import { NextRequest, NextResponse } from "next/server";
import { getColleges, addCollege, deleteCollege } from "@/lib/colleges";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const colleges = await getColleges();
    return NextResponse.json({ success: true, colleges });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Valid college name is required" },
        { status: 400 }
      );
    }
    const updated = await addCollege(name.trim());
    return NextResponse.json({ success: true, colleges: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add college" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    if (!name) {
      return NextResponse.json(
        { success: false, error: "College name is required" },
        { status: 400 }
      );
    }
    const updated = await deleteCollege(name);
    return NextResponse.json({ success: true, colleges: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete college" },
      { status: 500 }
    );
  }
}
