import { type ReactNode } from "react";
import { useAperio } from "@/lib/aperio-store";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  const { loading } = useAperio();

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