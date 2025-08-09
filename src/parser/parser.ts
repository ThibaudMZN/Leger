import { COMPONENTS } from "../componentsList";
import { UnknownComponentError, UnknownPropertyError } from "../errors";

export function splitContent(input: string): {
  rawFrontmatter: string;
  rawLegerContent: string;
} {
  const match = input.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { rawFrontmatter: "", rawLegerContent: input };
  }

  return {
    rawFrontmatter: match[1].trim(),
    rawLegerContent: input.slice(match[0].length).trim(),
  };
}

export function parseLeger(input: string): LegerNode[] {
  const lines = input.split("\n").filter(Boolean);

  const root: LegerNode[] = [];
  const stack: { indent: number; node: LegerNode }[] = [];

  for (const line of lines) {
    const match = line.match(/^(\s*)([a-zA-Z0-9_+]+)(?:\(([^)]*)\))?\s*(.*)?$/);
    if (!match) continue;

    const indent = match[1].length;
    const type = match[2];
    const rawProps = match[3] || "";
    const trailingText = match[4]?.trim();

    if (!(type in COMPONENTS))
      throw new UnknownComponentError(`Unknown component: ${type}`);

    const allowedProps = COMPONENTS[type].props;
    const props: Record<string, string> = {};
    rawProps.split(",").forEach((pair) => {
      const [k, v] = pair.split("=").map((s) => s?.trim());
      if (k && v) {
        if (!allowedProps.includes(k))
          throw new UnknownPropertyError(
            `Unknown property for component '${type}': ${k}`,
          );
        props[k] = v.replace(/^['"]|['"]$/g, "");
      }
    });

    const node: LegerNode = {
      type,
      props,
      children: [],
    };

    if (trailingText) node.content = trailingText;

    while (stack.length && stack[stack.length - 1].indent >= indent)
      stack.pop();

    if (stack.length === 0) root.push(node);
    else stack[stack.length - 1].node.children.push(node);

    stack.push({ indent, node });
  }

  return root;
}

export function parseFrontmatter(input: string): Record<string, any> {
  const frontmatter: Record<string, any> = {};

  let previousKey = "";
  for (const line of input.split("\n")) {
    if (line.startsWith("  -")) {
      const value = line.slice(3).trim();
      frontmatter[previousKey] = [...frontmatter[previousKey], value];
      continue;
    }
    const trimmed = line.trim();
    const [key, value] = trimmed.split(":").map((s) => s.trim());
    frontmatter[key] = value || [];
    previousKey = key;
  }
  return frontmatter;
}

type ParseResult = {
  nodes: LegerNode[];
  frontmatter: Record<string, any>;
};

export function parse(input: string): ParseResult {
  const { rawFrontmatter, rawLegerContent } = splitContent(input);
  return {
    frontmatter: parseFrontmatter(rawFrontmatter),
    nodes: parseLeger(rawLegerContent),
  };
}
