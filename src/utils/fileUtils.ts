import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function compressFiles(files: File[], level: number = 6): Promise<Blob> {
  const zip = new JSZip();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    zip.file(file.name, arrayBuffer, {
      compression: 'DEFLATE',
      compressionOptions: { level },
    });
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level } });
}

export async function extractZip(file: File): Promise<{ name: string; data: Blob }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const results: { name: string; data: Blob }[] = [];
  for (const [name, entry] of Object.entries(zip.files)) {
    if (!entry.dir) {
      const data = await entry.async('blob');
      results.push({ name, data });
    }
  }
  return results;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

export function downloadBlob(blob: Blob, filename: string) {
  saveAs(blob, filename);
}

export function getMimeType(ext: string): string {
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    csv: 'text/csv',
    zip: 'application/zip',
  };
  return types[ext] || 'application/octet-stream';
}
