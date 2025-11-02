import sharp from 'sharp';
import { toIco } from 'to-ico';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { ConversionOptions, ConversionResult } from './types.js';
import { PWA_ICON_SIZES } from './types.js';

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

