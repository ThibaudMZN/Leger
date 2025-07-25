import path from "path";
import fs from "fs/promises";
import { parse } from "../parser/parser";
import { render } from "../renderer/renderer";
import { COMPONENTS } from "../constants";
import { execSync } from "node:child_process";

export type BuildOptions = {
  paths: {
    input: string;
    output: string;
  };
};

export type BuildResult = {
  filesCount: number;
};

const defaultOptions: BuildOptions = {
  paths: {
    input: "pages",
    output: ".slim/generated",
  },
};

export async function build(
  options: BuildOptions = defaultOptions,
): Promise<BuildResult> {
  const inDir = path.resolve(options.paths.input);
  const outDir = path.resolve(options.paths.output);
  await fs.mkdir(outDir, { recursive: true });
  const files = await fs.readdir(inDir);

  for (const file of files) {
    if (!file.endsWith(".slim")) continue;

    const name = file.replace(".slim", "");
    const raw = await fs.readFile(path.join(inDir, file), "utf-8");
    const ast = parse(raw);
    const svelteRender = render(ast);

    const imports = `<script>\n${Array.from(svelteRender.usedComponents)
      .map((type) => {
        const componentName = COMPONENTS[type];
        return `    import ${componentName} from '$lib/components/${componentName}.svelte';`;
      })
      .join("\n")}\n</script>`;

    const svelteCode = [imports, svelteRender.content].join("\n\n");

    const outPath = path.join(outDir, `${name}.svelte`);
    await fs.writeFile(outPath, svelteCode, "utf-8");
  }

  const svelteKitDir = path.join(outDir, ".sveltekit");
  await setupTempSvelteKit(svelteKitDir);

  await fs.cp(
    "./src/components",
    path.join(svelteKitDir, "src/lib/components"),
    { recursive: true },
  );

  const svelteFiles = await fs.readdir(outDir);
  for (const file of svelteFiles.filter((f) => f.endsWith(".svelte"))) {
    const name = path.basename(file, ".svelte");
    const content = await fs.readFile(path.join(outDir, file), "utf-8");

    const routeDir =
      name === "index"
        ? path.join(svelteKitDir, "src/routes")
        : path.join(svelteKitDir, "src/routes", name);

    await fs.mkdir(routeDir, { recursive: true });
    await fs.writeFile(path.join(routeDir, "+page.svelte"), content);
  }

  await fs.writeFile(
    path.join(svelteKitDir, "src/routes/+layout.ts"),
    "export const prerender = true;",
  );

  execSync("npm run build", { cwd: svelteKitDir, stdio: "inherit" });

  await fs.cp(path.join(svelteKitDir, "build"), ".slim", { recursive: true });

  await fs.rm(outDir, { recursive: true });

  return { filesCount: files.length };
}

async function setupTempSvelteKit(dir: string) {
  await fs.mkdir(dir, { recursive: true });

  const configDir = "sveltekit-config";

  const cpToTarget = async (file: string) =>
    fs.cp(path.join(configDir, file), path.join(dir, file));

  await fs.cp(
    path.join(configDir, "app.html"),
    path.join(dir, "src/app.html"),
    { recursive: true },
  );

  await cpToTarget("package.json");
  await cpToTarget("svelte.config.js");
  await cpToTarget("vite.config.js");
}
