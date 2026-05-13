import { extractText, getDocumentProxy } from "unpdf";

export interface ParsedPage {
  pageNumber: number;
  text: string;
}

export interface ParsedPdf {
  pages: ParsedPage[];
  totalPages: number;
}

export async function parsePdf(buffer: Buffer): Promise<ParsedPdf> {
  const data = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(data);
  const { text, totalPages } = await extractText(pdf, { mergePages: false });

  const pageTexts = Array.isArray(text) ? text : [text];
  const pages: ParsedPage[] = pageTexts.map((t, i) => ({
    pageNumber: i + 1,
    text: normalizeWhitespace(t),
  }));

  return { pages, totalPages };
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
