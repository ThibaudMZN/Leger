import path from "node:path";
import { parse } from "../parser/parser";
import { render } from "../renderer/renderer";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { TEMPLATE } from "./htmlUtils";

export type BuildOptions = {
  paths: {
    input: string;
    output: string;
  };
};

export type BuildResult = {
  filesCount: number;
  duration: number;
};

const defaultOptions: BuildOptions = {
  paths: {
    input: "pages",
    output: "dist-leger",
  },
};

export const build = async (
  options: BuildOptions = defaultOptions,
): Promise<BuildResult> => {
  const initialTime = performance.now();
  const inDir = path.resolve(options.paths.input);
  const outDir = path.resolve(options.paths.output);

  try {
    await fs.rm(outDir, { recursive: true });
  } catch (err) {}
  await fs.mkdir(outDir, { recursive: true });

  const allFiles = await fs.readdir(inDir, {
    withFileTypes: true,
    recursive: true,
  });

  const legerFiles = allFiles
    .filter((f) => f.isFile() && f.name.endsWith(".leg"))
    .map((f) => path.join(path.relative(inDir, f.parentPath), f.name));

  let filesCount = 0;
  for (const file of legerFiles) {
    const filePath = path.resolve(inDir, file);
    const content = await fs.readFile(filePath, "utf-8");
    const ast = parse(content);
    const html = render(ast);

    const htmlContent = TEMPLATE(html.content);
    const outFilePath = path.resolve(outDir, file.replace(".leg", ".html"));

    const dir = path.dirname(outFilePath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(outFilePath, htmlContent);

    filesCount++;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const script = path.join(__dirname, "../components/components.iife.js");
  await fs.cp(script, path.join(outDir, "scripts", "components.iife.js"));
  const styles = path.join(__dirname, "../components/style.css");
  await fs.cp(styles, path.join(outDir, "styles", "style.css"));

  const duration = performance.now() - initialTime;
  return { filesCount, duration };
};
