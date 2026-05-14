import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  buildContextBlock,
  getSystemPrompt,
} from "@/lib/ai/prompts";
import { searchRelevantChunks } from "@/lib/ai/rag";
import {
  getSession,
  insertMessage,
  listMessages,
  touchSession,
  updateSessionTitle,
  type MessageSourceRef,
} from "@/lib/db/queries/study";

export const maxDuration = 60;
export const runtime = "nodejs";

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
const MAX_HISTORY_MESSAGES = 12;
const PREVIEW_CHARS = 220;

const Body = z.object({
  sessionId: z.string().uuid(),
  content: z.string().min(1).max(4000),
});

let _openai: OpenAI | null = null;
function openai(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

function makePreview(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= PREVIEW_CHARS
    ? clean
    : `${clean.slice(0, PREVIEW_CHARS)}…`;
}

function buildTitleFromQuestion(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= 60 ? clean : `${clean.slice(0, 57)}…`;
}

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
  const { sessionId, content } = parsed.data;

  const session = await getSession(sessionId, user.id);
  if (!session) {
    return NextResponse.json(
      { error: "Sessão não encontrada" },
      { status: 404 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("niche")
    .eq("id", user.id)
    .maybeSingle<{ niche: string }>();

  await insertMessage({
    sessionId,
    role: "user",
    content,
  });

  const history = await listMessages(sessionId);
  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const chunks = await searchRelevantChunks(content, {
    userId: user.id,
    documentId: session.document_id,
  });

  const sources: MessageSourceRef[] = chunks.map((c) => ({
    chunkId: c.id,
    pageNumber: c.pageNumber,
    preview: makePreview(c.content),
  }));

  const systemPrompt =
    getSystemPrompt(profile?.niche) +
    `\n\nContexto do material do aluno:\n${buildContextBlock(
      chunks.map((c) => ({
        content: c.content,
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
      })),
    )}`;

  const messagesForLlm: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [
    { role: "system", content: systemPrompt },
    ...trimmedHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const encoder = new TextEncoder();
  let assembled = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      };

      try {
        send({ type: "sources", sources });

        const completion = await openai().chat.completions.create({
          model: CHAT_MODEL,
          stream: true,
          temperature: 0.3,
          messages: messagesForLlm,
        });

        for await (const part of completion) {
          const delta = part.choices[0]?.delta?.content ?? "";
          if (delta) {
            assembled += delta;
            send({ type: "delta", text: delta });
          }
        }

        const finalContent = assembled.trim() || "(sem resposta)";
        const saved = await insertMessage({
          sessionId,
          role: "assistant",
          content: finalContent,
          sources,
        });
        await touchSession(sessionId);

        if (!session.title) {
          await updateSessionTitle(
            sessionId,
            user.id,
            buildTitleFromQuestion(content),
          );
        }

        send({ type: "done", messageId: saved.id });
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao gerar resposta";
        send({ type: "error", error: message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
