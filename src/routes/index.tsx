import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AperioMark } from "@/components/aperio/AperioMark";
import { useAperio } from "@/lib/aperio-store";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  const { profile } = useAperio();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: profile.onboarded ? "/home" : "/onboarding" });
    }, 1400);
    return () => clearTimeout(t);
  }, [profile.onboarded, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-navy">
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_50%_30%,oklch(0.78_0.13_78/.35),transparent_55%)]" />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="animate-[pulse_3s_ease-in-out_infinite]">
          <AperioMark className="[&>span]:text-[var(--cream)] [&>span]:text-3xl" />
        </div>
        <p className="font-serif text-base italic text-[var(--gold-soft)]">
          Where the Word opens.
        </p>
        <Link to="/onboarding" className="mt-6 text-xs uppercase tracking-[0.3em] text-[var(--gold-soft)]/70 hover:text-[var(--gold)]">
          Begin →
        </Link>
      </div>
    </div>
  );
}
