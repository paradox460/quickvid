import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import dayjsParser from "dayjs-parser";
import { randomInt } from "@es-toolkit/es-toolkit";
import { sprintf } from "@std/fmt/printf";
import { Table } from "@cliffy/table";
import { colors } from "@cliffy/ansi/colors";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayjsParser);

export function help(): string {
  const redBullet = colors.red("-");
  const table: Table = new Table()
    .header(["Token", "Lower Bound (inclusive)", "Upper Bound (inclusive)"])
    .body([
      [colors.blue("m, s"), 0, 59],
      [colors.blue("h, M"), 1, 12],
      [colors.blue("H"), 0, 23],
      [colors.blue("d, D"), 1, 31],
      [colors.blue("y, Y"), 0, new Date().getFullYear()],
    ])
    .padding(1)
    .indent(2)
    .border();

  return [
    colors.bold("Date Formatting and Generation\n"),
    colors.bold("Formats:\n"),
    `  ${redBullet} ${
      colors.blue("YYYY-MM-DD HH:mm:ss Z")
    } Human readable ISO 8601 format`,
    `  ${redBullet} ${
      colors.blue("YYYY-MM-DDTHH:mm:ssZ")
    } Real ISO 8601 format`,
    `  ${redBullet} ${
      colors.blue("YYYY-MM-DD HH:mm:ssZZ")
    } Compact ISO 8601 format`,
    `  ${redBullet} ${colors.blue("YYYYMMDD_HHmmss")} IMG timestamp`,
    `  ${redBullet} ${colors.blue("hh:mm:ss A")} 12 hours`,
    `  ${redBullet} ${colors.blue("HH:mm:ss")} 24 Hours`,

    "",
    colors.dim("  All timestamps may be prefixed with `IMG_`."),
    colors.dim(
      "  In the case of time-only timestamps, the date will be set to today.\n",
    ),

    colors.bold("Random Tokens:\n"),
    "  The following tokens can be used to generate random values:",
    table.toString(),
    "",

    colors.bold("Ranges"),

    `  ${redBullet} ${colors.blue("()")} exclusive`,
    `  ${redBullet} ${colors.blue("[]")} inclusive`,
    "",
  ].join("\n");
}

function generateRandomValues(str: string): string {
  return str.replaceAll(/%[ymdhs]|[\[\(]\d+-\d+[\]\)]/ig, (match) => {
    let lower = 0, upper: number, fmtString = "%02d";
    match = match.replace(/%/g, "");
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
        lower = 1;
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
    str = str.replace(/^IMG_/, "");
  }
  // Check to see if we have any randomizer tokens present
  if ((/%[ymdhs]|[\[\]\(\)]/gi).test(str)) {
    str = generateRandomValues(str);
  }
  return dayjs(str);
}

export function generateFilenameDate(
  { zone, input }: { zone?: string; input?: string },
): string {
  let date;
  if (input) {
    date = parse(input);
  } else {
    date = dayjs().tz(zone);
  }

  return date.format("[IMG_]YYYYMMDD_HHmmss");
}
