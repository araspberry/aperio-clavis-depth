// Bible text proxy backed by API.Bible (https://scripture.api.bible).
// Keeps API_BIBLE_KEY server-side and serves both web and native clients.
//
// Endpoints (single function, dispatched by `?action=`):
//   GET ?action=bibles           -> list available Bibles for this key
//   GET ?action=chapter&bibleId=...&book=Matthew&chapter=5
//
// Responses are normalized into Aperio's ApiChapter shape:
//   { book, chapter, translation, translationName, headings, verses:[{n,text}] }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const API_BASE = "https://api.scripture.api.bible/v1";
const API_BASE_FALLBACK = "https://rest.api.bible/v1";

// USFM book ID map. API.Bible expects e.g. "GEN", "1CO".
const BOOK_USFM: Record<string, string> = {
  Genesis: "GEN", Exodus: "EXO", Leviticus: "LEV", Numbers: "NUM", Deuteronomy: "DEU",
  Joshua: "JOS", Judges: "JDG", Ruth: "RUT",
  "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
  "1 Chronicles": "1CH", "2 Chronicles": "2CH",
  Ezra: "EZR", Nehemiah: "NEH", Esther: "EST", Job: "JOB", Psalms: "PSA", Proverbs: "PRO",
  Ecclesiastes: "ECC", "Song of Solomon": "SNG", Isaiah: "ISA", Jeremiah: "JER",
  Lamentations: "LAM", Ezekiel: "EZK", Daniel: "DAN",
  Hosea: "HOS", Joel: "JOL", Amos: "AMO", Obadiah: "OBA", Jonah: "JON",
  Micah: "MIC", Nahum: "NAM", Habakkuk: "HAB", Zephaniah: "ZEP",
  Haggai: "HAG", Zechariah: "ZEC", Malachi: "MAL",
  Matthew: "MAT", Mark: "MRK", Luke: "LUK", John: "JHN", Acts: "ACT", Romans: "ROM",
  "1 Corinthians": "1CO", "2 Corinthians": "2CO", Galatians: "GAL", Ephesians: "EPH",
  Philippians: "PHP", Colossians: "COL",
  "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
  "1 Timothy": "1TI", "2 Timothy": "2TI", Titus: "TIT", Philemon: "PHM",
  Hebrews: "HEB", James: "JAS", "1 Peter": "1PE", "2 Peter": "2PE",
  "1 John": "1JN", "2 John": "2JN", "3 John": "3JN", Jude: "JUD", Revelation: "REV",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function apiKeyOrFail() {
  const key = Deno.env.get("API_BIBLE_KEY");
  if (!key) throw new Error("API_BIBLE_KEY is not configured on the server.");
  return key;
}

async function listBibles() {
  const key = apiKeyOrFail();
  let res = await fetch(`${API_BASE}/bibles?language=eng`, { headers: { "api-key": key } });
  if (!res.ok) {
    res = await fetch(`${API_BASE_FALLBACK}/bibles?language=eng`, { headers: { "api-key": key } });
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API.Bible /bibles failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const payload = await res.json();
  const bibles = (payload.data ?? []).map((b: any) => ({
    id: b.id,
    abbreviation: b.abbreviationLocal ?? b.abbreviation ?? b.name,
    name: b.nameLocal ?? b.name,
    language: b.language?.id ?? "eng",
  }));
  return bibles;
}

// Strip HTML tags but preserve verse-number markers we'll re-parse.
function htmlToText(html: string) {
  return html
    .replace(/<\/?p[^>]*>/gi, "\n")
    .replace(/<br\s*\/?>(\s|&nbsp;)*/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchChapter(bibleId: string, book: string, chapter: number) {
  const usfm = BOOK_USFM[book];
  if (!usfm) throw new Error(`Unsupported book: ${book}`);
  const chapterId = `${usfm}.${chapter}`;

  const key = apiKeyOrFail();
  const url = new URL(`${API_BASE}/bibles/${bibleId}/chapters/${chapterId}`);
  url.searchParams.set("content-type", "json");
  url.searchParams.set("include-notes", "false");
  url.searchParams.set("include-titles", "true");
  url.searchParams.set("include-chapter-numbers", "false");
  url.searchParams.set("include-verse-numbers", "true");
  url.searchParams.set("include-verse-spans", "false");

  let res = await fetch(url, { headers: { "api-key": key } });
  if (!res.ok && res.status === 401) {
    const fallback = new URL(url.toString().replace(API_BASE, API_BASE_FALLBACK));
    res = await fetch(fallback, { headers: { "api-key": key } });
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API.Bible chapter fetch failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const payload = await res.json();
  const data = payload.data;

  const verses: { n: number; text: string }[] = [];
  const headings: { afterVerse: number; text: string }[] = [];
  let currentVerseN = 0;
  let currentText = "";
  let lastVerseN = 0;

  const flush = () => {
    if (!currentVerseN) return;
    let text = currentText.replace(/\s+/g, " ").trim();
    // API.Bible emits the verse number as a text node inside the verse tag.
    // Strip any leading occurrence(s) of the verse number plus optional punctuation/pilcrow.
    const numStr = String(currentVerseN);
    text = text.replace(new RegExp(`^(?:${numStr}\\s*[¶\\.\\-:)\\]]?\\s*)+`), "").trim();
    verses.push({ n: currentVerseN, text });
    lastVerseN = currentVerseN;
    currentVerseN = 0;
    currentText = "";
  };

  // API.Bible JSON content is an array of "items" (paragraphs/sections) each
  // with nested items: { type: "tag", name, attrs, items: [...] } or
  // { type: "text", text }.
  const walk = (items: any[]) => {
    for (const item of items ?? []) {
      if (item.type === "tag" && item.name === "verse") {
        // verse marker - flush previous, start new
        flush();
        const num = Number(item.attrs?.number ?? item.number ?? 0);
        if (num) currentVerseN = num;
        if (Array.isArray(item.items)) walk(item.items);
      } else if (item.type === "tag" && /^h\d?$|^heading$|^s\d?$|^ms\d?$/i.test(item.name ?? "")) {
        flush();
        const headingText = collectText(item.items ?? []);
        if (headingText) headings.push({ afterVerse: lastVerseN, text: headingText });
      } else if (item.type === "text") {
        if (currentVerseN) currentText += item.text ?? "";
      } else if (Array.isArray(item.items)) {
        walk(item.items);
      }
    }
  };

  const collectText = (items: any[]): string => {
    let out = "";
    for (const item of items) {
      if (item.type === "text") out += item.text ?? "";
      else if (Array.isArray(item.items)) out += collectText(item.items);
    }
    return out.replace(/\s+/g, " ").trim();
  };

  if (Array.isArray(data?.content)) {
    walk(data.content);
    flush();
  }

  // Fallback: parse HTML if JSON content was not structured as expected.
  if (!verses.length && typeof data?.content === "string") {
    const text = htmlToText(data.content);
    const re = /\[(\d+)\]\s*([\s\S]*?)(?=\[\d+\]|$)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      verses.push({ n: Number(m[1]), text: m[2].trim() });
    }
  }

  return {
    book,
    chapter,
    translation: bibleId,
    translationName: data?.bibleId ?? bibleId,
    headings,
    verses,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "chapter";

    if (action === "bibles") {
      const bibles = await listBibles();
      return json({ bibles });
    }

    if (action === "chapter") {
      const bibleId = url.searchParams.get("bibleId") ?? url.searchParams.get("translation");
      const book = url.searchParams.get("book");
      const chapter = Number(url.searchParams.get("chapter"));
      if (!bibleId || !book || !chapter) {
        return json({ error: "bibleId, book, and chapter are required." }, 400);
      }
      const data = await fetchChapter(bibleId, book, chapter);
      return json(data);
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});
