import { resolve } from "@std/path";
import { homedir } from "node:os";

export function absolutePath(path: string): string {
  path = path.replace("~", homedir());
  path = resolve(path);
  return path;
}
