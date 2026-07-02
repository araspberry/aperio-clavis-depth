import { SignInWithApple, type SignInWithAppleResponse } from "@capacitor-community/apple-sign-in";
import { supabase } from "@/integrations/supabase/client";

/** App bundle identifier — must match PRODUCT_BUNDLE_IDENTIFIER and the
 *  "Client IDs" list in Supabase Auth → Providers → Apple. */
const APPLE_CLIENT_ID = "com.aperio.app";

function randomNonce(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Native Sign in with Apple (iOS).
 *
 * Presents the system Apple ID sheet (Face ID / Touch ID) and hands the
 * resulting identity token to Supabase via signInWithIdToken. Apple receives
 * the SHA-256 hash of a random nonce; Supabase receives the raw nonce so it
 * can verify the token was minted for this sign-in attempt.
 *
 * Requirements:
 * - "Sign in with Apple" capability enabled on the App target (App.entitlements).
 * - Apple provider enabled in Supabase with com.aperio.app in Client IDs.
 */
export async function signInWithAppleNative(): Promise<void> {
  const rawNonce = randomNonce();
  const hashedNonce = await sha256Hex(rawNonce);

  let result: SignInWithAppleResponse;
  try {
    result = await SignInWithApple.authorize({
      clientId: APPLE_CLIENT_ID,
      redirectURI: "com.aperio.app://auth/callback", // unused for native iOS, required by the plugin API
      scopes: "email name",
      nonce: hashedNonce,
    });
  } catch (err) {
    // User dismissed the Apple sheet — not an error worth surfacing.
    const message = err instanceof Error ? err.message : String(err);
    if (/cancel|1001/i.test(message)) {
      const cancelled = new Error("cancelled");
      cancelled.name = "AppleSignInCancelled";
      throw cancelled;
    }
    throw err;
  }

  const identityToken = result.response?.identityToken;
  if (!identityToken) {
    throw new Error("Apple did not return an identity token. Please try again.");
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
}
