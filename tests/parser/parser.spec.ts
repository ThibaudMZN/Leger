import { describe, it } from "node:test";
import assert from "node:assert";
import {
  parse,
  parseFrontmatter,
  parseLeger,
  splitContent,
} from "../../src/parser/parser";
import { UnknownComponentError, UnknownPropertyError } from "../../src/errors";

describe("Leger parser", () => {
  describe("File content splitter", () => {
    it("can split frontmatter and leger content", () => {
      const input = `---
title: Hello World
---
      
text()`;

      const { rawFrontmatter, rawLegerContent } = splitContent(input);
      assert.equal(rawFrontmatter, `title: Hello World`);
      assert.equal(rawLegerContent, "text()");
    });

    it("can return only leger content if no frontmatter", () => {
      const input = "text()";

      const { rawFrontmatter, rawLegerContent } = splitContent(input);

      assert.equal(rawFrontmatter, "");
      assert.equal(rawLegerContent, "text()");
    });
  });

  describe("Frontmatter parser", () => {
    it("can parse single values", () => {
      const input = `title: Some title
description: Some description`;

      const frontmatter = parseFrontmatter(input);
      assert.equal(frontmatter.title, "Some title");
      assert.equal(frontmatter.description, "Some description");
    });

    it("can parse an array", () => {
      const input = `array:
  - First item
  - Second item
`;

      const frontmatter = parseFrontmatter(input);
      assert.deepEqual(frontmatter.array, ["First item", "Second item"]);
    });
  });

  describe("Content parser", () => {
    it("can detect component keywords", () => {
      const input = "text()";

      const tree = parseLeger(input);

      assert.deepEqual(tree[0].type, "text");
    });

    it("can detect component props", () => {
      const input = "text(size=small)";

      const tree = parseLeger(input);

      assert.deepEqual(tree[0].props, { size: "small" });
    });

    it("can detect components nesting", () => {
      const input = `
        text()
            text()
        `;

      const tree = parseLeger(input);

      assert.deepEqual(tree[0].children[0].type, "text");
    });

    it("can detect trailing text as content", () => {
      const input = "text() Some trailing text as content";

      const tree = parseLeger(input);

      assert.deepEqual(tree[0].content, "Some trailing text as content");
    });

    it("throws an error if it's not a know component", () => {
      const input = "notAComponent(a=b)";

      assert.throws(
        () => parseLeger(input),
        (e) => {
          assert(e instanceof UnknownComponentError);
          assert.match(e.toString(), /Unknown component: notAComponent/);
          return true;
        },
      );
    });

    it("throws an error if the component has unknown properties", () => {
      const input = "text(notAProps=a)";

      assert.throws(
        () => parseLeger(input),
        (e) => {
          assert(e instanceof UnknownPropertyError);
          assert.match(
            e.toString(),
            /Unknown property for component 'text': notAProps/,
          );
          return true;
        },
      );
    });
  });

  describe("Full parser", () => {
    it("returns both Leger content and Frontmatter content", () => {
      const input = `---
title: Some title
---
      
text()`;

      const result = parse(input);

      assert.deepEqual(result, {
        frontmatter: {
          title: "Some title",
        },
        nodes: [{ type: "text", children: [], props: {} }],
      });
    });
  });
});
