import { ArgumentValue, Type } from "@cliffy/command";

const positions = ["tl", "tr", "bl", "br", "nw", "ne", "sw", "se"];

export default class Position extends Type<string> {
  public parse({ value }: ArgumentValue): string {
    return value;
  }

  override values(): Array<string> {
    return positions;
  }
}
