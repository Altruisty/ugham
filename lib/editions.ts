import fs from "fs";
import path from "path";
import { pgPool as pool, runOnceInitialized } from "./pgPool";

const DATA_DIR = path.join(process.cwd(), "data");
const EDITIONS_FILE = path.join(DATA_DIR, "event_editions.json");

export interface EventRoundTemplate {
  roundNumber: number;
  title: string;
  description: string;
  certificateNote: string;
}

export interface EventEditionRecord {
  slug: string; // e.g., "shepitch_chennai", "shepitch_chennai_e3", "hackpick", "hackpick_e2"
  series: "shepitch_chennai" | "shepitch_coimbatore" | "hackpick";
  editionNumber: number;
  title: string;
  badgeText: string;
  tagline: string;
  description: string;
  status: "active" | "upcoming" | "past";
  registrationClosed?: boolean;
  pricingMode: "per_member" | "flat_team";
  feeAmount: number;
  teamSizeMin: number;
  teamSizeMax: number;
  tracks?: string[];
  domains: string[];
  whatsappLink: string;
  scheduleNote: string;
  rounds: EventRoundTemplate[];
  createdAt: string;
}

export const DEFAULT_EDITIONS: EventEditionRecord[] = [
  {
    slug: "shepitch_chennai",
    series: "shepitch_chennai",
    editionNumber: 2,
    title: "ShePitch Chennai Edition 2",
    badgeText: "CHENNAI EDITION 2",
    tagline: "Women-led innovation challenge • Chennai Hub",
    description:
      "Premier women-led innovation arena in Chennai. Showcase working prototypes or conceptual blueprints to angel investors and deep-tech incubators.",
    status: "active",
    pricingMode: "per_member",
    feeAmount: 99,
    teamSizeMin: 3,
    teamSizeMax: 4,
    tracks: ["Project Pitch", "Idea Pitch"],
    domains: ["AI", "SAAS", "EDUTECH", "HEALTHCARE", "FINTECH", "AGRITECH", "IOT", "MECHANICAL", "CYBER SECURITY", "OPEN INNOVATION"],
    whatsappLink: "https://chat.whatsapp.com/invite/ugham-shepitch-chennai",
    scheduleNote: "Registrations Open • Chennai Finale",
    rounds: [
      {
        roundNumber: 1,
        title: "( SAMPLE PPT ) PPT SUBMISSION & VIDEO SUBMISSION ( DRIVE LINK OR OTHER LINKS )",
        description: "Download the official sample pitch PPT format and submit your Google Drive deck or pitch video link.",
        certificateNote: "AUTOMATIC PARTICIPATION CERTIFICATE FOR NOT SELECTED TO ROUND 2",
      },
      {
        roundNumber: 2,
        title: "PROTOTYPE SUBMISSION & VIDEO EXPLANATION ( LINKS )",
        description: "Submit working codebase / prototype demonstration links with architectural walkthrough.",
        certificateNote: "APPRECIATION CERTIFICATE FOR NOT MOVED NEXT",
      },
      {
        roundNumber: 3,
        title: "OFFLINE GRAND FINALE",
        description: "Physical on-stage pitch in Chennai before angel investors, venture partners & technical jury.",
        certificateNote: "FINAL STAGE: GRANTS, INCUBATION & INTERNSHIPS",
      },
    ],
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    slug: "hackpick",
    series: "hackpick",
    editionNumber: 1,
    title: "HackPick 2026",
    badgeText: "EDITION 1 • DEEP-TECH SPRINT",
    tagline: "Rapid engineering marathon • Flat ₹199/squad",
    description:
      "A 36-hour rapid engineering marathon. Build deep-tech hardware, autonomous software, and industrial automation tools tackling real-world enterprise briefs.",
    status: "active",
    pricingMode: "flat_team",
    feeAmount: 199,
    teamSizeMin: 2,
    teamSizeMax: 3,
    tracks: ["Deep-Tech Sprint"],
    domains: ["AI", "CYBER SECURITY", "FINTECH", "IOT", "SAAS", "AGRI TECH", "HEALTH CARE", "CLOUD"],
    whatsappLink: "https://chat.whatsapp.com/invite/ugham-hackpick-2026",
    scheduleNote: "Registrations Open • 36-Hour Sprint",
    rounds: [
      {
        roundNumber: 1,
        title: "( SAMPLE PPT ) PPT SUBMISSION & VIDEO SUBMISSION ( DRIVE LINK OR OTHER LINKS )",
        description: "Download the official Sample PPT and upload solution architecture + Drive/Video link.",
        certificateNote: "AUTOMATIC PARTICIPATION CERTIFICATE FOR NOT SELECTED TO ROUND 2",
      },
      {
        roundNumber: 2,
        title: "PROTOTYPE SUBMISSION & VIDEO EXPLANATION ( LINKS )",
        description: "Submit working code repository / hardware prototype & technical video demonstration.",
        certificateNote: "APPRECIATION CERTIFICATE FOR NOT MOVED NEXT",
      },
      {
        roundNumber: 3,
        title: "( SAMPLE PPT ) PRESENT TO JURIES",
        description: "Present live system architecture and technical Q&A defense to industry jury panel.",
        certificateNote: "EXCELLENCE CERTIFICATE FOR NOT MOVED NEXT",
      },
      {
        roundNumber: 4,
        title: "OFFLINE GRAND FINALE ( BEST TEAM, WINNER TEAM )",
        description: "36-hour on-ground championship crowning Best Team & Winner Team with awards & internships.",
        certificateNote: "GRAND FINALE: BEST TEAM & WINNER TEAM",
      },
    ],
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    slug: "shepitch_coimbatore",
    series: "shepitch_coimbatore",
    editionNumber: 1,
    title: "ShePitch Coimbatore Edition",
    badgeText: "COIMBATORE EDITION 1",
    tagline: "Women-led innovation challenge • Western TN",
    description:
      "Regional women-led startup & prototype challenge serving Coimbatore and Western Tamil Nadu innovation chapters.",
    status: "upcoming",
    pricingMode: "per_member",
    feeAmount: 99,
    teamSizeMin: 3,
    teamSizeMax: 4,
    tracks: ["Project Pitch", "Idea Pitch"],
    domains: ["AI", "SAAS", "EDUTECH", "HEALTHCARE", "FINTECH", "AGRITECH", "IOT", "MECHANICAL", "CYBER SECURITY", "OPEN INNOVATION"],
    whatsappLink: "https://chat.whatsapp.com/invite/ugham-shepitch-coimbatore",
    scheduleNote: "Upcoming Soon • Coimbatore Chapter",
    rounds: [
      {
        roundNumber: 1,
        title: "( SAMPLE PPT ) PPT SUBMISSION & VIDEO SUBMISSION ( DRIVE LINK OR OTHER LINKS )",
        description: "Download the official sample pitch PPT format and submit your Google Drive deck or pitch video link.",
        certificateNote: "AUTOMATIC PARTICIPATION CERTIFICATE FOR NOT SELECTED TO ROUND 2",
      },
      {
        roundNumber: 2,
        title: "PROTOTYPE SUBMISSION & VIDEO EXPLANATION ( LINKS )",
        description: "Submit working codebase / prototype demonstration links with architectural walkthrough.",
        certificateNote: "APPRECIATION CERTIFICATE FOR NOT MOVED NEXT",
      },
      {
        roundNumber: 3,
        title: "OFFLINE GRAND FINALE",
        description: "On-stage finals in Coimbatore before venture partners & technical jury.",
        certificateNote: "FINAL STAGE: GRANTS, INCUBATION & INTERNSHIPS",
      },
    ],
    createdAt: "2026-10-05T00:00:00.000Z",
  },
];

function ensureLocalEditionsFile(): EventEditionRecord[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(EDITIONS_FILE)) {
    fs.writeFileSync(EDITIONS_FILE, JSON.stringify(DEFAULT_EDITIONS, null, 2), "utf-8");
    return DEFAULT_EDITIONS;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(EDITIONS_FILE, "utf-8"));
    return Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_EDITIONS;
  } catch {
    return DEFAULT_EDITIONS;
  }
}

async function initEditionsDb() {
  if (!pool) return;
  return runOnceInitialized("event_editions_init", async () => {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS event_editions (
          slug VARCHAR(80) PRIMARY KEY,
          series VARCHAR(50) NOT NULL,
          edition_number INT NOT NULL,
          title VARCHAR(200) NOT NULL,
          badge_text VARCHAR(120) NOT NULL,
          tagline VARCHAR(255),
          description TEXT,
          status VARCHAR(30) NOT NULL DEFAULT 'active',
          pricing_mode VARCHAR(30) NOT NULL DEFAULT 'per_member',
          fee_amount INT NOT NULL DEFAULT 99,
          team_size_min INT NOT NULL DEFAULT 3,
          team_size_max INT NOT NULL DEFAULT 4,
          tracks JSONB DEFAULT '[]',
          domains JSONB DEFAULT '[]',
          whatsapp_link TEXT,
          schedule_note VARCHAR(255),
          rounds JSONB DEFAULT '[]',
          registration_closed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await client.query(`
        ALTER TABLE event_editions ADD COLUMN IF NOT EXISTS registration_closed BOOLEAN DEFAULT FALSE;
        CREATE TABLE IF NOT EXISTS app_meta (
          key VARCHAR(64) PRIMARY KEY,
          value TEXT
        );
      `);
      const coimbatoreMigrated = await client.query(`SELECT value FROM app_meta WHERE key = 'coimbatore_upcoming_v1'`);
      if (coimbatoreMigrated.rows.length === 0) {
        await client.query(`UPDATE event_editions SET status = 'upcoming' WHERE slug = 'shepitch_coimbatore'`);
        await client.query(
          `INSERT INTO app_meta (key, value) VALUES ('coimbatore_upcoming_v1', 'true') ON CONFLICT (key) DO NOTHING`
        );
      }
      const countRes = await client.query(`SELECT COUNT(*)::int AS cnt FROM event_editions`);
      if (countRes.rows[0]?.cnt === 0) {
        const localSeed = ensureLocalEditionsFile();
        for (const ed of localSeed) {
          await client.query(
            `INSERT INTO event_editions (
              slug, series, edition_number, title, badge_text, tagline, description, status,
              pricing_mode, fee_amount, team_size_min, team_size_max, tracks, domains, whatsapp_link,
              schedule_note, rounds, created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
            ON CONFLICT (slug) DO NOTHING`,
            [
              ed.slug,
              ed.series,
              ed.editionNumber,
              ed.title,
              ed.badgeText,
              ed.tagline,
              ed.description,
              ed.status,
              ed.pricingMode,
              ed.feeAmount,
              ed.teamSizeMin,
              ed.teamSizeMax,
              JSON.stringify(ed.tracks || []),
              JSON.stringify(ed.domains || []),
              ed.whatsappLink,
              ed.scheduleNote,
              JSON.stringify(ed.rounds || []),
              ed.createdAt,
            ]
          );
        }
      }
    } finally {
      client.release();
    }
  }).catch((err) => {
    console.error("Postgres initEditionsDb error, falling back to local:", err);
    throw err;
  });
}

export async function getEventEditions(): Promise<EventEditionRecord[]> {
  if (pool) {
    try {
      await initEditionsDb();
      const res = await pool.query(`SELECT * FROM event_editions ORDER BY created_at DESC, edition_number DESC`);
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          slug: r.slug,
          series: r.series,
          editionNumber: r.edition_number,
          title: r.title,
          badgeText: r.badge_text,
          tagline: r.tagline || "",
          description: r.description || "",
          status: r.status,
          registrationClosed: Boolean(r.registration_closed),
          pricingMode: r.pricing_mode,
          feeAmount: r.fee_amount,
          teamSizeMin: r.team_size_min,
          teamSizeMax: r.team_size_max,
          tracks: typeof r.tracks === "string" ? JSON.parse(r.tracks) : r.tracks || [],
          domains: typeof r.domains === "string" ? JSON.parse(r.domains) : r.domains || [],
          whatsappLink: r.whatsapp_link || "",
          scheduleNote: r.schedule_note || "",
          rounds: typeof r.rounds === "string" ? JSON.parse(r.rounds) : r.rounds || [],
          createdAt: new Date(r.created_at).toISOString(),
        }));
      }
    } catch (err) {
      console.error("Postgres getEventEditions error:", err);
    }
  }
  return ensureLocalEditionsFile();
}

export async function upsertEventEdition(ed: EventEditionRecord): Promise<EventEditionRecord[]> {
  if (pool) {
    try {
      await initEditionsDb();
      await pool.query(
        `INSERT INTO event_editions (
          slug, series, edition_number, title, badge_text, tagline, description, status,
          pricing_mode, fee_amount, team_size_min, team_size_max, tracks, domains, whatsapp_link,
          schedule_note, rounds, registration_closed, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          badge_text = EXCLUDED.badge_text,
          tagline = EXCLUDED.tagline,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          pricing_mode = EXCLUDED.pricing_mode,
          fee_amount = EXCLUDED.fee_amount,
          team_size_min = EXCLUDED.team_size_min,
          team_size_max = EXCLUDED.team_size_max,
          tracks = EXCLUDED.tracks,
          domains = EXCLUDED.domains,
          whatsapp_link = EXCLUDED.whatsapp_link,
          schedule_note = EXCLUDED.schedule_note,
          rounds = EXCLUDED.rounds,
          registration_closed = EXCLUDED.registration_closed`,
        [
          ed.slug,
          ed.series,
          ed.editionNumber,
          ed.title,
          ed.badgeText,
          ed.tagline,
          ed.description,
          ed.status,
          ed.pricingMode,
          ed.feeAmount,
          ed.teamSizeMin,
          ed.teamSizeMax,
          JSON.stringify(ed.tracks || []),
          JSON.stringify(ed.domains || []),
          ed.whatsappLink,
          ed.scheduleNote,
          JSON.stringify(ed.rounds || []),
          Boolean(ed.registrationClosed),
          ed.createdAt || new Date().toISOString(),
        ]
      );
    } catch (err) {
      console.error("Postgres upsertEventEdition error:", err);
    }
  }

  const list = ensureLocalEditionsFile();
  const idx = list.findIndex((item) => item.slug === ed.slug);
  if (idx >= 0) {
    list[idx] = ed;
  } else {
    list.unshift(ed);
  }
  fs.writeFileSync(EDITIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
  return getEventEditions();
}

export async function updateEditionStatus(
  slug: string,
  status?: "active" | "upcoming" | "past",
  registrationClosed?: boolean
): Promise<EventEditionRecord[]> {
  if (pool) {
    try {
      await initEditionsDb();
      if (status !== undefined) {
        await pool.query(`UPDATE event_editions SET status = $1 WHERE slug = $2`, [status, slug]);
      }
      if (typeof registrationClosed === "boolean") {
        await pool.query(`UPDATE event_editions SET registration_closed = $1 WHERE slug = $2`, [registrationClosed, slug]);
      }
    } catch (err) {
      console.error("Postgres updateEditionStatus error:", err);
    }
  }

  const list = ensureLocalEditionsFile();
  const item = list.find((ed) => ed.slug === slug);
  if (item) {
    if (status !== undefined) item.status = status;
    if (typeof registrationClosed === "boolean") item.registrationClosed = registrationClosed;
    fs.writeFileSync(EDITIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
  }
  return getEventEditions();
}
