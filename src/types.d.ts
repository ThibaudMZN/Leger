type SlimNode = {
    type: string;
    props: Record<string, string>;
    children: SlimNode[];
    content?: string;
}