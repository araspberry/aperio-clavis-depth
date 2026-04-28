import type { CapacitorConfig } from '@capacitor/cli';

// Toggle between live-reload (Lovable preview) and bundled production assets.
// Set CAP_BUILD=production before `npx cap sync ios` to ship the bundled `dist/` build.
//   Dev (default):   npx cap sync ios
//   Production:      CAP_BUILD=production npx cap sync ios
const isProduction = process.env.CAP_BUILD === 'production';

const config: CapacitorConfig = {
  appId: 'com.aperio.app',
  appName: 'Aperio',
  webDir: 'dist',
  // In production, omit `server` so Capacitor loads the bundled assets from `dist/`.
  ...(isProduction
    ? {}
    : {
        server: {
          url: 'https://21d047b4-6ebe-4204-bbe4-9146665fff55.lovableproject.com?forceHideBadge=true',
          cleartext: true,
        },
      }),
  ios: {
    contentInset: 'always',
  },
};

export default config;