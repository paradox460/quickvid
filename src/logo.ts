import { FilterChain, FilterChainData, joinFilters } from "./utils/filters.ts";
import { absolutePath } from "./utils/paths.ts";

type LogoOptions = {
  position?: string;
  filename?: string;
  width: string;
  wiggle?: boolean | number;
  filters?: Array<string>;
};

type positionTuple = [string, string] | [];

export default class Logo {
  private file: string = "";
  private position: positionTuple = [];
  private options: LogoOptions;

  constructor(options: LogoOptions) {
    this.options = options;
    if (!this.options.filename) {
      return;
    }
    this.logoFile();
    this.calcPosition();
    this.doWiggle();
  }

  private logoFile() {
    this.file = absolutePath(this.options.filename as string);
  }

  get logoInput() {
    if (!this.options.filename) return [];
    return ["-i", this.file];
  }

  private calcPosition() {
    if (!this.options.position) {
      this.options.position = "br";
    }
    switch (this.options.position) {
      case "tl":
      case "nw":
        this.position = ["0", "0"];
        break;
      case "tr":
      case "ne":
        this.position = ["W-w-10", "10"];
        break;
      case "bl":
      case "sw":
        this.position = ["10", "H-h-10"];
        break;
      case "br":
      case "se":
        this.position = ["W-w-10", "H-h-10"];
        break;
      default:
        this.position = this.options.position.split(":", 2) as positionTuple;
        break;
    }
  }

  private doWiggle() {
    if (!this.options.wiggle) return;
    if (typeof this.options.wiggle === "boolean") {
      this.options.wiggle = 2;
    }
    const wiggleString =
      `'+randomi(t,-${this.options.wiggle},${this.options.wiggle})'`;
    this.position = this.position.map((v) =>
      `${v}${wiggleString}`
    ) as positionTuple;
  }

  filters(
    { outputs: [{ name: inputLabel }] }: FilterChainData,
  ): FilterChainData | null {
    if (!this.options.filename) return null;
    const label = "[filteredLogo]";
    const initialFilters = [
      "[1:v]",
      joinFilters(this.options.filters || ["null"]),
      label,
    ];
    const filterChain: FilterChain = [initialFilters];

    // If we have a logo width that uses any of the ffmpeg scale ref expressions
    // we need to split the background and pass that as a param to scale

    if ((/ref_|r[wh]|rdar/i).test(this.options.width)) {
      filterChain.push([
        `[${inputLabel}]`,
        "split",
        `[${inputLabel}1][${inputLabel}2]`,
      ]);

      filterChain.push([
        `${label}[${inputLabel}1]`,
        `scale=w=${this.options.width}:h=-1`,
        "[logo]",
      ]);
      inputLabel = `${inputLabel}2`;
    } else {
      filterChain.push([
        `${label}`,
        `scale=w=${this.options.width}:h=-1`,
        "[logo]",
      ]);
    }
    filterChain.push([
      `[${inputLabel}][logo]`,
      `overlay=${this.position[0]}:${this.position[1]}`,
      "[overlaid]",
    ]);

    return {
      filters: filterChain,
      outputs: [{
        type: "video",
        name: "overlaid",
      }],
    };
  }
}
