import { getSql } from "@/lib/db/client";
import { embedText } from "@/lib/ai/embeddings";

export interface RagChunk {
  id: string;
  content: string;
  chunkIndex: number;
  pageNumber: number | null;
  similarity: number;
}

const DEFAULT_TOP_K = 5;
const MIN_SIMILARITY = 0.2;

export async function searchRelevantChunks(
  query: string,
  options: { documentId?: string | null; topK?: number; userId: string },
): Promise<RagChunk[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const embedding = await embedText(trimmed);
  const sql = getSql();
  const topK = options.topK ?? DEFAULT_TOP_K;
  const vectorLiteral = `[${embedding.join(",")}]`;

  const rows = await sql<
    Array<{
      id: string;
      content: string;
      chunk_index: number;
      page_number: number | null;
      similarity: number;
    }>
  >`
    SELECT
      dc.id,
      dc.content,
      dc.chunk_index,
      dc.page_number,
      1 - (dc.embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM document_chunks dc
    INNER JOIN documents d ON d.id = dc.document_id
    WHERE d.user_id = ${options.userId}
      AND d.status = 'ready'
      AND (${options.documentId ?? null}::uuid IS NULL OR dc.document_id = ${options.documentId ?? null}::uuid)
    ORDER BY dc.embedding <=> ${vectorLiteral}::vector
    LIMIT ${topK}
  `;

  return rows
    .filter((r) => r.similarity >= MIN_SIMILARITY)
    .map((r) => ({
      id: r.id,
      content: r.content,
      chunkIndex: r.chunk_index,
      pageNumber: r.page_number,
      similarity: r.similarity,
    }));
}
