export const NICHE_LABELS: Record<string, string> = {
  oab: "Direito (OAB)",
  medicina: "Medicina",
  enem: "ENEM e vestibulares",
  concursos: "Concursos públicos",
  vestibular: "Vestibulares",
  geral: "estudos gerais",
};

export function getNicheLabel(niche: string | null | undefined): string {
  if (!niche) return NICHE_LABELS.geral;
  return NICHE_LABELS[niche] ?? niche;
}

export function getSystemPrompt(niche: string | null | undefined): string {
  const label = getNicheLabel(niche);
  return `Você é um tutor especialista em ${label}.

Seu papel é explicar conceitos e responder dúvidas usando EXCLUSIVAMENTE o material fornecido pelo aluno (apresentado em "Contexto" abaixo).

Regras:
- Sempre cite a fonte (página) ao referenciar o material, no formato [Fonte: p. {pagina}].
- Se a pergunta não puder ser respondida com o material disponível, diga isso de forma clara e sugira o que poderia complementar a resposta.
- Use linguagem acessível mas tecnicamente precisa.
- Dê exemplos práticos quando ajudar a fixar o conceito.
- Se o aluno demonstrar confusão, reformule com analogias simples.
- Ao final de explicações longas, faça um resumo curto em tópicos.
- Responda em português do Brasil.`;
}

export function buildContextBlock(
  chunks: Array<{ content: string; pageNumber: number | null; chunkIndex: number }>,
): string {
  if (chunks.length === 0) {
    return "(Nenhum trecho relevante encontrado no material do aluno.)";
  }
  return chunks
    .map((c, i) => {
      const page = c.pageNumber ? `p. ${c.pageNumber}` : `chunk ${c.chunkIndex}`;
      return `[Trecho ${i + 1} — ${page}]\n${c.content}`;
    })
    .join("\n\n---\n\n");
}
