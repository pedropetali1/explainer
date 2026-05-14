"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import type { MessageSourceRef } from "@/lib/db/queries/study";
import { cn } from "@/lib/utils";

interface Props {
  sources: MessageSourceRef[];
}

export function SourceReference({ sources }: Props) {
  const [open, setOpen] = useState(false);

  if (!Array.isArray(sources) || sources.length === 0) return null;

  return (
    <div className="mt-3 border rounded-md bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          {sources.length} {sources.length === 1 ? "trecho" : "trechos"} do material
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      <ul
        className={cn(
          "divide-y border-t",
          open ? "block" : "hidden",
        )}
      >
        {sources.map((src, idx) => (
          <li key={src.chunkId} className="px-3 py-2 text-xs">
            <p className="font-medium text-foreground">
              Trecho {idx + 1}
              {src.pageNumber ? ` • p. ${src.pageNumber}` : ""}
            </p>
            <p className="text-muted-foreground mt-0.5 leading-relaxed">
              {src.preview}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
