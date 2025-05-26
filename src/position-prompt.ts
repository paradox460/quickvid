import { Select } from "@cliffy/prompt/select";

export async function promptForPosition() {
  return await Select.prompt({
    message: "Choose a position for the logo",
    options: [
      { name: "Top Left (tl, nw)", value: "tl" },
      { name: "Top Right (tr, ne)", value: "tr" },
      { name: "Bottom Left (bl, sw)", value: "bl" },
      { name: "Bottom Right (br, se)", value: "br" },
    ],
    search: true,
  });
}
