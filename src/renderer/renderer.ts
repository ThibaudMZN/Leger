import { COMPONENTS, ComponentType } from "../componentsList";

type RenderResult = {
  content: string;
  usedComponents: Set<ComponentType>;
};

export function render(
  nodes: LegerNode[],
  level = 0,
  usedComponents: Set<ComponentType> = new Set<ComponentType>(),
): RenderResult {
  const indent = "  ".repeat(level);

  const content = nodes
    .map((node) => {
      if (!usedComponents.has(node.type)) usedComponents.add(node.type);

      const tagName = COMPONENTS[node.type].name;

      const props = Object.entries(node.props)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");

      const opening = `<${tagName}${props ? " " + props : ""}>`;
      const closing = `</${tagName}>`;

      const content =
        node.content ??
        (node.children.length > 0
          ? `\n${render(node.children, level + 1, usedComponents).content}\n${indent}`
          : "");

      return `${indent}${opening}${content}${closing}`;
    })
    .join("\n");

  return {
    content,
    usedComponents,
  };
}

export function renderFrontmatter(frontmatter: Record<string, any>): string {
  let result = `<title>${frontmatter.title ? frontmatter.title : "Leger"}</title>`;
  if (frontmatter.siteName)
    result += `\n<meta property="og:site_name" content="${frontmatter.siteName}">`;
  if (frontmatter.description)
    result += `\n<meta name="description" content="${frontmatter.description}">`;
  return result;
}
