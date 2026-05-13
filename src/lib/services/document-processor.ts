import { parsePdf } from "@/lib/utils/pdf-parser";
import { chunkPages } from "@/lib/utils/chunker";
import { embedBatch } from "@/lib/ai/embeddings";
import {
  deleteDocumentChunks,
  insertChunks,
  updateDocumentStatus,
} from "@/lib/db/queries/documents";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_PAGES = 50;
const BUCKET = "documents";

export async function processDocument(
  documentId: string,
  filePath: string,
): Promise<{ totalChunks: number }> {
  await updateDocumentStatus(documentId, "processing", { errorMessage: null });

  try {
    const admin = createAdminClient();
    const { data: blob, error: dlError } = await admin.storage
      .from(BUCKET)
      .download(filePath);
    if (dlError || !blob) {
      throw new Error(`Failed to download file: ${dlError?.message ?? "unknown"}`);
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await parsePdf(buffer);
    if (parsed.totalPages > MAX_PAGES) {
      throw new Error(
        `Documento tem ${parsed.totalPages} páginas (limite ${MAX_PAGES}).`,
      );
    }

    const chunks = chunkPages(parsed.pages);
    if (chunks.length === 0) {
      throw new Error("Não foi possível extrair texto do PDF.");
    }

    const embeddings = await embedBatch(chunks.map((c) => c.content));
    const enriched = chunks.map((c, i) => ({ ...c, embedding: embeddings[i] }));

    await deleteDocumentChunks(documentId);
    await insertChunks(documentId, enriched);

    await updateDocumentStatus(documentId, "ready", {
      totalChunks: chunks.length,
    });

    return { totalChunks: chunks.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateDocumentStatus(documentId, "error", { errorMessage: message });
    throw err;
  }
}
