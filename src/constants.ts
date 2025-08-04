type ComponentProps = {
  name: string;
  props: string[];
};

export const COMPONENTS: Record<string, ComponentProps> = {
  link: { name: "leger-link", props: ["target"] },
  section: { name: "leger-section", props: ["columns"] },
  text: { name: "leger-text", props: ["size"] },
};

export type ComponentType = keyof typeof COMPONENTS;
