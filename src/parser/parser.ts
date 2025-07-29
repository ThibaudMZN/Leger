import { COMPONENTS } from "../constants";
import { UnknownComponentError, UnknownPropertyError } from "../errors";

export function parse(input: string): LegerNode[] {
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
