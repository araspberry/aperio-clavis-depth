import type { CapacitorConfig } from '@capacitor/cli';

// Default to bundled production assets so Xcode/App Store builds do not load Lovable preview.
// To temporarily test live-reload against Lovable preview, run with CAP_BUILD=preview.
const usePreviewServer = process.env.CAP_BUILD === 'preview';

const config: CapacitorConfig = {
  appId: 'com.aperio.app',
  appName: 'Aperio',
  webDir: 'dist/capacitor',
  // Omit `server` by default so Capacitor loads the bundled native assets from `dist/capacitor/`.
  ...(usePreviewServer
    ? {
        server: {
          url: 'https://21d047b4-6ebe-4204-bbe4-9146665fff55.lovableproject.com?forceHideBadge=true',
          cleartext: true,
        },
      }
    : {}),
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
};

export default config;