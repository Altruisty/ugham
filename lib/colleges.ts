import fs from "fs";
import path from "path";
import { pgPool as pool, runOnceInitialized } from "./pgPool";



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
  return runOnceInitialized("admin_colleges_init", async () => {
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
  }).catch((err) => {
    console.error("Colleges table init error:", err);
    throw err;
  });
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

export interface CollegeCredential {
  collegeName: string;
  username: string;
  password: string;
  contactEmail?: string;
  updatedAt?: string;
}

const COLLEGE_AUTH_FILE = path.join(DATA_DIR, "colleges_auth.json");

export function getCollegeCredentials(): CollegeCredential[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(COLLEGE_AUTH_FILE)) {
    // Generate default credentials for initial colleges
    const initial: CollegeCredential[] = [
      {
        collegeName: "Indian Institute of Technology (IIT) Madras",
        username: "iit-madras",
        password: "IITM@2026",
        contactEmail: "dean.academics@iitm.ac.in",
        updatedAt: new Date().toISOString(),
      },
      {
        collegeName: "National Institute of Technology (NIT) Trichy",
        username: "nit-trichy",
        password: "NITT@2026",
        contactEmail: "studentaffairs@nitt.edu",
        updatedAt: new Date().toISOString(),
      },
      {
        collegeName: "Anna University (CEG Campus)",
        username: "anna-univ",
        password: "ANNA@2026",
        contactEmail: "hod.events@annauniv.edu",
        updatedAt: new Date().toISOString(),
      },
      {
        collegeName: "PSG College of Technology",
        username: "psg-tech",
        password: "PSG@2026",
        contactEmail: "innovation@psgtech.ac.in",
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(COLLEGE_AUTH_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(COLLEGE_AUTH_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveCollegeCredential(cred: CollegeCredential): CollegeCredential[] {
  const current = getCollegeCredentials();
  const existingIdx = current.findIndex(
    (c) =>
      c.collegeName.toLowerCase() === cred.collegeName.toLowerCase() ||
      c.username.toLowerCase() === cred.username.toLowerCase()
  );
  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], ...cred, updatedAt: new Date().toISOString() };
  } else {
    current.push({ ...cred, updatedAt: new Date().toISOString() });
  }
  fs.writeFileSync(COLLEGE_AUTH_FILE, JSON.stringify(current, null, 2), "utf-8");
  return current;
}

export function deleteCollegeCredential(collegeName: string): CollegeCredential[] {
  const current = getCollegeCredentials();
  const filtered = current.filter(
    (c) => c.collegeName.toLowerCase() !== collegeName.trim().toLowerCase()
  );
  fs.writeFileSync(COLLEGE_AUTH_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return filtered;
}
