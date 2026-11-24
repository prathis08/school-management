#!/usr/bin/env node
/**
 * Tiny SQL migration runner.
 *
 * Usage:
 *   node scripts/migrate.js            # apply pending migrations
 *   node scripts/migrate.js --baseline # mark all current files as applied (no SQL run)
 *   node scripts/migrate.js --status   # show applied/pending
 *
 * Each file in database/migrations/*.sql is applied once and recorded in the
 * `schema_migrations` table with a checksum so later edits are detected.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "..", "database", "migrations");

const args = new Set(process.argv.slice(2));
const baseline = args.has("--baseline");
const statusOnly = args.has("--status");

const checksum = (content) =>
  crypto.createHash("md5").update(content).digest("hex");

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  ssl: process.env.DB_HOST?.includes("aivencloud.com")
    ? { rejectUnauthorized: false }
    : process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const ensureTable = () =>
  client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      checksum   TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

const listFiles = () =>
  fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort();

const main = async () => {
  await client.connect();
  await ensureTable();

  const { rows } = await client.query(
    "SELECT filename, checksum FROM schema_migrations",
  );
  const applied = new Map(rows.map((row) => [row.filename, row.checksum]));
  const files = listFiles();

  if (statusOnly) {
    for (const file of files) {
      const state = applied.has(file) ? "applied" : "pending";
      console.log(`${state.padEnd(8)} ${file}`);
    }
    return;
  }

  if (baseline) {
    let added = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      await client.query(
        "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2) ON CONFLICT (filename) DO NOTHING",
        [file, checksum(content)],
      );
      added += 1;
    }
    console.log(`Baseline complete — recorded ${added} migration(s).`);
    return;
  }

  let ran = 0;
  let changed = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    const sum = checksum(content);

    if (applied.has(file)) {
      if (applied.get(file) !== sum) {
        console.warn(
          `WARN: ${file} changed after being applied (checksum mismatch). Create a new migration instead.`,
        );
        changed += 1;
      }
      continue;
    }

    console.log(`Applying ${file}...`);
    try {
      await client.query("BEGIN");
      await client.query(content);
      await client.query(
        "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)",
        [file, sum],
      );
      await client.query("COMMIT");
      ran += 1;
      console.log(`  OK`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`  FAILED: ${error.message}`);
      process.exitCode = 1;
      break;
    }
  }

  console.log(
    `Done. Applied ${ran} new migration(s)${changed ? `, ${changed} checksum warning(s)` : ""}.`,
  );
};

main()
  .catch((error) => {
    console.error("Migration runner error:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });
