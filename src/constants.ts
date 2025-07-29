type ComponentProps = {
  name: string;
  props?: Record<string, any>;
};

export const COMPONENTS: Record<string, ComponentProps> = {
  section: { name: "Section" },
  text: { name: "Text" }
};

export type ComponentType = keyof typeof COMPONENTS;
