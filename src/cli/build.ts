import path from 'path';
import fs from 'fs/promises';
import { parse } from '../parser/parser';
import { render } from '../renderer/renderer';

export type BuildOptions = {
    paths: {
        input: string;
        output: string;
    }
};

export type BuildResult = {
    filesCount: number;
}

const defaultOptions: BuildOptions = {
    paths: {
        input: 'pages',
        output: '.slim/generated',
    }
}

export async function build(options: BuildOptions = defaultOptions): Promise<BuildResult> {
    const inDir = path.resolve(options.paths.input);
    const outDir = path.resolve(options.paths.output);
    await fs.mkdir(outDir, { recursive: true });
    const files = await fs.readdir(inDir);

    for (const file of files) {
        if (!file.endsWith('.slim')) continue;

        const name = file.replace('.slim', '');
        const raw = await fs.readFile(path.join(inDir, file), 'utf-8');
        const ast = parse(raw);
        const svelteCode = render(ast);

        const outPath = path.join(outDir, `${name}.svelte`);
        await fs.writeFile(outPath, svelteCode, 'utf-8');
    }

    return {filesCount: files.length};
}
