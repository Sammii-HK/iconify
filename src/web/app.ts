const uploadArea = document.getElementById('uploadArea')!;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const previewSection = document.getElementById('previewSection')!;
const previewImage = document.getElementById('previewImage') as HTMLImageElement;
const formatSelect = document.getElementById('formatSelect') as HTMLSelectElement;
const icoSizeGroup = document.getElementById('icoSizeGroup')!;
const icoSizeInput = document.getElementById('icoSizeInput') as HTMLInputElement;
const convertButton = document.getElementById('convertButton') as HTMLButtonElement;
const resultSection = document.getElementById('resultSection')!;
const resultFiles = document.getElementById('resultFiles')!;
const downloadZipButton = document.getElementById('downloadZipButton') as HTMLButtonElement;
const individualDownloads = document.getElementById('individualDownloads')!;
const errorSection = document.getElementById('errorSection')!;
const errorMessage = document.getElementById('errorMessage')!;

// Emoji mode elements
const imageModeButton = document.getElementById('imageModeButton')!;
const emojiModeButton = document.getElementById('emojiModeButton')!;
const imageSection = document.getElementById('imageSection')!;
const emojiSection = document.getElementById('emojiSection')!;
const emojiInput = document.getElementById('emojiInput') as HTMLInputElement;
const emojiPreviewContainer = document.getElementById('emojiPreviewContainer')!;
const emojiPreview = document.getElementById('emojiPreview')!;

let currentImageFile: File | null = null;
let currentMode: 'image' | 'emoji' = 'image';

// Mode toggle
imageModeButton.addEventListener('click', () => switchMode('image'));
emojiModeButton.addEventListener('click', () => switchMode('emoji'));

function switchMode(mode: 'image' | 'emoji') {
  currentMode = mode;
  
  if (mode === 'image') {
    imageModeButton.classList.add('active');
    emojiModeButton.classList.remove('active');
    imageSection.style.display = 'block';
    emojiSection.style.display = 'none';
    convertButton.disabled = !currentImageFile;
  } else {
    emojiModeButton.classList.add('active');
    imageModeButton.classList.remove('active');
    imageSection.style.display = 'none';
    emojiSection.style.display = 'block';
    convertButton.disabled = !emojiInput.value.trim();
  }
  
  hideResult();
  hideError();
}

// Emoji input handling
emojiInput.addEventListener('input', (e) => {
  const emoji = (e.target as HTMLInputElement).value.trim();
  if (emoji) {
    emojiPreview.textContent = emoji;
    emojiPreviewContainer.style.display = 'block';
    convertButton.disabled = false;
    hideError();
  } else {
    emojiPreviewContainer.style.display = 'none';
    convertButton.disabled = true;
  }
});

// Show/hide ICO size input based on format
formatSelect.addEventListener('change', () => {
  const format = formatSelect.value;
  icoSizeGroup.style.display = format === 'pwa' ? 'none' : 'block';
});

// Upload area click
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFileSelect(files[0]);
  }
});

// File input change
fileInput.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    handleFileSelect(target.files[0]);
  }
});

function handleFileSelect(file: File) {
  // Validate file type
  if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
    showError('Please select a PNG or JPEG image file.');
    return;
  }

  currentImageFile = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target?.result as string;
    previewSection.style.display = 'block';
    convertButton.disabled = false;
    hideError();
  };
  reader.readAsDataURL(file);
}

async function convertImage() {
  if (currentMode === 'image' && !currentImageFile) return;
  if (currentMode === 'emoji' && !emojiInput.value.trim()) return;

  convertButton.disabled = true;
  convertButton.textContent = 'Converting...';
  hideResult();
  hideError();

  // Show ad while converting (user is engaged and waiting)
  showConversionAd();

  try {
    const format = formatSelect.value;
    const icoSizes = icoSizeInput.value
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(s => !isNaN(s) && s > 0);

    let requestBody: any;

    if (currentMode === 'emoji') {
      // Emoji conversion
      requestBody = {
        emoji: emojiInput.value.trim(),
        format,
        icoSizes: icoSizes.length > 0 ? icoSizes : [16, 32, 48],
      };
    } else {
      // Image conversion
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(currentImageFile!);
      });

      requestBody = {
        imageData,
        format,
        icoSizes: icoSizes.length > 0 ? icoSizes : [16, 32, 48],
      };
    }

    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = 'Conversion failed';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        // If response is not JSON, get text
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await response.json();
    } catch (e) {
      const text = await response.text();
      throw new Error(`Invalid response from server: ${text.substring(0, 100)}`);
    }

    // Display results
    displayResults(result.files);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'An error occurred during conversion.');
    convertButton.disabled = false;
    convertButton.textContent = 'Convert';
    // Hide ad on error
    hideConversionAd();
  }
}

function displayResults(files: Record<string, string>) {
  resultFiles.innerHTML = '';
  individualDownloads.innerHTML = '';

  const fileList: Array<{ name: string; data: string }> = [];

  for (const [fileName, base64Data] of Object.entries(files)) {
    fileList.push({ name: fileName, data: base64Data });
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
      <span class="file-name">${fileName}</span>
      <span class="file-size">Ready</span>
    `;
    resultFiles.appendChild(fileItem);

    // Determine MIME type based on file extension
    let mimeType = 'application/octet-stream';
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'ico':
        mimeType = 'image/x-icon';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      default:
        mimeType = 'application/octet-stream';
    }

    // Individual download link with proper MIME type
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${base64Data}`;
    link.download = fileName;
    link.className = 'download-link';
    link.textContent = `Download ${fileName}`;
    individualDownloads.appendChild(link);
  }

  // Store files for ZIP download
  (downloadZipButton as any).fileList = fileList;
  
  resultSection.style.display = 'block';
  convertButton.disabled = false;
  convertButton.textContent = 'Convert';
  
  // Ad is already showing from when conversion started
}

function showConversionAd() {
  const conversionAdSlot = document.getElementById('conversionAdSlot');
  if (conversionAdSlot) {
    // Show the container first so it has dimensions
    conversionAdSlot.style.display = 'block';
    
    // Wait a bit for the container to render, then push ad
    setTimeout(() => {
      try {
        const adsbygoogle = (window as any).adsbygoogle;
        if (adsbygoogle && adsbygoogle.loaded) {
          // AdSense is loaded, push the ad
          adsbygoogle.push({});
        } else {
          // AdSense not loaded yet, it will auto-load when script loads
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        }
      } catch (e) {
        console.log('AdSense error (expected if not configured):', e);
      }
    }, 100);
  }
}

function hideConversionAd() {
  const conversionAdSlot = document.getElementById('conversionAdSlot');
  if (conversionAdSlot) {
    conversionAdSlot.style.display = 'none';
  }
}

downloadZipButton.addEventListener('click', async () => {
  const fileList = (downloadZipButton as any).fileList as Array<{ name: string; data: string }>;
  if (!fileList || fileList.length === 0) return;

  try {
    const JSZip = (window as any).JSZip;
    if (!JSZip) {
      throw new Error('JSZip library not loaded');
    }
    
    const zip = new JSZip();

    for (const file of fileList) {
      // Decode base64 to binary
      const binaryString = atob(file.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Determine MIME type for proper encoding
      let mimeType = 'application/octet-stream';
      const extension = file.name.toLowerCase().split('.').pop();
      switch (extension) {
        case 'ico':
          mimeType = 'image/x-icon';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
      }
      
      // Add file to ZIP with proper MIME type
      zip.file(file.name, bytes, { binary: true });
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iconify-icons.zip';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    showError('Failed to create ZIP file. Please download files individually.');
  }
});

convertButton.addEventListener('click', convertImage);

function showError(message: string) {
  errorMessage.textContent = message;
  errorSection.style.display = 'block';
}

function hideError() {
  errorSection.style.display = 'none';
}

function hideResult() {
  resultSection.style.display = 'none';
}

