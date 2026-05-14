import { getSql } from "@/lib/db/client";

export interface StudySessionRow {
  id: string;
  user_id: string;
  title: string | null;
  document_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageSourceRef {
  chunkId: string;
  pageNumber: number | null;
  documentTitle?: string;
  preview: string;
}

export interface MessageRow {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  sources: MessageSourceRef[];
  created_at: string;
}

export async function listSessions(
  userId: string,
): Promise<Array<StudySessionRow & { document_title: string | null }>> {
  const sql = getSql();
  return sql<Array<StudySessionRow & { document_title: string | null }>>`
    SELECT s.*, d.title AS document_title
    FROM study_sessions s
    LEFT JOIN documents d ON d.id = s.document_id
    WHERE s.user_id = ${userId}
    ORDER BY s.updated_at DESC
  `;
}

export async function getSession(
  id: string,
  userId: string,
): Promise<StudySessionRow | null> {
  const sql = getSql();
  const rows = await sql<StudySessionRow[]>`
    SELECT * FROM study_sessions
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function createSession(input: {
  userId: string;
  title?: string | null;
  documentId?: string | null;
}): Promise<StudySessionRow> {
  const sql = getSql();
  const [row] = await sql<StudySessionRow[]>`
    INSERT INTO study_sessions (user_id, title, document_id)
    VALUES (${input.userId}, ${input.title ?? null}, ${input.documentId ?? null})
    RETURNING *
  `;
  return row;
}

export async function updateSessionTitle(
  id: string,
  userId: string,
  title: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE study_sessions
    SET title = ${title}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `;
}

export async function touchSession(id: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE study_sessions SET updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteSession(id: string, userId: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM study_sessions WHERE id = ${id} AND user_id = ${userId}`;
}

export async function listMessages(sessionId: string): Promise<MessageRow[]> {
  const sql = getSql();
  return sql<MessageRow[]>`
    SELECT * FROM messages
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `;
}

export async function insertMessage(input: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  sources?: MessageSourceRef[];
}): Promise<MessageRow> {
  const sql = getSql();
  const [row] = await sql<MessageRow[]>`
    INSERT INTO messages (session_id, role, content, sources)
    VALUES (
      ${input.sessionId},
      ${input.role},
      ${input.content},
      ${JSON.stringify(input.sources ?? [])}::jsonb
    )
    RETURNING *
  `;
  return row;
}
