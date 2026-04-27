import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aperio.app',
  appName: 'Aperio',
  webDir: 'dist',
  // For local development against the Lovable preview, set this to your preview URL.
  // Remove `server` before shipping a production build so the bundled web assets are used.
  server: {
    url: 'https://21d047b4-6ebe-4204-bbe4-9146665fff55.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;