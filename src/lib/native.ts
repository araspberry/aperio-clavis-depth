import { Capacitor } from "@capacitor/core";

export const isNative = () => Capacitor.isNativePlatform();

/** Custom URL scheme used by the native app for OAuth callbacks. Must match Info.plist / AndroidManifest. */
export const NATIVE_REDIRECT_URI = "com.aperio.app://auth/callback";