# Iconify

Convert PNG/JPEG images or emojis to ICO files for favicons and generate PWA icon sets. Available as both a command-line tool and a web application.

## Features

- **ICO Generation**: Create ICO files with configurable sizes for favicons
- **PWA Icon Sets**: Generate all standard PWA icon sizes as PNG files (16x16, 32x32, 48x48, 64x64, 128x128, 192x192, 512x512)
- **Emoji Support**: Convert emojis directly to favicons and PWA icons
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

Convert an emoji to ICO and PWA icons:

```bash
npm run start:cli "😀" --emoji --format both --output-dir ./icons
```

**Options:**
- `-o, --output-dir <dir>`: Output directory (default: `./output`)
- `-f, --format <format>`: Output format - `ico`, `pwa`, or `both` (default: `both`)
- `-s, --ico-size <sizes>`: Comma-separated ICO sizes, e.g., `16,32,48` (default: `16,32,48`)
- `-e, --emoji`: Treat input as an emoji instead of a file path

**Examples:**

```bash
# Generate only ICO file from image
npm run start:cli image.png --format ico --output-dir ./favicons

# Generate only PWA icons from image
npm run start:cli image.png --format pwa --output-dir ./pwa-icons

# Generate both with custom ICO sizes from image
npm run start:cli image.jpg --format both --ico-size 32,64,128 --output-dir ./icons

# Convert emoji to favicon
npm run start:cli "🎉" --emoji --format ico --output-dir ./favicons

# Convert emoji to PWA icons
npm run start:cli "🚀" --emoji --format pwa --output-dir ./pwa-icons
```

### Web App

**Live Version:** [https://iconify-alpha.vercel.app](https://iconify-alpha.vercel.app)

Or run locally:

```bash
npm run start:web
```

Then open your browser to `http://localhost:3000`

**Features:**
- Switch between Image and Emoji modes
- Drag and drop or click to select an image
- Enter emoji directly in emoji mode
- Preview your image or emoji before conversion
- Choose output format (ICO, PWA, or both)
- Configure ICO sizes
- Download individual files or all as a ZIP archive

### API

**Live API:** `https://iconify-alpha.vercel.app/api/convert`

#### Quick Start

**Convert Emoji (GET - Direct Download):**
```bash
curl https://iconify-alpha.vercel.app/api/favicon?emoji=⭐ -o favicon.ico
```

**Convert Image/Emoji (POST - JSON Response):**
```bash
curl -X POST https://iconify-alpha.vercel.app/api/convert \
  -H "Content-Type: application/json" \
  -d '{"emoji": "⭐", "format": "ico", "icoSizes": [16, 32, 48]}'
```

#### Endpoints

1. **`GET /api/favicon?emoji=⭐&size=32`** - Returns ICO file directly (binary)
2. **`POST /api/convert`** - Returns JSON with base64-encoded files

#### Request Format

```json
{
  "imageData": "data:image/png;base64,...",  // For images (optional)
  "emoji": "⭐",                               // For emojis (optional)
  "format": "ico",                            // "ico", "pwa", or "both"
  "icoSizes": [16, 32, 48]                    // Optional, default: [16, 32, 48]
}
```

#### Response Format

```json
{
  "files": {
    "favicon.ico": "base64-encoded-data...",
    "icon-16x16.png": "base64-encoded-data...",
    // ... more files
  }
}
```

#### Using the Scripts

```bash
# Convert image file (saves to ./public by default)
node scripts/convert-image-simple.js logo.png --format both

# Convert emoji
node scripts/convert-image-simple.js --emoji ⭐ --format ico
```

**See `API_USAGE.md` for detailed examples in multiple languages.**

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

