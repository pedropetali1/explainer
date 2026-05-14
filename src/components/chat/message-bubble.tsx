"use client";

import { Loader2 } from "lucide-react";
import type { ChatMessage } from "@/hooks/use-chat";
import { SourceReference } from "./source-reference";
import { cn } from "@/lib/utils";

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const isPendingEmpty = message.pending && !message.content;

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        {isPendingEmpty ? (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Pensando...
          </span>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        {!isUser && message.sources.length > 0 && (
          <SourceReference sources={message.sources} />
        )}
      </div>
    </div>
  );
}
