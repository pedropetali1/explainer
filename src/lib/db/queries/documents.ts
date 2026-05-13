import { getSql } from "@/lib/db/client";
import type { Chunk } from "@/lib/utils/chunker";

export type DocumentStatus = "pending" | "processing" | "ready" | "error";

export interface DocumentRow {
  id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_size: number;
  status: DocumentStatus;
  total_chunks: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export async function insertDocument(input: {
  userId: string;
  title: string;
  filePath: string;
  fileSize: number;
}): Promise<DocumentRow> {
  const sql = getSql();
  const [row] = await sql<DocumentRow[]>`
    INSERT INTO documents (user_id, title, file_path, file_size, status)
    VALUES (${input.userId}, ${input.title}, ${input.filePath}, ${input.fileSize}, 'pending')
    RETURNING *
  `;
  return row;
}

export async function getDocumentById(
  id: string,
  userId: string,
): Promise<DocumentRow | null> {
  const sql = getSql();
  const rows = await sql<DocumentRow[]>`
    SELECT * FROM documents WHERE id = ${id} AND user_id = ${userId} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function listDocuments(userId: string): Promise<DocumentRow[]> {
  const sql = getSql();
  return sql<DocumentRow[]>`
    SELECT * FROM documents WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
  extra: { totalChunks?: number; errorMessage?: string | null } = {},
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE documents
    SET status = ${status},
        total_chunks = COALESCE(${extra.totalChunks ?? null}, total_chunks),
        error_message = ${extra.errorMessage ?? null},
        updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function countUserDocuments(userId: string): Promise<number> {
  const sql = getSql();
  const [row] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM documents WHERE user_id = ${userId}
  `;
  return Number(row.count);
}

export async function insertChunks(
  documentId: string,
  chunks: Array<Chunk & { embedding: number[] }>,
): Promise<void> {
  if (chunks.length === 0) return;
  const sql = getSql();
  await sql.begin(async (tx) => {
    for (const c of chunks) {
      await tx`
        INSERT INTO document_chunks
          (document_id, content, chunk_index, page_number, embedding, metadata)
        VALUES (
          ${documentId},
          ${c.content},
          ${c.index},
          ${c.pageNumber ?? null},
          ${`[${c.embedding.join(",")}]`},
          ${JSON.stringify(c.metadata ?? {})}::jsonb
        )
      `;
    }
  });
}

export async function deleteDocumentChunks(documentId: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM document_chunks WHERE document_id = ${documentId}`;
}
