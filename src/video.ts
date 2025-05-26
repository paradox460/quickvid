import { isString } from "@es-toolkit/es-toolkit";
import { FilterChain, FilterChainData, joinFilters } from "./utils/filters.ts";

type VideoOptions = {
  duration?: string | number;
  filters?: string[];
  editListFilters?: string[];
  palindrome?: boolean;
  // deno-lint-ignore no-explicit-any
  ffprobeInfo: any;
};

export default class Video {
  private options: VideoOptions;
  private outputDuration?: number;

  constructor(options: VideoOptions) {
    this.options = options;
  }

  get isStill(): boolean {
    return this.options.ffprobeInfo.format?.format_name === "image2";
  }

  get duration(): number {
    if (this.outputDuration) return this.outputDuration;

    if (typeof (this.options.duration) === "number") {
      return this.options.duration;
    }

    const originalDuration = this.options.ffprobeInfo.format?.duration ?? 0;
    this.outputDuration = originalDuration;

    // calculate palindrome duration first
    if (this.options.palindrome) {
      (this.outputDuration as number) *= 2;
    }
    // then calculate multiplier duration if needed
    if (isString(this.options.duration)) {
      const multiplier = Number(
        this.options.duration.match(/(\d+(?:\.\d+)?)x/)?.[1] ?? 1,
      );
      (this.outputDuration as number) *= multiplier;
    }

    return this.outputDuration as number;
  }

  public preLogoFilters(input: FilterChainData): FilterChainData {
    const { filters: userFilters, outputs: [{ name: ufOutput }] } = this
      .userFilters(input);
    const { filters: fixedDimensionsFilter, outputs: [output] } = this
      .fixDimensions(ufOutput);

    return {
      filters: [
        ...userFilters,
        ...fixedDimensionsFilter,
      ],
      outputs: [output],
    };
  }
  public postLogoFilter(
    { outputs: [{ name: inputLabel }] }: FilterChainData,
  ): FilterChainData {
    let filterChain: FilterChain;
    if (this.options.palindrome) {
      filterChain = [
        [`[${inputLabel}]`, `split`, `[p1][p2]`],
        [`[p2]`, `reverse`, `[pr]`],
        [`[p1][pr]`, `concat`, `[video]`],
      ];
    } else {
      filterChain = [
        [`[${inputLabel}]`, "null", "[video]"],
      ];
    }

    return {
      filters: filterChain,
      outputs: [{
        type: "video",
        name: "video",
      }],
    };
  }

  private userFilters(
    { outputs: [{ name: inputLabel }] }: FilterChainData,
  ): FilterChainData {
    const filters = [
      ...(this.options.editListFilters || []),
      ...(this.options.filters || []),
    ];

    return {
      filters: [
        [
          `[${inputLabel}]`,
          joinFilters(filters.length !== 0 ? filters : ["null"]),
          "[background]",
        ],
      ],
      outputs: [{
        type: "video",
        name: "background",
      }],
    };
  }

  private fixDimensions(inputLabel: string): FilterChainData {
    return {
      filters: [
        [`[${inputLabel}]`, "scale=force_divisible_by=2", "[evenized]"],
      ],
      outputs: [{
        type: "video",
        name: "evenized",
      }],
    };
  }
}
