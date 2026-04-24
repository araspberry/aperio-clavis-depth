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
      if (!userId) navigate({ to: "/auth" });
      else navigate({ to: profile.onboarded ? "/home" : "/onboarding" });
    }, 1400);
    return () => clearTimeout(t);
  }, [loading, userId, profile.onboarded, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-navy">
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_50%_30%,oklch(0.78_0.13_78/.35),transparent_55%)]" />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="animate-[pulse_3s_ease-in-out_infinite]">
          <img
            src={logo}
            alt="Aperio"
            className="h-28 w-28 rounded-[28px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]"
          />
        </div>
        <h1 className="font-serif text-4xl tracking-wide text-[var(--cream)]">Aperio</h1>
        <p className="-mt-3 font-serif text-base italic text-[var(--gold-soft)]">
          Where the Word opens.
        </p>
        <Link to="/auth" className="mt-6 text-xs uppercase tracking-[0.3em] text-[var(--gold-soft)]/70 hover:text-[var(--gold)]">
          Begin →
        </Link>
      </div>
    </div>
  );
}
