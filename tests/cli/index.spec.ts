import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import { runCli } from "../../src/cli/index";

describe("Leger's CLI", () => {
  let originalConsoleError: (...data: string[]) => void;
  let originalProcessExit: (code?: number | string | null | undefined) => never;
  let errors: string[] = [];
  let exitCode: number | string | null | undefined;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = (error: string) => {
      errors.push(error);
    };

    originalProcessExit = process.exit;
    // @ts-ignore
    process.exit = (code?: number | string | null | undefined) => {
      exitCode = code;
    };
  });

  afterEach(() => {
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });

  it("returns an error on unknown command", async () => {
    await runCli("not-a-command");
    assert.match(errors[0], /Unknown command: not-a-command/);
    assert.equal(exitCode, 1);
  });
});
