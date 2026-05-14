"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageSquare, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StudySessionRow } from "@/lib/db/queries/study";
import type { DocumentRow } from "@/lib/db/queries/documents";

type SessionItem = StudySessionRow & { document_title: string | null };

interface Props {
  sessions: SessionItem[];
  documents: DocumentRow[];
  activeSessionId: string | null;
}

export function SessionList({ sessions, documents, activeSessionId }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string>(
    documents.find((d) => d.status === "ready")?.id ?? "",
  );

  const readyDocs = documents.filter((d) => d.status === "ready");

  const onCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/study/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDoc || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Falha ao criar sessão");
        return;
      }
      router.push(`/dashboard/study?session=${json.data.id}`);
      router.refresh();
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (id: string) => {
    const res = await fetch(`/api/study/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Falha ao remover sessão");
      return;
    }
    if (id === activeSessionId) {
      router.push("/dashboard/study");
    }
    router.refresh();
  };

  return (
    <div className="w-72 shrink-0 border-r flex flex-col h-full min-h-0 bg-sidebar">
      <div className="px-4 py-5 border-b space-y-3">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
          Sessões
        </p>
        {readyDocs.length > 0 ? (
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="w-full text-xs rounded-md border border-border bg-background px-2.5 py-2 transition-colors focus:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="">Todos os materiais</option>
            {readyDocs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nenhum material pronto. Faça upload na aba Materiais.
          </p>
        )}
        <Button
          onClick={onCreate}
          disabled={creating}
          variant="accent"
          className="w-full"
          size="sm"
        >
          {creating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Nova conversa
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-6 text-center">
            Nenhuma conversa ainda.
          </p>
        ) : (
          sessions.map((s) => (
            <SessionItemRow
              key={s.id}
              session={s}
              active={s.id === activeSessionId}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SessionItemRow({
  session,
  active,
  onDelete,
}: {
  session: SessionItem;
  active: boolean;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm cursor-pointer transition-colors duration-150",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
      onClick={() => router.push(`/dashboard/study?session=${session.id}`)}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-accent" />
      )}
      <MessageSquare className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm">
          {session.title ?? "Nova conversa"}
        </p>
        {session.document_title && (
          <p className="truncate text-[10px] text-muted-foreground mt-0.5 tracking-wide">
            {session.document_title}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={async (e) => {
          e.stopPropagation();
          if (deleting) return;
          setDeleting(true);
          try {
            await onDelete(session.id);
          } finally {
            setDeleting(false);
          }
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
        aria-label="Remover conversa"
      >
        {deleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}
