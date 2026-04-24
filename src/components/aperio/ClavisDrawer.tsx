import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, X, BookOpen, Languages, Link2, ScrollText, NotebookPen } from "lucide-react";
import { getCommentary, toneIntro } from "@/data/clavis";
import { setNote, useAperio } from "@/lib/aperio-store";

type DrawerState = "closed" | "peek" | "split" | "full";

const HEIGHTS: Record<DrawerState, string> = {
  closed: "0vh",
  peek: "22vh",
  split: "55vh",
  full: "92vh",
};

const TABS = [
  { id: "commentary", label: "Commentary", icon: BookOpen },
  { id: "lexicon", label: "Lexicon", icon: Languages },
  { id: "cross", label: "Cross Refs", icon: Link2 },
  { id: "manuscript", label: "Manuscript", icon: ScrollText },
  { id: "notes", label: "My Notes", icon: NotebookPen },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ClavisDrawer({
  state,
  setState,
  book,
  chapter,
  selectedVerse,
}: {
  state: DrawerState;
  setState: (s: DrawerState) => void;
  book: string;
  chapter: number;
  selectedVerse: number | null;
}) {
  const { profile, notes } = useAperio();
  const [tab, setTab] = useState<TabId>("commentary");
  const commentary = getCommentary(book, chapter);
  const noteKey = `${book} ${chapter}${selectedVerse ? `:${selectedVerse}` : ""}`;
  const [draftNote, setDraftNote] = useState(notes[noteKey] ?? "");

  useEffect(() => {
    setDraftNote(notes[noteKey] ?? "");
  }, [noteKey, notes]);

  const dragRef = useRef<{ startY: number; startState: DrawerState } | null>(null);

  const cycleUp = () => setState(state === "peek" ? "split" : state === "split" ? "full" : state);
  const cycleDown = () => setState(state === "full" ? "split" : state === "split" ? "peek" : "closed");

  return (
    <>
      {state !== "closed" && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-3xl rounded-t-3xl border-t border-[var(--gold)]/30 bg-[var(--navy)] text-[var(--cream)] shadow-cathedral transition-[height] duration-300 ease-out"
          style={{ height: HEIGHTS[state] }}
        >
          {/* Drag handle */}
          <div
            className="flex items-center justify-center pt-2 pb-1 cursor-grab"
            onPointerDown={(e) => {
              dragRef.current = { startY: e.clientY, startState: state };
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!dragRef.current) return;
              const dy = dragRef.current.startY - e.clientY;
              if (dy > 60) {
                setState(dragRef.current.startState === "peek" ? "split" : "full");
                dragRef.current = null;
              } else if (dy < -60) {
                const next = dragRef.current.startState === "full" ? "split" : dragRef.current.startState === "split" ? "peek" : "closed";
                setState(next);
                dragRef.current = null;
              }
            }}
            onPointerUp={() => { dragRef.current = null; }}
          >
            <div className="h-1.5 w-12 rounded-full bg-white/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-soft)]/80">{toneIntro(profile.clavisTone)}</span>
              <span className="text-[10px] text-white/40">·</span>
              <span className="text-[10px] text-white/60">{book} {chapter}{selectedVerse ? `:${selectedVerse}` : ""}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={cycleDown} className="rounded-full p-1.5 hover:bg-white/10"><ChevronDown className="h-4 w-4" /></button>
              <button onClick={cycleUp} className="rounded-full p-1.5 hover:bg-white/10"><ChevronUp className="h-4 w-4" /></button>
              <button onClick={() => setState("closed")} className="rounded-full p-1.5 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/10 px-2">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((t) => {
                const active = tab === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-xs transition ${active ? "border-b-2 border-[var(--gold)] text-[var(--gold)]" : "border-b-2 border-transparent text-white/60 hover:text-white"}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-5 py-5" style={{ height: `calc(${HEIGHTS[state]} - 7rem)` }}>
            {tab === "commentary" && (
              <div className="space-y-5">
                <Section title="Overview">{commentary.overview}</Section>
                <Section title="Theological Significance">{commentary.theology}</Section>
                <Section title="Historical & Cultural Context">{commentary.context}</Section>
                <Section title="Application">{commentary.application}</Section>
              </div>
            )}
            {tab === "lexicon" && (
              <div className="space-y-4">
                {commentary.lexicon.map((l) => (
                  <div key={l.strongs} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-baseline justify-between">
                      <p className="font-serif text-lg">{l.original} <span className="text-sm text-white/50">{l.translit}</span></p>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--gold-soft)]">{l.language} · {l.strongs}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/60">"{l.word}" — {l.occurrences.toLocaleString()} occurrences</p>
                    <p className="mt-3 text-sm text-white/85">{l.definition}</p>
                    <p className="mt-2 text-sm italic text-white/65">{l.usage}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === "cross" && (
              <div className="space-y-3">
                {commentary.crossRefs.map((c) => (
                  <div key={c.ref} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wider text-[var(--gold-soft)]">{c.ref}</p>
                    <p className="scripture mt-2 text-base text-white/90">"{c.text}"</p>
                    <p className="mt-2 text-xs italic text-white/60">Why: {c.why}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === "manuscript" && (
              <div className="space-y-5">
                <Section title="Tradition">{commentary.manuscript.tradition}</Section>
                <Section title="Notable Variants">{commentary.manuscript.variants}</Section>
                <Section title="Transmission">{commentary.manuscript.transmission}</Section>
              </div>
            )}
            {tab === "notes" && (
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--gold-soft)]">{noteKey}</p>
                <textarea
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  onBlur={() => setNote(noteKey, draftNote)}
                  placeholder={selectedVerse ? "Your annotation on this verse..." : "Notes on this chapter..."}
                  className="mt-3 min-h-[40vh] w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 font-serif text-base text-white placeholder:text-white/40 focus:border-[var(--gold)]/40 focus:outline-none"
                />
                <p className="mt-2 text-[10px] text-white/40">Saved automatically. Private to you.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold-soft)]/80">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/85">{children}</p>
    </div>
  );
}