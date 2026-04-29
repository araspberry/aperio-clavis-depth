import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Aperio" },
      { name: "description", content: "Choose a new password for your Aperio account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    // Supabase parses the recovery token from the URL hash and emits
    // a PASSWORD_RECOVERY event. Wait for either that or an existing session.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setInfo("Password updated. Redirecting…");
      setTimeout(() => navigate({ to: "/home" }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-navy text-[var(--cream)]">
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_70%_20%,oklch(0.78_0.13_78/.3),transparent_60%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="font-serif text-3xl tracking-wide">Aperio</span>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="text-center">
            <p className="font-serif text-sm uppercase tracking-[0.2em] text-[var(--gold-soft)]">Reset password</p>
            <h1 className="mt-2 font-serif text-3xl">Choose a new password</h1>
          </div>

          {!ready ? (
            <p className="mt-8 text-center text-sm text-[var(--cream)]/70">
              Verifying your reset link…
            </p>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="h-12 border-white/10 bg-white/5 pr-12 text-[var(--cream)] placeholder:text-[var(--cream)]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cream)]/60 hover:text-[var(--cream)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="h-12 border-white/10 bg-white/5 text-[var(--cream)] placeholder:text-[var(--cream)]/40"
              />

              {error && <p className="text-sm text-red-300">{error}</p>}
              {info && <p className="text-sm text-[var(--gold-soft)]">{info}</p>}

              <Button
                type="submit"
                disabled={busy}
                className="h-12 w-full bg-[var(--gold)] text-[var(--navy)] hover:bg-[var(--gold)]/90"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}