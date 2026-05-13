import type { ParsedPage } from "./pdf-parser";

export interface Chunk {
  content: string;
  index: number;
  pageNumber?: number;
  metadata: Record<string, unknown>;
}

const TARGET_TOKENS = 650;
const MAX_TOKENS = 800;
const OVERLAP_TOKENS = 100;

const CHARS_PER_TOKEN = 4;

const estimateTokens = (s: string) => Math.ceil(s.length / CHARS_PER_TOKEN);

const takeLastTokens = (s: string, tokens: number) => {
  const chars = tokens * CHARS_PER_TOKEN;
  if (s.length <= chars) return s;
  const slice = s.slice(-chars);
  const firstSpace = slice.indexOf(" ");
  return firstSpace > 0 ? slice.slice(firstSpace + 1) : slice;
};

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function flushBuffer(
  buffer: string,
  pageNumber: number | undefined,
  index: number,
  chunks: Chunk[],
): string {
  const trimmed = buffer.trim();
  if (!trimmed) return "";
  chunks.push({
    content: trimmed,
    index,
    pageNumber,
    metadata: {},
  });
  return takeLastTokens(trimmed, OVERLAP_TOKENS);
}

export function chunkPages(pages: ParsedPage[]): Chunk[] {
  const chunks: Chunk[] = [];
  let buffer = "";
  let bufferPage: number | undefined;

  const append = (text: string, pageNumber: number) => {
    if (!buffer) bufferPage = pageNumber;
    buffer = buffer ? `${buffer}\n\n${text}` : text;
  };

  for (const page of pages) {
    const paragraphs = splitIntoParagraphs(page.text);
    for (const paragraph of paragraphs) {
      const paragraphTokens = estimateTokens(paragraph);

      if (paragraphTokens > MAX_TOKENS) {
        if (buffer) {
          buffer = flushBuffer(buffer, bufferPage, chunks.length, chunks);
          bufferPage = page.pageNumber;
        }
        const sentences = splitIntoSentences(paragraph);
        for (const sentence of sentences) {
          const candidate = buffer ? `${buffer} ${sentence}` : sentence;
          if (estimateTokens(candidate) > TARGET_TOKENS) {
            buffer = flushBuffer(buffer, bufferPage, chunks.length, chunks);
            bufferPage = page.pageNumber;
            buffer = buffer ? `${buffer} ${sentence}` : sentence;
          } else {
            buffer = candidate;
          }
        }
        continue;
      }

      const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
      if (estimateTokens(candidate) > TARGET_TOKENS) {
        buffer = flushBuffer(buffer, bufferPage, chunks.length, chunks);
        bufferPage = page.pageNumber;
        append(paragraph, page.pageNumber);
      } else {
        append(paragraph, page.pageNumber);
      }
    }
  }

  if (buffer.trim()) {
    chunks.push({
      content: buffer.trim(),
      index: chunks.length,
      pageNumber: bufferPage,
      metadata: {},
    });
  }

  return chunks;
}
