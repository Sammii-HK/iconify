import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { convertImage, convertEmoji } from '../core/converter.js';
import type { OutputFormat } from '../core/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

async function serveFile(
  res: ServerResponse,
  filePath: string,
  contentType: string
): Promise<void> {
  try {
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404);
    res.end('File not found');
  }
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve static files
  if (url.pathname === '/' || url.pathname === '/index.html') {
    await serveFile(res, join(__dirname, 'index.html'), 'text/html');
    return;
  }

  if (url.pathname === '/app.js') {
    await serveFile(res, join(__dirname, 'app.js'), 'application/javascript');
    return;
  }

  if (url.pathname === '/styles.css') {
    await serveFile(res, join(__dirname, 'styles.css'), 'text/css');
    return;
  }

  // API endpoint for conversion
  if (url.pathname === '/api/convert' && req.method === 'POST') {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString());

      const { imageData, emoji, format, icoSizes } = body;

      if (!format) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing required field: format' }));
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
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing required field: imageData or emoji' }));
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
        res.writeHead(500);
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      // Read generated files
      const files: Record<string, string> = {};
      
      if (result.icoPath) {
        const icoBuffer = await readFile(result.icoPath);
        files['favicon.ico'] = icoBuffer.toString('base64');
      }

      if (result.pwaPaths) {
        for (const pwaPath of result.pwaPaths) {
          const fileName = pathJoin(pwaPath).split(pathJoin.sep).pop() || '';
          const pwaBuffer = await readFile(pwaPath);
          files[fileName] = pwaBuffer.toString('base64');
        }
      }

      // Cleanup
      await rm(tempDir, { recursive: true, force: true });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ files }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error) 
      }));
    }
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Iconify web app running at http://localhost:${PORT}`);
});

