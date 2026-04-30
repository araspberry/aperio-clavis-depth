import { type ReactNode, useEffect } from "react";
import { useAperio } from "@/lib/aperio-store";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  const { loading } = useAperio();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cleanup = () => {};

    void (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") return;

      const onWheel = (event: WheelEvent) => {
        if (!event.deltaY && !event.deltaX) return;
        event.preventDefault();
        window.scrollBy({ top: event.deltaY || event.deltaX, left: 0, behavior: "auto" });
      };

      window.addEventListener("wheel", onWheel, { passive: false });
      cleanup = () => window.removeEventListener("wheel", onWheel);
    })();

    return () => cleanup();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--gold)]" />
      </div>
    );
  }

  return (
    <div className="native-scroll-root min-h-screen bg-background pb-24">
      {children}
      <BottomNav />
    </div>
  );
}