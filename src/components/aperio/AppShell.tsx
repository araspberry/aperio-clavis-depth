import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAperio } from "@/lib/aperio-store";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  const { profile } = useAperio();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile.firstName === "" && !profile.onboarded) {
      // give hydration a tick
      const t = setTimeout(() => {
        if (!profile.onboarded) navigate({ to: "/onboarding" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [profile.onboarded, profile.firstName, navigate]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {children}
      <BottomNav />
    </div>
  );
}