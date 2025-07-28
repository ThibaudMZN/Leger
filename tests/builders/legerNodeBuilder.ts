import { ComponentType } from "../../src/constants";

export class LegerNodeBuilder {
  private data: LegerNode = {
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

  withChild(node: LegerNode) {
    this.data.children.push(node);
    return this;
  }

  withContent(content: string) {
    this.data.content = content;
    return this;
  }

  build(): LegerNode {
    return this.data;
  }
}
