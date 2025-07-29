type ComponentProps = {
  name: string;
  props: string[];
};

export const COMPONENTS: Record<string, ComponentProps> = {
  section: { name: "Section", props: ["columns"] },
  text: { name: "Text", props: ["size"] },
};

export type ComponentType = keyof typeof COMPONENTS;
