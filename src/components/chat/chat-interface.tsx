"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useChat } from "@/hooks/use-chat";
import { MessageBubble } from "./message-bubble";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  sessionId: string;
  documentTitle: string | null;
}

export function ChatInterface({ sessionId, documentTitle }: Props) {
  const { messages, sendMessage, streaming, error, loadingHistory } = useChat({
    sessionId,
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await sendMessage(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState documentTitle={documentTitle} />
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t bg-background/95 backdrop-blur px-4 py-3"
      >
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={autoResize}
            onKeyDown={onKeyDown}
            placeholder={
              documentTitle
                ? `Pergunte sobre "${documentTitle}"...`
                : "Pergunte algo sobre seus materiais..."
            }
            rows={1}
            disabled={streaming || loadingHistory}
            className={cn(
              "flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm",
              "focus:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:opacity-60",
            )}
          />
          <Button
            type="submit"
            disabled={!input.trim() || streaming || loadingHistory}
            size="icon-lg"
            aria-label="Enviar"
          >
            {streaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Enter envia • Shift+Enter quebra linha
        </p>
      </form>
    </div>
  );
}

function EmptyState({ documentTitle }: { documentTitle: string | null }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 text-muted-foreground fade-in">
      <div className="max-w-md space-y-3">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
          {documentTitle ? "Material ativo" : "Pronto para começar"}
        </p>
        <h3 className="font-heading text-2xl tracking-tight leading-tight text-foreground">
          {documentTitle
            ? `Estudando "${documentTitle}"`
            : "Pergunte algo para começar"}
        </h3>
        <p className="text-sm leading-relaxed">
          A IA responde usando exclusivamente seus materiais. As referências
          mostram a página do PDF de onde veio cada parte da resposta.
        </p>
      </div>
    </div>
  );
}
