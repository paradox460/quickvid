import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { randomInt } from "@es-toolkit/es-toolkit";
import { sprintf } from "@std/fmt/printf";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const FORMATS = [
  "YYYY-MM-DD HH:mm:ss Z", // Human readable ISO 8601 format
  "YYYY-MM-DDTHH:mm:ssZ", // Real ISO 8601 format
  "YYYY-MM-DD HH:mm:ssZZ", // Compact ISO 8601 format
  "YYYYMMDD_HHmmss", // IMG timestamp
  "hh:mm:ss A", // 12 hours
  "HH:mm:ss", // 24 Hours

];

function generateRandomValues(str: string): string {
  return str.replaceAll(/[ydhs]|(?<![AP])m|[\[\(]\d+-\d+[\]\)]/ig, (match) => {
    let lower = 0, upper: number, fmtString = "%02d";
    switch (match) {
      case "m":
      case "s":
        upper = 59;
        break;
      case "h":
      case "M":
        upper = 12;
        lower = 1;
        break;
      case "H":
        upper = 23;
        break;
      case "D":
      case "d":
        upper = 31;
        break;
      case "Y":
      case "y":
        upper = dayjs().year();
        fmtString = "%04d";
        break;
      default: {
        const bounds = match.match(
          /(?<lbi>[\[\(])(?<lb>\d+)-(?<ub>\d+)(?<ubi>[\]\)])/,
        );
        if (!bounds) throw new Error("Invalid date randomizer format");
        lower = Number(bounds!.groups!.lb);
        upper = Number(bounds!.groups!.ub);
        if (bounds!.groups!.lbi === "(") {
          lower += 1;
        }
        if (bounds!.groups!.ubi === "]") {
          upper += 1;
        }
        break;
      }
    }
    const randInt = randomInt(lower, upper);
    return sprintf(fmtString, randInt);
  });
}

function parse(str: string) {
  if (/^IMG_/.test(str)) {
    str =str.replace(/^IMG_/, "");
  }
  // Check to see if we have any randomizer tokens present
  if ((/[ymdhs\[\]\(\)]/gi).test(str)) {
    str = generateRandomValues(str);
  }
  // Attempt parsing all the formats we know of
  return dayjs(str.toUpperCase(), FORMATS);
}

export function generateFilenameDate(zone: string, input?: string): string {
  let date;
  if (input) {
    date = parse(input);
  } else {
    date = dayjs().tz(zone);
  }

  return date.format("[IMG_]YYYYMMDD_HHmmss");
}
