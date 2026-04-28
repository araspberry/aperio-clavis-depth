import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/aperio/AppShell";
import { AperioMark } from "@/components/aperio/AperioMark";
import { useAperio } from "@/lib/aperio-store";
import { SCRIPTURE_OF_DAY } from "@/data/bible";
import { Bell, Settings, Share2, KeyRound, BookOpen, Sparkles } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Aperio" },
      { name: "description", content: "Your daily sanctuary in Aperio: scripture of the day, prayer, and reading." },
    ],
  }),
  component: HomePage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Peace to you tonight";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "A quiet evening";
}

function HomePage() {
  const { profile, minutesToday, streak, lastRead } = useAperio();
  const goal = profile.dailyMinutes || 15;
  const pct = Math.min(100, (minutesToday / goal) * 100);

  return (
    <AppShell>
      {/* Top bar */}
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pt-6">
        <AperioMark />
        <div className="flex items-center gap-1 text-muted-foreground">
          <button className="rounded-full p-2 hover:bg-secondary"><Bell className="h-4 w-4" /></button>
          <Link to="/profile" className="rounded-full p-2 hover:bg-secondary"><Settings className="h-4 w-4" /></Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 pt-6">
        <p className="text-sm text-muted-foreground">
          {greeting()}, <span className="text-foreground">{profile.firstName || "friend"}</span>.
        </p>

        {/* Scripture of the day */}
        <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-navy p-7 text-[var(--cream)] shadow-cathedral">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-soft)]/80">Scripture of the day</span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--cream)]/50">{SCRIPTURE_OF_DAY.translation}</span>
          </div>
          <p className="scripture mt-5 text-2xl leading-relaxed">
            "{SCRIPTURE_OF_DAY.text}"
          </p>
          <p className="mt-4 font-serif italic text-[var(--gold-soft)]">— {SCRIPTURE_OF_DAY.ref}</p>
          <div className="mt-6 flex gap-2">
            <Link to="/read/$book/$chapter" params={{ book: "Philippians", chapter: "4" }}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-xs font-semibold text-[var(--navy-deep)] hover:opacity-90">
              <KeyRound className="h-3.5 w-3.5" /> Open in Clavis
            </Link>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-[var(--cream)] hover:bg-white/5">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
        </section>

        {/* Daily goal */}
        <section className="mt-5 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Daily goal</p>
              <p className="mt-1 font-serif text-lg">
                {minutesToday} / {goal} min today
              </p>
            </div>
            <div className="relative h-14 w-14">
              <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                <circle cx="18" cy="18" r="15" stroke="oklch(0.88 0.02 85)" strokeWidth="3" fill="none" />
                <circle cx="18" cy="18" r="15" stroke="oklch(0.78 0.13 78)" strokeWidth="3" fill="none"
                  strokeDasharray={`${(pct / 100) * 94.25} 94.25`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
                {Math.round(pct)}%
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            🔥 {streak} day{streak === 1 ? "" : "s"} streak
          </p>
        </section>

        {/* Prayer prompt */}
        <Link to="/prayer" className="mt-4 block rounded-2xl border border-border bg-card p-5 transition hover:border-[var(--gold)]/40">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Prayer journal</p>
          <p className="mt-2 font-serif text-lg">
            What's on your heart today, <span className="text-[var(--gold-deep)]">{profile.firstName || "friend"}</span>?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Tap to write today's prayer →</p>
        </Link>

        {/* Read */}
        <section className="mt-4 grid grid-cols-2 gap-3">
          <Link to="/read/$book/$chapter" params={{ book: lastRead.book, chapter: String(lastRead.chapter) }}
            className="rounded-2xl border border-border bg-card p-5 transition hover:border-[var(--gold)]/40">
            <BookOpen className="h-5 w-5 text-[var(--gold-deep)]" />
            <p className="mt-3 font-serif text-base">Continue reading</p>
            <p className="text-xs text-muted-foreground">{lastRead.book} {lastRead.chapter}</p>
          </Link>
          <Link to="/read"
            className="rounded-2xl border border-border bg-card p-5 transition hover:border-[var(--gold)]/40">
            <Sparkles className="h-5 w-5 text-[var(--gold-deep)]" />
            <p className="mt-3 font-serif text-base">Start something new</p>
            <p className="text-xs text-muted-foreground">Choose a book</p>
          </Link>
        </section>

        {/* Recommended */}
        <section className="mt-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Clavis recommends</p>
          <div className="mt-3 grid gap-3">
            <PlanCard title="The Gospel of John" desc="A 21-day journey through John, with Clavis unlocking every chapter." book="John" chapter={1} />
            <PlanCard title="Romans — A Deep Dive" desc="Paul's theological masterpiece, verse by verse." book="Romans" chapter={8} />
            <PlanCard title="30 Days in the Psalms" desc="Hebrew poetry, prayer, and the heart of God." book="Psalms" chapter={23} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function PlanCard({ title, desc, book, chapter }: { title: string; desc: string; book: string; chapter: number }) {
  return (
    <Link to="/read/$book/$chapter" params={{ book, chapter: String(chapter) }}
      className="flex items-stretch gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-[var(--gold)]/40">
      <div className="w-1 shrink-0 rounded-full bg-gradient-gold" />
      <div className="py-0.5">
        <p className="font-serif text-base">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}