import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface TaggedWord {
  word: string;
  strongs: string;
  original: string;
  translit: string;
  language: "Greek" | "Hebrew" | "";
  gloss: string;
}

export function StrongsVerse({ book, chapter, verse, text }: { book: string; chapter: number; verse: number; text: string }) {
  const [active, setActive] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["strongs", book, chapter, verse],
    staleTime: 1000 * 60 * 60 * 24 * 7,
    gcTime: 1000 * 60 * 60 * 24 * 30,
    retry: 0,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("strongs", {
        body: { book, chapter, verse, text },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.words as TaggedWord[];
    },
  });

  if (isLoading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Tagging original-language words…
      </div>
    );
  }
  if (error || !data) {
    return <p className="mt-3 text-xs text-muted-foreground">{(error as Error)?.message ?? "Couldn't load Strong's tags."}</p>;
  }

  // Align tagged words back to verse text by greedy match
  const lower = text.toLowerCase();
  const used = new Array(text.length).fill(false);
  const positions: Array<{ start: number; end: number; tag: TaggedWord }> = [];
  let cursor = 0;
  for (const tag of data) {
    const w = tag.word.toLowerCase();
    const idx = lower.indexOf(w, cursor);
    if (idx === -1) continue;
    if (used.slice(idx, idx + w.length).some(Boolean)) continue;
    for (let i = idx; i < idx + w.length; i++) used[i] = true;
    positions.push({ start: idx, end: idx + w.length, tag });
    cursor = idx + w.length;
  }
  positions.sort((a, b) => a.start - b.start);

  const segments: React.ReactNode[] = [];
  let pos = 0;
  positions.forEach((p, i) => {
    if (p.start > pos) segments.push(text.slice(pos, p.start));
    const isActive = active === i;
    segments.push(
      <button
        key={`w-${i}`}
        type="button"
        onClick={(e) => { e.stopPropagation(); setActive(isActive ? null : i); }}
        className={`inline relative cursor-pointer underline decoration-dotted decoration-[var(--gold-deep)]/50 underline-offset-4 transition-colors ${isActive ? "bg-[var(--gold)]/20 text-[var(--gold-deep)]" : "hover:bg-[var(--gold)]/10"}`}
      >
        {text.slice(p.start, p.end)}
      </button>
    );
    pos = p.end;
  });
  if (pos < text.length) segments.push(text.slice(pos));

  const activeTag = active !== null ? positions[active]?.tag : null;

  return (
    <div className="mt-3 rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-4">
      <p className="text-[10px] uppercase tracking-wider text-[var(--gold-deep)]">Strong's tags · v.{verse}</p>
      <p className="scripture mt-2 text-base leading-relaxed text-foreground">{segments}</p>
      {activeTag && (
        <div className="mt-3 rounded-xl border border-border bg-card p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-serif text-lg">
              {activeTag.original || activeTag.word}{" "}
              <span className="text-sm text-muted-foreground">{activeTag.translit}</span>
            </p>
            <span className="text-[10px] uppercase tracking-wider text-[var(--gold-deep)]">
              {activeTag.language}{activeTag.strongs ? ` · ${activeTag.strongs}` : ""}
            </span>
          </div>
          <p className="mt-1 text-xs italic text-muted-foreground">"{activeTag.word}"</p>
          <p className="mt-2 text-sm text-foreground/85">{activeTag.gloss}</p>
        </div>
      )}
    </div>
  );
}
