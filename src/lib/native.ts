import { Capacitor } from "@capacitor/core";

export const isNative = () => Capacitor.isNativePlatform();

/** Custom URL scheme used by the native app for OAuth callbacks. Must match Info.plist / AndroidManifest. */
export const NATIVE_REDIRECT_URI = "app.aperio://auth/callback";

/** Hosted app origin used only to reach Lovable Cloud's OAuth broker from bundled native assets. */
export const NATIVE_OAUTH_ORIGIN = "https://id-preview--21d047b4-6ebe-4204-bbe4-9146665fff55.lovable.app";

/** HTTPS callback accepted by the OAuth broker; it immediately hands off to the native URL scheme. */
export const NATIVE_OAUTH_CALLBACK_URI = `${NATIVE_OAUTH_ORIGIN}/native-auth-callback`;