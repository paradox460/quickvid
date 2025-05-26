import { ArgumentValue, Type, ValidationError } from "@cliffy/command";

export default class DurationType extends Type<string | number> {
  public parse({ label, name, value }: ArgumentValue): string | number {
    if (value.match(/\d+(?:\.\d+)?x/)) {
      // Dealing with a multiplier duration
      return value;
    } else {
      const num = Number(value);
      if (Number.isFinite(num)) {
        return num;
      }

      throw new ValidationError(
        `${label} ${name} must be a valid number or a multiplier ending in 'x', got '${value}'`,
      );
    }
  }
}
