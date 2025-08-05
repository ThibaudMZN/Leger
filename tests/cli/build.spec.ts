import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { build } from "../../src/cli/build";
import { Dir, InMemoryFileSystem } from "../builders/fileSystem.inMemory";
import { BuildOptions } from "../../src/cli/build";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "node:url";

const defaultTestOptions: BuildOptions = {
  paths: { input: "/input", output: "/output" },
};

describe("Leger build command", () => {
  let fileSystem: InMemoryFileSystem;

  beforeEach((context) => {
    if ("mock" in context) {
      context.mock.method(path, "resolve", (...args: string[]) =>
        args.join("/"),
      );
      context.mock.method(path, "dirname", () => "/output");

      fileSystem = new InMemoryFileSystem();

      const methods = ["mkdir", "rm", "cp", "readdir", "readFile", "writeFile"];
      methods.forEach((method) => {
        // @ts-ignore
        context.mock.method(fs, method, fileSystem[method].bind(fileSystem));
      });
    }

    fileSystem.writeFile(
      `${defaultTestOptions.paths.input}/index.leg`,
      "text() Built text",
    );

    fileSystem.writeFile(
      "/components/components.iife.js",
      "console.log('webcomponents');",
    );
  });

  afterEach((context) => {
    if ("mock" in context) context.mock.reset();
  });

  it("clears and create output dir", async () => {
    await build(defaultTestOptions);

    const outDir = fileSystem.get(defaultTestOptions.paths.output);
    assert.equal(outDir?.type, "dir");
  });

  it("copies components script to output", async () => {
    await build(defaultTestOptions);

    const outScript = fileSystem.readFile(
      `${defaultTestOptions.paths.output}/scripts/components.iife.js`,
    );
    assert.equal(outScript, "console.log('webcomponents');");
  });

  it("write compiled file", async () => {
    await build(defaultTestOptions);

    const output = fileSystem.readFile(
      `${defaultTestOptions.paths.output}/index.html`,
    );
    assert.match(output, /<!DOCTYPE html>/);
    assert.match(output, /<leger-text>/);
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
