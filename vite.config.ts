import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { builtinModules } from "module";

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
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        "chokidar",
        "vite",
        "fsevents",
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
