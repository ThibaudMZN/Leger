import { describe, it } from "node:test";
import assert from "node:assert";
import { render } from "../../src/renderer/renderer";
import { LegerNodeBuilder } from "../builders/legerNodeBuilder";

describe("Leger renderer", () => {
  it("can render a component", () => {
    const nodes: LegerNode[] = [new LegerNodeBuilder().build()];

    const result = render(nodes);

    assert.equal(result.content, "<Text></Text>");
  });

  it("can add props", () => {
    const nodes: LegerNode[] = [
      new LegerNodeBuilder().withProps({ props1: "a", props2: "b" }).build(),
    ];

    const result = render(nodes);

    assert.equal(result.content, '<Text props1="a" props2="b"></Text>');
  });

  it("can render content", () => {
    const nodes: LegerNode[] = [
      new LegerNodeBuilder().withContent("Some inner content").build(),
    ];

    const result = render(nodes);

    assert.equal(result.content, "<Text>Some inner content</Text>");
  });

  it("can render nested components", () => {
    const nodes: LegerNode[] = [
      new LegerNodeBuilder()
        .withChild(
          new LegerNodeBuilder().withContent("Some content inside").build(),
        )
        .build(),
    ];

    const results = render(nodes).content.split("\n");

    assert.equal(results[0], "<Text>");
    assert.equal(results[1], "  <Text>Some content inside</Text>");
    assert.equal(results[2], "</Text>");
  });

  it("can return a list of used components", () => {
    const nodes: LegerNode[] = [
      new LegerNodeBuilder()
        .withType("section")
        .withChild(
          new LegerNodeBuilder()
            .withType("text")
            .withContent("Some content inside")
            .build(),
        )
        .build(),
    ];

    const { usedComponents } = render(nodes);

    assert.deepEqual(Array.from(usedComponents), ["section", "text"]);
  });
});
