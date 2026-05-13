import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env.local") });

const sql = postgres(process.env.DATABASE_URL, { max: 1, ssl: "require" });
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const docs = await sql`
  SELECT d.id, d.file_path
  FROM documents d
  JOIN profiles p ON p.id = d.user_id
  WHERE p.email = 'pipeline-smoke@explainer.test'
`;
for (const d of docs) {
  await admin.storage.from("documents").remove([d.file_path]);
  await sql`DELETE FROM documents WHERE id = ${d.id}`;
  console.log("removed", d.id, d.file_path);
}

console.log(docs.length ? "Cleaned." : "Nothing to clean.");
await sql.end();
