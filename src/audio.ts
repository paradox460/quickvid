import { convenientCommand } from "./utils/convenient_command.ts";
import { FilterChain, FilterChainData, joinFilters } from "./utils/filters.ts";
import { absolutePath } from "./utils/paths.ts";

type AudioOptions = {
  file?: string;
  filters: string[];
  edit?: boolean;
  noaudio?: boolean;
  // deno-lint-ignore no-explicit-any
  ffprobeInfo: any;
  palindrome?: boolean;
};
export default class Audio {
  private options: AudioOptions;
  private audioStream?: string;

  constructor(options: AudioOptions) {
    this.options = options;

    if (this.options.noaudio) return;
  }

  public async load() {
    if (this.options.file?.match(/^(https?|ytsearch).*/)) {
      await this.downloadAudio();
    } else if (this.options.file) {
      this.options.file = absolutePath(this.options.file);
    } else {
      this.getAudioInfo();
    }

    if (this.options.file) {
      this.audioStream = "2:a";
    }

    return this;
  }

  get audioInput() {
    if (this.options.noaudio || !this.options.file) return [];
    return ["-i", this.options.file];
  }

  private async downloadAudio() {
    this.options.file = (await convenientCommand(
      "yt-dlp",
      "--abort-on-error",
      "-x",
      "-o",
      "/tmp/%(id)s.%(ext)s",
      ...(this.options.edit ? ["--audio-format", "wav"] : []),
      "--print",
      "after_move:filepath",
      "-w",
      "--",
      this.options.file as string,
    )).trim();

    this.options.file = absolutePath(this.options.file);

    if (this.options.edit) {
      await convenientCommand("open", "-a", "Fission", "-W", this.options.file);
    }
  }

  private getAudioInfo() {
    const audioStream = this.options.ffprobeInfo.streams.find((
      stream: { codec_type?: string },
    ) => stream.codec_type && stream.codec_type === "audio");

    if (audioStream) {
      this.audioStream = "0:a";
    }
  }

  filters(_fcd: FilterChainData): FilterChainData | null {
    if (this.options.noaudio || !this.audioStream) return null;

    let outputPad = "[audio]";
    let palindromeFilters: FilterChain = [];
    if (this.options.palindrome) {
      outputPad = "[ap1][ap2]";
      this.options.filters.push("asplit");
      palindromeFilters = [
        ["[ap2]", "areverse", "[apr]"],
        ["[ap1][apr]", "concat=v=0:a=1", "[audio]"],
      ];
    }

    const filterChain: FilterChain = [
      [
        `[${this.audioStream}]`,
        joinFilters(
          this.options.filters.length > 0 ? this.options.filters : ["anull"],
        ),
        outputPad,
      ],
      ...palindromeFilters,
    ];

    return {
      filters: filterChain,
      outputs: [{
        type: "audio",
        name: "audio",
      }],
    };
  }
}
