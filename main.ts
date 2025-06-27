import { Command } from "@cliffy/command";
import { isNull } from "@es-toolkit/es-toolkit";
import * as Path from "@std/path";
import packageInfo from "./deno.json" with { type: "json" };
import Audio from "./src/audio.ts";
import { generateFilenameDate, help as dateHelp } from "./src/dates.ts";
import { EditFile } from "./src/editfile.ts";
import { ffprobe } from "./src/ffprobe.ts";
import Logo from "./src/logo.ts";
import { openInMpv } from "./src/mpv.ts";
import DurationType from "./src/types/duration-type.ts";
import Position from "./src/types/position.ts";
import TimeZoneType from "./src/types/timezone.ts";
import {
  FilterChain,
  genFilterChainData,
  joinFilterChains,
} from "./src/utils/filters.ts";
import Video from "./src/video.ts";
import { absolutePath } from "./src/utils/paths.ts";
import {
  convenientCommand,
  convenientSpawn,
} from "./src/utils/convenient_command.ts";
import { promptForPosition } from "./src/position-prompt.ts";
import { set } from "@es-toolkit/es-toolkit/compat";
import shellEscape from "x/shell_escape";
import { CompletionsCommand } from "@cliffy/command/completions";

const args = await new Command()
  .name("quickvid")
  .version(packageInfo.version)
  .description(
    "Tool for working with video and images, for quick edits, watermarking, and conversion."
  )
  .arguments("<input:file> [output:file]")
  .option("-e, --edit", "Opens the command in an editor before dispatching")
  .option("--mpv", "Opens the file in MPV before processing")
  .option("--cleanup", "Deletes the original file after processing")
  .group("Audio Options")
  .option(
    "-a, --audio.file <audio:file>",
    `Audio file to use as background. Overwrites any audio from the original file. Has no effect if input is an image.`,
  )
  .option(
    "-a.f, --audio.filters, --af <filter>",
    "Extra filters to apply to the audio",
    { collect: true },
  )
  .option("-a.e, --audio.edit", "Edit the audio file in Fission")
  .option("-a.n, --audio.noaudio", "Strip all audio")
  .group("Logo Options")
  .type("position", new Position())
  .option(
    "--logo.filename, --logofile <filename:file>",
    `The filename of the logo to use. If absent, no logo is added`,
    {},
  )
  .option(
    "-l.p, --logo.position, --position, -p <position:position>",
    `Position of the watermark. Default is bottom-right. Pass a string like '34:22' for x-y coordinates`,
  )
  .option(
    "-l.w, --logo.width <width>",
    `Width of the watermark. Default is 1/5th of the input width. Directly passed to scale2ref filter`,
    { default: "ref_w/5" },
  )
  .option(
    "-l.wi, --logo.wiggle [magnitude:integer]",
    `Make the logo "wiggle", tiktok style`,
  )
  .option(
    "-l.f, --logo.filters <filter>",
    "Extra filters to apply to the logo",
    { collect: true },
  )
  .group("Video Options")
  .type("duration", new DurationType())
  .option(
    "-v.d, --video.duration, --duration <duration:duration>",
    "Duration of the output video",
  )
  .option(
    "-v.f, --video.filters, --vf <filter>",
    "Extra filters to apply to the video",
    { collect: true },
  )
  .option(
    "-v.e, --video.editfile [editfile:file]",
    "Reads an editfile, produced by mpv. Currently only handles filters, not durations",
  )
  .option(
    "-v.p, --video.palindrome",
    "Makes the video loop forwards and then backwards.",
  )
  .group("Date Options")
  .option("-d, --date.date, --date <date>", "Date to use for output.", {})
  .type("timezone", new TimeZoneType())
  .option(
    "-d.z, --date.zone, --tz <timezone:timezone>",
    "The timezone to use, otherwise uses current timezone"
  )
  .group("Output Options")
  .option(
    "-o.d, -o, --output.directory, --output <directory:file>",
    "Output directory for the generated files",
    { default: "/tmp/" },
  )
  .option(
    "-o.y, --output.yoink, --yoink",
    "Adds the file to yoink when finished",
  )
  .option(
    "-o.c, --output.copy, --copy",
    "Adds the file to the clipboard when finished",
  )
  .option(
    "-o.o, --output.open, --open",
    "Opens the output file in the default application",
  )
  .option("-o.command, --output.command", "Prints the (unescaped) command ")
  .command("completions", new CompletionsCommand())
  .reset()
  .command("dates")
  .action(() => {
    console.log(dateHelp());
    Deno.exit(0);
  })
  .reset()
  .parse(Deno.args);

// If we're doing completions, bail out
if (args.cmd.constructor.name !== "Command") {
  Deno.exit(0);
}

const { options } = args;

let { args: [inputFile, outputFile] } = args;
inputFile = absolutePath(inputFile);
outputFile = outputFile && absolutePath(outputFile);

const ffprobeInfo = await ffprobe(inputFile);

let removeEdits = !!options.cleanup, edits: EditFile | null = null;
let editFilters: string[] = [];

const editFileName = EditFile.getName(options.video?.editfile || options?.mpv);

if (options.mpv) {
  removeEdits = true;
  await openInMpv(inputFile, editFileName as string);
  if (options.logo?.filename && !options.logo?.position) {
    set(options, "logo.position", await promptForPosition());
  }
}

if (editFileName) {
  edits = await (new EditFile(editFileName).load());
  editFilters = edits.getFilters(inputFile) ||
    edits.getFilters(absolutePath(inputFile));
}

const video = new Video({
  duration: options.video?.duration,
  filters: options.video?.filters ? [...options.video.filters] : undefined,
  editListFilters: editFilters,
  palindrome: !!options.video?.palindrome,
  ffprobeInfo,
});

const logo = new Logo({
  position: options.logo?.position,
  width: options.logo?.width,
  wiggle: options.logo?.wiggle,
  filters: options.logo?.filters ? [...options.logo.filters] : undefined,
  filename: options.logo?.filename
});

const audio = await (new Audio({
  file: options.audio?.file,
  filters: options.audio?.filters ? [...options.audio.filters] : [],
  noaudio: !!options.audio?.noaudio,
  edit: !!options.audio?.edit,
  palindrome: !!options.video?.palindrome,
  ffprobeInfo,
}).load());

type filterClasses = Video | Logo | Audio;
type KeysOfUnion<T> = T extends T ? keyof T : never;
type filterMethodValues = KeysOfUnion<filterClasses>;

const filterChain: [filterClasses, filterMethodValues][] = [
  [video, "preLogoFilters"],
  [logo, "filters"],
  [video, "postLogoFilter"],
  [audio, "filters"],
];

let filterList: FilterChain = [];
let result = genFilterChainData({ outputs: [{ type: "video", name: "0:v" }] });
const finalOutput: { video?: string; audio?: string } = {
  video: undefined,
  audio: undefined,
};

for (const [obj, method] of filterChain) {
  // deno-lint-ignore no-explicit-any
  const methodResult = (obj as any)[method](result);
  if (isNull(methodResult)) continue;
  result = methodResult;
  filterList = [...filterList, ...result.filters];
  finalOutput[result.outputs[0].type] = result.outputs[0].name;
}

const filterGraph = joinFilterChains(filterList);

if (!outputFile) {
  const extension = video.isStill ? "jpg" : "mp4";
  const filename = generateFilenameDate(
    {
      zone: options.date?.zone,
      input: options.date?.date
    },
  ) + "." + extension;
  outputFile = absolutePath(Path.join(options.output.directory, filename));
}

const videoOutput = [
  ...(video.isStill ? [] : ["-c:v", "libx264", "-pix_fmt", "yuv420p"]),
  "-map",
  `[${finalOutput.video}]`
];

const duration = !video.isStill || video.duration > 0
  ? ["-t", video.duration.toString()]
  : ["-vframes", "1"];

let ffmpegCommand = [
  "-loglevel",
  "error",
  "-i",
  inputFile,
  ...logo.logoInput,
  ...audio.audioInput,
  "-filter_complex",
  filterGraph,
  ...videoOutput,
  ...(finalOutput.audio
    ? ["-c:a", "aac", "-map", `[${finalOutput.audio}]`]
    : ["-an"]),
  "-map_metadata",
  "-1",
  ...duration,
  outputFile,
];

if (options.edit) {
  const ffmpegArgsFile = await Deno.makeTempFile({ suffix: ".json" });
  await Deno.writeTextFile(
    ffmpegArgsFile,
    JSON.stringify(ffmpegCommand, null, 2),
  );
  await convenientSpawn(`nvim`, ffmpegArgsFile);
  ffmpegCommand = await Deno.readTextFile(ffmpegArgsFile).then(JSON.parse);
}

if (options.output?.command) {
  const escaped = shellEscape(ffmpegCommand);
  console.log(`\nffmpeg ${escaped}\n`);
}

await convenientSpawn(`ffmpeg`, ...ffmpegCommand);

if (options.output?.yoink) {
  try {
    convenientCommand("open", "-a", "Yoink", outputFile);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }
}
if (options.output?.copy) {
  try {
    const script = `
    on run args
      set the clipboard to POSIX file (first item of args)
    end
    `;
    convenientCommand("osascript", "-e", script, outputFile);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }
}

if (options.output?.open) {
  try {
    convenientCommand("open", outputFile);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }
}
if (removeEdits && edits) {
  edits.cleanup();
}

if (options.cleanup) {
  try {
    Deno.removeSync(inputFile);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }
}

console.log(outputFile);
