export const COMPONENTS: Record<string, string> = {
  text: "Text",
  section: "Section",
};

export type ComponentType = keyof typeof COMPONENTS;
