export function joinFilters(filters: Array<string>): string {
  return filters.join(", ");
}

export type FilterChain = string[][];
export function joinFilterChains(filterChains: FilterChain): string {
  return filterChains.map((chain) => {
    return chain?.join(" ");
  }).join(";");
}

export type output = {
  type: "audio" | "video";
  name: string;
};

type Data = {
  filters: FilterChain;
  outputs: output[];
};

export type FilterChainData = Data;

// deno-lint-ignore no-explicit-any
export function genFilterChainData(merge: any): FilterChainData {
  return { filters: [], outputs: [], ...merge };
}
