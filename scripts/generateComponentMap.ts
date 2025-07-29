import { readdirSync, writeFileSync } from "node:fs";

const componentFiles = readdirSync("./src/components").sort();

const components = componentFiles.map((c) => {
  const componentName = c.replace(".svelte", "");
  return {
    id: componentName.toLowerCase(),
    name: componentName,
  };
});

const output: string = `type ComponentProps = {
  name: string;
  props?: Record<string, any>;
};

export const COMPONENTS: Record<string, ComponentProps> = {
  ${components.map((c) => `${c.id}: { name: "${c.name}" }`).join(",\n  ")}
};

export type ComponentType = keyof typeof COMPONENTS;
`;

writeFileSync("./src/constants.ts", output);
