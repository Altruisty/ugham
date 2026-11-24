import fs from "fs";
import path from "path";
import { Pool } from "pg";

// Aiven Cloud PostgreSQL connection URL
// Strip query parameters (?sslmode=require) so pg does not enforce strict CA verification for cloud databases with self-signed certs
const rawConnectionString = process.env.DATABASE_URL || "";
const connectionString = rawConnectionString.split("?")[0].trim();

let pool: Pool | null = null;
if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });
}

const DATA_DIR = path.join(process.cwd(), "data");
const COLLEGES_FILE = path.join(DATA_DIR, "colleges.json");

import { DEFAULT_COLLEGES } from "./constants";
export { DEFAULT_COLLEGES };

function ensureCollegesFile(): string[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(COLLEGES_FILE)) {
    fs.writeFileSync(COLLEGES_FILE, JSON.stringify(DEFAULT_COLLEGES, null, 2), "utf-8");
    return DEFAULT_COLLEGES;
  }
  try {
    const raw = fs.readFileSync(COLLEGES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    // fallback
  }
  fs.writeFileSync(COLLEGES_FILE, JSON.stringify(DEFAULT_COLLEGES, null, 2), "utf-8");
  return DEFAULT_COLLEGES;
}

async function initCollegesTable() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS admin_colleges (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      // Seed default colleges if empty
      const countRes = await client.query("SELECT COUNT(*) FROM admin_colleges");
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        for (const col of DEFAULT_COLLEGES) {
          await client.query(
            "INSERT INTO admin_colleges (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
            [col]
          );
        }
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Colleges table init error:", err);
  }
}

export async function getColleges(): Promise<string[]> {
  if (pool) {
    try {
      await initCollegesTable();
      const res = await pool.query(
        "SELECT name FROM admin_colleges ORDER BY name ASC"
      );
      if (res.rows.length > 0) {
        return res.rows.map((r) => r.name);
      }
    } catch (err) {
      console.error("Postgres getColleges error, fallback to local:", err);
    }
  }
  return ensureCollegesFile().sort();
}

export async function addCollege(collegeName: string): Promise<string[]> {
  const trimmed = collegeName.trim();
  if (!trimmed) throw new Error("College name cannot be empty");

  if (pool) {
    try {
      await initCollegesTable();
      await pool.query(
        "INSERT INTO admin_colleges (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        [trimmed]
      );
      return await getColleges();
    } catch (err) {
      console.error("Postgres addCollege error, saving local:", err);
    }
  }

  const current = ensureCollegesFile();
  if (!current.includes(trimmed)) {
    current.push(trimmed);
    current.sort();
    fs.writeFileSync(COLLEGES_FILE, JSON.stringify(current, null, 2), "utf-8");
  }
  return current;
}

export async function deleteCollege(collegeName: string): Promise<string[]> {
  const trimmed = collegeName.trim();
  if (!trimmed) return await getColleges();

  if (pool) {
    try {
      await initCollegesTable();
      await pool.query("DELETE FROM admin_colleges WHERE name = $1", [trimmed]);
      return await getColleges();
    } catch (err) {
      console.error("Postgres deleteCollege error, removing local:", err);
    }
  }

  let current = ensureCollegesFile();
  current = current.filter((c) => c !== trimmed);
  fs.writeFileSync(COLLEGES_FILE, JSON.stringify(current, null, 2), "utf-8");
  return current;
}
