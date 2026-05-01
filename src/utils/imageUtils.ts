import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';

export async function compressImage(
  file: File,
  options?: { maxSizeMB?: number; maxWidthOrHeight?: number; quality?: number }
): Promise<File> {
  const config = {
    maxSizeMB: options?.maxSizeMB || 1,
    maxWidthOrHeight: options?.maxWidthOrHeight || 1920,
    initialQuality: options?.quality || 0.8,
    useWebWorker: true,
  };
  return imageCompression(file, config);
}

export async function convertImageFormat(
  file: File,
  targetFormat: string,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas no disponible')); return; }
      ctx.drawImage(img, 0, 0);
      const mimeType = `image/${targetFormat}`;
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Error al convertir'));
        },
        mimeType,
        quality
      );
    };
    img.onerror = () => reject(new Error('Error al cargar imagen'));
    img.src = URL.createObjectURL(file);
  });
}

export async function resizeImage(
  file: File,
  width: number,
  height: number,
  maintainAspect: boolean = true
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let finalWidth = width;
      let finalHeight = height;
      if (maintainAspect) {
        const ratio = Math.min(width / img.width, height / img.height);
        finalWidth = Math.round(img.width * ratio);
        finalHeight = Math.round(img.height * ratio);
      }
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas no disponible')); return; }
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Error al redimensionar'));
        },
        file.type,
        0.9
      );
    };
    img.onerror = () => reject(new Error('Error al cargar imagen'));
    img.src = URL.createObjectURL(file);
  });
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Error al cargar imagen'));
    img.src = URL.createObjectURL(file);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  saveAs(blob, filename);
}
