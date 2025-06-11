# Quickvid

Quickvid is a command-line tool for quick video and image editing, watermarking, and conversion. It is designed for fast, scriptable workflows and supports a variety of options for manipulating video, audio, and logos.

## Features

- Quick edits and conversions for video and images
- Add watermarks/logos with customizable position, size, and effects
- Replace, filter, or strip audio tracks
- Flexible output options (directory, clipboard, open, Yoink integration)
- Date and timezone-based output filenames
- Edit ffmpeg commands before execution
- Integration with MPV for preview and editfile generation

## Installation

Binaries are provided for various platforms, check the [latest release](https://github.com/paradox460/quickvid/releases/latest) to see if yours is supported


### Build it yourself

Quickvid is written in Deno. Make sure you have [Deno](https://deno.com/) installed.

We use Mise for our version and tool chain management. You'll need to have [mise](https://mise.jdx.dev) installed.

Clone the repo, run `mise install`, and then you can run

```sh
# Run directly with Deno (add --allow-all for full functionality)
deno run --allow-all main.ts [options]
```

You can also build a binary, and there is an install script that works on MacOS systems.

```sh
# This only builds a binary
mise run build

# This builds (if needed) and installs a binary
mise run install
```

## Usage

```sh
quickvid <input:file> [output:file] [options]
```

For a full list of options and detailed usage, run:

```sh
quickvid --help
```

## Example

```sh
quickvid input.mp4 --logo.filename logo.png -o.d ~/Videos/
```

This command adds a logo and saves the output in `~/Videos/`.


## License

MIT License

Copyright (c) 2025 Jeff Sandberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
