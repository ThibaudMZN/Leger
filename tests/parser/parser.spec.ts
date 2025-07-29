import { describe, it } from "node:test";
import assert from "node:assert";
import { parse } from "../../src/parser/parser";
import { UnknownComponentError, UnknownPropertyError } from "../../src/errors";

describe("Leger parser", () => {
  it("can detect component keywords", () => {
    const input = "text()";

    const tree = parse(input);

    assert.deepEqual(tree[0].type, "text");
  });

  it("can detect component props", () => {
    const input = "text(size=small)";

    const tree = parse(input);

    assert.deepEqual(tree[0].props, { size: "small" });
  });

  it("can detect components nesting", () => {
    const input = `
        text()
            text()
        `;

    const tree = parse(input);

    assert.deepEqual(tree[0].children[0].type, "text");
  });

  it("can detect trailing text as content", () => {
    const input = "text() Some trailing text as content";

    const tree = parse(input);

    assert.deepEqual(tree[0].content, "Some trailing text as content");
  });

  it("throws an error if it's not a know component", () => {
    const input = "notAComponent(a=b)";

    assert.throws(
      () => parse(input),
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
      () => parse(input),
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
