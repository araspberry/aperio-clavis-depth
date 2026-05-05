import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/aperio/AppShell";
import { BOOKS } from "@/data/bible";
import { isNative } from "@/lib/native";
import {
  FEATURED_TRANSLATIONS,
  fetchChapter,
  getReadableTranslations,
  normalizeReadableTranslation,
} from "@/lib/bible-api";
import { fetchClavisCommentary, getClavisQueryKey } from "@/lib/clavis-query";
import { bumpClavis, recordReading, setProfile, toggleBookmark, useAperio } from "@/lib/aperio-store";
import { ClavisDrawer } from "@/components/aperio/ClavisDrawer";
import { StrongsVerse } from "@/components/aperio/StrongsVerse";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Bookmark, KeyRound, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/read/$book/$chapter")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.book} ${params.chapter} — Aperio` },
      { name: "description", content: `Read ${params.book} ${params.chapter} with Clavis AI commentary, Greek/Hebrew lexicon, cross references, and historical context.` },
      { property: "og:title", content: `${params.book} ${params.chapter} — Aperio` },
      { property: "og:description", content: `Scripture, opened. ${params.book} ${params.chapter} with Clavis commentary.` },
    ],
  }),
  component: ReaderPage,
});

function goToPath(nextPath: string) {
  const useHashRouting =
    window.location.protocol === "capacitor:" || window.location.protocol === "file:";
  if (useHashRouting) {
    if (window.location.hash !== `#${nextPath}`) {
      window.history.pushState(null, "", `#${nextPath}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    return;
  }
  if (window.location.pathname !== nextPath) {
    window.history.pushState(null, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

function ReaderPage() {
  const { book, chapter } = useParams({ from: "/read/$book/$chapter" });
  const ch = Number(chapter);
  const { bookmarks, profile } = useAperio();
  const queryClient = useQueryClient();
  const [drawerTab, setDrawerTab] = useState<"commentary" | "verses">("commentary");
  const [translationBusy, setTranslationBusy] = useState(false);
  const availableTranslations = getReadableTranslations();
  // Map any legacy or runtime-unsupported translation to a safe fallback.
  const normalizedProfileTranslation = normalizeReadableTranslation(profile.translation);
  const supported = availableTranslations.some(
    (t) => t.id === normalizedProfileTranslation || t.shortName === normalizedProfileTranslation,
  );
  const translation = supported
    ? (availableTranslations.find((t) => t.shortName === normalizedProfileTranslation)?.id ??
      normalizedProfileTranslation)
    : "BSB";
  const selectedTranslation = availableTranslations.find((t) => t.id === translation) ?? FEATURED_TRANSLATIONS[0];

  const { data, isLoading, error } = useQuery({
    queryKey: ["chapter", translation, book, ch],
    queryFn: ({ signal }) => fetchChapter(book, ch, translation, signal),
    enabled: !!book && ch > 0,
  });

  const [drawer, setDrawer] = useState<"closed" | "peek" | "split" | "full">("closed");
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [strongsVerse, setStrongsVerse] = useState<number | null>(null);
  const navigate = useNavigate();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      recordReading(book, ch, 1);
    }
  }, [book, ch]);

  useEffect(() => {
    if (profile.translation === translation) return;
    void setProfile({ translation });
  }, [profile.translation, translation]);

  useEffect(() => {
    if (!data?.verses?.length) return;
    const chapterPassageText = data.verses.map((v) => `${v.n} ${v.text}`).join(" ");
    void queryClient.prefetchQuery({
      queryKey: getClavisQueryKey(book, ch, null, profile.clavisTone),
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24 * 7,
      queryFn: () =>
        fetchClavisCommentary({
          book,
          chapter: ch,
          selectedVerse: null,
          tone: profile.clavisTone,
          passageText: chapterPassageText,
        }),
    });
  }, [book, ch, data, profile.clavisTone, queryClient]);

  const bookMeta = BOOKS.find((b) => b.name === book);
  const maxCh = bookMeta?.chapters ?? 1;

  const openClavis = (verse?: number) => {
    bumpClavis();
    if (verse) {
      setSelectedVerse(verse);
      setDrawerTab("verses");
    } else {
      setDrawerTab("commentary");
    }
    setDrawer((d) => (d === "closed" ? "split" : d));
  };

  const changeTranslation = async (nextTranslation: string) => {
    if (nextTranslation === translation) return;
    setTranslationBusy(true);
    try {
      await setProfile({ translation: nextTranslation });
      setSelectedVerse(null);
      setStrongsVerse(null);
      setDrawer("closed");
    } finally {
      setTranslationBusy(false);
    }
  };

  const passageText = data?.verses
    .filter((v) => !selectedVerse || v.n === selectedVerse)
    .map((v) => `${v.n} ${v.text}`)
    .join(" ");

  return (
    <AppShell>
      <div className="relative mx-auto max-w-3xl">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/40 bg-background/85 px-5 py-3 backdrop-blur-xl">
          <Link to="/read" className="rounded-full p-2 hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <button
              type="button"
              onClick={() => goToPath(`/read/${encodeURIComponent(book)}`)}
              onTouchEnd={(event) => {
                event.preventDefault();
                goToPath(`/read/${encodeURIComponent(book)}`);
              }}
              className="mx-auto inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 font-serif text-base transition hover:bg-secondary/80"
              aria-label={`Open chapter picker for ${book}`}
            >
              <span className="truncate">
                {book} <span className="text-[var(--gold-deep)]">{ch}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
            <div className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Chapter {ch}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isNative() ? (
              <div className="relative inline-flex items-center">
                <select
                  value={selectedTranslation.id}
                  onChange={(event) => void changeTranslation(event.target.value)}
                  aria-label="Bible version"
                  disabled={translationBusy}
                  className="h-8 appearance-none rounded-full border border-[var(--gold)] bg-transparent pl-3 pr-7 text-xs font-semibold uppercase tracking-wider text-[var(--gold-deep)]"
                >
                  {availableTranslations.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.shortName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-[var(--gold-deep)]" />
              </div>
            ) : (
              <Select value={selectedTranslation.id} onValueChange={changeTranslation}>
                <SelectTrigger
                  className="h-8 w-auto gap-1 rounded-full border-[var(--gold)] bg-transparent px-3 text-xs font-semibold uppercase tracking-wider text-[var(--gold-deep)]"
                  aria-label="Bible version"
                  disabled={translationBusy}
                >
                  <SelectValue placeholder="Version">
                    {selectedTranslation.shortName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableTranslations.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.shortName} · {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {translationBusy && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>
        </header>

        {/* Scripture */}
        <article
          className="touch-pan-y px-6 pb-40 pt-8 transition-all"
          style={{
            paddingBottom: drawer === "split" ? "55vh" : drawer === "full" ? "92vh" : drawer === "peek" ? "25vh" : "10rem",
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Chapter {ch}</p>
          <h1 className="mt-2 font-serif text-3xl">{book}</h1>

          {isLoading && (
            <div className="mt-12 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading {book} {ch}…
            </div>
          )}
          {error && (
            <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {(error as Error).message}
            </div>
          )}
          {data && (
            <div className="scripture mt-8 text-[1.35rem] text-foreground/90">
              {data.verses.map((v) => {
                const heading = data.headings.find((h) => h.afterVerse === v.n - 1);
                const ref = `${book} ${ch}:${v.n}`;
                const isBookmarked = bookmarks.includes(ref);
                const isSelected = selectedVerse === v.n;
                return (
                  <span key={v.n}>
                    {heading && (
                      <span className="mb-2 mt-6 block font-serif text-sm uppercase tracking-[0.2em] text-[var(--gold-deep)]">
                        {heading.text}
                      </span>
                    )}
                    <span
                      className={`transition-colors ${isSelected ? "rounded-md bg-[var(--gold)]/15 px-1" : ""}`}
                    >
                      <button
                        type="button"
                        data-verse-interactive="true"
                        onClick={() => setSelectedVerse(isSelected ? null : v.n)}
                        className="touch-pan-y inline rounded-sm focus:outline-none"
                        aria-label={`Select verse ${v.n}`}
                      >
                        <sup className="verse-num">{v.n}</sup>
                      </button>
                      {v.text}{" "}
                      {isBookmarked && <span className="text-xs text-[var(--gold-deep)]">★ </span>}
                    </span>
                  </span>
                );
              })}
            </div>
          )}

          {selectedVerse !== null && (
            <div className="sticky bottom-32 z-10 mt-6 flex justify-center">
              <div className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1.5 shadow-cathedral">
                <button
                  onClick={() => toggleBookmark(`${book} ${ch}:${selectedVerse}`)}
                  className="rounded-full p-2 hover:bg-secondary" title="Bookmark"
                ><Bookmark className="h-4 w-4" /></button>
                <button
                  onClick={() => setStrongsVerse(strongsVerse === selectedVerse ? null : selectedVerse)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${strongsVerse === selectedVerse ? "bg-[var(--gold)]/20 text-[var(--gold-deep)]" : "hover:bg-secondary"}`}
                  title="Show Strong's tags"
                >Στ/א</button>
                <button onClick={() => openClavis(selectedVerse)} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-3 py-1.5 text-xs font-semibold text-[var(--navy-deep)]">
                  <KeyRound className="h-3.5 w-3.5" /> Clavis on v.{selectedVerse}
                </button>
              </div>
            </div>
          )}

          {strongsVerse !== null && data && (() => {
            const v = data.verses.find((x) => x.n === strongsVerse);
            return v ? <StrongsVerse book={book} chapter={ch} verse={v.n} text={v.text} /> : null;
          })()}

          {/* Chapter nav */}
          <div className="mt-12 flex items-center justify-between border-t border-border pt-5">
            <button
              disabled={ch <= 1}
              onClick={() => navigate({ to: "/read/$book/$chapter", params: { book, chapter: String(ch - 1) } })}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              disabled={ch >= maxCh}
              onClick={() => navigate({ to: "/read/$book/$chapter", params: { book, chapter: String(ch + 1) } })}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </article>

        {/* Floating Clavis pill */}
        {drawer === "closed" && (
          <button
            onClick={() => openClavis()}
            className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 inline-flex items-center rounded-full bg-white border border-[var(--gold)] px-6 py-2.5 text-sm font-semibold text-[var(--gold-deep)] shadow-gold transition hover:scale-[1.02]"
          >
            Open Clavis
          </button>
        )}

        <ClavisDrawer
          state={drawer}
          setState={setDrawer}
          book={book}
          chapter={ch}
          selectedVerse={selectedVerse}
          verses={data?.verses ?? []}
          passageText={passageText}
          initialTab={drawerTab}
        />
      </div>
    </AppShell>
  );
}
