"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_BYTES = 25 * 1024 * 1024;

export function UploadZone() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (file.type !== "application/pdf") {
        toast.error("Apenas PDFs são aceitos.");
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error("Arquivo maior que 25 MB.");
        return;
      }

      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: form,
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Falha no upload");
          return;
        }
        toast.success("Upload concluído. Processando...");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro inesperado");
      } finally {
        setUploading(false);
      }
    },
    [router],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        uploading && "opacity-60 cursor-not-allowed",
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm font-medium">
        {uploading
          ? "Enviando..."
          : isDragActive
            ? "Solte o PDF aqui"
            : "Arraste um PDF ou clique para selecionar"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Máximo 25 MB • até 50 páginas
      </p>
    </div>
  );
}
