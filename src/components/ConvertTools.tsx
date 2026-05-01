import { useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import DropZone from './DropZone';
import { convertImageFormat } from '../utils/imageUtils';
import { downloadBlob } from '../utils/fileUtils';

type ConvertMode = 'image' | 'text';

const imageFormats = ['png', 'jpeg', 'webp', 'bmp'];

export default function ConvertTools() {
  const [mode, setMode] = useState<ConvertMode>('image');
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState('png');
  const [quality, setQuality] = useState(0.9);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResult(null);
    try {
      switch (mode) {
        case 'image': {
          for (const file of files) {
            const blob = await convertImageFormat(file, targetFormat, quality);
            const newName = file.name.replace(/\.[^.]+$/, '') + '.' + targetFormat;
            downloadBlob(blob, newName);
          }
          setResult(`${files.length} imagen(es) convertida(s) a ${targetFormat.toUpperCase()}`);
          break;
        }
        case 'text': {
          for (const file of files) {
            const text = await file.text();
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const newName = file.name.replace(/\.[^.]+$/, '') + '.txt';
            downloadBlob(blob, newName);
          }
          setResult(`${files.length} archivo(s) convertido(s) a texto`);
          break;
        }
      }
    } catch (err) {
      setResult('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('image'); setFiles([]); setResult(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${mode === 'image' ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <RefreshCw size={18} />
          Imagenes
        </button>
        <button
          onClick={() => { setMode('text'); setFiles([]); setResult(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${mode === 'text' ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <RefreshCw size={18} />
          A Texto
        </button>
      </div>

      <p className="text-sm text-slate-500">
        {mode === 'image' ? 'Convierte imagenes entre diferentes formatos' : 'Convierte archivos a formato de texto plano'}
      </p>

      <DropZone
        accept={mode === 'image' ? 'image/*' : '.txt,.csv,.json,.xml,.html,.md,.log'}
        multiple
        onFiles={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
        files={files}
        onRemoveFile={(i) => setFiles(prev => prev.filter((_, idx) => idx !== i))}
        label="Arrastra archivos aqui"
        sublabel={mode === 'image' ? 'Cualquier formato de imagen' : 'TXT, CSV, JSON, XML, HTML, MD'}
      />

      {mode === 'image' && files.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Formato de destino</label>
            <div className="flex flex-wrap gap-2">
              {imageFormats.map(f => (
                <button key={f} onClick={() => setTargetFormat(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${targetFormat === f ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Calidad: {Math.round(quality * 100)}%</label>
            <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-teal-600" />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <button
          onClick={handleProcess}
          disabled={processing}
          className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-teal-200 hover:shadow-teal-300"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Procesando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Download size={18} />
              {mode === 'image' ? 'Convertir Imagenes' : 'Convertir a Texto'}
            </span>
          )}
        </button>
      )}

      {result && (
        <div className={`p-4 rounded-xl text-sm font-medium ${result.startsWith('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-teal-50 text-teal-700 border border-teal-100'}`}>
          {result}
        </div>
      )}
    </div>
  );
}
