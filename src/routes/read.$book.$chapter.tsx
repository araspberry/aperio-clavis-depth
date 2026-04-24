import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/aperio/AppShell";
import { BOOKS, getChapter } from "@/data/bible";
import { bumpClavis, recordReading, toggleBookmark, useAperio } from "@/lib/aperio-store";
import { ClavisDrawer } from "@/components/aperio/ClavisDrawer";
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, KeyRound, MoreVertical } from "lucide-react";

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

function ReaderPage() {
  const { book, chapter } = useParams({ from: "/read/$book/$chapter" });
  const ch = Number(chapter);
  const data = useMemo(() => getChapter(book, ch), [book, ch]);
  const { bookmarks } = useAperio();
  const [drawer, setDrawer] = useState<"closed" | "peek" | "split" | "full">("closed");
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const navigate = useNavigate();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      recordReading(book, ch, 1);
    }
  }, [book, ch]);

  const bookMeta = BOOKS.find((b) => b.name === book);
  const maxCh = bookMeta?.chapters ?? 1;

  const openClavis = (verse?: number) => {
    bumpClavis();
    if (verse) setSelectedVerse(verse);
    setDrawer((d) => (d === "closed" ? "split" : d));
  };

  return (
    <AppShell>
      <div className="relative mx-auto max-w-3xl">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/40 bg-background/85 px-5 py-3 backdrop-blur-xl">
          <Link to="/read" className="rounded-full p-2 hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="font-serif text-base">
            {book} <span className="text-[var(--gold-deep)]">{ch}</span>
          </p>
          <button className="rounded-full p-2 hover:bg-secondary"><MoreVertical className="h-4 w-4" /></button>
        </header>

        {/* Scripture */}
        <article
          className="px-6 pb-40 pt-8 transition-all"
          style={{
            paddingBottom: drawer === "split" ? "55vh" : drawer === "full" ? "92vh" : drawer === "peek" ? "25vh" : "10rem",
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Chapter {ch}</p>
          <h1 className="mt-2 font-serif text-3xl">{book}</h1>

          <div className="scripture mt-8 text-[1.15rem] text-foreground/90">
            {data.verses.map((v) => {
              const ref = `${book} ${ch}:${v.n}`;
              const isBookmarked = bookmarks.includes(ref);
              const isSelected = selectedVerse === v.n;
              return (
                <span
                  key={v.n}
                  onClick={() => setSelectedVerse(isSelected ? null : v.n)}
                  className={`cursor-pointer transition-colors ${isSelected ? "rounded-md bg-[var(--gold)]/15 px-1" : "hover:bg-[var(--gold)]/5"}`}
                >
                  <sup className="verse-num">{v.n}</sup>
                  {v.text}{" "}
                  {isBookmarked && <span className="text-xs text-[var(--gold-deep)]">★ </span>}
                </span>
              );
            })}
          </div>

          {selectedVerse !== null && (
            <div className="sticky bottom-32 z-10 mt-6 flex justify-center">
              <div className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1.5 shadow-cathedral">
                <button
                  onClick={() => toggleBookmark(`${book} ${ch}:${selectedVerse}`)}
                  className="rounded-full p-2 hover:bg-secondary" title="Bookmark"
                ><Bookmark className="h-4 w-4" /></button>
                <button onClick={() => openClavis(selectedVerse)} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-3 py-1.5 text-xs font-semibold text-[var(--navy-deep)]">
                  <KeyRound className="h-3.5 w-3.5" /> Clavis on v.{selectedVerse}
                </button>
              </div>
            </div>
          )}

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
            className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-[var(--navy-deep)] shadow-gold transition hover:scale-[1.02]"
          >
            <KeyRound className="h-4 w-4" />
            Open Clavis
          </button>
        )}

        <ClavisDrawer
          state={drawer}
          setState={setDrawer}
          book={book}
          chapter={ch}
          selectedVerse={selectedVerse}
        />
      </div>
    </AppShell>
  );
}