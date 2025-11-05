import { convertImage, convertEmoji } from '../src/core/converter.js';
export default async function handler(req, res) {
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
        const { imageData, emoji, format, icoSizes } = req.body;
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
                outputFormat: format,
                outputDir: tempDir,
                icoSizes: icoSizes || [16, 32, 48],
            });
        }
        else {
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
                outputFormat: format,
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
        const files = {};
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
        res.status(200).json({ files });
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : String(error)
        });
    }
}
//# sourceMappingURL=convert.js.map