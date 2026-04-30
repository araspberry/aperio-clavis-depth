# Aperio Clavis Depth

Aperio is a Lovable.dev-generated AI Bible reader focused on clarity while reading Scripture. The current fastest mobile path is a Capacitor iOS wrapper around the existing React/TanStack app, preserving the UI and core functionality.

## Audit

- Framework: React 19, Vite 7, TanStack Router/Start, TanStack Query, Tailwind CSS 4, Radix UI primitives.
- Routing: file-based TanStack routes in `src/routes`, with a separate hash-history Capacitor entry in `src/capacitor-entry.tsx`.
- Auth: Supabase auth plus Lovable Cloud OAuth for web. Native Google OAuth opens with `@capacitor/browser` and returns through the `com.aperio.app://auth/callback` URL scheme.
- Database/API usage: Supabase tables for profiles, prayers, bookmarks, and notes; Supabase Edge Functions for Clavis and Strong's data; `https://bible.helloao.org/api` for Bible text.
- Environment: Supabase values are read from `SUPABASE_*` and `VITE_SUPABASE_*` variables. Start from `.env.example`.
- Build: `npm run build` creates both the web/TanStack build and the static Capacitor bundle in `dist/capacitor`.
- iOS blocker found: the repo had Capacitor config and dependencies, but no checked-in `ios/` native project. The generated iOS app also needed URL schemes registered for OAuth callbacks.
- Xcode freeze context: the latest app state already avoids the previous stateful in-page book tap flow by routing book taps to `/read/$book`. The app also includes an iOS WKWebView scroll guard in `src/styles.css`.

## Recommendation

Use Capacitor first. It is the quickest path because the app is already a responsive web app, already has Capacitor dependencies/config, and the current UI can ship without a React Native rebuild. Revisit Expo/React Native only if WKWebView performance, offline-first storage, or App Store-native interaction requirements become dominant.

## Local Setup

```sh
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite.

## Checks

```sh
npm run typecheck
npm run build
npm run lint
```

Current note: `npm run lint` checks TypeScript/React rules and leaves formatting to `npm run format`. Some generated UI modules still emit Fast Refresh warnings because they export helper constants alongside components.

## iOS Setup

Requirements:

- macOS with Xcode installed
- Xcode command line tools selected
- Node.js 20+

Build and sync the native app:

```sh
npm run ios:sync
npm run ios:open
```

In Xcode:

1. Select the `App` scheme.
2. Set the signing team and bundle identifier as needed.
3. Run on an iOS simulator or device.

CLI shortcut:

```sh
npm run ios:run
```

## OAuth Notes

The iOS app registers both URL schemes used by the code:

- `com.aperio.app://auth/callback`
- `app.aperio://auth/callback`

Supabase and any OAuth provider configuration must allow the active native redirect URI before native sign-in will complete.
