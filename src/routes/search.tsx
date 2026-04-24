import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppShell } from "@/components/aperio/AppShell";
import { Search as SearchIcon, KeyRound, Loader2 } from "lucide-react";
import { useAperio } from "@/lib/aperio-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Aperio" }] }),
  component: SearchPage,
});

const FILTERS = ["All", "Verses", "Notes", "Prayers"] as const;

type Passage = { book: string; chapter: number; verse: string; ref: string; text: string; why: string };
type ClavisResult = { answer: string; passages: Passage[] };

export function SearchPage() {
  const { prayers, notes } = useAperio();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [clavis, setClavis] = useState<ClavisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    const term = q.trim();
    if (!term) { setClavis(null); setError(null); setLoading(false); return; }
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    const t = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke("clavis-search", { body: { query: term } });
        if (id !== reqId.current) return;
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setClavis(data as ClavisResult);
      } catch (e) {
        if (id !== reqId.current) return;
        setError(e instanceof Error ? e.message : "Clavis could not respond.");
        setClavis(null);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [q]);

  const passages = clavis?.passages ?? [];

  const noteHits = useMemo(() =>
    !q.trim() ? [] : Object.entries(notes).filter(([_, v]) => v.toLowerCase().includes(q.toLowerCase())),
    [q, notes]
  );
  const prayerHits = useMemo(() =>
    !q.trim() ? [] : prayers.filter((p) => p.text.toLowerCase().includes(q.toLowerCase())),
    [q, prayers]
  );

  const showCl = q.trim().length > 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-serif text-3xl">Search the Word</h1>

        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
          <SearchIcon className="h-4 w-4 text-[var(--gold-deep)]" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Ask Clavis anything — themes, words, questions…"
            className="w-full bg-transparent text-sm focus:outline-none" />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs transition ${filter === f ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold-deep)]" : "border-border text-muted-foreground hover:border-[var(--gold)]/40"}`}
            >{f}</button>
          ))}
        </div>

        {!q.trim() && (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Clavis recommends exploring</p>
            <div className="mt-3 grid gap-2">
              {["The Hebrew concept of Shalom", "Paul's theology of suffering", "Prophecies fulfilled by Jesus", "What does it mean to fear the Lord?", "The Greek word agapē"].map((s) => (
                <button key={s} onClick={() => setQ(s)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm hover:border-[var(--gold)]/40">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {showCl && (
          <div className="mt-6 rounded-2xl border border-[var(--gold)]/30 bg-gradient-to-br from-[var(--gold)]/10 to-transparent p-5">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[var(--gold-deep)]" />
              <p className="text-xs uppercase tracking-wider text-[var(--gold-deep)]">Clavis says</p>
              {loading && <Loader2 className="ml-1 h-3 w-3 animate-spin text-[var(--gold-deep)]" />}
            </div>
            {loading && !clavis && (
              <p className="mt-3 text-sm italic text-muted-foreground">Searching the Word…</p>
            )}
            {error && (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            )}
            {clavis && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                {linkifyRefs(clavis.answer)}
              </p>
            )}
          </div>
        )}

        {(filter === "All" || filter === "Verses") && passages.length > 0 && (
          <section className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{passages.length} passage{passages.length === 1 ? "" : "s"}</p>
            {passages.map((r) => (
              <Link key={r.ref} to="/read/$book/$chapter" params={{ book: r.book, chapter: String(r.chapter) }}
                className="block rounded-2xl border border-border border-l-4 border-l-[var(--gold)] bg-card p-4 hover:border-[var(--gold)]/50">
                <p className="text-xs uppercase tracking-wider text-[var(--gold-deep)]">{r.ref}</p>
                <p className="scripture mt-1 text-base text-foreground/90">"{r.text}"</p>
                {r.why && <p className="mt-2 text-xs italic text-muted-foreground">{r.why}</p>}
              </Link>
            ))}
          </section>
        )}

        {(filter === "All" || filter === "Notes") && noteHits.length > 0 && (
          <section className="mt-6 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">In your notes</p>
            {noteHits.map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-[var(--gold-deep)]">{k}</p>
                <p className="mt-1 text-sm">{v}</p>
              </div>
            ))}
          </section>
        )}

        {(filter === "All" || filter === "Prayers") && prayerHits.length > 0 && (
          <section className="mt-6 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">In your prayers</p>
            {prayerHits.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-[var(--gold-deep)]">{p.category}</p>
                <p className="mt-1 text-sm">{p.text}</p>
              </div>
            ))}
          </section>
        )}

        {showCl && !loading && !error && clavis && passages.length === 0 && noteHits.length === 0 && prayerHits.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">No passages found. Try rephrasing your question.</p>
        )}
      </div>
    </AppShell>
  );
}

// Match references like "John 3:16", "Romans 8", "1 Corinthians 13:4-7"
const REF_REGEX =
  /\b((?:[123]\s+)?(?:[A-Z][a-z]+(?:\s[A-Z][a-z]+)?))\s+(\d+)(?::\d+(?:-\d+)?)?\b/g;

function linkifyRefs(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  REF_REGEX.lastIndex = 0;
  while ((match = REF_REGEX.exec(text)) !== null) {
    const [full, book, chapter] = match;
    const start = match.index;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    nodes.push(
      <Link
        key={`${start}-${full}`}
        to="/read/$book/$chapter"
        params={{ book, chapter }}
        className="font-medium text-[var(--gold-deep)] underline decoration-[var(--gold)]/40 underline-offset-2 hover:decoration-[var(--gold)]"
      >
        {full}
      </Link>,
    );
    lastIndex = start + full.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}
