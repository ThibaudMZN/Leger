import {describe, it, Mock, beforeEach, afterEach} from "node:test";
import assert from "node:assert";
import {build, BuildOptions} from "../../src/cli/build";

import path from "path";
import fs from "fs/promises";

describe("Slim CLI build command", () => {
    let mockPathResolve: Mock<any>;
    let mockFsMkdir: Mock<any>;
    let mockFsReaddir: Mock<any>;
    let mockFsReadFile: Mock<any>;
    let mockFsWriteFile: Mock<any>;

    const defaultTestOptions: BuildOptions = {paths: {input: '/input', output: '/output'}};

    beforeEach((context) => {
        if('mock' in context) {
            mockPathResolve = context.mock.method(path, 'resolve', (path: string) => path);
            mockFsMkdir = context.mock.method(fs, 'mkdir', async () => '');
            mockFsReaddir = context.mock.method(fs, 'readdir', async () => []);
            mockFsReadFile = context.mock.method(fs, 'readFile', async () => '');
            mockFsWriteFile = context.mock.method(fs, 'writeFile', async () => {});
        }
    });

    afterEach((context) => {
        if ('mock' in context)
            context.mock.reset();
    });

    it("can resolve input and output path", async () => {
        let resolvedPath: string[] = [];
        mockPathResolve.mock.mockImplementation((target: string) => {
            resolvedPath.push(target);
            return '';
        })

        await build(defaultTestOptions);

        assert.deepEqual(resolvedPath, ['/input', '/output']);
    });

    it("can create output dir", async () => {
        let createdDirectory: Record<string, any> = {};
        mockFsMkdir.mock.mockImplementation(async (target: string, options: Record<string, any>) => {
            createdDirectory = {target, options};
        });

        await build(defaultTestOptions);

        assert.equal(createdDirectory.target, '/output');
        assert.deepEqual(createdDirectory.options, { recursive: true });
    });

    it("can read all files from input directory", async () => {
        let readDirectory: string = '';
        mockFsReaddir.mock.mockImplementation(async (target: string) => {
            readDirectory = target;
            return []
        });

        await build(defaultTestOptions);

        assert.equal(readDirectory, '/input');
    });

    it("can generate svelte files", async () => {
        let generatedFile: Record<string, any> = {};
        mockFsReaddir.mock.mockImplementation(async () => ['index.slim']);
        mockFsReadFile.mock.mockImplementation(async () => 'text(size=large) Hello, world!');
        mockFsWriteFile.mock.mockImplementation(async (target: string, output: string) => {
            generatedFile = {target, output};
        });

        await build(defaultTestOptions);
        assert.match(generatedFile.target, /\/output\/index.svelte/);
        assert.equal(generatedFile.output, '<Text size="large">Hello, world!</Text>');
    });

    it('should omit non .slim files', async () => {
        let generatedFile: Record<string, any> = {};
        mockFsReaddir.mock.mockImplementation(async () => ['index.not-slim']);
        mockFsWriteFile.mock.mockImplementation(async (target: string, output: string) => {
            generatedFile = {target, output};
        });

        await build(defaultTestOptions);
        assert.deepEqual(generatedFile, {});
    });

    it('should return number of compiled files', async () => {
        mockFsReaddir.mock.mockImplementation(async () => ['a.slim', 'b.slim']);

        const result = await build(defaultTestOptions);
        assert.deepEqual(result.filesCount, 2);
    });
});