import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { forwardNativeOAuthCallback } from "@/lib/native-auth";

export const Route = createFileRoute("/native-auth-callback")({
  head: () => ({
    meta: [
      { title: "Returning to Aperio" },
      { name: "description", content: "Completing Aperio sign-in." },
    ],
  }),
  component: NativeAuthCallbackPage,
});

function NativeAuthCallbackPage() {
  useEffect(() => {
    forwardNativeOAuthCallback();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
      <div>
        <h1 className="font-serif text-3xl">Returning to Aperio…</h1>
        <p className="mt-3 text-sm text-muted-foreground">If the app does not reopen, return to Aperio and try again.</p>
      </div>
    </main>
  );
}