import type { VercelRequest, VercelResponse } from '@vercel/node';
import { convertImage, convertEmoji } from '../src/core/converter.js';
import type { OutputFormat } from '../src/core/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Parse body - supports both JSON and base64 image data
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        res.status(400).json({ error: 'Invalid JSON in request body' });
        return;
      }
    }

    const { imageData, emoji, format, icoSizes } = body;

    if (!format) {
      res.status(400).json({ error: 'Missing required field: format' });
      return;
    }

    // Create temp directory
    const { writeFile, mkdtemp, readFile, rm } = await import('fs/promises');
    const { join: pathJoin } = await import('path');
    const { tmpdir } = await import('os');
    
    const tempDir = await mkdtemp(pathJoin(tmpdir(), 'iconify-'));
    let result;

    if (emoji) {
      // Handle emoji conversion
      result = await convertEmoji(emoji, {
        outputFormat: format as OutputFormat,
        outputDir: tempDir,
        icoSizes: icoSizes || [16, 32, 48],
      });
    } else {
      // Handle image conversion
      if (!imageData) {
        await rm(tempDir, { recursive: true, force: true });
        res.status(400).json({ error: 'Missing required field: imageData or emoji' });
        return;
      }

      // Decode base64 image
      const imageBuffer = Buffer.from(imageData.split(',')[1] || imageData, 'base64');
      const tempInput = pathJoin(tempDir, 'input.png');
      
      await writeFile(tempInput, imageBuffer);

      // Perform conversion
      result = await convertImage(tempInput, {
        outputFormat: format as OutputFormat,
        outputDir: tempDir,
        icoSizes: icoSizes || [16, 32, 48],
      });
    }

    if (!result.success) {
      await rm(tempDir, { recursive: true, force: true });
      res.status(500).json({ error: result.error });
      return;
    }

    // Read generated files
    const files: Record<string, string> = {};
    
    if (result.icoPath) {
      const icoBuffer = await readFile(result.icoPath);
      // Ensure base64 encoding is correct - Buffer.toString('base64') handles binary correctly
      files['favicon.ico'] = icoBuffer.toString('base64');
    }

    if (result.pwaPaths) {
      const { sep } = await import('path');
      for (const pwaPath of result.pwaPaths) {
        const fileName = pwaPath.split(sep).pop() || '';
        const pwaBuffer = await readFile(pwaPath);
        // Ensure base64 encoding is correct for binary PNG data
        files[fileName] = pwaBuffer.toString('base64');
      }
    }

    // Cleanup
    await rm(tempDir, { recursive: true, force: true });

    // Set proper content type header
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ files });
  } catch (error) {
    console.error('Conversion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
    });
  }
}

