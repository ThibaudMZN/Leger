import {
  describe,
  it,
  Mock,
  beforeEach,
  afterEach,
  mock,
  before,
} from "node:test";
import assert from "node:assert";
import { BuildOptions, BuildResult } from "../../src/cli/build";

import path from "path";
import fs from "fs/promises";

describe("Leger build command", async () => {
  let mockPathResolve: Mock<any>;
  let mockFsMkdir: Mock<any>;
  let mockFsReaddir: Mock<any>;
  let mockFsReadFile: Mock<any>;
  let mockFsWriteFile: Mock<any>;

  const defaultTestOptions: BuildOptions = {
    paths: { input: "/input", output: "/output" },
  };

  let build: (option: BuildOptions) => Promise<BuildResult>;
  before(async () => {
    // const viteNamedExports = await import("vite").then((v) => v);
    mock.module("vite", {
      namedExports: {
        build: mock.fn(),
      },
    });

    ({ build } = await import("../../src/cli/build"));
  });

  beforeEach((context) => {
    if ("mock" in context) {
      mockPathResolve = context.mock.method(
        path,
        "resolve",
        (path: string) => path,
      );
      mockFsMkdir = context.mock.method(fs, "mkdir", async () => "");
      mockFsReaddir = context.mock.method(fs, "readdir", async () => []);
      mockFsReadFile = context.mock.method(fs, "readFile", async () => "");
      mockFsWriteFile = context.mock.method(fs, "writeFile", async () => {});

      context.mock.method(fs, "cp", async () => {});
      context.mock.method(fs, "rm", async () => {});
      context.mock.method(process, "chdir", () => {});
    }
  });

  afterEach((context) => {
    if ("mock" in context) context.mock.reset();
  });

  await it("can resolve input and output path", async () => {
    let resolvedPath: string[] = [];
    mockPathResolve.mock.mockImplementation((target: string) => {
      resolvedPath.push(target);
      return "";
    });

    await build(defaultTestOptions);

    assert.deepEqual(resolvedPath, ["/input", "/output"]);
  });

  await it("can create output dir", async () => {
    let createdDirectory: Record<string, any> = {};
    mockFsMkdir.mock.mockImplementationOnce(
      async (target: string, options: Record<string, any>) => {
        createdDirectory = { target, options };
      },
    );

    await build(defaultTestOptions);

    assert.equal(createdDirectory.target, "/output");
    assert.deepEqual(createdDirectory.options, { recursive: true });
  });

  await it("can read all files from input directory", async () => {
    let readDirectory: string = "";
    mockFsReaddir.mock.mockImplementationOnce(async (target: string) => {
      readDirectory = target;
      return [];
    });

    await build(defaultTestOptions);

    assert.equal(readDirectory, "/input");
  });

  await it("can generate svelte files", async () => {
    let generatedFile: Record<string, any> = {};
    mockFsReaddir.mock.mockImplementationOnce(async () => ["index.leg"]);
    mockFsReadFile.mock.mockImplementationOnce(
      async () => "text(size=large) Hello, world!",
    );
    mockFsWriteFile.mock.mockImplementationOnce(
      async (target: string, output: string) => {
        generatedFile = { target, output };
      },
    );

    await build(defaultTestOptions);
    assert.match(generatedFile.target, /\/output\/index.svelte/);
    assert.match(
      generatedFile.output,
      /<Text size="large">Hello, world!<\/Text>/,
    );
  });

  await it("should omit non .leg files", async () => {
    let generatedFile: Record<string, any> = {};
    mockFsReaddir.mock.mockImplementation(async () => ["index.not-leg"]);
    let fileWritten = false;
    mockFsWriteFile.mock.mockImplementation(async () => {
      fileWritten = true;
    });

    await build(defaultTestOptions);
    assert.equal(fileWritten, false);
  });

  await it("should return number of compiled files", async () => {
    mockFsReaddir.mock.mockImplementation(async () => ["a.leg", "b.leg"]);

    const result = await build(defaultTestOptions);
    assert.deepEqual(result.filesCount, 2);
  });
});
