import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/aperio/AppShell";
import { BOOKS } from "@/data/bible";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/read/$book")({
  head: ({ params }) => ({ meta: [{ title: `${params.book} — Chapters | Aperio` }] }),
  component: ChapterPickerPage,
});

function ChapterPickerPage() {
  const { book } = useParams({ from: "/read/$book" });
  const bookMeta =
    BOOKS.find((b) => b.name === book) ?? BOOKS.find((b) => b.name === decodeURIComponent(book));

  if (!bookMeta) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-5 py-8">
          <Link to="/read" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Read
          </Link>
          <h1 className="mt-6 font-serif text-3xl">Book not found</h1>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link to="/read" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Read
        </Link>
        <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {bookMeta.testament === "NT" ? "New Testament" : "Old Testament"}
        </p>
        <h1 className="mt-2 font-serif text-4xl">{bookMeta.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a chapter to begin.</p>

        <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-8">
          {Array.from({ length: bookMeta.chapters }, (_, i) => i + 1).map((chapter) => (
            <Link
              key={chapter}
              to="/read/$book/$chapter"
              params={{ book: bookMeta.name, chapter: String(chapter) }}
              className="flex aspect-square items-center justify-center rounded-lg border border-border bg-card text-base text-foreground transition hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/10"
            >
              {chapter}
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
