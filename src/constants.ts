type ComponentProps = {
  name: string;
  props: string[];
};

export const COMPONENTS: Record<string, ComponentProps> = {
  link: { name: "Link", props: ["target"] },
  section: { name: "Section", props: ["columns"] },
  text: { name: "Text", props: ["size"] },
};

export type ComponentType = keyof typeof COMPONENTS;
