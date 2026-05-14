"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MessageSourceRef } from "@/lib/db/queries/study";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: MessageSourceRef[];
  pending?: boolean;
}

interface UseChatOptions {
  sessionId: string;
}

interface StreamEvent {
  type: "sources" | "delta" | "done" | "error";
  sources?: MessageSourceRef[];
  text?: string;
  messageId?: string;
  error?: string;
}

function normalizeSources(raw: unknown): MessageSourceRef[] {
  if (Array.isArray(raw)) return raw as MessageSourceRef[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as MessageSourceRef[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function useChat({ sessionId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/study/sessions/${sessionId}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Falha ao carregar histórico");
        setMessages([]);
        return;
      }
      const rows = (json.data.messages ?? []) as Array<{
        id: string;
        role: "user" | "assistant";
        content: string;
        sources: unknown;
      }>;
      setMessages(
        rows.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: normalizeSources(m.sources),
        })),
      );
    } finally {
      setLoadingHistory(false);
    }
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await loadHistory();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [loadHistory]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || streaming) return;
      setError(null);

      const tempUserId = `temp-user-${Date.now()}`;
      const tempAssistantId = `temp-asst-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: tempUserId,
          role: "user",
          content: content.trim(),
          sources: [],
        },
        {
          id: tempAssistantId,
          role: "assistant",
          content: "",
          sources: [],
          pending: true,
        },
      ]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId, content: content.trim() }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            let evt: StreamEvent;
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            applyEvent(evt, tempAssistantId);
          }
        }

        if (buffer.trim()) {
          try {
            applyEvent(JSON.parse(buffer), tempAssistantId);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Erro inesperado";
        setError(message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantId
              ? { ...m, pending: false, content: m.content || `Erro: ${message}` }
              : m,
          ),
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }

      function applyEvent(evt: StreamEvent, assistantId: string) {
        if (evt.type === "sources" && evt.sources) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, sources: normalizeSources(evt.sources) }
                : m,
            ),
          );
        } else if (evt.type === "delta" && evt.text) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + (evt.text ?? "") }
                : m,
            ),
          );
        } else if (evt.type === "done") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, id: evt.messageId ?? m.id, pending: false }
                : m,
            ),
          );
        } else if (evt.type === "error") {
          setError(evt.error ?? "Erro ao gerar resposta");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    pending: false,
                    content: m.content || `Erro: ${evt.error ?? "desconhecido"}`,
                  }
                : m,
            ),
          );
        }
      }
    },
    [sessionId, streaming],
  );

  return {
    messages,
    sendMessage,
    streaming,
    error,
    loadingHistory,
    reload: loadHistory,
  };
}
