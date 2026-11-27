import fs from "fs";
import path from "path";
import { pgPool as pool, runOnceInitialized } from "./pgPool";

const DATA_DIR = path.join(process.cwd(), "data");
const SUPPORT_FILE = path.join(DATA_DIR, "support_queries.json");

export interface SupportQueryRecord {
  id: string;
  userName: string;
  userEmail: string;
  collegeName: string;
  category: string;
  title: string;
  message: string;
  status: "open" | "solved";
  createdAt: string;
  solvedAt?: string;
}

function ensureLocalSupportFile(): SupportQueryRecord[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SUPPORT_FILE)) {
    fs.writeFileSync(SUPPORT_FILE, JSON.stringify([], null, 2), "utf-8");
    return [];
  }
  try {
    const raw = JSON.parse(fs.readFileSync(SUPPORT_FILE, "utf-8"));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

async function initSupportTable() {
  if (!pool) return;
  return runOnceInitialized("support_queries_init", async () => {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS support_queries (
          id VARCHAR(64) PRIMARY KEY,
          user_name VARCHAR(150) NOT NULL,
          user_email VARCHAR(150) NOT NULL,
          college_name VARCHAR(255) NOT NULL DEFAULT '',
          category VARCHAR(100) NOT NULL DEFAULT 'General Inquiry',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(30) NOT NULL DEFAULT 'open',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          solved_at TIMESTAMP WITH TIME ZONE
        );
      `);
    } finally {
      client.release();
    }
  }).catch((err) => {
    console.error("Postgres support_queries init error:", err);
    throw err;
  });
}

export async function getSupportQueries(): Promise<SupportQueryRecord[]> {
  if (pool) {
    try {
      await initSupportTable();
      const res = await pool.query(`SELECT * FROM support_queries ORDER BY created_at DESC`);
      return res.rows.map((r) => ({
        id: r.id,
        userName: r.user_name,
        userEmail: r.user_email,
        collegeName: r.college_name || "",
        category: r.category || "General Inquiry",
        title: r.title,
        message: r.message,
        status: r.status === "solved" ? "solved" : "open",
        createdAt: new Date(r.created_at).toISOString(),
        solvedAt: r.solved_at ? new Date(r.solved_at).toISOString() : undefined,
      }));
    } catch (err) {
      console.error("Postgres getSupportQueries error, falling back to local:", err);
    }
  }
  return ensureLocalSupportFile();
}

export async function createSupportQuery(input: {
  userName: string;
  userEmail: string;
  collegeName?: string;
  category?: string;
  title: string;
  message: string;
}): Promise<SupportQueryRecord> {
  const record: SupportQueryRecord = {
    id: `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    userName: input.userName.trim(),
    userEmail: input.userEmail.trim().toLowerCase(),
    collegeName: (input.collegeName || "").trim(),
    category: (input.category || "General Query").trim(),
    title: input.title.trim(),
    message: input.message.trim(),
    status: "open",
    createdAt: new Date().toISOString(),
  };

  if (pool) {
    try {
      await initSupportTable();
      await pool.query(
        `INSERT INTO support_queries (
          id, user_name, user_email, college_name, category, title, message, status, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          record.id,
          record.userName,
          record.userEmail,
          record.collegeName,
          record.category,
          record.title,
          record.message,
          record.status,
          record.createdAt,
        ]
      );
      return record;
    } catch (err) {
      console.error("Postgres createSupportQuery error, saving to local backup:", err);
    }
  }

  const list = ensureLocalSupportFile();
  list.unshift(record);
  fs.writeFileSync(SUPPORT_FILE, JSON.stringify(list, null, 2), "utf-8");
  return record;
}

export async function updateSupportQueryStatus(
  id: string,
  status: "open" | "solved"
): Promise<SupportQueryRecord[]> {
  const solvedAt = status === "solved" ? new Date().toISOString() : null;

  if (pool) {
    try {
      await initSupportTable();
      await pool.query(
        `UPDATE support_queries SET status = $1, solved_at = $2 WHERE id = $3`,
        [status, solvedAt, id]
      );
      return await getSupportQueries();
    } catch (err) {
      console.error("Postgres updateSupportQueryStatus error:", err);
    }
  }

  const list = ensureLocalSupportFile();
  const target = list.find((q) => q.id === id);
  if (target) {
    target.status = status;
    target.solvedAt = solvedAt || undefined;
    fs.writeFileSync(SUPPORT_FILE, JSON.stringify(list, null, 2), "utf-8");
  }
  return list;
}
