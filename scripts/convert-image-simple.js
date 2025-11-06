#!/usr/bin/env node

/**
 * Simple script to convert an image file or emoji to ICO/PWA icons using the Iconify API
 * 
 * Usage:
 *   node scripts/convert-image-simple.js <image-file> [--format ico|pwa|both] [--ico-sizes 16,32,48] [--output-dir ./public]
 *   node scripts/convert-image-simple.js --emoji <emoji> [--format ico|pwa|both] [--ico-sizes 16,32,48] [--output-dir ./public]
 * 
 * Examples:
 *   # Convert image file
 *   node scripts/convert-image-simple.js logo.png
 *   node scripts/convert-image-simple.js logo.png --format ico
 *   
 *   # Convert emoji
 *   node scripts/convert-image-simple.js --emoji ⭐
 *   node scripts/convert-image-simple.js --emoji 🚀 --format both --ico-sizes 32,64
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const args = process.argv.slice(2);

// Parse arguments
let imageFile = null;
let emoji = null;
let format = 'both';
let icoSizes = [16, 32, 48];
let outputDir = './public';
const apiUrl = process.env.ICONIFY_API_URL || 'https://iconify-alpha.vercel.app/api/convert';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--emoji' && args[i + 1]) {
    let emojiValue = args[i + 1];
    // Support Unicode code point format: U+1F600 or 1F600 or <0001F600>
    if (emojiValue.startsWith('U+') || emojiValue.startsWith('u+')) {
      const codePoint = parseInt(emojiValue.substring(2), 16);
      emoji = String.fromCodePoint(codePoint);
    } else if (emojiValue.startsWith('<') && emojiValue.endsWith('>')) {
      // Format: <0001F600> - remove < > and parse hex
      const codePoint = parseInt(emojiValue.slice(1, -1), 16);
      emoji = String.fromCodePoint(codePoint);
    } else if (/^[0-9A-Fa-f]+$/.test(emojiValue)) {
      // Just hex digits - treat as code point
      const codePoint = parseInt(emojiValue, 16);
      emoji = String.fromCodePoint(codePoint);
    } else {
      // Regular emoji character
      emoji = emojiValue;
    }
    i++;
  } else if (args[i] === '--format' && args[i + 1]) {
    format = args[i + 1];
    i++;
  } else if (args[i] === '--ico-sizes' && args[i + 1]) {
    icoSizes = args[i + 1].split(',').map(s => parseInt(s.trim(), 10)).filter(s => !isNaN(s));
    i++;
  } else if (args[i] === '--output-dir' && args[i + 1]) {
    outputDir = args[i + 1];
    i++;
  } else if (!args[i].startsWith('--') && !imageFile && !emoji) {
    // First non-flag argument is the image file (if not using --emoji)
    imageFile = args[i];
  }
}

if (!imageFile && !emoji) {
  console.error('Usage: node scripts/convert-image-simple.js <image-file> [options]');
  console.error('   or: node scripts/convert-image-simple.js --emoji <emoji> [options]');
  console.error('\nOptions:');
  console.error('  --format <format>     Output format: ico, pwa, or both (default: both)');
  console.error('  --ico-sizes <sizes>   Comma-separated ICO sizes (default: 16,32,48)');
  console.error('  --output-dir <dir>     Output directory (default: ./public)');
  console.error('\nExamples:');
  console.error('  node scripts/convert-image-simple.js logo.png');
  console.error('  node scripts/convert-image-simple.js --emoji ⭐');
  console.error('  node scripts/convert-image-simple.js --emoji 🚀 --format ico');
  console.error('  node scripts/convert-image-simple.js --emoji U+1F600 --format ico');
  console.error('  node scripts/convert-image-simple.js --emoji 1fab4 --format ico');
  process.exit(1);
}

async function convertImage() {
  try {
    let requestBody;
    
    if (emoji) {
      console.log(`Converting emoji: ${emoji}`);
      requestBody = {
        emoji,
        format,
        icoSizes,
      };
    } else {
      console.log(`Reading: ${imageFile}`);
      const imageBuffer = await readFile(imageFile);
      
      // Convert to base64 data URL
      const mimeType = imageFile.toLowerCase().endsWith('.jpg') || imageFile.toLowerCase().endsWith('.jpeg')
        ? 'image/jpeg'
        : 'image/png';
      const base64Data = imageBuffer.toString('base64');
      const imageData = `data:${mimeType};base64,${base64Data}`;
      
      requestBody = {
        imageData,
        format,
        icoSizes,
      };
    }
    
    console.log(`Sending to: ${apiUrl}`);
    
    // Ensure emoji is properly encoded in JSON (JSON.stringify handles Unicode correctly)
    const jsonBody = JSON.stringify(requestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: jsonBody,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }
    
    const result = await response.json();
    
    if (!result.files) {
      throw new Error('No files returned');
    }
    
    await mkdir(outputDir, { recursive: true });
    
    console.log(`\nSaving ${Object.keys(result.files).length} file(s):`);
    
    for (const [fileName, base64Data] of Object.entries(result.files)) {
      const filePath = join(outputDir, fileName);
      const buffer = Buffer.from(base64Data, 'base64');
      await writeFile(filePath, buffer);
      console.log(`  ✓ ${fileName}`);
    }
    
    console.log(`\n✅ Done! Files in ${outputDir}/`);
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

convertImage();

