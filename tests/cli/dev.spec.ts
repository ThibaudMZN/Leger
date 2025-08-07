import { describe, it, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert";
import { dev, DevResult } from "../../src/cli/dev";
import path from "path";
import fs from "node:fs/promises";

describe("Leger dev command", () => {
  let server: DevResult;
  const initialConsole = console;

  before(() => {
    console.log = () => {};
  });

  beforeEach(async (context) => {
    if ("mock" in context) {
      context.mock.method(path, "resolve", (path: string) => path);
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
      context.mock.method(fs, "readFile", (path: string) => {
        if (path.endsWith(".leg")) return "text() Dev server";
        if (path.endsWith(".css")) return "* { margin: 0; }";
        if (path.endsWith(".css.map")) return '{ "some": "value" }';
        return "console.log('webcomponents');";
      });
    }
    server = await dev();
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

  it("injects a client script inside HTML content", async () => {
    const response = await fetch("http://localhost:7363");

    assert.match(
      await response.text(),
      /const evtSource = new EventSource\('\/sse'\)/,
    );
  });
});
