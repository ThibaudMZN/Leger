import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { build } from "../../src/cli/build";
import { InMemoryFileSystem } from "../builders/fileSystem.inMemory";
import { BuildOptions } from "../../src/cli/build";

import fs from "fs/promises";
import path from "path";

const defaultTestOptions: BuildOptions = {
  paths: { input: "/input", output: "/output" },
};

describe("Leger build command", () => {
  let fileSystem: InMemoryFileSystem;

  beforeEach((context) => {
    if ("mock" in context) {
      context.mock.method(path, "resolve", (path: string) => path);

      fileSystem = new InMemoryFileSystem();

      const methods = ["mkdir", "rm", "cp", "readdir", "readFile", "writeFile"];
      methods.forEach((method) => {
        // @ts-ignore
        context.mock.method(fs, method, fileSystem[method].bind(fileSystem));
      });
    }

    fileSystem.set(defaultTestOptions.paths.input, {
      "index.leg": "",
    });
  });

  afterEach((context) => {
    if ("mock" in context) context.mock.reset();
  });

  it("clears and create output dir", async () => {
    await build(defaultTestOptions);

    const outDir = fileSystem.get(defaultTestOptions.paths.output);
    assert.notEqual(outDir, undefined);
  });

  it("copies components script to output", async () => {
    await build(defaultTestOptions);

    const outDir = fileSystem.get(defaultTestOptions.paths.output);
    assert.match(
      outDir["/output/scripts/components.iife.js"],
      /components.iife.js$/,
    );
  });

  it("write compiled file", async () => {
    await build(defaultTestOptions);

    const output = fileSystem.get(defaultTestOptions.paths.output);
    assert.match(output.file, /<!DOCTYPE html>/);
    assert.match(output.file, /<leger-text>/);
  });

  it("returns the file count", async () => {
    const result = await build(defaultTestOptions);

    assert.equal(result.filesCount, 1);
  });

  it("returns the duration", async () => {
    const result = await build(defaultTestOptions);

    assert.equal(result.duration > 0, true);
  });
});
