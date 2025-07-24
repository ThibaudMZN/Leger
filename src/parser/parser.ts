import {COMPONENTS} from "../constants";
import {UnknownComponentError} from "../errors";

export function parse(input: string): SlimNode[] {
    const lines = input.split('\n').filter(Boolean);

    const root: SlimNode[] = [];
    const stack: { indent: number; node: SlimNode }[] = [];

    for (const line of lines) {
        const match = line.match(/^(\s*)([a-zA-Z0-9_+]+)(?:\(([^)]*)\))?\s*(.*)?$/);
        if (!match) continue;

        const indent = match[1].length;
        const type = match[2];
        const rawProps = match[3] || '';
        const trailingText = match[4]?.trim();

        if(!(type in COMPONENTS))
            throw new UnknownComponentError("Unknown component: not-a-component")

        const props: Record<string, string> = {};
        rawProps.split(',').forEach((pair) => {
            const [k, v] = pair.split('=').map((s) => s?.trim());
            if (k && v) props[k] = v.replace(/^['"]|['"]$/g, '');
        });

        const node: SlimNode = {
            type,
            props,
            children: [],
        };

        if (trailingText)
            node.content = trailingText;

        while (stack.length && stack[stack.length - 1].indent >= indent)
            stack.pop();

        if (stack.length === 0)
            root.push(node);
        else
            stack[stack.length - 1].node.children.push(node);

        stack.push({indent, node});
    }

    return root;
}