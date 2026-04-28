import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, KeyRound } from "lucide-react";
import { isNative } from "@/lib/native";
import { buildNativeOAuthUrl, openNativeAuthUrl } from "@/lib/native-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Aperio" },
      { name: "description", content: "Sign in to Aperio to sync your prayers, notes, and bookmarks across devices." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/home" },
        });
        if (error) throw error;
        setInfo("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    setError(null);
    setBusy(true);
    try {
      const native = isNative();
      if (native) {
        await openNativeAuthUrl(buildNativeOAuthUrl(provider));
        return;
      }

      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} sign-in failed`);
      setBusy(false);
    }
  };

  const google = () => oauth("google");
  const apple = () => oauth("apple");

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-navy text-[var(--cream)]">
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_70%_20%,oklch(0.78_0.13_78/.3),transparent_60%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <div className="flex flex-col items-center gap-2 pt-8">
          <span className="font-serif text-4xl tracking-wide text-[var(--cream)]">Aperio</span>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="text-center">
            <h1 className="font-serif text-3xl">{mode === "signin" ? "Welcome back." : "Begin your journey."}</h1>
            <p className="mt-2 font-serif italic text-[var(--gold-soft)]">Where the Word opens.</p>
          </div>

          <button
            onClick={google}
            disabled={busy}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm transition hover:border-white/30 disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <button
            onClick={apple}
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm transition hover:border-white/30 disabled:opacity-50"
          >
            <AppleIcon />
            Continue with Apple
          </button>

          <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-[var(--cream)]/40">
            <div className="h-px flex-1 bg-white/10" />
            or
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--cream)]/60">Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-white/15 bg-white/5 text-[var(--cream)] placeholder:text-white/40"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--cream)]/60">Password</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-white/15 bg-white/5 text-[var(--cream)] placeholder:text-white/40"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-100">{error}</p>}
            {info && <p className="rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-2.5 text-xs text-[var(--gold-soft)]">{info}</p>}

            <Button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-gold py-5 text-[var(--navy-deep)] shadow-gold hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? <><KeyRound className="mr-2 h-4 w-4" /> Sign in</> : <><Mail className="mr-2 h-4 w-4" /> Create account</>}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-[var(--cream)]/60">
            {mode === "signin" ? (
              <>New to Aperio? <button onClick={() => setMode("signup")} className="text-[var(--gold-soft)] underline">Create an account</button></>
            ) : (
              <>Already have an account? <button onClick={() => setMode("signin")} className="text-[var(--gold-soft)] underline">Sign in</button></>
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] text-[var(--cream)]/40">
          By continuing you agree to keep your prayers and notes private to your account.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#fff" d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.892-1.742 2.982-4.305 2.982-7.35Z" opacity=".9"/>
      <path fill="#fff" d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.232-2.51c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.596-4.123H3.064v2.59A10 10 0 0 0 12 22Z" opacity=".7"/>
      <path fill="#fff" d="M6.404 13.9A6 6 0 0 1 6.09 12c0-.66.114-1.3.314-1.9V7.51H3.064A10 10 0 0 0 2 12c0 1.614.386 3.14 1.064 4.49l3.34-2.59Z" opacity=".5"/>
      <path fill="#fff" d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.96 2.99 14.696 2 12 2 8.09 2 4.71 4.245 3.064 7.51l3.34 2.59C7.19 7.736 9.396 5.977 12 5.977Z" opacity=".95"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}
