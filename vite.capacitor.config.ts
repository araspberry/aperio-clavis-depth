import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [
    // Stub out TanStack Start server-only internals that have no place in a
    // Capacitor (client-only) build.  The real resolution is normally injected
    // by the TanStack Start Vite plugin; without it the build fails on the
    // "#tanstack-router-entry" package-imports specifier.
    {
      name: "tanstack-start-server-stub",
      resolveId(id) {
        if (id === "#tanstack-router-entry") {
          return "\0virtual:tanstack-router-entry";
        }
      },
      load(id) {
        if (id === "\0virtual:tanstack-router-entry") {
          return `export const routerModule = {};`;
        }
      },
    },
    react(),
    tailwindcss(),
    tsConfigPaths(),
    {
      name: "capacitor-index-html",
      closeBundle() {
        // Vite 7 names the HTML output after the input key ("index" → "index.html").
        // Guard against older behaviour that preserved the source filename.
        const direct = "dist/capacitor/index.html";
        const legacy = "dist/capacitor/index.capacitor.html";
        if (existsSync(direct)) return;
        if (existsSync(legacy)) {
          const { renameSync } = require("node:fs");
          renameSync(legacy, direct);
          return;
        }
        throw new Error(
          `[capacitor-index-html] Neither ${direct} nor ${legacy} was emitted. ` +
          `Ensure index.capacitor.html exists at the project root.`
        );
      },
    },
  ],
  build: {
    outDir: "dist/capacitor",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.capacitor.html"),
      },
    },
  },
});
