// Smoke test do pipeline de processamento (Fase 2).
// Cria um usuário de teste, gera um PDF sintético, faz upload via admin,
// insere documento, roda processDocument, valida chunks no DB.

import "dotenv/config";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { createAdminClient } from "../src/lib/supabase/admin";
import { getSql } from "../src/lib/db/client";
import { insertDocument } from "../src/lib/db/queries/documents";
import { processDocument } from "../src/lib/services/document-processor";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env.local") });

const TEST_EMAIL = "pipeline-smoke@explainer.test";
const BUCKET = "documents";

async function ensureTestUser(): Promise<string> {
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list.users.find((u) => u.email === TEST_EMAIL);
  if (existing) return existing.id;
  const { data, error } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: "smoke-test-password-12345",
    email_confirm: true,
    user_metadata: { name: "Smoke Test", niche: "geral" },
  });
  if (error) throw error;
  return data.user.id;
}

async function buildPdf(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const paragraphs = [
    "O Direito Constitucional brasileiro tem como fonte primária a Constituição Federal de 1988, conhecida como Constituição Cidadã. Ela estabelece os direitos e garantias fundamentais, a organização do Estado e dos Poderes.",
    "Os direitos fundamentais são divididos em individuais, coletivos, sociais, de nacionalidade e políticos. O artigo 5º trata dos direitos individuais e coletivos, com 78 incisos.",
    "O princípio da separação dos poderes, previsto no artigo 2º, divide o Estado em Legislativo, Executivo e Judiciário, independentes e harmônicos entre si.",
    "A administração pública direta e indireta obedece aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência, conforme o artigo 37 da Constituição.",
  ];
  for (let p = 0; p < 2; p++) {
    const page = doc.addPage([612, 792]);
    let y = 750;
    for (const text of paragraphs) {
      page.drawText(text, { x: 50, y, size: 11, font, maxWidth: 500 });
      y -= 80;
    }
  }
  return Buffer.from(await doc.save());
}

async function main() {
  console.log("1. Ensure test user...");
  const userId = await ensureTestUser();
  console.log("   user:", userId);

  console.log("2. Generate test PDF...");
  const buffer = await buildPdf();
  console.log("   bytes:", buffer.length);

  console.log("3. Upload to Storage...");
  const admin = createAdminClient();
  const filePath = `${userId}/${crypto.randomUUID()}-smoke.pdf`;
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType: "application/pdf", upsert: true });
  if (upErr) throw upErr;
  console.log("   path:", filePath);

  console.log("4. Insert document row...");
  const doc = await insertDocument({
    userId,
    title: "Smoke test PDF",
    filePath,
    fileSize: buffer.length,
  });
  console.log("   id:", doc.id);

  console.log("5. Run processDocument...");
  const result = await processDocument(doc.id, doc.file_path);
  console.log("   chunks:", result.totalChunks);

  console.log("6. Verify chunks in DB...");
  const sql = getSql();
  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM document_chunks WHERE document_id = ${doc.id}
  `;
  console.log("   DB chunk count:", rows[0].count);

  console.log("7. Test similarity search via match_chunks()...");
  // generate embedding for a query and use match_chunks
  const { embedText } = await import("../src/lib/ai/embeddings");
  const queryEmbedding = await embedText("quais são os princípios da administração pública?");
  const matches = await sql<
    { content: string; similarity: number; page_number: number | null }[]
  >`
    SELECT content, similarity, page_number
    FROM match_chunks(${`[${queryEmbedding.join(",")}]`}::vector(1536), 3, ${doc.id}::uuid)
  `;
  for (const m of matches) {
    console.log(`   p.${m.page_number ?? "?"} sim=${m.similarity.toFixed(3)}: ${m.content.slice(0, 80)}...`);
  }

  console.log("\nCleanup...");
  await sql`DELETE FROM documents WHERE id = ${doc.id}`;
  await admin.storage.from(BUCKET).remove([filePath]);

  await sql.end();
  console.log("OK");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exitCode = 1;
});
