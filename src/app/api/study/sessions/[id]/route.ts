import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  deleteSession,
  getSession,
  listMessages,
} from "@/lib/db/queries/study";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const session = await getSession(id, user.id);
  if (!session) {
    return NextResponse.json(
      { error: "Sessão não encontrada" },
      { status: 404 },
    );
  }
  const messages = await listMessages(session.id);
  return NextResponse.json({ data: { session, messages } });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  await deleteSession(id, user.id);
  return NextResponse.json({ data: { ok: true } });
}
