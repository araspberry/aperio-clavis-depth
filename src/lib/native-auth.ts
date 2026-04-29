import { AppLauncher } from "@capacitor/app-launcher";
import { App, type URLOpenListenerEvent } from "@capacitor/app";
import { supabase } from "@/integrations/supabase/client";
import { LEGACY_NATIVE_REDIRECT_URI, NATIVE_OAUTH_CALLBACK_URI, NATIVE_OAUTH_ORIGIN, NATIVE_REDIRECT_URI } from "./native";

let listenerAttached = false;

export function forwardNativeOAuthCallback() {
  if (typeof window === "undefined") return false;
  if (window.location.origin !== NATIVE_OAUTH_ORIGIN || window.location.pathname !== "/native-auth-callback") {
    return false;
  }

  window.location.replace(`${NATIVE_REDIRECT_URI}${window.location.search}${window.location.hash}`);
  return true;
}

/**
 * Registers a single global listener that catches OAuth callback deep links
 * (e.g. com.aperio.app://auth/callback#access_token=...) and hands the tokens
 * to Supabase. Safe to call multiple times — only attaches once.
 */
export function attachNativeAuthListener() {
  if (listenerAttached) return;
  listenerAttached = true;

  void App.addListener("appUrlOpen", async (event: URLOpenListenerEvent) => {
    const url = event.url;
    console.info("[native-auth] appUrlOpen", url);
    if (!url.startsWith(NATIVE_REDIRECT_URI) && !url.startsWith(LEGACY_NATIVE_REDIRECT_URI)) return;

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
      } else {
        console.warn("[native-auth] callback received without OAuth tokens or code", url);
      }
    } catch (e) {
      console.error("[native-auth] failed to set session", e);
    } finally {
      console.info("[native-auth] callback handled");
    }
  });
}

/** Starts OAuth without redirecting the Capacitor WebView away from the bundled app. */
export async function startNativeOAuth(provider: "google" | "apple") {
  attachNativeAuthListener();

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    provider,
    redirect_uri: NATIVE_OAUTH_CALLBACK_URI,
    state,
  });
  const url = `${NATIVE_OAUTH_ORIGIN}/~oauth/initiate?${params.toString()}`;

  console.info("[native-auth] opening managed OAuth URL outside the WebView");
  await AppLauncher.openUrl({ url });
}