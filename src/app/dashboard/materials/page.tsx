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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Materiais</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Faça upload de PDFs para a IA aprender com eles.
        </p>
      </div>

      <UploadZone />

      <div>
        <h2 className="text-sm font-medium mb-3">Seus materiais</h2>
        <DocumentList documents={documents} />
      </div>
    </div>
  );
}
