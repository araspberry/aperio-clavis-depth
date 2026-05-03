// Bible text loader backed by API.Bible via the `bible-text` edge function.
// All API.Bible requests go through the server so the API key stays private,
// and both web + native (Capacitor iOS) hit the same hosted endpoint.

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

interface BibleListResponse {
  bibles: Array<{ id: string; abbreviation: string; name: string; language: string }>;
}

// Curated picker list. `id` is an API.Bible bibleId; `shortName` drives the UI.
// We list these as "preferred" — only those actually returned by the
// /bibles endpoint will be shown. If none of these are available we fall back
// to the full English list from API.Bible.
const PREFERRED_BIBLES: ApiTranslation[] = [
  { id: "de4e12af7f28f599-02", shortName: "KJV", name: "King James Version", language: "eng" },
  { id: "de4e12af7f28f599-01", shortName: "KJV", name: "King James Version", language: "eng" },
  { id: "06125adad2d5898a-01", shortName: "ASV", name: "American Standard Version", language: "eng" },
  { id: "9879dbb7cfe39e4d-01", shortName: "WEB", name: "World English Bible", language: "eng" },
  { id: "65eec8e0b60e656b-01", shortName: "FBV", name: "Free Bible Version", language: "eng" },
  { id: "01b29f4b342acc35-01", shortName: "LSV", name: "Literal Standard Version", language: "eng" },
  { id: "55212e3cf5d04d49-01", shortName: "KJVCPB", name: "Cambridge Paragraph Bible (KJV)", language: "eng" },
];

// Default until the live list resolves. Kept stable so other modules can
// import a translation immediately without awaiting an async fetch.
export const FEATURED_TRANSLATIONS: ApiTranslation[] = PREFERRED_BIBLES.slice(0, 4);

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bible-text`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let availableTranslationsPromise: Promise<ApiTranslation[]> | null = null;
let cachedTranslations: ApiTranslation[] = FEATURED_TRANSLATIONS;

async function loadAvailableTranslations(): Promise<ApiTranslation[]> {
  const res = await fetch(`${FUNCTIONS_URL}?action=bibles`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Could not load Bible list (${res.status})`);
  const payload = (await res.json()) as BibleListResponse;
  return shapeTranslations(payload.bibles ?? []);
}

function shapeTranslations(
  bibles: Array<{ id: string; abbreviation: string; name: string; language: string }>,
): ApiTranslation[] {
  const byId = new Map(bibles.map((b) => [b.id, b]));
  const preferred = PREFERRED_BIBLES.filter((p) => byId.has(p.id)).map((p) => {
    const b = byId.get(p.id)!;
    return { id: b.id, shortName: p.shortName, name: p.name, language: b.language };
  });
  if (preferred.length) {
    // Dedup by shortName (KJV has multiple ids).
    const seen = new Set<string>();
    return preferred.filter((t) => (seen.has(t.shortName) ? false : (seen.add(t.shortName), true)));
  }
  // Fallback: first ten English bibles.
  return bibles
    .filter((b) => b.language === "eng")
    .slice(0, 10)
    .map((b) => ({ id: b.id, shortName: b.abbreviation, name: b.name, language: b.language }));
}

export function getReadableTranslations(): ApiTranslation[] {
  // Kick off the async refresh in the background; UI gets the cached list
  // immediately and re-renders when react-query / the picker re-asks.
  if (!availableTranslationsPromise) {
    availableTranslationsPromise = loadAvailableTranslations()
      .then((list) => {
        if (list.length) cachedTranslations = list;
        return cachedTranslations;
      })
      .catch(() => cachedTranslations);
  }
  return cachedTranslations;
}

// Map any saved translation onto an id we can actually fetch.
// Accepts old short-codes (BSB/ESV/NLT/WEB/etc.) and new bibleIds.
export function normalizeReadableTranslation(translation: string): string {
  if (!translation) return cachedTranslations[0]?.id ?? FEATURED_TRANSLATIONS[0].id;
  // If it already matches a known id, keep it.
  if (cachedTranslations.some((t) => t.id === translation)) return translation;
  // Try matching by shortName (case-insensitive).
  const byShort = cachedTranslations.find(
    (t) => t.shortName.toLowerCase() === translation.toLowerCase(),
  );
  if (byShort) return byShort.id;
  // Fall back to the first available translation.
  return cachedTranslations[0]?.id ?? FEATURED_TRANSLATIONS[0].id;
}

export async function fetchChapter(
  book: string,
  chapter: number,
  translation: string,
  signal?: AbortSignal,
): Promise<ApiChapter> {
  const bibleId = normalizeReadableTranslation(translation);
  const url = `${FUNCTIONS_URL}?action=chapter&bibleId=${encodeURIComponent(bibleId)}&book=${encodeURIComponent(book)}&chapter=${chapter}`;
  const res = await fetch(url, {
    signal,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error ?? `Could not load ${book} ${chapter}.`);
  }
  const data = (await res.json()) as ApiChapter;
  // Tag the response with the human-readable name we have locally.
  const meta = cachedTranslations.find((t) => t.id === bibleId);
  if (meta) {
    data.translation = meta.shortName;
    data.translationName = meta.name;
  }
  return data;
}
