import { describe, it, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert";
import { dev, DevOptions, DevResult } from "../../src/cli/dev";
import path from "path";
import fs from "node:fs/promises";
import { InMemoryFileSystem } from "../builders/fileSystem.inMemory";

const defaultTestOptions: DevOptions = {
  paths: { input: "/pages" },
};

describe("Leger dev command", () => {
  let server: DevResult;
  const initialConsole = console;
  let fileSystem: InMemoryFileSystem;

  before(() => {
    console.log = () => {};
  });

  beforeEach(async (context) => {
    if ("mock" in context) {
      fileSystem = new InMemoryFileSystem();
      context.mock.method(path, "resolve", (path: string) => path);
      context.mock.method(path, "dirname", () => "/output");
      context.mock.method(fs, "watch", () => {
        return {
          [Symbol.asyncIterator]() {
            return {
              async next() {
                return { done: true, value: undefined };
              },
            };
          },
        };
      });

      context.mock.method(fs, "readFile", fileSystem.readFile.bind(fileSystem));
      fileSystem.writeFile(
        `${defaultTestOptions.paths.input}/index.leg`,
        "text() Dev server",
      );
      fileSystem.writeFile(
        "/components/components.iife.js",
        "console.log('webcomponents');",
      );
      fileSystem.writeFile("/components/style.css", "* { margin: 0; }");
      fileSystem.writeFile("/components/style.css.map", '{ "some": "value" }');

      fileSystem.mkdir(`${defaultTestOptions.paths.input}/assets`);
      fileSystem.writeFile(
        `${defaultTestOptions.paths.input}/assets/image.png`,
        "Not a real .png",
      );
    }
    server = await dev(defaultTestOptions);
  });

  afterEach(async () => {
    await server.close();
  });

  after(() => {
    console = initialConsole;
  });

  it("starts an http server", async () => {
    const response = await fetch("http://localhost:7363");

    assert.match(await response.text(), /<!DOCTYPE html>/);
  });

  it("can serve webcomponents script", async () => {
    const response = await fetch(
      "http://localhost:7363/scripts/components.iife.js",
    );

    assert.equal(await response.text(), "console.log('webcomponents');");
  });

  it("can serve styles", async () => {
    const response = await fetch("http://localhost:7363/styles/style.css");

    assert.equal(await response.text(), "* { margin: 0; }");
  });

  it("can serve style map", async () => {
    const response = await fetch("http://localhost:7363/styles/style.css.map");

    assert.equal(await response.text(), '{ "some": "value" }');
  });

  it("can serve an asset", async () => {
    const response = await fetch("http://localhost:7363/assets/image.png");

    assert.equal(await response.text(), "Not a real .png");
  });

  it("injects a client script inside HTML content", async () => {
    const response = await fetch("http://localhost:7363");

    assert.match(
      await response.text(),
      /const evtSource = new EventSource\('\/sse'\)/,
    );
  });
});
