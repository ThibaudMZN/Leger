export class InMemoryFileSystem {
  private _fs: Record<string, any> = {};

  private _extractPath(path: string): string {
    return path.split("/").filter(Boolean)[0];
  }

  get(path: string): Record<string, any> {
    return this._fs[this._extractPath(path)];
  }

  set(path: string, value: Record<string, any>): void {
    this._fs[this._extractPath(path)] = value;
  }

  mkdir(path: string) {
    this._fs[this._extractPath(path)] = {};
  }

  rm(path: string) {
    delete this._fs[this._extractPath(path)];
  }

  cp(input: string, output: string) {
    this._fs[this._extractPath(output)] = {
      ...this._fs[this._extractPath(output)],
      [output]: input,
    };
  }

  readdir(path: string) {
    const files = this.get(path);
    return Object.keys(files).map((f) => ({
      name: f,
      isFile: () => true,
      parentPath: "",
    }));
  }

  readFile(path: string) {
    return "text()";
  }

  writeFile(path: string, content: string): void {
    this._fs[this._extractPath(path)]["file"] = content;
  }
}
