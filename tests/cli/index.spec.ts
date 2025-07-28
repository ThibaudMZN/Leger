import { describe, it } from "node:test";
import assert from "node:assert";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const CLI_PATH = "src/cli/index.ts";
const NODE_ARGS = ["--import", "tsx"];

const execFileAsync = promisify(execFile);

describe("Leger's CLI", () => {
  it("returns an error on unknown command", async () => {
    try {
      await execFileAsync("node", [...NODE_ARGS, CLI_PATH, "not-a-command"]);
      assert.fail("Should have thrown an error on unknown command");
    } catch (e) {
      if (e instanceof Error)
        assert.match(e.toString(), /Unknown command: not-a-command/);
      else assert.fail();
    }
  });
});
