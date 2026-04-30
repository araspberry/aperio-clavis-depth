import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { forwardNativeOAuthCallback } from "@/lib/native-auth";
import { NATIVE_REDIRECT_URI } from "@/lib/native";

// Inline script: runs as soon as the HTML is parsed, before React hydrates.
// Safari is much more reliable about following a custom-scheme redirect
// when it happens immediately on page load, not from a deferred React effect.
const INLINE_REDIRECT = `
(function(){
  try {
    var target = ${JSON.stringify(NATIVE_REDIRECT_URI)} + (window.location.search || "") + (window.location.hash || "");
    window.location.replace(target);
  } catch (e) {}
})();
`;

export const Route = createFileRoute("/native-auth-callback")({
  head: () => ({
    meta: [
      { title: "Returning to Aperio" },
      { name: "description", content: "Completing Aperio sign-in." },
    ],
    scripts: [
      { children: INLINE_REDIRECT },
    ],
  }),
  component: NativeAuthCallbackPage,
});

function NativeAuthCallbackPage() {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    // Belt and suspenders: also try from React in case the inline script was blocked.
    forwardNativeOAuthCallback();
    // If we're still on this page after 1.5s, Safari likely blocked the scheme jump
    // (e.g. requires a user gesture). Show a manual "Open Aperio" button.
    const t = setTimeout(() => setStuck(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const reopen = () => {
    const target =
      NATIVE_REDIRECT_URI +
      (typeof window !== "undefined" ? window.location.search + window.location.hash : "");
    window.location.href = target;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
      <div>
        <h1 className="font-serif text-3xl">Returning to Aperio…</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          If Aperio does not reopen automatically, tap the button below.
        </p>
        {stuck && (
          <button
            onClick={reopen}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow"
          >
            Open Aperio
          </button>
        )}
      </div>
    </main>
  );
}