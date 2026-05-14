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
        "border border-dashed rounded-lg px-6 py-12 text-center cursor-pointer transition-all duration-200",
        isDragActive
          ? "border-accent bg-accent/5"
          : "border-border hover:border-foreground/40 hover:bg-muted/30",
        uploading && "opacity-60 cursor-not-allowed",
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud
        className={cn(
          "mx-auto h-8 w-8 mb-4 transition-colors",
          isDragActive ? "text-accent" : "text-muted-foreground",
        )}
        strokeWidth={1.5}
      />
      <p className="font-heading text-xl tracking-tight leading-tight">
        {uploading
          ? "Enviando..."
          : isDragActive
            ? "Solte o PDF aqui"
            : "Arraste um PDF ou clique para selecionar"}
      </p>
      <p className="text-xs text-muted-foreground mt-2 tracking-wide">
        Máximo 25 MB · até 50 páginas
      </p>
    </div>
  );
}
