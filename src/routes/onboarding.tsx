import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AperioMark } from "@/components/aperio/AperioMark";
import { setProfile, useAperio } from "@/lib/aperio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome to Aperio" }] }),
  component: Onboarding,
});

const TOTAL = 14; // 0..13

function Onboarding() {
  const { profile } = useAperio();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ ...profile });
  const navigate = useNavigate();

  const next = () => setStep((s) => Math.min(TOTAL - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const finish = () => {
    setProfile({ ...draft, onboarded: true, memberSince: new Date().toISOString() });
    navigate({ to: "/home" });
  };

  const update = (p: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...p }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-navy text-[var(--cream)]">
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_70%_20%,oklch(0.78_0.13_78/.3),transparent_60%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-6 py-8">
        {/* Progress */}
        {step > 1 && step < TOTAL - 1 && (
          <div className="mb-8 flex items-center gap-1">
            {Array.from({ length: TOTAL - 2 }).map((_, i) => (
              <div
                key={i}
                className={`h-[2px] flex-1 rounded-full transition-all ${
                  i + 1 < step ? "bg-[var(--gold)]" : "bg-white/15"
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center">
          {step === 0 && <Welcome onNext={next} />}
          {step === 1 && <Promise onNext={next} />}
          {step === 2 && (
            <Screen title="First, let's get to know you." subtitle="Aperio will use your first name personally throughout the experience.">
              <div className="space-y-4">
                <Field label="First name">
                  <Input value={draft.firstName} onChange={(e) => update({ firstName: e.target.value })} className="onboarding-input" />
                </Field>
                <Field label="Last name">
                  <Input value={draft.lastName} onChange={(e) => update({ lastName: e.target.value })} className="onboarding-input" />
                </Field>
              </div>
            </Screen>
          )}
          {step === 3 && (
            <Screen title="Tell us a little about yourself.">
              <div className="space-y-4">
                <Field label="Date of birth">
                  <Input type="date" value={draft.dob} onChange={(e) => update({ dob: e.target.value })} className="onboarding-input" />
                </Field>
                <Field label="Gender">
                  <ChoiceGrid
                    value={draft.gender}
                    onChange={(v) => update({ gender: v })}
                    options={["Male", "Female", "Prefer not to answer"]}
                  />
                </Field>
              </div>
            </Screen>
          )}
          {step === 4 && (
            <Screen title="Where are you in the world?" subtitle="Used to localize scripture events, community features, and future experiences.">
              <div className="space-y-4">
                <Field label="City"><Input value={draft.city} onChange={(e) => update({ city: e.target.value })} className="onboarding-input" /></Field>
                <Field label="State / Region"><Input value={draft.state} onChange={(e) => update({ state: e.target.value })} className="onboarding-input" /></Field>
                <Field label="Country"><Input value={draft.country} onChange={(e) => update({ country: e.target.value })} className="onboarding-input" /></Field>
              </div>
            </Screen>
          )}
          {step === 5 && (
            <Screen title="What does your daily life look like?">
              <ChoiceList
                value={draft.profession}
                onChange={(v) => update({ profession: v })}
                options={["Student", "Ministry / Pastor / Clergy", "Academic / Professor / Researcher", "Business Professional", "Homemaker", "Retired", "Other"]}
              />
            </Screen>
          )}
          {step === 6 && (
            <Screen title="Where do you come from spiritually?" subtitle="No judgment. Every tradition is welcome here.">
              <ChoiceList
                value={draft.denomination}
                onChange={(v) => update({ denomination: v })}
                options={["Non-denominational","Baptist","Catholic","Methodist","Pentecostal / Charismatic","Presbyterian / Reformed","Anglican / Episcopal","Orthodox","New to Faith","Exploring / Not Sure","Other"]}
              />
            </Screen>
          )}
          {step === 7 && (
            <Screen title="What brings you to Aperio?" subtitle="Select all that apply.">
              <MultiList
                value={draft.reasons}
                onChange={(v) => update({ reasons: v })}
                options={["Daily devotional reading","Deep personal Bible study","Academic or theological research","Sermon or teaching preparation","Growing in my faith","Understanding the original languages","I'm just curious"]}
              />
            </Screen>
          )}
          {step === 8 && (
            <Screen title="How would you describe your faith right now?">
              <ChoiceList
                value={draft.journey}
                onChange={(v) => update({ journey: v })}
                options={["I'm just beginning to explore","I'm growing and learning","I've been walking in faith for years","I'm in ministry and study deeply","I'm academic — faith meets scholarship for me"]}
              />
            </Screen>
          )}
          {step === 9 && (
            <Screen title="Which Bible translation feels like home?">
              <ChoiceGrid
                value={draft.translation}
                onChange={(v) => update({ translation: v })}
                options={["NIV","ESV","KJV","NKJV","NLT","NASB","The Message","AMP","CSB","Choose for me"]}
              />
            </Screen>
          )}
          {step === 10 && (
            <Screen title="What topics or books stir something in you?" subtitle="Select all that apply.">
              <MultiList
                value={draft.topics}
                onChange={(v) => update({ topics: v })}
                options={["The Gospels","Paul's Letters","Prophecy & Revelation","Psalms & Wisdom Literature","The Law & Torah","History of Israel","The Early Church","End Times","Prayer & Worship","Faith & Salvation","Leadership & Purpose","Not Sure Yet","Maybe"]}
              />
            </Screen>
          )}
          {step === 11 && (
            <Screen title="How much time are you willing to commit to the Word each day?">
              <ChoiceList
                value={String(draft.dailyMinutes)}
                onChange={(v) => update({ dailyMinutes: Number(v) })}
                options={[
                  { label: "5 to 10 minutes", value: "10" },
                  { label: "15 to 30 minutes", value: "20" },
                  { label: "30 to 60 minutes", value: "45" },
                  { label: "As long as it takes", value: "90" },
                ]}
              />
              <div className="mt-6 rounded-2xl border border-[var(--gold)]/30 bg-white/5 p-5">
                <p className="text-sm text-[var(--cream)]/80">Make this your daily goal?</p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => update({ setDailyGoal: true })}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm transition ${draft.setDailyGoal ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold-soft)]" : "border-white/15 text-white/70"}`}
                  >Yes, set my goal</button>
                  <button
                    onClick={() => update({ setDailyGoal: false })}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm transition ${!draft.setDailyGoal ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold-soft)]" : "border-white/15 text-white/70"}`}
                  >Maybe later</button>
                </div>
              </div>
            </Screen>
          )}
          {step === 12 && (
            <Screen title="How would you like Clavis to speak to you?" subtitle="Clavis is the AI engine inside Aperio. It will unlock every passage you read — automatically.">
              <ChoiceList
                value={draft.clavisTone}
                onChange={(v) => update({ clavisTone: v as typeof draft.clavisTone })}
                options={[
                  { label: "Scholarly — deep, technical, precise", value: "scholarly" },
                  { label: "Devotional — warm, personal, applicable", value: "devotional" },
                  { label: "Balanced — both, depending on the passage", value: "balanced" },
                  { label: "Let Clavis decide based on what I'm reading", value: "auto" },
                ]}
              />
            </Screen>
          )}
          {step === 13 && (
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--gold-soft)]/70">A moment</p>
              <h1 className="mt-6 font-serif text-4xl leading-tight">
                {draft.firstName || "Friend"}, Aperio is ready to open the Word with you.
              </h1>
              <p className="mt-6 font-serif italic text-[var(--cream)]/70">Where the Word opens.</p>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 && step < TOTAL - 1 ? (
            <button onClick={back} className="flex items-center gap-1 text-sm text-[var(--cream)]/60 hover:text-[var(--cream)]">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : <div />}

          {step < TOTAL - 1 ? (
            <Button
              onClick={step === 0 || step === 1 ? next : next}
              className="rounded-full bg-gradient-gold px-7 py-5 text-[var(--navy-deep)] hover:opacity-90 shadow-gold"
              disabled={step === 2 && !draft.firstName}
            >
              {step === 0 ? "Begin" : step === 1 ? "Let's begin" : "Continue"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finish} className="rounded-full bg-gradient-gold px-7 py-5 text-[var(--navy-deep)] hover:opacity-90 shadow-gold ml-auto">
              Enter Aperio
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <style>{`
        .onboarding-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          color: var(--cream);
          height: 3rem;
        }
        .onboarding-input::placeholder { color: rgba(255,255,255,0.4); }
      `}</style>
    </div>
  );
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="mb-12 flex justify-center"><AperioMark className="[&>span]:text-3xl [&>span]:text-[var(--cream)]" /></div>
      <h1 className="font-serif text-5xl leading-tight">Welcome to Aperio.</h1>
      <p className="mt-4 font-serif text-xl italic text-[var(--gold-soft)]">Where the Word opens.</p>
      <p className="mx-auto mt-8 max-w-sm text-sm leading-relaxed text-[var(--cream)]/60">
        "In the beginning was the Word, and the Word was with God, and the Word was God."
        <br /><span className="text-xs">— John 1:1</span>
      </p>
    </div>
  );
}

function Promise({ onNext: _ }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold-soft)]/70">A short conversation</p>
      <h1 className="mt-6 font-serif text-3xl leading-snug">
        Just a few onboarding questions so we can customize your experience with Aperio.
      </h1>
      <p className="mx-auto mt-6 max-w-md text-sm text-[var(--cream)]/60">
        Aperio is getting to know you — not processing you. One or two questions per screen.
      </p>
    </div>
  );
}

function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-serif text-3xl leading-tight">{title}</h1>
      {subtitle && <p className="mt-3 text-sm text-[var(--cream)]/60">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-xs uppercase tracking-wider text-[var(--cream)]/60">{label}</Label>
      {children}
    </div>
  );
}

type Opt = string | { label: string; value: string };
const norm = (o: Opt) => (typeof o === "string" ? { label: o, value: o } : o);

function ChoiceList({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Opt[] }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const o = norm(opt);
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`w-full rounded-xl border px-5 py-4 text-left text-sm transition ${active ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--cream)]" : "border-white/12 bg-white/5 text-[var(--cream)]/80 hover:border-white/25"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ChoiceGrid({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Opt[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const o = norm(opt);
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-xl border px-4 py-3 text-sm transition ${active ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--cream)]" : "border-white/12 bg-white/5 text-[var(--cream)]/80 hover:border-white/25"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function MultiList({ value, onChange, options }: { value: string[]; onChange: (v: string[]) => void; options: string[] }) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition ${active ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--cream)]" : "border-white/12 bg-white/5 text-[var(--cream)]/80 hover:border-white/25"}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}