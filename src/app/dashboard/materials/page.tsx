import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listDocuments } from "@/lib/db/queries/documents";
import { UploadZone } from "@/components/materials/upload-zone";
import { DocumentList } from "@/components/materials/document-list";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const documents = await listDocuments(user.id);

  return (
    <div className="space-y-10 max-w-3xl">
      <header className="space-y-2">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          Biblioteca
        </p>
        <h1 className="font-heading text-3xl md:text-4xl tracking-tight leading-tight">
          Materiais
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Faça upload de PDFs para a IA aprender com eles. Cada documento vira
          base para conversas e questões.
        </p>
      </header>

      <UploadZone />

      <div className="space-y-3">
        <h2 className="text-xs tracking-widest uppercase text-muted-foreground">
          Seus materiais
        </h2>
        <DocumentList documents={documents} />
      </div>
    </div>
  );
}
