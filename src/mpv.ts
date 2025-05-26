import {
  convenientCommand,
  convenientSpawn,
} from "./utils/convenient_command.ts";

export async function openInMpv(filename: string, editfile: string) {
  await convenientSpawn(
    "mpv",
    filename,
    "--loop",
    "--fs",
    `--script-opts=writeedits-filename="${editfile}"`,
  );
  await convenientCommand(
    "osascript",
    "-l",
    "JavaScript",
    `-e`,
    `Application("iTerm2").activate()`,
  );
}
