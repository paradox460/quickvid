import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import { randomInt } from "@es-toolkit/es-toolkit";
import { sprintf } from "@std/fmt/printf";
import { Table } from "@cliffy/table";
import { colors } from "@cliffy/ansi/colors";
import * as chrono from 'chrono-node'

dayjs.extend(utc);
dayjs.extend(timezone);

export function help(): string {
  const redBullet = colors.red("-");
  const table: Table = new Table()
    .header(["Token", "Lower Bound (inclusive)", "Upper Bound (inclusive)"])
    .body([
      [colors.blue("%m, %s"), 0, 59],
      [colors.blue("%h, %M"), 1, 12],
      [colors.blue("%H"), 0, 23],
      [colors.blue("%d, %D"), 1, 31],
      [colors.blue("%y, %Y"), 0, new Date().getFullYear()],
    ])
    .padding(1)
    .indent(4)
    .border();

  return [
    colors.yellow.bold("Input:"),
    [
      colors.bold(
        "24 hour time (any date format followed by a 24-hour time expression)",
      ),
      `  ${redBullet} 17:41:28`,
      `  ${redBullet} 17:41:28Z`,
      `  ${redBullet} 17:41:28.999Z`,
      `  ${redBullet} 17:41:28.999999Z`,
      `  ${redBullet} 17:41:28.999999999Z`,
      `  ${redBullet} 17:41:28 MST`,
      `  ${redBullet} 17:41:28 Eastern Daylight Time`,
      `  ${redBullet} 17:41:28 GMT+03:00`,
      `  ${redBullet} 17:41:28 GMT-9`,
      `  ${redBullet} 17:41:28-09:00`,
      `  ${redBullet} 17:41:28+0900`,
      "",
      colors.bold(
        "12 hour time (any date format followed by a 12-hour time expression)",
      ),

      `  ${redBullet} 9:26:53 am`,
      `  ${redBullet} 9:26:53 a.m.`,
      `  ${redBullet} 9:26:53am`,
      `  ${redBullet} 9:26pm`,
      `  ${redBullet} 9pm`,
      "",
      colors.bold(`year month day`),

      `  ${redBullet} 2016-09-24`,
      `  ${redBullet} 2016-9-24`,
      `  ${redBullet} 2016/9/24`,
      `  ${redBullet} 20160924`,
      "",
      colors.bold("day monthname year"),

      `  ${redBullet} Wednesday, 01 January 2020`,
      `  ${redBullet} Wednesday 01 January 2020`,
      `  ${redBullet} Wed, 01 January 2020`,
      `  ${redBullet} Wed 01 January 2020`,
      `  ${redBullet} 01 January 2020`,
      `  ${redBullet} 01-January-2020`,
      `  ${redBullet} 1 Jan 2020`,
      `  ${redBullet} 1-Jan-2020`,
      `  ${redBullet} 01 Jan 20`,
      `  ${redBullet} 1 Jan 20`,
      "",
      colors.bold("monthname day year"),

      `  ${redBullet} Sunday, March 27 2016`,
      `  ${redBullet} Sunday March 27 2016`,
      `  ${redBullet} Sun, March 27 2016`,
      `  ${redBullet} Sun March 27 2016`,
      `  ${redBullet} March 27 2016`,
      `  ${redBullet} Mar 27, 2016`,
      `  ${redBullet} Mar 27 2016`,
      "",
      colors.bold(`month day year`),

      `  ${redBullet} 03/14/2020`,
      `  ${redBullet} 03-14-2020`,
      `  ${redBullet} 3/14/2020`,
      `  ${redBullet} 3-14-2020`,
      `  ${redBullet} 03/14/20`,
      `  ${redBullet} 03-14-20`,
      "",
      colors.bold(`day month year`),

      `  ${redBullet} 14/03/2020`,
      `  ${redBullet} 14.03.2020`,
      `  ${redBullet} 14/3/2020`,
      `  ${redBullet} 14.3.2020`,
      `  ${redBullet} 14/03/20`,
      `  ${redBullet} 14.03.20`,
      `  ${redBullet} 14/3/20`,
      `  ${redBullet} 14.3.20`,
      "",
      colors.bold(`relative time`),
      `  ${redBullet} 5 minutes ago`,
      `  ${redBullet} -8 months`,
      `  ${redBullet} in 13 days`,
      `  ${redBullet} +21 weeks`,
      "",
      colors.bold("monthname day"),
      `  ${redBullet} Sunday, June 28`,
      `  ${redBullet} Sunday June 28`,
      `  ${redBullet} Sun, June 28`,
      `  ${redBullet} Sun June 28`,
      `  ${redBullet} June 28`,
      `  ${redBullet} Jun 28`,
      "",
      colors.bold(`day monthname`),
      `  ${redBullet} 16 March`,
      `  ${redBullet} 16 Mar`,

      "",
      colors.bold(`day month`),
      `  ${redBullet} 14/03`,
      `  ${redBullet} 14.03`,
      `  ${redBullet} 14/3`,
      `  ${redBullet} 14.3`,
      "",
      colors.bold(`Twitter`),
      `  ${redBullet} Fri Apr 09 12:53:54 +0000 2010`,
      "",
      colors.bold(`unix timestamp`),
      `  ${redBullet} @1602604901`,
      "",
      colors.bold(`Microsoft JSON date string`),
      `  ${redBullet} /Date(1601677889008-0700)/`,
      `  ${redBullet} /Date(1601677889008)/`,
      "",
      colors.bold(`Chinese`),
      `  ${redBullet} 2020年09月26日`,
      `  ${redBullet} 2020年9月26日`,
      `  ${redBullet} 2020 年 9 月 26 日`,
      `  ${redBullet} ２０１７年０８月３１日`,
      "",

      colors.dim("  All timestamps may be prefixed with `IMG_`."),
      colors.dim(
        "  In the case of time-only timestamps, the date will be set to today.\n",
      ),
    ].map((l) => `  ${l}`),

    colors.yellow.bold("Outputs"),
    [
      colors.bold("Random Tokens:\n"),
      "  The following tokens can be used to generate random values:",
    ].map((l) => `  ${l}`),
    table.toString(),
    `    additionally, you can use ${colors.blue("%t")} to insert a random time string like '14:23:45'`,
    "",
    [
      colors.bold("Ranges"),

      `  ${redBullet} ${colors.blue("()")} exclusive`,
      `  ${redBullet} ${colors.blue("[]")} inclusive`,
    ].map((l) => `  ${l}`),

    "",
  ].flat().join("\n");
}

function generateRandomValues(str: string): string {
  str = str.replaceAll(/%t/ig, () => "%H:%m:%s")
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
  if ((/%[tymdhs]|[\[\]\(\)]/gi).test(str)) {
    str = generateRandomValues(str);
  }
  const chronoDate = chrono.parseDate(str);
  return dayjs(chronoDate);
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
