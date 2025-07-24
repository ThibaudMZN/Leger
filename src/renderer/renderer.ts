import {COMPONENTS} from "../constants";

export function render(nodes: SlimNode[], level = 0): string {
    const indent = '  '.repeat(level);

    return nodes
        .map((node) => {
            const tagName = COMPONENTS[node.type];

            const props = Object.entries(node.props)
                .map(([k, v]) => `${k}="${v}"`)
                .join(' ');

            const opening = `<${tagName}${props ? ' ' + props : ''}>`;
            const closing = `</${tagName}>`;

            const content =
                node.content ??
                (node.children.length > 0 ? `\n${render(node.children, level + 1)}\n${indent}` : '');

            return `${indent}${opening}${content}${closing}`;
        })
        .join('\n');
}