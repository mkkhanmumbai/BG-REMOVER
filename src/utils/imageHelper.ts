import JSZip from 'jszip';
import { ImageItem } from '../types';

/**
 * Utility to load an image URL into an HTMLImageElement
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Creates a download for a single base64 data URL
 */
export function downloadSingleImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Creates a ZIP of all processed images and downloads it
 */
export async function downloadAllAsZip(items: { dataUrl: string; name: string }[]) {
  const zip = new JSZip();
  
  items.forEach((item, index) => {
    // Get base64 content by removing data:image/png;base64,
    const base64Data = item.dataUrl.split(',')[1];
    const fileName = item.name.endsWith('.png') ? item.name : `${item.name}.png`;
    zip.file(fileName, base64Data, { base64: true });
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  
  const link = document.createElement('a');
  link.download = `background_removed_images_227x253.zip`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Draws an ImageItem on a canvas of exactly 227x253 and returns its base64 PNG dataUrl
 */
export async function renderFinalImage(
  item: ImageItem,
  eraserMaskCanvas: HTMLCanvasElement | null = null
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 227;
  canvas.height = 253;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get 2D context');
  }

  // 1. Draw background color if not transparent
  if (item.adjustSettings.bgColor !== 'transparent') {
    ctx.fillStyle = item.adjustSettings.bgColor;
    ctx.fillRect(0, 0, 227, 253);
  } else {
    // Transparent background
    ctx.clearRect(0, 0, 227, 253);
  }

  // 2. Load the base image (processed/background-removed image if available, else original)
  const baseImgUrl = item.processedUrl || item.originalUrl;
  const img = await loadImage(baseImgUrl);

  // 3. Save context, apply transformations, and draw the image
  ctx.save();
  
  // Move to center of canvas for rotation and offset adjustments
  ctx.translate(227 / 2 + item.adjustSettings.x, 253 / 2 + item.adjustSettings.y);
  ctx.rotate((item.adjustSettings.rotation * Math.PI) / 180);

  // Calculate drawing width and height maintaining aspect ratio or scaling
  const imgAspect = img.width / img.height;
  const canvasAspect = 227 / 253;
  
  let drawWidth = 227;
  let drawHeight = 253;

  if (imgAspect > canvasAspect) {
    // Image is wider than canvas aspect ratio
    drawHeight = 253 * item.adjustSettings.zoom;
    drawWidth = drawHeight * imgAspect;
  } else {
    // Image is taller than canvas aspect ratio
    drawWidth = 227 * item.adjustSettings.zoom;
    drawHeight = drawWidth / imgAspect;
  }

  // Draw image centered on transformed origin
  ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  
  ctx.restore();

  // 4. Apply custom eraser mask if present
  // The mask represents manual eraser drawings.
  // We can draw it directly on the canvas with destination-out or custom composite operations
  if (item.eraserMaskUrl) {
    try {
      const maskImg = await loadImage(item.eraserMaskUrl);
      ctx.save();
      // Apply mask as source-out or destination-out
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(maskImg, 0, 0, 227, 253);
      ctx.restore();
    } catch (e) {
      console.error('Failed to load eraser mask', e);
    }
  }

  return canvas.toDataURL('image/png');
}
