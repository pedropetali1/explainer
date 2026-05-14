import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getSession,
  listSessions,
  type StudySessionRow,
} from "@/lib/db/queries/study";
import { listDocuments } from "@/lib/db/queries/documents";
import { ChatInterface } from "@/components/chat/chat-interface";
import { SessionList } from "@/components/chat/session-list";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ session?: string }>;
}

export default async function StudyPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { session: sessionParam } = await searchParams;

  const [sessions, documents] = await Promise.all([
    listSessions(user.id),
    listDocuments(user.id),
  ]);

  let activeSession: StudySessionRow | null = null;
  if (sessionParam) {
    activeSession = await getSession(sessionParam, user.id);
  }

  const activeDocTitle = activeSession?.document_id
    ? (documents.find((d) => d.id === activeSession?.document_id)?.title ??
      null)
    : null;

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] min-h-0">
      <SessionList
        sessions={sessions}
        documents={documents}
        activeSessionId={activeSession?.id ?? null}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        {activeSession ? (
          <ChatInterface
            key={activeSession.id}
            sessionId={activeSession.id}
            documentTitle={activeDocTitle}
          />
        ) : (
          <NoSessionState hasDocuments={documents.some((d) => d.status === "ready")} />
        )}
      </div>
    </div>
  );
}

function NoSessionState({ hasDocuments }: { hasDocuments: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-2">
        <h2 className="text-lg font-semibold">Comece uma conversa</h2>
        <p className="text-sm text-muted-foreground">
          {hasDocuments
            ? 'Clique em "Nova conversa" para começar a estudar com a IA usando seus materiais.'
            : "Faça upload de um PDF na aba Materiais para que a IA possa estudar com você."}
        </p>
      </div>
    </div>
  );
}
