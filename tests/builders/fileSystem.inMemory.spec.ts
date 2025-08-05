import { beforeEach, describe, it } from "node:test";
import { Dir, File, InMemoryFileSystem } from "./fileSystem.inMemory";
import assert from "node:assert";

describe("In Memory File System", () => {
  let fs: InMemoryFileSystem;

  beforeEach(() => {
    fs = new InMemoryFileSystem();
  });

  describe("when creating a folder with mkdir", () => {
    it("can create a folder node", () => {
      fs.mkdir("/folder");

      const result = fs.get("/folder") as Dir;
      assert.notEqual(result, undefined);
      assert.equal(result.type, "dir");
    });

    it("can create a nested folder", () => {
      fs.mkdir("/some/folder");

      const some = fs.get("/some") as Dir;
      assert.equal(some.type, "dir");
      assert.equal(some.children.size, 1);
      const folder = fs.get("/some/folder") as Dir;
      assert.equal(folder.type, "dir");
      assert.equal(folder.children.size, 0);
    });
  });

  describe("when deleting a folder with rm", () => {
    it("can delete a folder", () => {
      fs.mkdir("/folder");

      fs.rm("/folder");

      const result = fs.get("/") as Dir;
      assert.equal(result.children.size, 0);
    });

    it("can delete a nested folder", () => {
      fs.mkdir("/some/folder");

      fs.rm("/some/folder");

      const result = fs.get("/some") as Dir;
      assert.equal(result.children.size, 0);
    });
  });

  describe("when writing a file with writeFile", () => {
    it("can write its content", () => {
      fs.writeFile("/folder/file.txt", "some content");

      const file = fs.get("/folder/file.txt") as File;
      assert.equal(file.type, "file");
      assert.equal(file.content, "some content");
    });
  });

  describe("when copying a file with cp", () => {
    it("can copy its content", () => {
      fs.writeFile("/folder/file.txt", "some content");

      fs.cp("/folder/file.txt", "/otherFolder/file.txt");

      const file = fs.get("/otherFolder/file.txt") as File;
      assert.equal(file.type, "file");
      assert.equal(file.content, "some content");
    });
  });

  describe("when reading a file with readFile", () => {
    it("can read its content", () => {
      fs.writeFile("/folder/file.txt", "some content");

      const result = fs.readFile("/folder/file.txt");

      assert.equal(result, "some content");
    });
  });

  describe("when reading a directory with readFile", () => {
    it("can read its content", () => {
      fs.mkdir("/folder/folder1");
      fs.writeFile("/folder/file1", "");

      const [folder1, file1] = fs.readdir("/folder");

      assert.equal(folder1.name, "folder1");
      assert.equal(folder1.isFile(), false);
      assert.equal(folder1.parentPath, "/folder");
      assert.equal(file1.name, "file1");
      assert.equal(file1.isFile(), true);
      assert.equal(file1.parentPath, "/folder");
    });
  });
});
