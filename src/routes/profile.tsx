import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/aperio/AppShell";
import { resetAll, signOut, useAperio } from "@/lib/aperio-store";
import { Sparkles, LogOut, Trash2 } from "lucide-react";
import { deleteMyAccount } from "@/server/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Aperio" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, prayers, bookmarks, notes, streak, longestStreak, totalDays, clavisSessions, minutesToday } = useAperio();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const memberSince = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";
  const goal = profile.dailyMinutes;
  const pct = Math.min(100, (minutesToday / goal) * 100);
  const answered = prayers.filter((p) => p.status === "answered");

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-5 py-8">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-navy p-6 text-[var(--cream)] shadow-cathedral">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold font-serif text-2xl text-[var(--navy-deep)]">
              {(profile.firstName[0] || "A").toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif text-2xl">{profile.firstName} {profile.lastName}</h1>
              <p className="text-xs text-[var(--cream)]/60">Aperio member since {memberSince}</p>
              <p className="mt-1 text-xs text-[var(--cream)]/60">{profile.denomination || "—"} · {profile.translation}</p>
            </div>
          </div>
        </div>

        {/* Daily goals */}
        <section className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Reading goal</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-16 w-16">
                <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                  <circle cx="18" cy="18" r="15" stroke="oklch(0.88 0.02 85)" strokeWidth="3" fill="none" />
                  <circle cx="18" cy="18" r="15" stroke="oklch(0.78 0.13 78)" strokeWidth="3" fill="none"
                    strokeDasharray={`${(pct / 100) * 94.25} 94.25`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{Math.round(pct)}%</span>
              </div>
              <div className="text-sm">
                <p>{minutesToday} / {goal} min</p>
                <p className="text-xs text-muted-foreground">🔥 {streak} day streak</p>
                <p className="text-xs text-muted-foreground">⚡ {longestStreak} longest</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Prayer today</p>
            <p className="mt-4 font-serif text-2xl">{prayers.filter((p) => new Date(p.date).toDateString() === new Date().toDateString()).length}</p>
            <p className="text-xs text-muted-foreground">prayers logged</p>
          </div>
        </section>

        {/* Journey stats */}
        <section className="mt-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">My journey</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="Days in the Word" value={totalDays} icon="📖" />
            <Stat label="Prayers logged" value={prayers.length} icon="🙏" />
            <Stat label="Prayers answered" value={answered.length} icon="✅" />
            <Stat label="Verses bookmarked" value={bookmarks.length} icon="🔖" />
            <Stat label="Personal notes" value={Object.keys(notes).length} icon="🖊️" />
            <Stat label="Clavis sessions" value={clavisSessions} icon="🔑" />
          </div>
        </section>

        {/* Clavis profile */}
        <section className="mt-6 rounded-2xl border border-[var(--gold)]/30 bg-gradient-to-br from-[var(--gold)]/8 to-transparent p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--gold-deep)]" />
            <p className="text-xs uppercase tracking-wider text-[var(--gold-deep)]">My Clavis profile</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Based on your reading and prayer patterns, Clavis has noticed:</p>
          <ul className="mt-3 space-y-2 text-sm">
            {clavisInsights({ profile, prayers, totalDays, clavisSessions }).map((i) => (
              <li key={i} className="flex gap-2"><span className="text-[var(--gold-deep)]">•</span>{i}</li>
            ))}
          </ul>
        </section>

        {/* Book of Remembrance */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Book of Remembrance</p>
          <p className="mt-2 font-serif text-lg">
            {answered.length} {answered.length === 1 ? "time" : "times"} God has moved on your behalf.
          </p>
          {answered.length > 0 && (
            <div className="mt-3 space-y-2">
              {answered.slice(0, 3).map((p) => (
                <div key={p.id} className="rounded-xl bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()} · {p.category}</p>
                  <p className="mt-1 text-sm italic">"{p.answeredText}"</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 font-serif italic text-xs text-muted-foreground">"These stones are your memorial." — Joshua 4:7</p>
        </section>

        {/* Preferences */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Preferences</p>
          <dl className="mt-3 grid gap-2 text-sm">
            <Row k="Gender" v={profile.gender || "—"} />
            <Row k="Location" v={[profile.city, profile.state, profile.country].filter(Boolean).join(", ") || "—"} />
            <Row k="Profession" v={profile.profession || "—"} />
            <Row k="Translation" v={profile.translation} />
            <Row k="Clavis tone" v={profile.clavisTone} />
            <Row k="Daily goal" v={`${profile.dailyMinutes} minutes`} />
          </dl>
        </section>

        {/* Support placeholder */}
        <section className="mt-6 rounded-2xl border border-dashed border-border p-5 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Coming soon</p>
          <p className="mt-2 font-serif text-base">Support the Mission</p>
          <p className="mt-1 text-xs text-muted-foreground">Help keep Aperio free for every believer worldwide.</p>
        </section>

        <button
          onClick={() => { if (confirm("Reset all Aperio data?")) { void resetAll().then(() => navigate({ to: "/onboarding" })); } }}
          className="mt-6 w-full rounded-xl border border-border py-3 text-xs text-muted-foreground hover:text-destructive">
          Reset Aperio data
        </button>

        <button
          onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-xs text-muted-foreground hover:text-foreground">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>

        <button
          disabled={deleting}
          onClick={async () => {
            const ok = confirm(
              "Permanently delete your Aperio account?\n\nThis removes your profile, prayers, notes, and bookmarks. This cannot be undone."
            );
            if (!ok) return;
            const sure = confirm("Are you absolutely sure? This is permanent.");
            if (!sure) return;
            setDeleting(true);
            try {
              await deleteMyAccount();
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            } catch (e) {
              alert("Could not delete account: " + (e instanceof Error ? e.message : String(e)));
              setDeleting(false);
            }
          }}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 py-3 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50">
          <Trash2 className="h-3.5 w-3.5" /> {deleting ? "Deleting…" : "Delete account"}
        </button>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-base">{icon}</p>
      <p className="mt-1 font-serif text-xl">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-1.5 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="text-sm">{v}</dd>
    </div>
  );
}

function clavisInsights({ profile, prayers, totalDays, clavisSessions }: {
  profile: ReturnType<typeof useAperio>["profile"];
  prayers: ReturnType<typeof useAperio>["prayers"];
  totalDays: number;
  clavisSessions: number;
}) {
  const out: string[] = [];
  if (profile.topics?.length) out.push(`You gravitate toward ${profile.topics.slice(0, 2).join(" and ")}.`);
  if (clavisSessions > 0) out.push(`You've opened Clavis ${clavisSessions} time${clavisSessions === 1 ? "" : "s"} — depth is becoming a habit.`);
  if (prayers.length > 0) {
    const counts: Record<string, number> = {};
    prayers.forEach((p) => (counts[p.category] = (counts[p.category] ?? 0) + 1));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (top) out.push(`${top} is your most common prayer category.`);
  }
  if (totalDays > 0) out.push(`You've spent ${totalDays} day${totalDays === 1 ? "" : "s"} in the Word with Aperio.`);
  out.push("Clavis recommends: The Book of Hebrews — based on your interests in the New Testament.");
  return out;
}
