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

interface AvailableTranslationsResponse {
  translations: Array<{
    id: string;
    shortName: string;
    name: string;
    englishName?: string;
    language: string;
  }>;
}

const API_BASE = "https://bible.helloao.org/api";
const LICENSED_TRANSLATIONS = new Set(["ESV", "NLT"]);

// A curated short list of high-quality English translations + originals.
// The full API exposes 1000+ — we keep the picker focused.
export const FEATURED_TRANSLATIONS: ApiTranslation[] = [
  { id: "BSB", shortName: "BSB", name: "Berean Standard Bible", language: "eng" },
  { id: "ESV", shortName: "ESV", name: "English Standard Version", language: "eng" },
  { id: "NLT", shortName: "NLT", name: "New Living Translation", language: "eng" },
  { id: "eng_kjv", shortName: "KJV", name: "King James Version", language: "eng" },
  { id: "eng_asv", shortName: "ASV", name: "American Standard Version", language: "eng" },
  { id: "ENGWEBP", shortName: "WEB", name: "World English Bible", language: "eng" },
  { id: "eng_net", shortName: "NET", name: "NET Bible", language: "eng" },
  { id: "eng_ylt", shortName: "YLT", name: "Young's Literal Translation", language: "eng" },
];

function hasServerBackedRoutes() {
  if (typeof window === "undefined") return true;
  return window.location.protocol !== "capacitor:" && window.location.protocol !== "file:";
}

export function getReadableTranslations() {
  if (hasServerBackedRoutes()) return FEATURED_TRANSLATIONS;
  return FEATURED_TRANSLATIONS.filter((translation) => !LICENSED_TRANSLATIONS.has(translation.id));
}

export function normalizeReadableTranslation(translation: string) {
  if (!LICENSED_TRANSLATIONS.has(translation)) return translation;
  return hasServerBackedRoutes() ? translation : "BSB";
}

const LEGACY_TRANSLATION_ALIASES: Record<string, string> = {
  engKJV: "eng_kjv",
  engASV: "eng_asv",
  engWEBP: "WEB",
  engNET: "eng_net",
  engYLT: "eng_ylt",
};

let availableTranslationsPromise: Promise<AvailableTranslationsResponse["translations"]> | null = null;

// Convert a "common" book name (e.g. "1 Corinthians") into the URL slug
// that helloao expects — strip spaces.
function bookSlug(book: string): string {
  return book.replace(/\s+/g, "");
}

const BOOK_CODES: Record<string, string> = {
  Genesis: "GEN",
  Exodus: "EXO",
  Leviticus: "LEV",
  Numbers: "NUM",
  Deuteronomy: "DEU",
  Joshua: "JOS",
  Judges: "JDG",
  Ruth: "RUT",
  "1 Samuel": "1SA",
  "2 Samuel": "2SA",
  "1 Kings": "1KI",
  "2 Kings": "2KI",
  "1 Chronicles": "1CH",
  "2 Chronicles": "2CH",
  Ezra: "EZR",
  Nehemiah: "NEH",
  Esther: "EST",
  Job: "JOB",
  Psalms: "PSA",
  Proverbs: "PRO",
  Ecclesiastes: "ECC",
  "Song of Solomon": "SNG",
  Isaiah: "ISA",
  Jeremiah: "JER",
  Lamentations: "LAM",
  Ezekiel: "EZK",
  Daniel: "DAN",
  Hosea: "HOS",
  Joel: "JOL",
  Amos: "AMO",
  Obadiah: "OBA",
  Jonah: "JON",
  Micah: "MIC",
  Nahum: "NAM",
  Habakkuk: "HAB",
  Zephaniah: "ZEP",
  Haggai: "HAG",
  Zechariah: "ZEC",
  Malachi: "MAL",
  Matthew: "MAT",
  Mark: "MRK",
  Luke: "LUK",
  John: "JHN",
  Acts: "ACT",
  Romans: "ROM",
  "1 Corinthians": "1CO",
  "2 Corinthians": "2CO",
  Galatians: "GAL",
  Ephesians: "EPH",
  Philippians: "PHP",
  Colossians: "COL",
  "1 Thessalonians": "1TH",
  "2 Thessalonians": "2TH",
  "1 Timothy": "1TI",
  "2 Timothy": "2TI",
  Titus: "TIT",
  Philemon: "PHM",
  Hebrews: "HEB",
  James: "JAS",
  "1 Peter": "1PE",
  "2 Peter": "2PE",
  "1 John": "1JN",
  "2 John": "2JN",
  "3 John": "3JN",
  Jude: "JUD",
  Revelation: "REV",
};

function bookCandidates(book: string): string[] {
  const candidates = [bookSlug(book)];
  const code = BOOK_CODES[book];
  if (code && !candidates.includes(code)) candidates.push(code);
  return candidates;
}

async function getAvailableTranslations() {
  if (!availableTranslationsPromise) {
    availableTranslationsPromise = fetch(`${API_BASE}/available_translations.json`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Could not load available translations (${res.status}).`);
        const data = (await res.json()) as AvailableTranslationsResponse;
        return data.translations ?? [];
      })
      .catch((error) => {
        availableTranslationsPromise = null;
        throw error;
      });
  }
  return availableTranslationsPromise;
}

async function resolveTranslationId(translation: string) {
  if (translation === "BSB") return "BSB";
  if (translation === "ESV") return "ESV";
  if (translation === "NLT") return "NLT";

  const desired = LEGACY_TRANSLATION_ALIASES[translation] ?? translation;
  const available = await getAvailableTranslations();
  const exactIdMatch = available.find((item) => item.id === desired);
  if (exactIdMatch) return exactIdMatch.id;

  const englishExactNameMatch = available.find((item) =>
    item.language === "eng" &&
    (item.name === desired || item.englishName === desired),
  );
  if (englishExactNameMatch) return englishExactNameMatch.id;

  const englishShortNameMatch = available.find((item) =>
    item.language === "eng" && item.shortName === desired,
  );
  if (englishShortNameMatch) return englishShortNameMatch.id;

  return desired;
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
  const resolvedTranslation = await resolveTranslationId(normalizeReadableTranslation(translation));
  if (resolvedTranslation === "ESV" || resolvedTranslation === "NLT") {
    const esvResponse = await fetch(
      `/api/bible/chapter?translation=${resolvedTranslation}&book=${encodeURIComponent(book)}&chapter=${chapter}`,
      { signal },
    );
    if (!esvResponse.ok) {
      const payload = await esvResponse.json().catch(() => null);
      throw new Error(payload?.error ?? `Could not load ${book} ${chapter} from ${resolvedTranslation}.`);
    }
    return esvResponse.json();
  }
  let res: Response | null = null;
  let data: any = null;
  let lastStatus: number | null = null;
  let triedNonJson = false;

  for (const candidate of bookCandidates(book)) {
    const url = `${API_BASE}/${resolvedTranslation}/${candidate}/${chapter}.json`;
    res = await fetch(url, { signal });
    lastStatus = res.status;
    if (!res.ok) continue;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      triedNonJson = true;
      continue;
    }

    data = await res.json();
    break;
  }

  if (!data) {
    if (triedNonJson) {
      throw new Error(`Translation "${resolvedTranslation}" doesn't appear to support ${book} ${chapter}. Try a different translation.`);
    }
    throw new Error(`Could not load ${book} ${chapter}${lastStatus ? ` (${lastStatus})` : ""}. The translation may not contain this book.`);
  }

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
    translation: data?.translation?.id ?? resolvedTranslation,
    translationName: data?.translation?.shortName ?? resolvedTranslation,
    headings,
    verses,
  };
}
