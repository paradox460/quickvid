import { convenientCommand } from "./utils/convenient_command.ts";

export async function ffprobe(filename: string) {
  return JSON.parse(
    await convenientCommand(
      "ffprobe",
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      "-count_packets",
      "--",
      filename,
    ),
  );
}
