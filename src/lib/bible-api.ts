// Live Bible text loader using the Free Use Bible API (helloao.org).
// MIT-licensed, no API key, 1000+ translations including BSB, KJV, ASV, WEB, NET,
// plus original Hebrew (WLC) and Greek (SBLGNT). We default to the BSB.
//
// Docs: https://bible.helloao.org

export interface ApiVerse {
  n: number;
  text: string;
}

export interface ApiChapter {
  book: string;
  chapter: number;
  translation: string;
  translationName: string;
  headings: { afterVerse: number; text: string }[];
  verses: ApiVerse[];
}

export interface ApiTranslation {
  id: string;
  shortName: string;
  name: string;
  language: string;
}

const API_BASE = "https://bible.helloao.org/api";

// A curated short list of high-quality English translations + originals.
// The full API exposes 1000+ — we keep the picker focused.
export const FEATURED_TRANSLATIONS: ApiTranslation[] = [
  { id: "BSB", shortName: "BSB", name: "Berean Standard Bible", language: "eng" },
  { id: "engKJV", shortName: "KJV", name: "King James Version", language: "eng" },
  { id: "engASV", shortName: "ASV", name: "American Standard Version", language: "eng" },
  { id: "engWEBP", shortName: "WEB", name: "World English Bible", language: "eng" },
  { id: "engNET", shortName: "NET", name: "New English Translation", language: "eng" },
  { id: "engYLT", shortName: "YLT", name: "Young's Literal Translation", language: "eng" },
];

// Convert a "common" book name (e.g. "1 Corinthians") into the URL slug
// that helloao expects — strip spaces.
function bookSlug(book: string): string {
  return book.replace(/\s+/g, "");
}

function flattenContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(flattenContent).join("");
  if (content && typeof content === "object") {
    const c = content as { text?: string; content?: unknown };
    if (typeof c.text === "string") return c.text;
    if (c.content !== undefined) return flattenContent(c.content);
  }
  return "";
}

export async function fetchChapter(
  book: string,
  chapter: number,
  translation = "BSB",
  signal?: AbortSignal,
): Promise<ApiChapter> {
  const url = `${API_BASE}/${translation}/${bookSlug(book)}/${chapter}.json`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Could not load ${book} ${chapter} (${res.status}). The translation may not contain this book.`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Translation "${translation}" doesn't appear to support ${book} ${chapter}. Try a different translation.`);
  }
  const data = await res.json();

  const verses: ApiVerse[] = [];
  const headings: { afterVerse: number; text: string }[] = [];
  let lastVerseN = 0;

  const items: unknown[] = data?.chapter?.content ?? [];
  for (const raw of items) {
    const item = raw as { type?: string; number?: number; content?: unknown };
    if (item.type === "verse" && typeof item.number === "number") {
      const text = flattenContent(item.content).replace(/\s+/g, " ").trim();
      verses.push({ n: item.number, text });
      lastVerseN = item.number;
    } else if (item.type === "heading") {
      headings.push({ afterVerse: lastVerseN, text: flattenContent(item.content).trim() });
    }
  }

  return {
    book,
    chapter,
    translation: data?.translation?.id ?? translation,
    translationName: data?.translation?.shortName ?? translation,
    headings,
    verses,
  };
}