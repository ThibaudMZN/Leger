import { readdirSync, writeFileSync } from "node:fs";
import { readFileSync } from "fs";
import path from "node:path";
import { parse } from "svelte/compiler";

const componentsDir = "./src/components";
const componentFiles = readdirSync(componentsDir).sort();

const components = componentFiles.map((c) => {
  const source = readFileSync(path.join(componentsDir, c));

  const sourceWithoutCSS = source
    .toString("utf-8")
    .replace(/<style(\s[^>]*)?>[\s\S]*?<\/style>/gi, "");

  const ast = parse(sourceWithoutCSS);

  const props: string[] = [];
  ast.instance?.content.body.forEach((node: any) => {
    if (
      node.type === "ExportNamedDeclaration" &&
      node.declaration?.type === "VariableDeclaration"
    ) {
      for (const decl of node.declaration.declarations) {
        if (
          decl.type === "VariableDeclarator" &&
          decl.id.type === "Identifier"
        ) {
          props.push(decl.id.name);
        }
      }
    }
  });

  const componentName = c.replace(".svelte", "");
  return {
    id: componentName.toLowerCase(),
    name: componentName,
    props,
  };
});

const output: string = `type ComponentProps = {
  name: string;
  props: string[];
};

export const COMPONENTS: Record<string, ComponentProps> = {
  ${components.map((c) => `${c.id}: { name: "${c.name}", props: ${JSON.stringify(c.props)} }`).join(",\n  ")}
};

export type ComponentType = keyof typeof COMPONENTS;
`;

writeFileSync("./src/constants.ts", output);
