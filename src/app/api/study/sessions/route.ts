import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createSession, listSessions } from "@/lib/db/queries/study";
import { getDocumentById } from "@/lib/db/queries/documents";

const CreateBody = z.object({
  documentId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(120).nullable().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const sessions = await listSessions(user.id);
  return NextResponse.json({ data: sessions });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = CreateBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Body inválido", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const documentId = parsed.data.documentId ?? null;
  if (documentId) {
    const doc = await getDocumentById(documentId, user.id);
    if (!doc) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 },
      );
    }
    if (doc.status !== "ready") {
      return NextResponse.json(
        { error: "Documento ainda não está pronto para uso" },
        { status: 400 },
      );
    }
  }

  const session = await createSession({
    userId: user.id,
    documentId,
    title: parsed.data.title ?? null,
  });

  return NextResponse.json({ data: session });
}
