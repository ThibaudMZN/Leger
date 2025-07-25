import { ComponentType } from "../../src/constants";

export class SlimNodeBuilder {
  private data: SlimNode = {
    type: "text",
    props: {},
    children: [],
  };

  withType(type: ComponentType) {
    this.data.type = type;
    return this;
  }

  withProps(props: Record<string, string>) {
    this.data.props = props;
    return this;
  }

  withChild(node: SlimNode) {
    this.data.children.push(node);
    return this;
  }

  withContent(content: string) {
    this.data.content = content;
    return this;
  }

  build(): SlimNode {
    return this.data;
  }
}
