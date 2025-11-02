# Iconify

Convert PNG/JPEG images to ICO files for favicons and generate PWA icon sets. Available as both a command-line tool and a web application.

## Features

- **ICO Generation**: Create ICO files with configurable sizes for favicons
- **PWA Icon Sets**: Generate all standard PWA icon sizes (16x16, 32x32, 48x48, 64x64, 128x128, 192x192, 512x512)
- **Multiple Formats**: Support for PNG and JPEG input images
- **CLI Tool**: Fast command-line interface for batch processing
- **Web App**: User-friendly browser interface with drag-and-drop

## Installation

```bash
npm install
npm run build
```

## Usage

### CLI Tool

Convert an image to ICO and PWA icons:

```bash
npm run start:cli <input-image> --format both --output-dir ./icons
```

**Options:**
- `-o, --output-dir <dir>`: Output directory (default: `./output`)
- `-f, --format <format>`: Output format - `ico`, `pwa`, or `both` (default: `both`)
- `-s, --ico-size <sizes>`: Comma-separated ICO sizes, e.g., `16,32,48` (default: `16,32,48`)

**Examples:**

```bash
# Generate only ICO file
npm run start:cli image.png --format ico --output-dir ./favicons

# Generate only PWA icons
npm run start:cli image.png --format pwa --output-dir ./pwa-icons

# Generate both with custom ICO sizes
npm run start:cli image.jpg --format both --ico-size 32,64,128 --output-dir ./icons
```

### Web App

Start the web server:

```bash
npm run start:web
```

Then open your browser to `http://localhost:3000`

**Features:**
- Drag and drop or click to select an image
- Preview your image before conversion
- Choose output format (ICO, PWA, or both)
- Configure ICO sizes
- Download individual files or all as a ZIP archive

## Project Structure

```
/
├── src/
│   ├── core/
│   │   ├── converter.ts       # Core conversion logic
│   │   └── types.ts           # Type definitions
│   ├── cli/
│   │   └── index.ts           # CLI entry point
│   └── web/
│       ├── index.html         # Web app UI
│       ├── app.ts             # Web app logic
│       ├── styles.css         # Styling
│       └── server.ts          # Web server
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Watch mode for development
npm run dev

# Build the project
npm run build
```

## Requirements

- Node.js 18+ 
- TypeScript 5+

## License

MIT

