import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAperio } from "@/lib/aperio-store";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, userId, loading } = useAperio();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!userId) {
      navigate({ to: "/auth" });
      return;
    }
    if (!profile.onboarded) {
      navigate({ to: "/onboarding" });
    }
  }, [loading, userId, profile.onboarded, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--gold)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {children}
      <BottomNav />
    </div>
  );
}