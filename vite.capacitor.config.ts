import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path";
import { renameSync } from "node:fs";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    tsConfigPaths(),
    {
      name: "capacitor-index-html",
      closeBundle() {
        renameSync("dist/capacitor/index.capacitor.html", "dist/capacitor/index.html");
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