type LegerNode = {
  type: ComponentType;
  props: Record<string, string>;
  children: LegerNode[];
  content?: string;
};
