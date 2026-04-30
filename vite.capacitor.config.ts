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
        const src = "dist/capacitor/index.capacitor.html";
        const dest = "dist/capacitor/index.html";
        if (!existsSync(src)) {
          throw new Error(
            `[capacitor-index-html] Expected ${src} to exist after build, but it was not emitted. ` +
            `This usually means Vite couldn't transform any modules — most often because the project ` +
            `path contains special characters like '#'. Rename the project folder and rebuild.`
          );
        }
        renameSync(src, dest);
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