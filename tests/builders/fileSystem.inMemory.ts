export type File = { type: "file"; content: string };
export type Dir = { type: "dir"; children: Map<string, Node> };
type Node = File | Dir;

const makeDir = (): Dir => ({ type: "dir", children: new Map<string, Node>() });
const makeFile = (content: string): File => ({ type: "file", content });

const isDir = (node: Node): node is Dir => node.type === "dir";
const isFile = (node: Node): node is File => node.type === "file";

export class InMemoryFileSystem {
  private _fs: Dir = makeDir();

  get(path: string): Node | undefined {
    const parts = path.split("/").filter(Boolean);
    return parts.reduce<Node>((current, part) => {
      if (!isDir(current)) {
        throw new Error(`Not a directory: ${part}`);
      }
      const next = current.children.get(part);
      if (!next) {
        throw new Error(`Path does not exist: ${path}`);
      }
      return next;
    }, this._fs);
  }

  private _walk(
    path: string,
    lastNodeCallback: (dir: Dir, part: string) => void,
    noNextNodeCallback: (dir: Dir, part: string) => Node,
  ): void {
    const parts = path.split("/").filter(Boolean);

    let current: Node = this._fs;
    parts.forEach((part, index) => {
      if (!isDir(current)) throw new Error(`Not a directory: ${part}`);

      if (index === parts.length - 1) {
        lastNodeCallback(current, part);
      } else {
        let next = current.children.get(part);
        if (!next) next = noNextNodeCallback(current, part);

        current = next;
      }
    });
  }

  mkdir(path: string): void {
    this._walk(
      path,
      (current, part) => current.children.set(part, makeDir()),
      (current, part) => {
        current.children.set(part, makeDir());
        const next = current.children.get(part);
        if (!next) throw new Error(`Path does not exist: ${path}`);
        return next;
      },
    );
  }

  rm(path: string): void {
    this._walk(
      path,
      (current, part) => current.children.delete(part),
      () => {
        throw new Error(`Path does not exist: ${path}`);
      },
    );
  }

  writeFile(path: string, content: string): void {
    this._walk(
      path,
      (current, part) => current.children.set(part, makeFile(content)),
      (current, part) => {
        current.children.set(part, makeDir());
        const next = current.children.get(part);
        if (!next) throw new Error(`Path does not exist: ${path}`);
        return next;
      },
    );
  }

  cp(input: string, output: string): void {
    const target = this.get(input);
    if (!target) throw new Error(`Cannot find: ${input}`);
    if (isFile(target))
      this._walk(
        output,
        (current, part) => current.children.set(part, makeFile(target.content)),
        (current, part) => {
          current.children.set(part, makeDir());
          const next = current.children.get(part);
          if (!next) throw new Error(`Path does not exist: ${output}`);
          return next;
        },
      );
    else if (isDir(target))
      this._walk(
        output,
        (current, part) => {
          const localTarget = current.children.get(part);
          if (localTarget && isDir(localTarget))
            localTarget.children = target.children;
        },
        (current, part) => {
          current.children.set(part, makeDir());
          const next = current.children.get(part);
          if (!next) throw new Error(`Path does not exist: ${output}`);
          return next;
        },
      );
  }

  readFile(path: string): string {
    const file = this.get(path);
    if (!file || !isFile(file)) throw new Error(`Cannot find file: ${path}`);

    return file.content;
  }

  readdir(path: string) {
    const folder = this.get(path);
    if (!folder || !isDir(folder)) throw new Error(`Not a directory: ${path}`);

    const parts = path.split("/").filter(Boolean);
    const parentPath = `/${parts[parts.length - 1]}`;
    const files = folder.children;
    return files.entries().map(([name, node]) => ({
      name,
      isFile: () => node.type === "file",
      parentPath,
    }));
  }

  lstat(path: string) {
    const target = this.get(path);
    if (!target) throw new Error(`Cannot find : ${path}`);
    return {
      isDirectory: () => target.type === "dir",
      isFile: () => target.type === "file",
    };
  }
}
