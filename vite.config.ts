import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  build: {
    target: "node20",
    outDir: "dist",
    lib: {
      entry: resolve(__dirname, "src/cli/index.ts"),
      formats: ["es"],
      fileName: () => "cli/index.js",
    },
    rollupOptions: {
      external: [
        "node:path",
        "node:fs/promises",
        "node:child_process",
        "node:url",
        "chokidar",
      ],
    },
    emptyOutDir: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "sveltekit-config",
          dest: ".",
        },
        {
          src: "src/components/**/*",
          dest: "./components",
        },
      ],
    }),
  ],
});
