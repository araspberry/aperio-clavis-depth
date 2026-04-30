import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, ArrowRight, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Aperio" },
      { name: "description", content: "Sign in to Aperio to sync your prayers, notes, and bookmarks across devices." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = search.redirect;
    return typeof r === "string" ? { redirect: r } : {};
  },
  component: AuthPage,
});

type Mode = "signin" | "signup";
type Step = 0 | 1 | 2;

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session?.user) navigate({ to: "/home" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) navigate({ to: "/home" });
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  const goNext = (next: Step) => { setDirection(1); setStep(next); setError(null); setInfo(null); };
  const goBack = (prev: Step) => { setDirection(-1); setStep(prev); setError(null); setInfo(null); };

  const pickMode = (m: Mode) => { setMode(m); goNext(1); };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) { setError("Please enter a valid email."); return; }
    goNext(2);
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + "/home" },
        });
        if (error) throw error;
        setInfo("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email) { setError("Enter your email first."); return; }
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      setInfo("Password reset link sent. Check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError(result.error instanceof Error ? result.error.message : "Google sign-in failed.");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/home" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setBusy(false);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-navy text-[var(--cream)]">
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_70%_20%,oklch(0.78_0.13_78/.3),transparent_60%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        {/* Top bar: back + progress */}
        <div className="flex h-10 items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => goBack((step - 1) as Step)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--cream)]/70 transition hover:bg-white/5 hover:text-[var(--cream)]"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : <div className="h-10 w-10" />}

          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === step ? "w-6 bg-[var(--gold)]" : i < step ? "w-3 bg-[var(--gold)]/60" : "w-3 bg-white/15"
                }`}
              />
            ))}
          </div>
          <div className="h-10 w-10" />
        </div>

        {/* Brand */}
        <div className="mt-2 flex flex-col items-center gap-2">
          <span className="font-serif text-3xl tracking-wide">Aperio</span>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />
        </div>

        {/* Steps */}
        <div className="relative flex flex-1 flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            {step === 0 && (
              <motion.div
                key="step-mode"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="text-center">
                  <h1 className="font-serif text-3xl">Welcome.</h1>
                  <p className="mt-2 font-serif italic text-[var(--gold-soft)]">Where the Word opens.</p>
                </div>

                <div className="mt-10 space-y-3">
                  <ModeCard
                    icon={<LogIn className="h-5 w-5" />}
                    title="Sign in"
                    subtitle="Continue your journey"
                    onClick={() => pickMode("signin")}
                  />
                  <ModeCard
                    icon={<UserPlus className="h-5 w-5" />}
                    title="Create account"
                    subtitle="Begin a new chapter"
                    onClick={() => pickMode("signup")}
                    primary
                  />
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--cream)]/40">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <button
                  onClick={signInWithGoogle}
                  disabled={busy}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-sm text-[var(--cream)] transition hover:border-white/30 hover:bg-white/10 disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.7H12z"/>
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-email"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <StepHeader
                  eyebrow={mode === "signin" ? "Sign in" : "Create account"}
                  title="What's your email?"
                />
                <form onSubmit={submitEmail} className="mt-8 space-y-4">
                  <AutofocusInput
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  {error && <ErrorMsg>{error}</ErrorMsg>}
                  <ContinueButton busy={false} label="Continue" />
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-password"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <StepHeader
                  eyebrow={mode === "signin" ? "Sign in" : "Create account"}
                  title={mode === "signin" ? "Enter your password" : "Choose a password"}
                  caption={email}
                />
                <form onSubmit={submitPassword} className="mt-8 space-y-4">
                  <div className="relative">
                    <AutofocusInput
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cream)]/50 hover:text-[var(--cream)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {mode === "signin" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={forgot}
                        disabled={busy}
                        className="text-xs text-[var(--gold-soft)] underline-offset-2 hover:underline disabled:opacity-50"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {error && <ErrorMsg>{error}</ErrorMsg>}
                  {info && (
                    <p className="rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-2.5 text-xs text-[var(--gold-soft)]">
                      {info}
                    </p>
                  )}

                  <ContinueButton busy={busy} label={mode === "signin" ? "Sign in" : "Create account"} />
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-[10px] text-[var(--cream)]/40">
          By continuing you agree to keep your prayers and notes private to your account.
        </p>
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  subtitle,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-2xl border px-5 py-5 text-left transition active:scale-[0.99] ${
        primary
          ? "border-[var(--gold)]/40 bg-gradient-to-br from-[var(--gold)]/15 to-[var(--gold)]/5 hover:border-[var(--gold)]/70"
          : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/8"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${
            primary ? "bg-[var(--gold)]/20 text-[var(--gold-soft)]" : "bg-white/10 text-[var(--cream)]"
          }`}
        >
          {icon}
        </div>
        <div>
          <div className="font-serif text-lg leading-tight">{title}</div>
          <div className="text-xs text-[var(--cream)]/60">{subtitle}</div>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-[var(--cream)]/50 transition group-hover:translate-x-0.5 group-hover:text-[var(--gold-soft)]" />
    </button>
  );
}

function StepHeader({ eyebrow, title, caption }: { eyebrow: string; title: string; caption?: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--gold-soft)]">{eyebrow}</div>
      <h2 className="mt-2 font-serif text-2xl">{title}</h2>
      {caption && <p className="mt-2 text-xs text-[var(--cream)]/60">{caption}</p>}
    </div>
  );
}

function AutofocusInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus(), 280);
    return () => clearTimeout(t);
  }, []);
  return (
    <Input
      ref={ref}
      {...props}
      className="h-12 border-white/15 bg-white/5 text-base text-[var(--cream)] placeholder:text-white/40 focus-visible:border-[var(--gold)]/50 focus-visible:ring-[var(--gold)]/30"
    />
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-100">{children}</p>;
}

function ContinueButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <Button
      type="submit"
      disabled={busy}
      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-5 text-[var(--navy-deep)] shadow-gold hover:opacity-90 disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </>
      )}
    </Button>
  );
}
