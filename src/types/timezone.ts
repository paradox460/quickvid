import { ArgumentValue, Type, ValidationError } from "@cliffy/command";

export default class TimeZoneType extends Type<string> {
  public parse({ label, name, value }: ArgumentValue): string {
    if (Intl.supportedValuesOf("timeZone").includes(value)) {
      return value;
    }

    throw new ValidationError(
      `${label} ${name} must be a valid time zone, got '${value}'`,
    );
  }

  override complete(): Array<string> {
    return Intl.supportedValuesOf("timeZone");
  }
}
