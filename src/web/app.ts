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

let currentImageFile: File | null = null;

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
  if (!currentImageFile) return;

  convertButton.disabled = true;
  convertButton.textContent = 'Converting...';
  hideResult();
  hideError();

  try {
    // Read file as base64
    const reader = new FileReader();
    const imageData = await new Promise<string>((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(currentImageFile!);
    });

    // Prepare request
    const format = formatSelect.value;
    const icoSizes = icoSizeInput.value
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(s => !isNaN(s) && s > 0);

    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData,
        format,
        icoSizes: icoSizes.length > 0 ? icoSizes : [16, 32, 48],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Conversion failed');
    }

    const result = await response.json();

    // Display results
    displayResults(result.files);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'An error occurred during conversion.');
    convertButton.disabled = false;
    convertButton.textContent = 'Convert';
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

    // Individual download link
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${base64Data}`;
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
      const binaryString = atob(file.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      zip.file(file.name, bytes);
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

