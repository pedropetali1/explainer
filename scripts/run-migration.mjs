import postgres from "postgres";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env.local") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL not set in .env.local");
  process.exit(1);
}

const migrationFile = process.argv[2] ?? "supabase/migrations/001_initial.sql";
const sql = readFileSync(resolve(__dirname, "..", migrationFile), "utf8");

const client = postgres(databaseUrl, { max: 1, ssl: "require" });

try {
  console.log(`Applying ${migrationFile}...`);
  await client.unsafe(sql);
  console.log("Migration applied successfully.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
