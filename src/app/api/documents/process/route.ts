import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDocumentById } from "@/lib/db/queries/documents";
import { processDocument } from "@/lib/services/document-processor";

export const maxDuration = 60;

const Body = z.object({
  documentId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Body inválido", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const doc = await getDocumentById(parsed.data.documentId, user.id);
  if (!doc) {
    return NextResponse.json(
      { error: "Documento não encontrado" },
      { status: 404 },
    );
  }

  try {
    const result = await processDocument(doc.id, doc.file_path);
    return NextResponse.json({ data: { documentId: doc.id, ...result } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
