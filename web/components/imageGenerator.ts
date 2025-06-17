import html2canvas from 'html2canvas';
import type { RefObject } from 'react';

interface ImageGenerationOptions {
  backgroundColor?: string | null;
  useCORS?: boolean;
  scale?: number;
}

interface OverlayTransform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextPosition {
  x: number;
  y: number;
}

interface MaskedCookieImageParams {
  baseImageUrl: string;
  overlayImageUrl: string;
  shape: 'circle' | 'square' | 'rect';
  overlayTransform: OverlayTransform;
  width?: number;
  height?: number;
  text?: string;
  textColor?: string;
  textFont?: string;
  textPosition?: TextPosition;
  textSize?: number;
}

/**
 * Hides UI controls before capture and restores them after.
 */
export const prepareElementForCapture = (element: HTMLElement): (() => void) => {
  const controls = element.querySelectorAll(
    '.desktop-transform-box-overlay, .desktop-transform-handle, .adjustment-transform-box-overlay, .adjustment-transform-handle'
  );
  const originalStates = Array.from(controls).map(el => (el as HTMLElement).style.display);
  controls.forEach(el => { (el as HTMLElement).style.display = 'none'; });
  return () => {
    controls.forEach((el, index) => {
      (el as HTMLElement).style.display = originalStates[index];
    });
  };
};

/**
 * Waits for all images in the element to be loaded and sets crossOrigin.
 */
const waitForImagesToLoad = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(img => {
      img.crossOrigin = 'anonymous';
      if (img.complete) return Promise.resolve();
      return new Promise<void>(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
};

/**
 * Generates an image from the preview DOM element using html2canvas.
 */
export const generateImageFromElement = async (
  element: HTMLElement,
  options: ImageGenerationOptions = {}
): Promise<string> => {
  const {
    backgroundColor = null,
    useCORS = true,
    scale = 2,
  } = options;

  // Debug logging
  console.log('Preview node:', element);
  const images = Array.from(element.querySelectorAll('img'));
  console.log('Images:', images.map(img => ({
    src: img.src,
    complete: img.complete,
    width: img.naturalWidth,
    height: img.naturalHeight,
    crossOrigin: img.crossOrigin
  })));

  // Wait for all images to load and set crossOrigin
  await waitForImagesToLoad(element);

  // Log again after loading
  console.log('Images after load:', images.map(img => ({
    src: img.src,
    complete: img.complete,
    width: img.naturalWidth,
    height: img.naturalHeight,
    crossOrigin: img.crossOrigin
  })));

  // Hide UI controls before capture
  const restoreState = prepareElementForCapture(element);

  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      useCORS,
      scale,
      logging: true,
      allowTaint: true,
      imageTimeout: 0,
      removeContainer: true,
      foreignObjectRendering: false,
      onclone: (clonedDoc) => {
        const clonedImages = clonedDoc.querySelectorAll('img');
        clonedImages.forEach(img => {
          img.crossOrigin = 'anonymous';
        });
      }
    });
    // Debug: check canvas size and a pixel value
    console.log('Canvas size:', canvas.width, canvas.height);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const pixel = ctx.getImageData(0, 0, 1, 1).data;
      console.log('Top-left pixel RGBA:', pixel);
    }
    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  } finally {
    restoreState();
  }
};

/**
 * Downloads the generated image.
 */
export const downloadImage = (dataUrl: string, filename: string = 'cookie-design.png'): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates and handles the cookie preview image.
 */
export const generateCookiePreviewImage = async (
  previewRef: RefObject<HTMLElement>,
  options: ImageGenerationOptions = {}
): Promise<string> => {
  if (!previewRef.current) {
    throw new Error('Preview element not found');
  }
  return generateImageFromElement(previewRef.current, options);
};

const shapeMaskMap = {
  circle: '/assets/cookie-circle-prot-mask.png',
  square: '/assets/cookie-square-prot-mask.png',
  rect: '/assets/cookie-rect-prot-mask.png',
} as const;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (error) => {
      console.error('Error loading image:', src, error);
      reject(error);
    };
    // Add timestamp to prevent caching issues
    const cacheBuster = `?t=${Date.now()}`;
    img.src = src + cacheBuster;
  });
}

/**
 * Generate a masked cookie image using the correct mask for the selected shape.
 */
export async function generateMaskedCookieImageForShape({
  baseImageUrl,
  overlayImageUrl,
  shape,
  overlayTransform,
  width = 600,
  height = 600,
  text,
  textColor = '#000000',
  textFont = 'sans-serif',
  textPosition = { x: 0, y: 0 },
  textSize = 32,
}: MaskedCookieImageParams): Promise<string> {
  console.log('Starting masked cookie image generation:', {
    baseImageUrl,
    overlayImageUrl,
    shape,
    overlayTransform
  });

  try {
    const maskImageUrl = shapeMaskMap[shape] || shapeMaskMap.circle;
    const [baseImg, overlayImg, maskImg] = await Promise.all([
      loadImage(baseImageUrl),
      loadImage(overlayImageUrl),
      loadImage(maskImageUrl),
    ]);

    console.log('Images loaded successfully:', {
      base: { width: baseImg.width, height: baseImg.height },
      overlay: { width: overlayImg.width, height: overlayImg.height },
      mask: { width: maskImg.width, height: maskImg.height }
    });

    // 1. Draw the cookie base on the main canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Draw base image
    ctx.drawImage(baseImg, 0, 0, width, height);

    // 2. Create a separate canvas for the overlay
    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = width;
    overlayCanvas.height = height;
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!overlayCtx) throw new Error('Could not get overlay canvas context');

    // Clear the overlay canvas
    overlayCtx.clearRect(0, 0, width, height);
    
    // Draw overlay image with transform
    overlayCtx.save();
    overlayCtx.drawImage(
      overlayImg,
      overlayTransform.x,
      overlayTransform.y,
      overlayTransform.width,
      overlayTransform.height
    );
    overlayCtx.restore();

    // 3. Apply the mask
    overlayCtx.globalCompositeOperation = 'destination-in';
    overlayCtx.drawImage(maskImg, 0, 0, width, height);
    overlayCtx.globalCompositeOperation = 'source-over';

    // 4. Draw the masked overlay onto the main canvas
    ctx.drawImage(overlayCanvas, 0, 0);

    // 5. Draw text if provided
    if (text) {
      ctx.save();
      ctx.font = `bold ${textSize}px ${textFont}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Position: x/y are percent offsets from center
      const px = width / 2 + textPosition.x * 0.1 * width / 100;
      const py = height * 0.75 + textPosition.y * 0.1 * height / 100;
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(text.toUpperCase(), px, py);
      ctx.restore();
    }

    console.log('Image generation completed successfully');
    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error in generateMaskedCookieImageForShape:', error);
    throw error;
  }
}