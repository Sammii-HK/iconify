import sharp from 'sharp';
import toIcoPkg from 'to-ico';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { ConversionOptions, ConversionResult } from './types.js';
import { PWA_ICON_SIZES } from './types.js';

// Handle CommonJS module
const toIco = (toIcoPkg as any).default || toIcoPkg;

/**
 * Validates that the input file is a supported image format
 */
async function validateInputImage(inputPath: string): Promise<void> {
  try {
    const stats = await fs.stat(inputPath);
    if (!stats.isFile()) {
      throw new Error(`Input path is not a file: ${inputPath}`);
    }

    const metadata = await sharp(inputPath).metadata();
    const format = metadata.format;
    
    if (format !== 'png' && format !== 'jpeg') {
      throw new Error(`Unsupported image format: ${format}. Supported formats: PNG, JPEG`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unsupported')) {
      throw error;
    }
    throw new Error(`Failed to read or validate image: ${inputPath}`);
  }
}

/**
 * Generates ICO file from input image
 */
async function generateICO(
  inputPath: string,
  outputPath: string,
  sizes: number[] = [16, 32, 48]
): Promise<void> {
  const images: Buffer[] = [];

  for (const size of sizes) {
    const buffer = await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    images.push(buffer);
  }

  const icoBuffer = await toIco(images);
  await fs.writeFile(outputPath, icoBuffer);
}

/**
 * Generates PWA icon set (multiple PNG files at different sizes)
 */
async function generatePWAIcons(
  inputPath: string,
  outputDir: string
): Promise<string[]> {
  const generatedPaths: string[] = [];

  for (const size of PWA_ICON_SIZES) {
    const outputPath = join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    generatedPaths.push(outputPath);
  }

  return generatedPaths;
}

/**
 * Renders an emoji to a PNG image
 */
async function renderEmojiToImage(
  emoji: string,
  outputPath: string,
  size: number = 512
): Promise<void> {
  try {
    // Use Twemoji CDN to get proper emoji SVG with colors
    // This ensures we get color emojis regardless of server font availability
    
    // Get the Unicode code point for the emoji
    const codePoint = emoji.codePointAt(0)?.toString(16);
    if (!codePoint) {
      throw new Error('Invalid emoji');
    }
    
    // Twemoji CDN URL format: https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/{codePoint}.svg
    const twemojiUrl = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codePoint}.svg`;
    
    // Use Node.js https/http to fetch (fetch might not be available in older Node versions)
    const https = await import('https');
    const http = await import('http');
    const urlModule = await import('url');
    
    const parsedUrl = urlModule.parse(twemojiUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    // Fetch the SVG from Twemoji CDN
    const svgText = await new Promise<string>((resolve, reject) => {
      const req = client.get(twemojiUrl, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch emoji from Twemoji CDN: HTTP ${res.statusCode}. The emoji "${emoji}" may not be supported.`));
          return;
        }
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          if (!data || data.trim().length === 0) {
            reject(new Error(`Empty response from Twemoji CDN for emoji "${emoji}"`));
            return;
          }
          // Validate it's actually SVG
          if (!data.includes('<svg') && !data.includes('<?xml')) {
            reject(new Error(`Invalid response from Twemoji CDN for emoji "${emoji}"`));
            return;
          }
          resolve(data);
        });
      });
      
      req.on('error', (err) => {
        reject(new Error(`Network error fetching emoji "${emoji}": ${err.message}`));
      });
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error(`Request timeout fetching emoji "${emoji}"`));
      });
    });
    
    // Convert SVG to PNG with Sharp - maintain transparent background
    await sharp(Buffer.from(svgText, 'utf8'))
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ 
        quality: 100,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(outputPath);
      
  } catch (error) {
    // If Twemoji fails, log and throw - we want to know about failures
    console.error('Emoji rendering error:', error);
    throw new Error(`Failed to render emoji: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Converts an emoji string to favicon/PWA icons
 */
export async function convertEmoji(
  emoji: string,
  options: ConversionOptions
): Promise<ConversionResult> {
  try {
    // Validate emoji (basic check - non-empty string)
    if (!emoji || emoji.trim().length === 0) {
      throw new Error('Emoji cannot be empty');
    }

    // Ensure output directory exists
    await fs.mkdir(options.outputDir, { recursive: true });

    // Render emoji to temporary PNG file
    const tempEmojiPath = join(options.outputDir, 'emoji-temp.png');
    await renderEmojiToImage(emoji.trim(), tempEmojiPath, 512);

    // Use existing conversion pipeline
    return await convertImage(tempEmojiPath, options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Main conversion function
 */
export async function convertImage(
  inputPath: string,
  options: ConversionOptions
): Promise<ConversionResult> {
  try {
    // Validate input
    await validateInputImage(inputPath);

    // Ensure output directory exists
    await fs.mkdir(options.outputDir, { recursive: true });

    const result: ConversionResult = {
      success: true,
      pwaPaths: []
    };

    // Generate ICO if needed
    if (options.outputFormat === 'ico' || options.outputFormat === 'both') {
      const icoSizes = options.icoSizes || [16, 32, 48];
      const icoPath = join(options.outputDir, 'favicon.ico');
      await generateICO(inputPath, icoPath, icoSizes);
      result.icoPath = icoPath;
    }

    // Generate PWA icons if needed
    if (options.outputFormat === 'pwa' || options.outputFormat === 'both') {
      const pwaPaths = await generatePWAIcons(inputPath, options.outputDir);
      result.pwaPaths = pwaPaths;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

