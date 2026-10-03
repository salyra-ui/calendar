import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [svelte(), react(), vue()],
  optimizeDeps: {
    esbuildOptions: {
      tsconfigRaw: { compilerOptions: { experimentalDecorators: true } },
    },
  },
  server: { port: 4330, strictPort: true },
  build: {
    target: "es2022",
    outDir: "dist/site",
    rollupOptions: {
      input: {
        main: "index.html",
        docs: "docs.html",
        framework: "framework.html",
        changelog: "changelog.html",
      },
    },
  },
});
