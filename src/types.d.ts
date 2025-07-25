type SlimNode = {
  type: ComponentType;
  props: Record<string, string>;
  children: SlimNode[];
  content?: string;
};
