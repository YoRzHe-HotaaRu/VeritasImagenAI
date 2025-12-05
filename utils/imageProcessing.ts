/**
 * Pure functions for client-side image forensics
 * Note: Heavy processing is done on Main Thread for simplicity in this demo,
 * but in production should move to Web Workers.
 */

export const resizeImage = (
  img: HTMLImageElement, 
  maxWidth: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const scale = maxWidth / img.width;
  const width = scale < 1 ? maxWidth : img.width;
  const height = scale < 1 ? img.height * scale : img.height;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(img, 0, 0, width, height);
  }
  return canvas;
};

// Simple grayscale conversion
const getGrayScaleData = (ctx: CanvasRenderingContext2D, width: number, height: number): Uint8ClampedArray => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  // Use luminance formula
  for (let i = 0; i < data.length; i += 4) {
    const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = avg;     // R
    data[i + 1] = avg; // G
    data[i + 2] = avg; // B
  }
  return data;
};

export const applySobelEdgeDetection = (
  canvas: HTMLCanvasElement
): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const width = canvas.width;
  const height = canvas.height;
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Create a copy for reading so we don't read modified pixels
  const originalData = new Uint8ClampedArray(data);

  const kernelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];
  
  const kernelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let pixelX = 0;
      let pixelY = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pos = ((y + ky) * width + (x + kx)) * 4;
          // Use Green channel as luminance proxy
          const val = originalData[pos + 1]; 
          
          pixelX += val * kernelX[ky + 1][kx + 1];
          pixelY += val * kernelY[ky + 1][kx + 1];
        }
      }

      const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
      const index = (y * width + x) * 4;
      
      // Invert for better visibility (black edges on white) or keep standard (white edges on black)
      // We'll go with High Contrast Neon style: White edges on very dark blue
      const val = Math.min(255, magnitude);
      
      data[index] = val; // R
      data[index + 1] = val > 50 ? 255 : val; // G (Tint green for tech feel)
      data[index + 2] = val; // B
      data[index + 3] = 255; // Alpha
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

export const applyNoiseAnalysis = (
  canvas: HTMLCanvasElement
): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Simple high-pass filter simulation: Original - Blurred
  // Since we can't easily blur efficiently in one pass without a library,
  // we will use a local variance approach or simple difference with neighbors.
  // Let's do a simple "local difference" amplifier.
  
  const copy = new Uint8ClampedArray(data);

  for (let i = 0; i < data.length; i += 4) {
    if (i > 4) {
      // Calculate difference from previous pixel
      const rDiff = Math.abs(copy[i] - copy[i - 4]);
      const gDiff = Math.abs(copy[i + 1] - copy[i - 3]);
      const bDiff = Math.abs(copy[i + 2] - copy[i - 2]);
      
      const maxDiff = Math.max(rDiff, gDiff, bDiff);
      
      // Amplify
      const amplified = maxDiff * 15; // Amp factor

      // Heatmap coloring
      data[i] = amplified; // R
      data[i + 1] = amplified > 100 ? amplified : 0; // G
      data[i + 2] = 255 - amplified; // B
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

export const applyELA = (canvas: HTMLCanvasElement): string => {
    // Error Level Analysis simulation
    // Ideally requires re-saving JPEG at lower quality and diffing.
    // We will simulate visualization of high-frequency chroma noise.
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Enhance brightness of dark areas to reveal artifacts
        // And push saturation
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        // Simple brightness boost for dark pixels (often where artifacts hide in plain sight)
        const luminance = 0.299*r + 0.587*g + 0.114*b;
        
        let output = 0;
        // If it's a "flat" color area, AI often leaves it too smooth. 
        // If it's noisy, AI often has "grid" noise. 
        // This visualizer just inverts luminance to make anomalies pop.
        output = (255 - luminance);

        data[i] = output; 
        data[i+1] = output * 0.8; // Sepia-ish
        data[i+2] = output * 0.5;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}