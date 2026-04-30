import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/aperio/AppShell";
import { BOOKS } from "@/data/bible";
import { useAperio } from "@/lib/aperio-store";
import { ChevronRight, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Book = (typeof BOOKS)[number];

const OT_GROUPS = ["Pentateuch", "Historical", "Wisdom", "Major Prophets", "Minor Prophets"] as const;
const NT_GROUPS = ["Gospels & Acts", "Pauline Epistles", "General Epistles", "Apocalyptic"] as const;

export const Route = createFileRoute("/read/")({
  head: () => ({ meta: [{ title: "Read — Aperio" }] }),
  component: ReadIndex,
});

function ReadIndex() {
  const { lastRead } = useAperio();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return BOOKS.filter((b) => b.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-serif text-3xl">Read the Bible</h1>
        <p className="mt-1 text-sm text-muted-foreground">All 66 books · tap a chapter to begin.</p>

        <Link
          to="/read/$book/$chapter"
          params={{ book: lastRead.book, chapter: String(lastRead.chapter) }}
          className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-navy p-5 text-[var(--cream)] shadow-cathedral"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-soft)]/80">Continue reading</p>
            <p className="mt-1 font-serif text-xl">{lastRead.book} {lastRead.chapter}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[var(--gold)]" />
        </Link>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any book…"
            className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-10 text-sm placeholder:text-muted-foreground focus:border-[var(--gold)]/50 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {filtered ? (
          <section className="mt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {filtered.length} match{filtered.length === 1 ? "" : "es"}
            </p>
            <BookGrid books={filtered} />
          </section>
        ) : (
          <>
            <Testament title="New Testament" groups={NT_GROUPS} testament="NT" />
            <Testament title="Old Testament" groups={OT_GROUPS} testament="OT" />
          </>
        )}
      </div>
    </AppShell>
  );
}

function Testament({
  title,
  groups,
  testament,
}: {
  title: string;
  groups: readonly string[];
  testament: "OT" | "NT";
}) {
  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl">{title}</h2>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold-deep)]">
          {BOOKS.filter((b) => b.testament === testament).length} books
        </span>
      </div>
      <div className="mt-2 h-px bg-gradient-to-r from-[var(--gold)]/40 via-border to-transparent" />

      {groups.map((group) => {
        const books = BOOKS.filter((b) => b.testament === testament && b.group === group);
        return (
          <div key={group} className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{group}</p>
            <BookGrid books={books} />
          </div>
        );
      })}
    </section>
  );
}

function BookGrid({ books }: { books: readonly Book[] }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {books.map((b) => (
        <BookCard key={b.name} book={b} />
      ))}
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Single-chapter books (Obadiah, Philemon, 2/3 John, Jude) — go straight in.
  if (book.chapters === 1) {
    return (
      <Link
        to="/read/$book/$chapter"
        params={{ book: book.name, chapter: "1" }}
        className="group rounded-xl border border-border bg-card px-4 py-3 transition hover:border-[var(--gold)]/40"
      >
        <p className="font-serif text-base">{book.name}</p>
        <p className="text-xs text-muted-foreground">1 chapter</p>
      </Link>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="group w-full rounded-xl border border-border bg-card px-4 py-3 text-left transition hover:border-[var(--gold)]/40 data-[state=open]:border-[var(--gold)]/60">
          <p className="font-serif text-base">{book.name}</p>
          <p className="text-xs text-muted-foreground">{book.chapters} chapters</p>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[min(20rem,90vw)] border-border/70 bg-card p-3"
      >
        <div className="flex items-baseline justify-between px-1 pb-2">
          <p className="font-serif text-sm">{book.name}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Choose a chapter</p>
        </div>
        <div className="grid max-h-[50vh] grid-cols-6 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-8">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => {
                setOpen(false);
                // Defer navigation so Radix can fully unmount the popover and
                // release its scroll/pointer lock before the route changes.
                // Without this, iOS WKWebView leaves the body scroll-locked.
                setTimeout(() => {
                  navigate({ to: "/read/$book/$chapter", params: { book: book.name, chapter: String(n) } });
                }, 0);
              }}
              className="aspect-square rounded-md border border-border/60 bg-background text-sm text-foreground/85 transition hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/10 hover:text-foreground"
            >
              {n}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}