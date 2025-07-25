import { describe, it } from "node:test";
import assert from "node:assert";
import { parse } from "../../src/parser/parser";
import { UnknownComponentError } from "../../src/errors";

describe("Slim parser", () => {
  it("can detect component keywords", () => {
    const input = "text()";

    const tree = parse(input);

    assert.deepEqual(tree[0].type, "text");
  });

  it("can detect component props", () => {
    const input = "text(props1=a, props2=b)";

    const tree = parse(input);

    assert.deepEqual(tree[0].props, { props1: "a", props2: "b" });
  });

  it("can detect components nesting", () => {
    const input = `
        text(props1=a, props2=b)
            text()
        `;

    const tree = parse(input);

    assert.deepEqual(tree[0].children[0].type, "text");
  });

  it("can detect trailing text as content", () => {
    const input = "text(a=b) Some trailing text as content";

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
});
