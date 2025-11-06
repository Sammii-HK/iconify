import type { VercelRequest, VercelResponse } from '@vercel/node';
import { convertEmoji } from '../src/core/converter.js';

/**
 * Simple GET endpoint to generate favicon from emoji
 * Usage: /api/favicon?emoji=⭐&size=32
 * Returns: ICO file directly
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { emoji, size } = req.query;

    if (!emoji || typeof emoji !== 'string') {
      res.status(400).json({ error: 'Missing required query parameter: emoji' });
      return;
    }

    // Parse size (default: 32)
    const icoSize = size ? parseInt(size as string, 10) : 32;
    const icoSizes = [icoSize];

    // Create temp directory
    const { mkdtemp, readFile, rm } = await import('fs/promises');
    const { join: pathJoin } = await import('path');
    const { tmpdir } = await import('os');
    
    const tempDir = await mkdtemp(pathJoin(tmpdir(), 'iconify-'));

    // Convert emoji to ICO
    const result = await convertEmoji(emoji, {
      outputFormat: 'ico',
      outputDir: tempDir,
      icoSizes,
    });

    if (!result.success || !result.icoPath) {
      await rm(tempDir, { recursive: true, force: true });
      // Return error as JSON even though we're supposed to return ICO
      // This helps with debugging
      res.status(500).json({ 
        error: result.error || 'Failed to generate favicon',
        hint: 'Make sure you\'re using a valid emoji character (e.g., ⭐, 🚀, 😀), not a code point string'
      });
      return;
    }

    // Read and return the ICO file directly
    const icoBuffer = await readFile(result.icoPath);
    
    // Cleanup
    await rm(tempDir, { recursive: true, force: true });

    // Set proper headers for ICO file
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Content-Disposition', `inline; filename="favicon.ico"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(icoBuffer);
  } catch (error) {
    console.error('Favicon generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
    });
  }
}

