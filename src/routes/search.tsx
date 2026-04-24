import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { AppShell } from "@/components/aperio/AppShell";
import { Search as SearchIcon, KeyRound } from "lucide-react";
import { useAperio } from "@/lib/aperio-store";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Aperio" }] }),
  component: SearchPage,
});

const FILTERS = ["All", "Verses", "Topics", "Words", "Notes", "Prayers"] as const;

const VERSE_INDEX: { ref: string; text: string; book: string; chapter: number; tags: string[] }[] = [
  { ref: "John 1:1", text: "In the beginning was the Word, and the Word was with God, and the Word was God.", book: "John", chapter: 1, tags: ["word","logos","beginning","creation"] },
  { ref: "John 3:16", text: "For God so loved the world, that he gave his only Son...", book: "John", chapter: 3, tags: ["love","agape","salvation","gospel"] },
  { ref: "Romans 8:1", text: "There is therefore now no condemnation for those who are in Christ Jesus.", book: "Romans", chapter: 8, tags: ["condemnation","grace","freedom"] },
  { ref: "Romans 8:28", text: "And we know that for those who love God all things work together for good...", book: "Romans", chapter: 8, tags: ["good","providence","love","suffering"] },
  { ref: "Romans 8:38-39", text: "Neither death nor life... will be able to separate us from the love of God in Christ Jesus.", book: "Romans", chapter: 8, tags: ["love","fear","hope","abandon"] },
  { ref: "Psalms 23:1", text: "The LORD is my shepherd; I shall not want.", book: "Psalms", chapter: 23, tags: ["shepherd","provision","trust"] },
  { ref: "Psalms 23:4", text: "Even though I walk through the valley of the shadow of death, I will fear no evil...", book: "Psalms", chapter: 23, tags: ["fear","death","comfort","hope"] },
  { ref: "Philippians 4:6", text: "Do not be anxious about anything, but in everything by prayer...", book: "Philippians", chapter: 4, tags: ["anxiety","prayer","peace"] },
  { ref: "Philippians 4:13", text: "I can do all things through him who strengthens me.", book: "Philippians", chapter: 4, tags: ["strength","perseverance"] },
  { ref: "Genesis 1:1", text: "In the beginning, God created the heavens and the earth.", book: "Genesis", chapter: 1, tags: ["creation","beginning"] },
];

export function SearchPage() {
  const { prayers, notes } = useAperio();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const results = useMemo(() => {
    if (!q.trim()) return [] as typeof VERSE_INDEX;
    const needle = q.toLowerCase();
    return VERSE_INDEX.filter(
      (v) => v.text.toLowerCase().includes(needle) || v.tags.some((t) => t.includes(needle)) || v.ref.toLowerCase().includes(needle)
    );
  }, [q]);

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
            placeholder="Search verses, words, themes, your notes..."
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
              {["The Hebrew concept of Shalom", "Paul's theology of suffering", "Prophecies fulfilled by Jesus"].map((s) => (
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
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {linkifyRefs(clavisAnswer(q, results.length))}
            </p>
          </div>
        )}

        {(filter === "All" || filter === "Verses" || filter === "Topics" || filter === "Words") && results.length > 0 && (
          <section className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{results.length} passage{results.length === 1 ? "" : "s"}</p>
            {results.map((r) => (
              <Link key={r.ref} to="/read/$book/$chapter" params={{ book: r.book, chapter: String(r.chapter) }}
                className="block rounded-2xl border border-border border-l-4 border-l-[var(--gold)] bg-card p-4 hover:border-[var(--gold)]/50">
                <p className="text-xs uppercase tracking-wider text-[var(--gold-deep)]">{r.ref}</p>
                <p className="scripture mt-1 text-base text-foreground/90">"{r.text}"</p>
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

        {showCl && results.length === 0 && noteHits.length === 0 && prayerHits.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">No exact matches yet. Try a theme or a Greek/Hebrew word.</p>
        )}
      </div>
    </AppShell>
  );
}

function clavisAnswer(q: string, count: number) {
  const lower = q.toLowerCase();
  if (lower.includes("agape") || lower.includes("love")) {
    return "In the New Testament, the English word 'love' translates three distinct Greek terms — agapē (G26, self-giving covenant love), phileo (G5368, friendship love), and storgē (familial affection). Agapē is the love of choice, not feeling — the love God shows toward us in Christ.";
  }
  if (lower.includes("shalom")) {
    return "Shalom (שָׁלוֹם, H7965) is the Hebrew concept of complete wholeness — peace not as the absence of conflict but as the presence of every good thing. It is what creation looked like before the fall and what the kingdom of God restores.";
  }
  if (lower.includes("afraid") || lower.includes("fear") || lower.includes("anxious")) {
    return "Scripture answers fear not by denying its weight but by turning the gaze. Psalm 23, Lamentations 3, Romans 8, and Philippians 4 all model the same movement — name what you fear, then look at the One who is larger than it.";
  }
  if (lower.includes("suffer")) {
    return "Paul's theology of suffering treats it not as punishment but as participation — being conformed to Christ. See Romans 5, Romans 8, 2 Corinthians 1, and Philippians 3:10.";
  }
  return `Found ${count} passage${count === 1 ? "" : "s"} matching your search. Tap any verse to read it in context with full Clavis commentary.`;
}

// Match references like "John 3:16", "Romans 8", "1 Corinthians 13:4-7", "Philippians 3:10",
// "2 Corinthians 1". Optional leading number for books like 1/2/3 John, Kings, etc.
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