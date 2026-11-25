import { NextResponse } from "next/server";
import { getEventEditions, upsertEventEdition, updateEditionStatus, EventEditionRecord } from "@/lib/editions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const editions = await getEventEditions();
    return NextResponse.json({ success: true, editions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      slug,
      series,
      editionNumber,
      title,
      badgeText,
      tagline,
      description,
      status,
      pricingMode,
      feeAmount,
      teamSizeMin,
      teamSizeMax,
      tracks,
      domains,
      whatsappLink,
      scheduleNote,
      rounds,
    } = body;

    if (!title || !series || !editionNumber) {
      return NextResponse.json({ success: false, error: "Title, series, and edition number are required." }, { status: 400 });
    }

    const generatedSlug =
      slug ||
      `${series}_edition_${editionNumber}`;

    const record: EventEditionRecord = {
      slug: generatedSlug,
      series,
      editionNumber: Number(editionNumber),
      title: title.trim(),
      badgeText: (badgeText || `${series.toUpperCase().replace(/_/g, " ")} • EDITION ${editionNumber}`).trim(),
      tagline: (tagline || "").trim(),
      description: (description || "").trim(),
      status: status || "active",
      pricingMode: pricingMode || (series === "hackpick" ? "flat_team" : "per_member"),
      feeAmount: Number(feeAmount || (series === "hackpick" ? 199 : 99)),
      teamSizeMin: Number(teamSizeMin || (series === "hackpick" ? 2 : 3)),
      teamSizeMax: Number(teamSizeMax || (series === "hackpick" ? 3 : 4)),
      tracks: Array.isArray(tracks) ? tracks : series === "hackpick" ? ["Deep-Tech Sprint"] : ["Project Pitch", "Idea Pitch"],
      domains: Array.isArray(domains) && domains.length > 0 ? domains : ["AI", "SAAS", "FINTECH", "IOT", "HEALTHCARE"],
      whatsappLink: (whatsappLink || "https://chat.whatsapp.com/invite/ugham-community").trim(),
      scheduleNote: (scheduleNote || "Registrations Open").trim(),
      rounds: Array.isArray(rounds) ? rounds : [],
      createdAt: new Date().toISOString(),
    };

    const editions = await upsertEventEdition(record);
    return NextResponse.json({ success: true, edition: record, editions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { slug, status, registrationClosed } = await req.json();
    if (!slug || (status === undefined && typeof registrationClosed !== "boolean")) {
      return NextResponse.json({ success: false, error: "Slug and update fields are required." }, { status: 400 });
    }
    const editions = await updateEditionStatus(slug, status, registrationClosed);
    return NextResponse.json({ success: true, editions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
