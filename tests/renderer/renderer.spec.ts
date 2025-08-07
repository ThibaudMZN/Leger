import { describe, it } from "node:test";
import assert from "node:assert";
import { render, renderFrontmatter } from "../../src/renderer/renderer";
import { LegerNodeBuilder } from "../builders/legerNodeBuilder";

describe("Leger renderer", () => {
  describe("Content renderer", () => {
    it("can render a component", () => {
      const nodes: LegerNode[] = [new LegerNodeBuilder().build()];

      const result = render(nodes);

      assert.equal(result.content, "<leger-text></leger-text>");
    });

    it("can add props", () => {
      const nodes: LegerNode[] = [
        new LegerNodeBuilder().withProps({ props1: "a", props2: "b" }).build(),
      ];

      const result = render(nodes);

      assert.equal(
        result.content,
        '<leger-text props1="a" props2="b"></leger-text>',
      );
    });

    it("can render content", () => {
      const nodes: LegerNode[] = [
        new LegerNodeBuilder().withContent("Some inner content").build(),
      ];

      const result = render(nodes);

      assert.equal(
        result.content,
        "<leger-text>Some inner content</leger-text>",
      );
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

      assert.equal(results[0], "<leger-text>");
      assert.equal(
        results[1],
        "  <leger-text>Some content inside</leger-text>",
      );
      assert.equal(results[2], "</leger-text>");
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

  describe("Frontmatter renderer", () => {
    it("can render default values", () => {
      const result = renderFrontmatter({});

      assert.equal(result, "<title>Leger</title>");
    });

    it("can render head values", () => {
      const result = renderFrontmatter({
        title: "Custom title",
        siteName: "Custom site name",
        description: "Custom description",
      });

      assert.equal(
        result,
        `<title>Custom title</title>
<meta property="og:site_name" content="Custom site name">
<meta name="description" content="Custom description">`,
      );
    });
  });
});
