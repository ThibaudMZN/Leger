import { describe, it } from "node:test";
import assert from "node:assert";
import { render } from "../../src/renderer/renderer";
import { SlimNodeBuilder } from "../builders/slimNode.builder";

describe("Slim renderer", () => {
  it("can render a component", () => {
    const nodes: SlimNode[] = [new SlimNodeBuilder().build()];

    const result = render(nodes);

    assert.equal(result, "<Text></Text>");
  });

  it("can add props", () => {
    const nodes: SlimNode[] = [
      new SlimNodeBuilder().withProps({ props1: "a", props2: "b" }).build(),
    ];

    const result = render(nodes);

    assert.equal(result, '<Text props1="a" props2="b"></Text>');
  });

  it("can render content", () => {
    const nodes: SlimNode[] = [
      new SlimNodeBuilder().withContent("Some inner content").build(),
    ];

    const result = render(nodes);

    assert.equal(result, "<Text>Some inner content</Text>");
  });

  it("can render nested components", () => {
    const nodes: SlimNode[] = [
      new SlimNodeBuilder()
        .withChild(
          new SlimNodeBuilder().withContent("Some content inside").build(),
        )
        .build(),
    ];

    const results = render(nodes).split("\n");

    assert.equal(results[0], "<Text>");
    assert.equal(results[1], "  <Text>Some content inside</Text>");
    assert.equal(results[2], "</Text>");
  });
});
