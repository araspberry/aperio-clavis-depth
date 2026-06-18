import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, renameSync } from "node:fs";

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
        // Vite 7 emits the HTML using the input key name ("index" → "index.html").
        // If it was somehow emitted as index.capacitor.html, rename it.
        const direct = "dist/capacitor/index.html";
        const legacy = "dist/capacitor/index.capacitor.html";
        if (existsSync(direct)) {
          return;
        }
        if (existsSync(legacy)) {
          renameSync(legacy, direct);
          return;
        }
        throw new Error(
          `[capacitor-index-html] Neither ${direct} nor ${legacy} was emitted. ` +
          `Check that index.capacitor.html exists at the project root and that the build completed without errors.`
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
