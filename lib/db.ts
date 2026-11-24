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

export interface RegistrationRecord {
  id: string;
  event_name: "shepitch" | "hackpick";
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
  created_at: string;
}

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
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
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
          amount_paid, payment_id, members, email_status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
