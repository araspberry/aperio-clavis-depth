import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/aperio/AppShell";
import { addPrayer, updatePrayer, useAperio, type PrayerEntry } from "@/lib/aperio-store";
import { Heart, Shield, Cross, Users, Briefcase, Coins, Globe, Sprout, HandHeart, BookOpen, MoreHorizontal, Check, Sparkles } from "lucide-react";

const CATEGORIES = [
  { id: "Gratitude", icon: Heart },
  { id: "Protection", icon: Shield },
  { id: "Healing", icon: Cross },
  { id: "Relationships", icon: Users },
  { id: "Career & Purpose", icon: Briefcase },
  { id: "Provision", icon: Coins },
  { id: "Nations & Leaders", icon: Globe },
  { id: "Spiritual Growth", icon: Sprout },
  { id: "Intercession", icon: HandHeart },
  { id: "Revelation", icon: BookOpen },
  { id: "Other", icon: MoreHorizontal },
] as const;

export const Route = createFileRoute("/prayer")({
  head: () => ({ meta: [{ title: "Prayer Journal — Aperio" }] }),
  component: PrayerPage,
});

function PrayerPage() {
  const { prayers, profile } = useAperio();
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Gratitude");
  const [forWhom, setForWhom] = useState("");

  const save = () => {
    if (!text.trim()) return;
    addPrayer({
      text: text.trim(),
      category,
      status: "praying",
      forWhom: category === "Intercession" ? forWhom : undefined,
    });
    setText("");
    setForWhom("");
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const streak = computePrayerStreak(prayers);

  return (
    <AppShell>
      <div className="min-h-screen bg-[var(--navy-deep)] text-[var(--cream)]">
        <div className="mx-auto max-w-2xl px-5 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl">Prayer Journal</h1>
              <p className="mt-1 text-xs text-[var(--cream)]/50">{today}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl">🔥 {streak}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--cream)]/50">days of prayer</p>
            </div>
          </div>

          <p className="mt-6 border-l-2 border-[var(--gold)]/40 pl-4 font-serif italic text-[var(--cream)]/70">
            "Be anxious for nothing, but in everything by prayer and supplication..." — Philippians 4:6
          </p>

          {/* Today's prayer */}
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--gold-soft)]">Today's prayer</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`What's on your heart today, ${profile.firstName || "friend"}?`}
              className="mt-3 min-h-[180px] w-full resize-none rounded-xl bg-transparent font-serif text-lg leading-relaxed text-white placeholder:text-white/35 focus:outline-none"
            />

            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--cream)]/50">Tag a category</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const active = category === c.id;
                  return (
                    <button key={c.id} onClick={() => setCategory(c.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${active ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold-soft)]" : "border-white/15 text-white/70 hover:border-white/30"}`}
                    >
                      <Icon className="h-3 w-3" /> {c.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {category === "Intercession" && (
              <input
                value={forWhom}
                onChange={(e) => setForWhom(e.target.value)}
                placeholder="Who are you praying for?"
                className="mt-3 w-full rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[var(--gold)]/40 focus:outline-none"
              />
            )}

            <div className="mt-4 flex items-center justify-between">
              <p className="text-[10px] text-white/40">🔒 Private — for you alone.</p>
              <button
                onClick={save}
                disabled={!text.trim()}
                className="rounded-full bg-gradient-gold px-5 py-2 text-xs font-semibold text-[var(--navy-deep)] shadow-gold disabled:opacity-30"
              >
                Save Prayer
              </button>
            </div>
          </section>

          {/* History */}
          <section className="mt-8 pb-8">
            <p className="text-xs uppercase tracking-wider text-[var(--cream)]/50">Prayer history</p>
            {prayers.length === 0 ? (
              <p className="mt-3 text-sm text-white/40">Your prayers will appear here.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {prayers.map((p) => <PrayerCard key={p.id} p={p} />)}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function PrayerCard({ p }: { p: PrayerEntry }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [answer, setAnswer] = useState(p.answeredText ?? "");
  const date = new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const statusIcon = p.status === "answered" ? "✅" : p.status === "in_progress" ? "🌱" : "🕊️";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/50">
          <span>{date}</span>·<span>{p.category}</span>{p.forWhom && <><span>·</span><span>for {p.forWhom}</span></>}
        </div>
        <span className="text-sm">{statusIcon}</span>
      </div>
      <p className="scripture mt-2 text-sm text-white/85">{p.text}</p>

      {p.status === "answered" && p.answeredText && (
        <div className="mt-3 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-3">
          <p className="text-[10px] uppercase tracking-wider text-[var(--gold-soft)]">What God did</p>
          <p className="mt-1 text-sm italic text-white/85">{p.answeredText}</p>
        </div>
      )}

      {p.status !== "answered" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setShowAnswer((s) => !s)}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/40 px-3 py-1 text-[10px] uppercase tracking-wider text-[var(--gold-soft)]"
          ><Sparkles className="h-3 w-3" /> Mark as answered</button>
        </div>
      )}

      {showAnswer && (
        <div className="mt-3 space-y-2 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-3">
          <p className="text-xs italic text-[var(--gold-soft)]">"This prayer has been answered. Would you like to write what God did?"</p>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your testimony..."
            className="min-h-[80px] w-full resize-none rounded-lg bg-white/5 p-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            onClick={() => {
              updatePrayer(p.id, { status: "answered", answeredText: answer, answeredDate: new Date().toISOString() });
              setShowAnswer(false);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-gold px-3 py-1 text-[10px] font-semibold text-[var(--navy-deep)]"
          ><Check className="h-3 w-3" /> Add to Book of Remembrance</button>
        </div>
      )}
    </div>
  );
}

function computePrayerStreak(prayers: PrayerEntry[]): number {
  if (prayers.length === 0) return 0;
  const days = new Set(prayers.map((p) => new Date(p.date).toDateString()));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}