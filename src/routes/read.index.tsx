import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/aperio/AppShell";
import { BOOKS } from "@/data/bible";
import { useAperio } from "@/lib/aperio-store";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/read/")({
  head: () => ({ meta: [{ title: "Read — Aperio" }] }),
  component: ReadIndex,
});

function ReadIndex() {
  const { lastRead } = useAperio();
  const ot = BOOKS.filter((b) => b.testament === "OT");
  const nt = BOOKS.filter((b) => b.testament === "NT");

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-serif text-3xl">Read the Bible</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a book to begin.</p>

        <Link to="/read/$book/$chapter" params={{ book: lastRead.book, chapter: String(lastRead.chapter) }}
          className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-navy p-5 text-[var(--cream)] shadow-cathedral">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-soft)]/80">Continue reading</p>
            <p className="mt-1 font-serif text-xl">{lastRead.book} {lastRead.chapter}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[var(--gold)]" />
        </Link>

        <Section title="New Testament" books={nt} />
        <Section title="Old Testament" books={ot} />
      </div>
    </AppShell>
  );
}

function Section({ title, books }: { title: string; books: readonly { name: string; chapters: number }[] }) {
  return (
    <section className="mt-8">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {books.map((b) => (
          <Link key={b.name} to="/read/$book/$chapter" params={{ book: b.name, chapter: "1" }}
            className="rounded-xl border border-border bg-card px-4 py-3 transition hover:border-[var(--gold)]/40">
            <p className="font-serif text-base">{b.name}</p>
            <p className="text-xs text-muted-foreground">{b.chapters} ch</p>
          </Link>
        ))}
      </div>
    </section>
  );
}