import postgres from "postgres";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env.local") });

const client = postgres(process.env.DATABASE_URL, { max: 1, ssl: "require" });

try {
  const tables = await client`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  console.log("Tables:", tables.map((t) => t.tablename).join(", "));

  const ext = await client`
    SELECT extname FROM pg_extension WHERE extname = 'vector'
  `;
  console.log("pgvector:", ext.length ? "enabled" : "MISSING");

  const fn = await client`
    SELECT proname FROM pg_proc WHERE proname = 'match_chunks'
  `;
  console.log("match_chunks fn:", fn.length ? "ok" : "MISSING");

  const trg = await client`
    SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  `;
  console.log("auth trigger:", trg.length ? "ok" : "MISSING");
} finally {
  await client.end();
}
