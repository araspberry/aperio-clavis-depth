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
    react(),
    tailwindcss(),
    tsConfigPaths(),
    {
      name: "capacitor-index-html",
      closeBundle() {
        const direct = "dist/capacitor/index.html";
        const legacy = "dist/capacitor/index.capacitor.html";
        if (existsSync(direct)) return;
        if (existsSync(legacy)) {
          const { renameSync } = require("node:fs");
          renameSync(legacy, direct);
          return;
        }
        throw new Error(
          `[capacitor-index-html] Neither ${direct} nor ${legacy} was emitted.`
        );
      },
    },
  ],
  resolve: {
    alias: {
      // Alias server-only TanStack Start packages to client stubs.
      "@tanstack/start-server-core": resolve(__dirname, "src/stubs/tanstack-start-server-core.ts"),
      "@tanstack/start-storage-context": resolve(__dirname, "src/stubs/tanstack-start-storage-context.ts"),
      // Alias Node.js stream built-ins used by @tanstack/router-core SSR files.
      "node:stream/web": resolve(__dirname, "src/stubs/node-stream-web.ts"),
      "node:stream": resolve(__dirname, "src/stubs/node-stream.ts"),
    },
  },
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
