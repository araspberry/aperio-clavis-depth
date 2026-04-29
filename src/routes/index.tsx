import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAperio } from "@/lib/aperio-store";
import logo from "@/assets/aperio-logo.png";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  const { profile, userId, loading } = useAperio();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      navigate({ to: profile.onboarded ? "/home" : "/onboarding" });
    }, 1400);
    return () => clearTimeout(t);
  }, [loading, userId, profile.onboarded, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-navy">
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_50%_30%,oklch(0.78_0.13_78/.35),transparent_55%)]" />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="relative animate-[pulse_3s_ease-in-out_infinite]">
          <div className="absolute inset-0 -z-10 rounded-full bg-[var(--gold)] opacity-30 blur-3xl" />
          <img
            src={logo}
            alt="Aperio"
            className="h-32 w-32 rounded-[28px] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]"
          />
        </div>
        <p className="mt-2 font-serif text-base italic text-[var(--gold-soft)]">
          Where the Word opens.
        </p>
        <Link to="/auth" className="mt-6 text-xs uppercase tracking-[0.3em] text-[var(--gold-soft)]/70 hover:text-[var(--gold)]">
          Begin →
        </Link>
      </div>
    </div>
  );
}
