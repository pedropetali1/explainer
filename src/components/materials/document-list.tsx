"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { DocumentRow } from "@/lib/db/queries/documents";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  documents: DocumentRow[];
}

const STATUS_LABEL: Record<DocumentRow["status"], string> = {
  pending: "Aguardando",
  processing: "Processando",
  ready: "Pronto",
  error: "Erro",
};

export function DocumentList({ documents }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const hasActive = documents.some(
    (d) => d.status === "pending" || d.status === "processing",
  );

  useEffect(() => {
    if (!hasActive) return;
    const id = setInterval(() => {
      startTransition(() => router.refresh());
    }, 3000);
    return () => clearInterval(id);
  }, [hasActive, router]);

  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum material ainda. Faça upload do seu primeiro PDF.
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-lg border bg-card">
      {documents.map((doc) => (
        <DocumentRowItem key={doc.id} doc={doc} />
      ))}
    </ul>
  );
}

function DocumentRowItem({ doc }: { doc: DocumentRow }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  const onRetry = async () => {
    setRetrying(true);
    try {
      const res = await fetch("/api/documents/process", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentId: doc.id }),
      });
      const json = await res.json();
      if (!res.ok) toast.error(json.error ?? "Falha ao reprocessar");
      else toast.success("Reprocessado.");
      router.refresh();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.title}</p>
        <p className="text-xs text-muted-foreground">
          {(doc.file_size / 1024 / 1024).toFixed(2)} MB
          {doc.total_chunks > 0 && ` • ${doc.total_chunks} chunks`}
        </p>
        {doc.status === "error" && doc.error_message && (
          <p className="text-xs text-destructive mt-1">{doc.error_message}</p>
        )}
      </div>
      <StatusBadge status={doc.status} />
      {doc.status === "error" && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? "..." : "Tentar de novo"}
        </Button>
      )}
    </li>
  );
}

function StatusBadge({ status }: { status: DocumentRow["status"] }) {
  const map = {
    pending: { Icon: Loader2, cls: "text-muted-foreground animate-spin" },
    processing: { Icon: Loader2, cls: "text-blue-600 animate-spin" },
    ready: { Icon: CheckCircle2, cls: "text-green-600" },
    error: { Icon: AlertCircle, cls: "text-destructive" },
  } as const;
  const { Icon, cls } = map[status];
  return (
    <span className="flex items-center gap-1.5 text-xs">
      <Icon className={cn("h-4 w-4", cls)} />
      <span className="text-muted-foreground">{STATUS_LABEL[status]}</span>
    </span>
  );
}
