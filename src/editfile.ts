import { isString } from "@es-toolkit/es-toolkit";
import { absolutePath } from "./utils/paths.ts";

const defaultEditFile = "/tmp/quickedits";

type EditRule = {
  end: number;
  filters: string[];
  newFilename: string;
  path: string;
  start: number;
};

export class EditFile {
  edits: EditRule[] = [];
  filename: string;

  constructor(filename: string) {
    this.filename = absolutePath(filename);
  }

  public async load() {
    try {
      const decoder = new TextDecoder("utf-8");
      const rawData = await Deno.readFile(this.filename);
      const text = decoder.decode(rawData);
      this.edits = text.split("\n").map((line) => {
        return JSON.parse(line) as EditRule;
      });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
    return this;
  }

  public findEdit(currentFile: string): EditRule | undefined {
    return this.edits.find(({ path }) => {
      return path === currentFile;
    });
  }

  public getFilters(currentFile: string): string[] {
    const edits = this.findEdit(currentFile);
    return edits?.filters ?? [];
  }

  public static getName(editFileArg: string | true | undefined): string | null {
    if (isString(editFileArg)) return editFileArg;
    if (editFileArg) return defaultEditFile;
    return null;
  }

  public cleanup() {
    try {
      Deno.removeSync(this.filename);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }
}
