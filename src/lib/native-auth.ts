import { Browser } from "@capacitor/browser";
import { App, type URLOpenListenerEvent } from "@capacitor/app";
import { supabase } from "@/integrations/supabase/client";
import { NATIVE_OAUTH_ORIGIN, NATIVE_REDIRECT_URI } from "./native";

let listenerAttached = false;

/**
 * Registers a single global listener that catches OAuth callback deep links
 * (e.g. app.aperio://auth/callback#access_token=...) and hands the tokens
 * to Supabase. Safe to call multiple times — only attaches once.
 */
export function attachNativeAuthListener() {
  if (listenerAttached) return;
  listenerAttached = true;

  void App.addListener("appUrlOpen", async (event: URLOpenListenerEvent) => {
    const url = event.url;
    if (!url.startsWith(NATIVE_REDIRECT_URI)) return;

    // Tokens may arrive as a hash fragment (implicit flow) or as a `code` query param (PKCE).
    const parsed = new URL(url);
    const hash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash;
    const hashParams = new URLSearchParams(hash);
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");
    const code = parsed.searchParams.get("code");

    try {
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      } else if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    } catch (e) {
      console.error("[native-auth] failed to set session", e);
    } finally {
      await Browser.close().catch(() => {});
    }
  });
}

/** Opens the given OAuth URL in the system in-app browser (ASWebAuthenticationSession on iOS, Custom Tabs on Android). */
export async function openNativeAuthUrl(url: string) {
  await Browser.open({ url, presentationStyle: "popover" });
}

export function buildNativeOAuthUrl(provider: "google" | "apple") {
  const params = new URLSearchParams({
    provider,
    redirect_uri: NATIVE_REDIRECT_URI,
    state: crypto.randomUUID(),
  });

  return `${NATIVE_OAUTH_ORIGIN}/~oauth/initiate?${params.toString()}`;
}