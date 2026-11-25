import { Pool } from "pg";
import fs from "fs";
import path from "path";

// Aiven PostgreSQL connection URL
// Strip query parameters so pg doesn't force strict CA chain verification for cloud DBs with self-signed certs
const rawConnectionString = process.env.DATABASE_URL || "";
const connectionString = rawConnectionString.split("?")[0].trim();

let pool: Pool | null = null;
if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

// Local fallback file path when DATABASE_URL is not yet configured
const DATA_DIR = path.join(process.cwd(), "data");
const FALLBACK_FILE = path.join(DATA_DIR, "registrations.json");

function ensureLocalFallback() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FALLBACK_FILE)) {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify([]), "utf-8");
  }
}

export interface TeamMember {
  name: string;
  email: string;
  phone?: string;
  role: "Leader" | "Member";
}

export interface RoundSubmissions {
  round1?: { pptLink?: string; videoLink?: string; submittedAt?: string };
  round2?: { prototypeLink?: string; videoLink?: string; submittedAt?: string };
  round3?: { deckLink?: string; notes?: string; submittedAt?: string };
}

export interface RegistrationRecord {
  id: string;
  event_name: string;
  track?: string; // "Project Pitch" | "Idea Pitch"
  domain: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  mobile: string;
  college_name: string;
  year_of_study: string;
  department: string;
  team_size: number;
  amount_paid: number;
  payment_id: string;
  members: TeamMember[];
  email_status: "sent" | "sending" | "failed" | "pending";
  round_status?: string;
  internship_status?: "Selected" | "Under Review" | "Not Selected";
  internship_selected?: boolean;
  internship_reason?: string;
  jury_feedback?: string;
  is_past_event?: boolean;
  certificate_issued?: boolean;
  certificate_title?: string;
  certificate_issued_at?: string;
  round_submissions?: RoundSubmissions;
  submission_links?: {
    pptLink?: string;
    videoLink?: string;
    prototypeLink?: string;
    driveLink?: string;
    submittedAt?: string;
  };
  created_at: string;
}

export function getEventDisplayName(eventName: string): string {
  if (eventName === "shepitch" || eventName === "shepitch_chennai") {
    return "ShePitch Chennai Edition 2";
  }
  if (eventName === "shepitch_coimbatore") {
    return "ShePitch Coimbatore Edition";
  }
  if (eventName === "hackpick") {
    return "HackPick 2026";
  }
  if (eventName.startsWith("shepitch_chennai_edition_")) {
    const num = eventName.replace("shepitch_chennai_edition_", "");
    return `ShePitch Chennai Edition ${num}`;
  }
  if (eventName.startsWith("shepitch_coimbatore_edition_")) {
    const num = eventName.replace("shepitch_coimbatore_edition_", "");
    return `ShePitch Coimbatore Edition ${num}`;
  }
  if (eventName.startsWith("hackpick_edition_")) {
    const num = eventName.replace("hackpick_edition_", "");
    return `HackPick Edition ${num}`;
  }
  return eventName.replace(/_/g, " ");
}

export const DEMO_TEST_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: "UGH-TEST-SP01",
    event_name: "shepitch_chennai",
    track: "Project Pitch",
    domain: "AI",
    team_name: "NovaInnovators",
    leader_name: "Test Participant",
    leader_email: "test@ugham.com",
    mobile: "+91 98765 43210",
    college_name: "Indian Institute of Technology (IIT) Madras",
    year_of_study: "3rd Year",
    department: "Computer Science & Engineering",
    team_size: 3,
    amount_paid: 297,
    payment_id: "pay_test_iitm_sp01",
    members: [
      { name: "Test Participant", email: "test@ugham.com", phone: "+91 98765 43210", role: "Leader" },
      { name: "Aarav Sharma", email: "aarav@ugham.com", role: "Member" },
      { name: "Priya Nair", email: "priya@ugham.com", role: "Member" },
    ],
    email_status: "sent",
    round_status: "Round 2 (Prototype & Video Explanation)",
    internship_selected: true,
    internship_reason: "Shortlisted for AI Venture Track internship due to live Edge-AI inference demo.",
    jury_feedback: "Strong AI architecture and clear commercial roadmap. Proceed with working prototype video.",
    round_submissions: {
      round1: {
        pptLink: "https://drive.google.com/file/d/shepitch-novainnovators-r1-ppt",
        videoLink: "https://youtu.be/novainnovators-r1-pitch",
        submittedAt: "2026-11-23T15:20:00.000Z",
      },
      round2: {
        prototypeLink: "https://github.com/novainnovators/shepitch-ai-prototype",
        videoLink: "https://drive.google.com/file/d/novainnovators-r2-demo-video",
        submittedAt: "2026-11-24T18:10:00.000Z",
      },
    },
    created_at: "2026-11-23T10:30:00.000Z",
  },
  {
    id: "UGH-TEST-HP02",
    event_name: "hackpick",
    track: "Deep-Tech Sprint",
    domain: "CYBER SECURITY",
    team_name: "QuantumForge",
    leader_name: "Test Participant",
    leader_email: "test@ugham.com",
    mobile: "+91 98765 43210",
    college_name: "Indian Institute of Technology (IIT) Madras",
    year_of_study: "3rd Year",
    department: "Computer Science & Engineering",
    team_size: 3,
    amount_paid: 199,
    payment_id: "pay_test_iitm_hp02",
    members: [
      { name: "Test Participant", email: "test@ugham.com", phone: "+91 98765 43210", role: "Leader" },
      { name: "Vikram Menon", email: "vikram@ugham.com", role: "Member" },
      { name: "Kavya Iyer", email: "kavya@ugham.com", role: "Member" },
    ],
    email_status: "sent",
    round_status: "Round 3 (Present to Juries)",
    internship_selected: true,
    jury_feedback: "Impressive zero-trust packet inspection demo. Cleared Round 2 prototype review.",
    created_at: "2026-11-23T14:15:00.000Z",
  },
  {
    id: "UGH-TEST-SP03",
    event_name: "shepitch_chennai",
    track: "Idea Pitch",
    domain: "HEALTHCARE",
    team_name: "EcoPulse Squad",
    leader_name: "Meera Krishnan",
    leader_email: "meera@ugham.com",
    mobile: "+91 94432 11890",
    college_name: "National Institute of Technology (NIT) Trichy",
    year_of_study: "Final Year",
    department: "Biomedical Engineering",
    team_size: 4,
    amount_paid: 396,
    payment_id: "pay_test_nitt_sp03",
    members: [
      { name: "Meera Krishnan", email: "meera@ugham.com", phone: "+91 94432 11890", role: "Leader" },
      { name: "Sneha Rao", email: "sneha@ugham.com", role: "Member" },
      { name: "Ananya Das", email: "ananya@ugham.com", role: "Member" },
      { name: "Roshni Verma", email: "roshni@ugham.com", role: "Member" },
    ],
    email_status: "sent",
    round_status: "Round 1 - Not Selected (Participation Certificate)",
    internship_selected: false,
    jury_feedback: "Good clinical problem statement, but market validation and unit economics need deeper field interviews before scaling.",
    created_at: "2026-11-24T09:20:00.000Z",
  },
  {
    id: "UGH-TEST-HP04",
    event_name: "hackpick",
    track: "Deep-Tech Sprint",
    domain: "IOT",
    team_name: "VoltGrid Labs",
    leader_name: "Arjun Verma",
    leader_email: "arjun@ugham.com",
    mobile: "+91 98401 77652",
    college_name: "National Institute of Technology (NIT) Trichy",
    year_of_study: "2nd Year",
    department: "Electrical & Electronics Engineering",
    team_size: 2,
    amount_paid: 199,
    payment_id: "pay_test_nitt_hp04",
    members: [
      { name: "Arjun Verma", email: "arjun@ugham.com", phone: "+91 98401 77652", role: "Leader" },
      { name: "Siddharth Bose", email: "siddharth@ugham.com", role: "Member" },
    ],
    email_status: "sent",
    round_status: "Round 2 (Prototype & Video Explanation)",
    internship_selected: false,
    jury_feedback: "Hardware telemetry sensor calibration verified. Submit final live edge latency metrics in Round 2.",
    created_at: "2026-11-24T11:45:00.000Z",
  },
  {
    id: "UGH-TEST-SP05",
    event_name: "shepitch_chennai",
    track: "Project Pitch",
    domain: "FINTECH",
    team_name: "FinBridge Tech",
    leader_name: "Divya Sundaram",
    leader_email: "divya@ugham.com",
    mobile: "+91 97890 33214",
    college_name: "Anna University (CEG Campus)",
    year_of_study: "3rd Year",
    department: "Information Technology",
    team_size: 3,
    amount_paid: 297,
    payment_id: "pay_test_ceg_sp05",
    members: [
      { name: "Divya Sundaram", email: "divya@ugham.com", phone: "+91 97890 33214", role: "Leader" },
      { name: "Harini Raj", email: "harini@ugham.com", role: "Member" },
      { name: "Keerthana S", email: "keerthana@ugham.com", role: "Member" },
    ],
    email_status: "sent",
    round_status: "Round 3 / 4 (Offline Grand Finale)",
    internship_selected: true,
    jury_feedback: "Top finalist in FinTech track. Exceptional UPI fraud detection latency and clean architecture.",
    created_at: "2026-11-24T16:10:00.000Z",
  },
  {
    id: "UGH-TEST-HP06",
    event_name: "hackpick",
    track: "Deep-Tech Sprint",
    domain: "AGRI TECH",
    team_name: "AgriSense AI",
    leader_name: "Karthik Raja",
    leader_email: "karthik@ugham.com",
    mobile: "+91 99445 66120",
    college_name: "PSG College of Technology",
    year_of_study: "Final Year",
    department: "Robotics & Automation",
    team_size: 3,
    amount_paid: 199,
    payment_id: "pay_test_psg_hp06",
    members: [
      { name: "Karthik Raja", email: "karthik@ugham.com", phone: "+91 99445 66120", role: "Leader" },
      { name: "Nithya Shree", email: "nithya@ugham.com", role: "Member" },
      { name: "Praveen Kumar", email: "praveen@ugham.com", role: "Member" },
    ],
    email_status: "sent",
    round_status: "Round 1 (PPT & Video Submission)",
    internship_selected: false,
    jury_feedback: "Round 1 submission under initial technical screening.",
    created_at: "2026-11-25T08:40:00.000Z",
  },
  {
    id: "UGH-TEST-PAST01",
    event_name: "shepitch_chennai",
    track: "Project Pitch",
    domain: "SAAS",
    team_name: "NovaSpark (Season 1)",
    leader_name: "Test Participant",
    leader_email: "test@ugham.com",
    mobile: "+91 98765 43210",
    college_name: "Indian Institute of Technology (IIT) Madras",
    year_of_study: "2nd Year",
    department: "Computer Science & Engineering",
    team_size: 3,
    amount_paid: 297,
    payment_id: "pay_past_iitm_sp01",
    members: [
      { name: "Test Participant", email: "test@ugham.com", phone: "+91 98765 43210", role: "Leader" },
      { name: "Riya Menon", email: "riya@ugham.com", role: "Member" },
      { name: "Devika Nair", email: "devika@ugham.com", role: "Member" },
    ],
    email_status: "sent",
    round_status: "Round 3 / 4 (Offline Grand Finale)",
    internship_selected: true,
    jury_feedback: "Finalist squad from Chennai Edition 1. Recognized for scalable SaaS architecture.",
    is_past_event: true,
    certificate_issued: true,
    certificate_title: "Certificate of Excellence — Grand Finalist",
    certificate_issued_at: "2026-02-15T10:00:00.000Z",
    created_at: "2026-01-12T09:00:00.000Z",
  },
  {
    id: "UGH-TEST-PAST02",
    event_name: "hackpick",
    track: "Deep-Tech Sprint",
    domain: "CLOUD",
    team_name: "CodeVortex 2025",
    leader_name: "Test Participant",
    leader_email: "test@ugham.com",
    mobile: "+91 98765 43210",
    college_name: "Indian Institute of Technology (IIT) Madras",
    year_of_study: "2nd Year",
    department: "Computer Science & Engineering",
    team_size: 2,
    amount_paid: 199,
    payment_id: "pay_past_iitm_hp02",
    members: [
      { name: "Test Participant", email: "test@ugham.com", phone: "+91 98765 43210", role: "Leader" },
      { name: "Karan Mehta", email: "karan@ugham.com", role: "Member" },
    ],
    email_status: "sent",
    round_status: "Round 2 - Not Selected (Appreciation Certificate)",
    internship_selected: false,
    jury_feedback: "Clean cloud orchestration demo in Round 2 sprint evaluation.",
    is_past_event: true,
    certificate_issued: true,
    certificate_title: "Certificate of Appreciation — Round 2 Qualifier",
    certificate_issued_at: "2026-03-20T14:30:00.000Z",
    created_at: "2026-03-01T11:30:00.000Z",
  },
];

export async function initDb() {
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS event_registrations (
            id VARCHAR(64) PRIMARY KEY,
            event_name VARCHAR(50) NOT NULL,
            track VARCHAR(50),
            domain VARCHAR(100) NOT NULL,
            team_name VARCHAR(150) NOT NULL,
            leader_name VARCHAR(150) NOT NULL,
            leader_email VARCHAR(150) NOT NULL,
            mobile VARCHAR(30) NOT NULL,
            college_name VARCHAR(255) NOT NULL,
            year_of_study VARCHAR(50) NOT NULL,
            department VARCHAR(150) NOT NULL,
            team_size INT NOT NULL,
            amount_paid INT NOT NULL,
            payment_id VARCHAR(100) NOT NULL,
            members JSONB NOT NULL DEFAULT '[]',
            email_status VARCHAR(50) NOT NULL DEFAULT 'pending',
            round_status VARCHAR(150),
            internship_selected BOOLEAN DEFAULT FALSE,
            jury_feedback TEXT,
            is_past_event BOOLEAN DEFAULT FALSE,
            certificate_issued BOOLEAN DEFAULT FALSE,
            certificate_title VARCHAR(255),
            certificate_issued_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Ensure new columns exist on legacy tables
        await client.query(`
          ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS round_status VARCHAR(150);
          ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS internship_selected BOOLEAN DEFAULT FALSE;
          ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS internship_reason TEXT;
          ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS jury_feedback TEXT;
          ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS is_past_event BOOLEAN DEFAULT FALSE;
          ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN DEFAULT FALSE;
          ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS certificate_title VARCHAR(255);
          ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMP WITH TIME ZONE;
          ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS round_submissions JSONB DEFAULT '{}';
        `);

        // One-time demo dataset seed tracker so empty cloud DB gets test colleges & squads immediately
        await client.query(`
          CREATE TABLE IF NOT EXISTS app_meta (
            key VARCHAR(64) PRIMARY KEY,
            value TEXT
          );
        `);
        const seededRes = await client.query(`SELECT value FROM app_meta WHERE key = 'demo_seeded_v3'`);
        if (seededRes.rows.length === 0) {
          for (const rec of DEMO_TEST_REGISTRATIONS) {
            await client.query(
              `INSERT INTO event_registrations (
                id, event_name, track, domain, team_name, leader_name, leader_email,
                mobile, college_name, year_of_study, department, team_size,
                amount_paid, payment_id, members, email_status, round_status, internship_selected, jury_feedback,
                is_past_event, certificate_issued, certificate_title, certificate_issued_at, created_at
              ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
              ON CONFLICT (id) DO NOTHING`,
              [
                rec.id,
                rec.event_name,
                rec.track || null,
                rec.domain,
                rec.team_name,
                rec.leader_name,
                rec.leader_email,
                rec.mobile,
                rec.college_name,
                rec.year_of_study,
                rec.department,
                rec.team_size,
                rec.amount_paid,
                rec.payment_id,
                JSON.stringify(rec.members),
                rec.email_status,
                rec.round_status || null,
                Boolean(rec.internship_selected),
                rec.jury_feedback || null,
                Boolean(rec.is_past_event),
                Boolean(rec.certificate_issued),
                rec.certificate_title || null,
                rec.certificate_issued_at || null,
                rec.created_at,
              ]
            );
          }
          await client.query(
            `INSERT INTO app_meta (key, value) VALUES ('demo_seeded_v3', 'true') ON CONFLICT (key) DO NOTHING`
          );
        }
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Aiven Postgres connection error, falling back to local storage:", err);
    }
  } else {
    ensureLocalFallback();
  }
}

export async function saveRegistration(record: RegistrationRecord): Promise<void> {
  if (pool) {
    try {
      await initDb();
      await pool.query(
        `INSERT INTO event_registrations (
          id, event_name, track, domain, team_name, leader_name, leader_email,
          mobile, college_name, year_of_study, department, team_size,
          amount_paid, payment_id, members, email_status, round_status, internship_selected, jury_feedback,
          is_past_event, certificate_issued, certificate_title, certificate_issued_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (id) DO UPDATE SET
          email_status = EXCLUDED.email_status`,
        [
          record.id,
          record.event_name,
          record.track || null,
          record.domain,
          record.team_name,
          record.leader_name,
          record.leader_email,
          record.mobile,
          record.college_name,
          record.year_of_study,
          record.department,
          record.team_size,
          record.amount_paid,
          record.payment_id,
          JSON.stringify(record.members),
          record.email_status,
          record.round_status || "Round 1 (PPT & Video Submission)",
          Boolean(record.internship_selected),
          record.jury_feedback || null,
          Boolean(record.is_past_event),
          Boolean(record.certificate_issued),
          record.certificate_title || null,
          record.certificate_issued_at || null,
          record.created_at,
        ]
      );
      return;
    } catch (err) {
      console.error("Postgres insert error, saving to local backup:", err);
    }
  }

  // Local storage fallback
  ensureLocalFallback();
  const content = fs.readFileSync(FALLBACK_FILE, "utf-8");
  const list: RegistrationRecord[] = JSON.parse(content || "[]");
  const index = list.findIndex((r) => r.id === record.id);
  if (index >= 0) {
    list[index] = record;
  } else {
    list.unshift(record);
  }
  fs.writeFileSync(FALLBACK_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function getRegistrations(): Promise<RegistrationRecord[]> {
  if (pool) {
    try {
      await initDb();
      const res = await pool.query(
        `SELECT * FROM event_registrations ORDER BY created_at DESC`
      );
      return res.rows.map((row) => ({
        id: row.id,
        event_name: row.event_name,
        track: row.track,
        domain: row.domain,
        team_name: row.team_name,
        leader_name: row.leader_name,
        leader_email: row.leader_email,
        mobile: row.mobile,
        college_name: row.college_name,
        year_of_study: row.year_of_study,
        department: row.department,
        team_size: row.team_size,
        amount_paid: row.amount_paid,
        payment_id: row.payment_id,
        members: typeof row.members === "string" ? JSON.parse(row.members) : row.members,
        email_status: row.email_status,
        round_status: row.round_status || undefined,
        internship_selected: Boolean(row.internship_selected),
        internship_reason: row.internship_reason || undefined,
        jury_feedback: row.jury_feedback || undefined,
        is_past_event: Boolean(row.is_past_event),
        certificate_issued: Boolean(row.certificate_issued),
        certificate_title: row.certificate_title || undefined,
        certificate_issued_at: row.certificate_issued_at ? new Date(row.certificate_issued_at).toISOString() : undefined,
        round_submissions:
          typeof row.round_submissions === "string"
            ? JSON.parse(row.round_submissions)
            : row.round_submissions || undefined,
        created_at: new Date(row.created_at).toISOString(),
      }));
    } catch (err) {
      console.error("Postgres select error, reading from local backup:", err);
    }
  }

  ensureLocalFallback();
  const content = fs.readFileSync(FALLBACK_FILE, "utf-8");
  return JSON.parse(content || "[]");
}

export async function updateEmailStatus(
  id: string,
  status: "sent" | "sending" | "failed" | "pending"
): Promise<void> {
  if (pool) {
    try {
      await pool.query(
        `UPDATE event_registrations SET email_status = $1 WHERE id = $2`,
        [status, id]
      );
      return;
    } catch (err) {
      console.error("Postgres update status error:", err);
    }
  }

  ensureLocalFallback();
  const content = fs.readFileSync(FALLBACK_FILE, "utf-8");
  const list: RegistrationRecord[] = JSON.parse(content || "[]");
  const item = list.find((r) => r.id === id);
  if (item) {
    item.email_status = status;
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(list, null, 2), "utf-8");
  }
}

export async function updateTeamStatus(
  id: string,
  updates: {
    round_status?: string;
    internship_selected?: boolean;
    internship_reason?: string;
    jury_feedback?: string;
    is_past_event?: boolean;
    certificate_issued?: boolean;
    certificate_title?: string;
    certificate_issued_at?: string;
  }
): Promise<void> {
  if (pool) {
    try {
      await initDb();
      await pool.query(
        `UPDATE event_registrations SET 
          round_status = COALESCE($1, round_status),
          internship_selected = COALESCE($2, internship_selected),
          internship_reason = COALESCE($3, internship_reason),
          jury_feedback = COALESCE($4, jury_feedback),
          is_past_event = COALESCE($5, is_past_event),
          certificate_issued = COALESCE($6, certificate_issued),
          certificate_title = COALESCE($7, certificate_title),
          certificate_issued_at = COALESCE($8, certificate_issued_at)
         WHERE id = $9`,
        [
          updates.round_status !== undefined ? updates.round_status : null,
          updates.internship_selected !== undefined ? updates.internship_selected : null,
          updates.internship_reason !== undefined ? updates.internship_reason : null,
          updates.jury_feedback !== undefined ? updates.jury_feedback : null,
          updates.is_past_event !== undefined ? updates.is_past_event : null,
          updates.certificate_issued !== undefined ? updates.certificate_issued : null,
          updates.certificate_title !== undefined ? updates.certificate_title : null,
          updates.certificate_issued_at !== undefined ? updates.certificate_issued_at : null,
          id,
        ]
      );
    } catch (err) {
      console.error("Postgres updateTeamStatus error, updating local:", err);
    }
  }

  ensureLocalFallback();
  const content = fs.readFileSync(FALLBACK_FILE, "utf-8");
  const list: RegistrationRecord[] = JSON.parse(content || "[]");
  const item = list.find((r) => r.id === id);
  if (item) {
    if (updates.round_status !== undefined) item.round_status = updates.round_status;
    if (updates.internship_selected !== undefined) item.internship_selected = updates.internship_selected;
    if (updates.internship_reason !== undefined) item.internship_reason = updates.internship_reason;
    if (updates.jury_feedback !== undefined) item.jury_feedback = updates.jury_feedback;
    if (updates.is_past_event !== undefined) item.is_past_event = updates.is_past_event;
    if (updates.certificate_issued !== undefined) item.certificate_issued = updates.certificate_issued;
    if (updates.certificate_title !== undefined) item.certificate_title = updates.certificate_title;
    if (updates.certificate_issued_at !== undefined) item.certificate_issued_at = updates.certificate_issued_at;
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(list, null, 2), "utf-8");
  }
}

export async function saveRoundSubmission(
  id: string,
  roundNumber: number,
  payload: { primaryLink: string; secondaryLink?: string; notes?: string; submittedAt: string }
): Promise<RegistrationRecord | null> {
  const all = await getRegistrations();
  const existing = all.find((r) => r.id === id);
  if (!existing) return null;

  const updatedSubmissions: NonNullable<RegistrationRecord["round_submissions"]> = {
    ...(existing.round_submissions || {}),
  };

  if (roundNumber === 1) {
    updatedSubmissions.round1 = {
      pptLink: payload.primaryLink,
      videoLink: payload.secondaryLink || undefined,
      submittedAt: payload.submittedAt,
    };
  } else if (roundNumber === 2) {
    updatedSubmissions.round2 = {
      prototypeLink: payload.primaryLink,
      videoLink: payload.secondaryLink || undefined,
      submittedAt: payload.submittedAt,
    };
  } else if (roundNumber === 3) {
    updatedSubmissions.round3 = {
      deckLink: payload.primaryLink,
      notes: payload.notes || payload.secondaryLink || undefined,
      submittedAt: payload.submittedAt,
    };
  }

  if (pool) {
    try {
      await initDb();
      await pool.query(
        `UPDATE event_registrations SET round_submissions = $1 WHERE id = $2`,
        [JSON.stringify(updatedSubmissions), id]
      );
    } catch (err) {
      console.error("Postgres saveRoundSubmission error:", err);
    }
  }

  ensureLocalFallback();
  const content = fs.readFileSync(FALLBACK_FILE, "utf-8");
  const list: RegistrationRecord[] = JSON.parse(content || "[]");
  const idx = list.findIndex((r) => r.id === id);
  if (idx >= 0) {
    list[idx].round_submissions = updatedSubmissions;
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(list, null, 2), "utf-8");
  }

  return { ...existing, round_submissions: updatedSubmissions };
}

export async function deleteRegistrationsByIds(ids: string[]): Promise<number> {
  if (!Array.isArray(ids) || ids.length === 0) return 0;

  if (pool) {
    try {
      await initDb();
      await pool.query(
        `DELETE FROM event_registrations WHERE id = ANY($1::text[])`,
        [ids]
      );
    } catch (err) {
      console.error("Postgres deleteRegistrationsByIds error:", err);
    }
  }

  ensureLocalFallback();
  const content = fs.readFileSync(FALLBACK_FILE, "utf-8");
  const list: RegistrationRecord[] = JSON.parse(content || "[]");
  const idSet = new Set(ids);
  const filtered = list.filter((r) => !idSet.has(r.id));
  const deletedCount = list.length - filtered.length;
  fs.writeFileSync(FALLBACK_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return deletedCount || ids.length;
}

export interface DatabaseStatus {
  connected: boolean;
  type: "PostgreSQL (Aiven Cloud)" | "Local File Storage (Fallback)";
  urlConfigured: boolean;
  host?: string;
  database?: string;
  error?: string;
  latencyMs?: number;
  mode: string;
}

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const urlConfigured = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());

  if (!pool || !urlConfigured) {
    return {
      connected: false,
      type: "Local File Storage (Fallback)",
      urlConfigured: false,
      mode: "Local Mock / File Storage",
      error: "DATABASE_URL is not configured in .env.local. Saving to data/registrations.json.",
    };
  }

  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1;");
      const latencyMs = Date.now() - start;
      let host = "aivencloud.com";
      let database = "defaultdb";
      try {
        const parsed = new URL(process.env.DATABASE_URL!);
        host = parsed.hostname;
        database = parsed.pathname.replace(/^\//, "");
      } catch {}

      return {
        connected: true,
        type: "PostgreSQL (Aiven Cloud)",
        urlConfigured: true,
        host,
        database,
        latencyMs,
        mode: `Aiven PostgreSQL (${latencyMs}ms)`,
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    let host = "aivencloud.com";
    try {
      const parsed = new URL(process.env.DATABASE_URL!);
      host = parsed.hostname;
    } catch {}

    return {
      connected: false,
      type: "Local File Storage (Fallback)",
      urlConfigured: true,
      host,
      mode: "Local Storage Backup Active",
      error: err.message || "Failed to reach PostgreSQL server",
    };
  }
}
