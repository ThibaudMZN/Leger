import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: { customElement: true },
      preprocess: [vitePreprocess()],
    }),
  ],
  build: {
    lib: {
      entry: "src/components/index.ts",
      name: "LegerComponents",
      fileName: "components",
      formats: ["iife"],
    },
    outDir: "dist/components",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
