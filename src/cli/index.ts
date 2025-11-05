#!/usr/bin/env node

import { Command } from 'commander';
import { convertImage, convertEmoji } from '../core/converter.js';
import { resolve } from 'path';
import { existsSync } from 'fs';
import type { OutputFormat } from '../core/types.js';

const program = new Command();

program
  .name('iconify')
  .description('Convert PNG/JPEG images or emojis to ICO files and PWA icon sets')
  .version('1.0.0')
  .argument('<input>', 'Input image file path (PNG or JPEG) or emoji')
  .option('-o, --output-dir <dir>', 'Output directory for generated files', './output')
  .option('-f, --format <format>', 'Output format: ico, pwa, or both', 'both')
  .option('-s, --ico-size <sizes>', 'ICO sizes (comma-separated, e.g., "16,32,48")', '16,32,48')
  .option('-e, --emoji', 'Treat input as an emoji instead of a file path')
  .action(async (input: string, options: { outputDir: string; format: string; icoSize: string; emoji?: boolean }) => {
    try {
      // Validate format
      const format = options.format.toLowerCase() as OutputFormat;
      if (format !== 'ico' && format !== 'pwa' && format !== 'both') {
        console.error(`Error: Invalid format "${format}". Must be: ico, pwa, or both`);
        process.exit(1);
      }

      // Parse ICO sizes
      const icoSizes = options.icoSize
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(s => !isNaN(s) && s > 0);

      if (icoSizes.length === 0) {
        console.error(`Error: Invalid ICO sizes: ${options.icoSize}`);
        process.exit(1);
      }

      let result;

      // Handle emoji input
      if (options.emoji) {
        console.log(`Converting emoji: ${input}`);
        console.log(`Output directory: ${options.outputDir}`);
        console.log(`Format: ${format}`);
        if (format === 'ico' || format === 'both') {
          console.log(`ICO sizes: ${icoSizes.join(', ')}`);
        }

        result = await convertEmoji(input, {
          outputFormat: format,
          outputDir: resolve(options.outputDir),
          icoSizes
        });
      } else {
        // Handle file input
        const inputPath = resolve(input);
        
        if (!existsSync(inputPath)) {
          console.error(`Error: Input file not found: ${inputPath}`);
          process.exit(1);
        }

        console.log(`Converting ${inputPath}...`);
        console.log(`Output directory: ${options.outputDir}`);
        console.log(`Format: ${format}`);
        if (format === 'ico' || format === 'both') {
          console.log(`ICO sizes: ${icoSizes.join(', ')}`);
        }

        result = await convertImage(inputPath, {
          outputFormat: format,
          outputDir: resolve(options.outputDir),
          icoSizes
        });
      }

      if (!result.success) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }

      // Report results
      console.log('\nConversion completed successfully!');
      
      if (result.icoPath) {
        console.log(`✓ ICO file: ${result.icoPath}`);
      }
      
      if (result.pwaPaths && result.pwaPaths.length > 0) {
        console.log(`✓ PWA icons generated (${result.pwaPaths.length} files):`);
        result.pwaPaths.forEach(path => {
          console.log(`  - ${path}`);
        });
      }

      process.exit(0);
    } catch (error) {
      console.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

program.parse();

