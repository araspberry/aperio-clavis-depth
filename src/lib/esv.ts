import type { ApiChapter, ApiVerse } from "@/lib/bible-api";

export interface EsvPassageResponse {
  query: string;
  canonical: string;
  passages: string[];
}

export function parseEsvChapter(book: string, chapter: number, data: EsvPassageResponse): ApiChapter {
  const raw = data.passages?.[0] ?? "";
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line !== "(ESV)");

  const verses: ApiVerse[] = [];
  const headings: { afterVerse: number; text: string }[] = [];

  let currentVerse: ApiVerse | null = null;
  let lastVerse = 0;

  for (const line of lines) {
    const verseStart = line.match(/^\[(\d+)\]\s*(.*)$/);
    if (verseStart) {
      if (currentVerse) verses.push(currentVerse);
      const verseNumber = Number(verseStart[1]);
      currentVerse = {
        n: verseNumber,
        text: verseStart[2].trim(),
      };
      lastVerse = verseNumber;
      continue;
    }

    if (currentVerse) {
      currentVerse.text = `${currentVerse.text} ${line}`.trim();
      continue;
    }

    headings.push({ afterVerse: lastVerse, text: line });
  }

  if (currentVerse) verses.push(currentVerse);

  return {
    book,
    chapter,
    translation: "ESV",
    translationName: "ESV",
    headings,
    verses,
  };
}

export function parseNltChapter(book: string, chapter: number, rawHtml: string): ApiChapter {
  const text = rawHtml
    .replace(/\r/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\u00a0/g, " ");

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line !== `## ${book} ${chapter}:${chapter}, NLT`)
    .filter((line) => !line.startsWith("## "))
    .filter((line) => !line.startsWith("### "));

  const verses: ApiVerse[] = [];
  const headings: { afterVerse: number; text: string }[] = [];
  let currentVerse: ApiVerse | null = null;
  let lastVerse = 0;

  const flush = () => {
    if (!currentVerse) return;
    currentVerse.text = currentVerse.text.replace(/\*\d+:\d+[a-z]?[^ ]*/g, "").replace(/\s+/g, " ").trim();
    verses.push(currentVerse);
    currentVerse = null;
  };

  for (const line of lines) {
    const verseStart = line.match(/^(\d+)\s*(.*)$/);
    if (verseStart) {
      flush();
      lastVerse = Number(verseStart[1]);
      currentVerse = { n: lastVerse, text: verseStart[2].trim() };
      continue;
    }

    if (!currentVerse && /^[A-Z].+/.test(line) && !/^[“"'(]/.test(line)) {
      headings.push({ afterVerse: lastVerse, text: line });
      continue;
    }

    if (currentVerse) {
      currentVerse.text = `${currentVerse.text} ${line}`.trim();
    }
  }

  flush();

  return {
    book,
    chapter,
    translation: "NLT",
    translationName: "NLT",
    headings,
    verses,
  };
}
