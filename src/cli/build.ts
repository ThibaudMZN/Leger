import path from "node:path";
import fs from "node:fs/promises";
import { execSync, spawn } from "node:child_process";
import { parse } from "../parser/parser";
import { render } from "../renderer/renderer";
import { COMPONENTS } from "../constants";
import { watch } from "chokidar";

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

  await compileSlimeToSvelte(files, inDir, outDir);

  const svelteKitDir = path.join(outDir, ".sveltekit");
  await setupTempSvelteKit(svelteKitDir);
  await generateSvelteKitRoutes(outDir, svelteKitDir);

  execSync("npm run build", { cwd: svelteKitDir, stdio: "inherit" });

  await fs.cp(path.join(svelteKitDir, "build"), ".slim", { recursive: true });
  await fs.rm(outDir, { recursive: true });

  return { filesCount: files.length };
}

export async function dev(
  options: BuildOptions = defaultOptions,
): Promise<void> {
  const inDir = path.resolve(options.paths.input);
  const outDir = path.resolve(`.slim-dev-${new Date().getTime()}`);
  await fs.mkdir(outDir, { recursive: true });
  const files = await fs.readdir(inDir);

  await compileSlimeToSvelte(files, inDir, outDir);

  const svelteKitDir = path.join(outDir, ".sveltekit");
  await setupTempSvelteKit(svelteKitDir);
  await generateSvelteKitRoutes(outDir, svelteKitDir);

  const svelteKitProcess = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    cwd: svelteKitDir,
  });

  console.log(`👀 Watching ${inDir} for changes...`);
  const watcher = watch(inDir, {
    ignoreInitial: true,
  });

  watcher.on("change", async (slimPath) => {
    console.log(`📝 Changed: ${slimPath}`);
    await compileSlimeToSvelte(files, inDir, outDir);
    await generateSvelteKitRoutes(outDir, svelteKitDir);
  });

  watcher.on("add", async (slimPath) => {
    console.log(`➕ Added: ${slimPath}`);
    await compileSlimeToSvelte(files, inDir, outDir);
    await generateSvelteKitRoutes(outDir, svelteKitDir);
  });

  watcher.on("unlink", async (slimPath) => {
    console.log(`🗑️  Deleted: ${slimPath}`);
    const name = path.basename(slimPath, ".slim");
    const routeDir = name === "index" ? "src/routes" : `src/routes/${name}`;
    const sveltePath = path.join(routeDir, "+page.svelte");

    try {
      await fs.unlink(sveltePath);
      console.log(`🗑️  Cleaned up: ${sveltePath}`);
      await compileSlimeToSvelte(files, inDir, outDir);
      await generateSvelteKitRoutes(outDir, svelteKitDir);
    } catch (error) {
      // File might not exist, ignore
    }
  });

  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down...");
    watcher.close();
    if (svelteKitProcess) {
      svelteKitProcess.kill();
    }
    fs.rm(outDir, { recursive: true }).then(() => process.exit(0));
  });

  console.log("🎉 Development mode started!");
  console.log(`📁 Watching: ${inDir}`);
  console.log("🌐 SvelteKit: http://localhost:5173");
  console.log("🔥 Hot reload: Enabled");
  console.log("Press Ctrl+C to stop");
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

  await fs.cp("./src/components", path.join(dir, "src/lib/components"), {
    recursive: true,
  });

  const routesDir = path.join(dir, "src/routes");
  await fs.mkdir(routesDir, { recursive: true });

  await fs.writeFile(
    path.join(dir, "src/routes/+layout.ts"),
    "export const prerender = true;",
  );
}

async function compileSlimeToSvelte(
  files: string[],
  inDir: string,
  outDir: string,
) {
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
}

async function generateSvelteKitRoutes(outDir: string, svelteKitDir: string) {
  const svelteFiles = await fs.readdir(outDir);
  for (const file of svelteFiles.filter((f) => f.endsWith(".svelte"))) {
    const name = path.basename(file, ".svelte");
    const content = await fs.readFile(path.join(outDir, file), "utf-8");

    const routeDir =
      name === "index"
        ? path.join(svelteKitDir, "src/routes")
        : path.join(svelteKitDir, "src/routes", name);

    if (name !== "index") await fs.mkdir(routeDir, { recursive: true });
    await fs.writeFile(path.join(routeDir, "+page.svelte"), content);
  }
}
