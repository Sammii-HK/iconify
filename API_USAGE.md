# Iconify API Usage Guide

The Iconify API allows you to convert images or emojis to ICO files and PWA icon sets.

## API Endpoint

**Live URL:** `https://iconify-alpha.vercel.app/api/convert`

**Method:** `POST`

**Content-Type:** `application/json`

## Request Format

### Convert an Image File

```json
{
  "imageData": "data:image/png;base64,iVBORw0KG...",
  "format": "ico",
  "icoSizes": [16, 32, 48]
}
```

### Convert an Emoji

```json
{
  "emoji": "⭐",
  "format": "both",
  "icoSizes": [16, 32, 48]
}
```

### Parameters

- **`imageData`** (string, optional): Base64-encoded image data URL (e.g., `data:image/png;base64,...`)
- **`emoji`** (string, optional): Emoji character to convert
- **`format`** (string, required): Output format - `"ico"`, `"pwa"`, or `"both"`
- **`icoSizes`** (array, optional): Array of ICO sizes in pixels (default: `[16, 32, 48]`)

**Note:** You must provide either `imageData` OR `emoji`, not both.

## Response Format

```json
{
  "files": {
    "favicon.ico": "base64-encoded-ico-data...",
    "icon-16x16.png": "base64-encoded-png-data...",
    "icon-32x32.png": "base64-encoded-png-data...",
    "icon-48x48.png": "base64-encoded-png-data...",
    "icon-64x64.png": "base64-encoded-png-data...",
    "icon-128x128.png": "base64-encoded-png-data...",
    "icon-192x192.png": "base64-encoded-png-data...",
    "icon-512x512.png": "base64-encoded-png-data..."
  }
}
```

The response contains base64-encoded file data. Decode it to get the binary file.

## Usage Examples

### cURL - Convert Image

```bash
# First, convert your image to base64
IMAGE_BASE64=$(base64 -i logo.png)

# Send to API
curl -X POST https://iconify-alpha.vercel.app/api/convert \
  -H "Content-Type: application/json" \
  -d "{
    \"imageData\": \"data:image/png;base64,$IMAGE_BASE64\",
    \"format\": \"both\",
    \"icoSizes\": [16, 32, 48]
  }"
```

### cURL - Convert Emoji

```bash
curl -X POST https://iconify-alpha.vercel.app/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "emoji": "⭐",
    "format": "ico",
    "icoSizes": [16, 32, 48]
  }'
```

### JavaScript/Node.js

```javascript
// Convert an image file
async function convertImage(imageFile) {
  // Read file and convert to base64
  const imageBuffer = await fs.readFile(imageFile);
  const base64Data = imageBuffer.toString('base64');
  const mimeType = imageFile.endsWith('.jpg') || imageFile.endsWith('.jpeg')
    ? 'image/jpeg'
    : 'image/png';
  const imageData = `data:${mimeType};base64,${base64Data}`;
  
  // Send to API
  const response = await fetch('https://iconify-alpha.vercel.app/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageData,
      format: 'both',
      icoSizes: [16, 32, 48],
    }),
  });
  
  const result = await response.json();
  
  // Decode and save files
  for (const [fileName, base64Data] of Object.entries(result.files)) {
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(fileName, buffer);
  }
}

// Convert an emoji
async function convertEmoji(emoji) {
  const response = await fetch('https://iconify-alpha.vercel.app/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      emoji,
      format: 'both',
      icoSizes: [16, 32, 48],
    }),
  });
  
  const result = await response.json();
  return result.files;
}
```

### Python

```python
import requests
import base64
import json

# Convert an image file
def convert_image(image_path):
    # Read and encode image
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')
    
    mime_type = 'image/png' if image_path.endswith('.png') else 'image/jpeg'
    image_data_url = f'data:{mime_type};base64,{image_data}'
    
    # Send to API
    response = requests.post(
        'https://iconify.dev/api/convert',
        headers={'Content-Type': 'application/json'},
        json={
            'imageData': image_data_url,
            'format': 'both',
            'icoSizes': [16, 32, 48],
        }
    )
    
    result = response.json()
    
    # Decode and save files
    for filename, base64_data in result['files'].items():
        with open(filename, 'wb') as f:
            f.write(base64.b64decode(base64_data))

# Convert an emoji
def convert_emoji(emoji):
    response = requests.post(
        'https://iconify.dev/api/convert',
        headers={'Content-Type': 'application/json'},
        json={
            'emoji': emoji,
            'format': 'both',
            'icoSizes': [16, 32, 48],
        }
    )
    
    return response.json()['files']
```

### Browser JavaScript

```javascript
// Convert an image from file input
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const reader = new FileReader();
reader.onload = async (e) => {
  const imageData = e.target.result; // Already in data:image/png;base64,... format
  
  const response = await fetch('https://iconify-alpha.vercel.app/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageData,
      format: 'both',
      icoSizes: [16, 32, 48],
    }),
  });
  
  const { files } = await response.json();
  
  // Create download links
  for (const [fileName, base64Data] of Object.entries(files)) {
    const blob = await fetch(`data:application/octet-stream;base64,${base64Data}`)
      .then(res => res.blob());
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }
};
reader.readAsDataURL(file);
```

## Using the Provided Scripts

Instead of calling the API directly, you can use the provided scripts:

```bash
# Convert an image file (uses the API internally)
node scripts/convert-image-simple.js logo.png --format both

# Convert an emoji (uses the API internally)
node scripts/convert-image-simple.js --emoji ⭐ --format ico
```

The scripts handle:
- Reading image files
- Converting to base64
- Calling the API
- Decoding the response
- Saving files to disk

## Error Handling

The API returns errors in this format:

```json
{
  "error": "Error message here"
}
```

Common errors:
- `400`: Missing required field (format, imageData, or emoji)
- `405`: Method not allowed (must use POST)
- `500`: Server error during conversion

## CORS

The API supports CORS and can be called from any origin. No authentication required.

