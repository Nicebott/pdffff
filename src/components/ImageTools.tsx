import { useState } from 'react';
import { Image, Download, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import DropZone from './DropZone';
import { compressImage, convertImageFormat, resizeImage, getImageDimensions, downloadBlob } from '../utils/imageUtils';

type ImageMode = 'compress' | 'convert' | 'resize';

const modes: { id: ImageMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'compress', label: 'Comprimir', icon: <Minimize2 size={18} />, desc: 'Reduce el tamano de la imagen manteniendo calidad' },
  { id: 'convert', label: 'Convertir formato', icon: <RefreshCw size={18} />, desc: 'Cambia el formato de la imagen (PNG, JPG, WebP)' },
  { id: 'resize', label: 'Redimensionar', icon: <Maximize2 size={18} />, desc: 'Cambia las dimensiones de la imagen' },
];

const formats = ['png', 'jpeg', 'webp'];

export default function ImageTools() {
  const [mode, setMode] = useState<ImageMode>('compress');
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState('png');
  const [quality, setQuality] = useState(0.8);
  const [maxSizeMB, setMaxSizeMB] = useState(1);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleFiles = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      try {
        const dims = await getImageDimensions(newFiles[0]);
        setDimensions(dims);
        setWidth(dims.width);
        setHeight(dims.height);
      } catch { /* ignore */ }
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResult(null);
    try {
      for (const file of files) {
        switch (mode) {
          case 'compress': {
            const compressed = await compressImage(file, { maxSizeMB, quality });
            downloadBlob(compressed, `comprimida_${file.name}`);
            const savings = ((1 - compressed.size / file.size) * 100).toFixed(1);
            setResult(`Imagen comprimida. Ahorro: ${savings}%`);
            break;
          }
          case 'convert': {
            const blob = await convertImageFormat(file, targetFormat, quality);
            const newName = file.name.replace(/\.[^.]+$/, '') + '.' + targetFormat;
            downloadBlob(blob, newName);
            setResult(`Imagen convertida a ${targetFormat.toUpperCase()}`);
            break;
          }
          case 'resize': {
            const blob = await resizeImage(file, width, height);
            const newName = file.name.replace(/\.[^.]+$/, '') + `_${width}x${height}` + file.name.match(/\.[^.]+$/)?.[0];
            downloadBlob(blob, newName || 'redimensionada.png');
            setResult(`Imagen redimensionada a ${width}x${height}`);
            break;
          }
        }
      }
    } catch (err) {
      setResult('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setFiles([]); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${mode === m.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">{modes.find(m => m.id === mode)?.desc}</p>

      <DropZone
        accept="image/*"
        multiple={mode !== 'resize'}
        onFiles={handleFiles}
        files={files}
        onRemoveFile={(i) => setFiles(prev => prev.filter((_, idx) => idx !== i))}
        label="Arrastra imagenes aqui"
        sublabel="PNG, JPG, WebP, GIF, BMP"
      />

      {dimensions && mode === 'resize' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <p className="text-sm text-slate-500">Tamano original: {dimensions.width} x {dimensions.height} px</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Ancho (px)</label>
              <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Alto (px)</label>
              <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" />
            </div>
          </div>
        </div>
      )}

      {mode === 'compress' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Tamano maximo (MB): {maxSizeMB}</label>
            <input type="range" min={0.1} max={10} step={0.1} value={maxSizeMB} onChange={e => setMaxSizeMB(Number(e.target.value))}
              className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Calidad: {Math.round(quality * 100)}%</label>
            <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-blue-600" />
          </div>
        </div>
      )}

      {mode === 'convert' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Formato de destino</label>
            <div className="flex gap-2">
              {formats.map(f => (
                <button key={f} onClick={() => setTargetFormat(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${targetFormat === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Calidad: {Math.round(quality * 100)}%</label>
            <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-blue-600" />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <button
          onClick={handleProcess}
          disabled={processing}
          className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-blue-300"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Procesando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Image size={18} />
              {mode === 'compress' ? 'Comprimir Imagen' : mode === 'convert' ? 'Convertir Formato' : 'Redimensionar'}
            </span>
          )}
        </button>
      )}

      {result && (
        <div className={`p-4 rounded-xl text-sm font-medium ${result.startsWith('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
          {result}
        </div>
      )}
    </div>
  );
}
