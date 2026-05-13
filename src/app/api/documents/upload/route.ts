import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { countUserDocuments, insertDocument } from "@/lib/db/queries/documents";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_DOCS_FREE = 10;
const BUCKET = "documents";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Arquivo não enviado" },
      { status: 400 },
    );
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Apenas PDFs são aceitos" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Arquivo maior que 25 MB" },
      { status: 400 },
    );
  }

  const existing = await countUserDocuments(user.id);
  if (existing >= MAX_DOCS_FREE) {
    return NextResponse.json(
      { error: `Limite de ${MAX_DOCS_FREE} materiais atingido` },
      { status: 403 },
    );
  }

  const title = (formData.get("title") as string | null) || file.name;
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectKey = `${user.id}/${crypto.randomUUID()}-${sanitized}`;

  const admin = createAdminClient();
  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(objectKey, arrayBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (upErr) {
    return NextResponse.json(
      { error: `Falha no upload: ${upErr.message}` },
      { status: 500 },
    );
  }

  const doc = await insertDocument({
    userId: user.id,
    title,
    filePath: objectKey,
    fileSize: file.size,
  });

  const processUrl = new URL("/api/documents/process", request.url);
  fetch(processUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ documentId: doc.id }),
  }).catch(() => {});

  return NextResponse.json({ data: doc });
}
