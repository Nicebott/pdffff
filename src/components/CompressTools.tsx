import { useState } from 'react';
import { Archive, Download, FolderOpen } from 'lucide-react';
import DropZone from './DropZone';
import { compressFiles, extractZip, formatFileSize, downloadBlob } from '../utils/fileUtils';

type CompressMode = 'zip' | 'unzip';

export default function CompressTools() {
  const [mode, setMode] = useState<CompressMode>('zip');
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState(6);
  const [extractedFiles, setExtractedFiles] = useState<{ name: string; data: Blob }[]>([]);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResult(null);
    setExtractedFiles([]);
    try {
      switch (mode) {
        case 'zip': {
          const blob = await compressFiles(files, compressionLevel);
          downloadBlob(blob, 'archivos_comprimidos.zip');
          const originalSize = files.reduce((acc, f) => acc + f.size, 0);
          const savings = ((1 - blob.size / originalSize) * 100).toFixed(1);
          setResult(`Archivos comprimidos. Tamano: ${formatFileSize(blob.size)} (Ahorro: ${savings}%)`);
          break;
        }
        case 'unzip': {
          const extracted = await extractZip(files[0]);
          setExtractedFiles(extracted);
          setResult(`Se extrajeron ${extracted.length} archivos`);
          break;
        }
      }
    } catch (err) {
      setResult('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
    setProcessing(false);
  };

  const handleDownloadExtracted = (file: { name: string; data: Blob }) => {
    downloadBlob(file.data, file.name);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('zip'); setFiles([]); setResult(null); setExtractedFiles([]); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${mode === 'zip' ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <Archive size={18} />
          Comprimir a ZIP
        </button>
        <button
          onClick={() => { setMode('unzip'); setFiles([]); setResult(null); setExtractedFiles([]); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${mode === 'unzip' ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <FolderOpen size={18} />
          Extraer ZIP
        </button>
      </div>

      <p className="text-sm text-slate-500">
        {mode === 'zip' ? 'Selecciona archivos para comprimir en un archivo ZIP' : 'Selecciona un archivo ZIP para extraer su contenido'}
      </p>

      <DropZone
        accept={mode === 'zip' ? '*' : '.zip'}
        multiple={mode === 'zip'}
        onFiles={(newFiles) => setFiles(mode === 'zip' ? prev => [...prev, ...newFiles] : newFiles)}
        files={files}
        onRemoveFile={(i) => setFiles(prev => prev.filter((_, idx) => idx !== i))}
        label={mode === 'zip' ? 'Arrastra archivos aqui' : 'Arrastra tu ZIP aqui'}
        sublabel={mode === 'zip' ? 'Cualquier tipo de archivo' : 'Archivos .zip'}
      />

      {mode === 'zip' && files.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <label className="text-sm font-medium text-slate-700 block mb-1">Nivel de compresion: {compressionLevel}</label>
          <input type="range" min={1} max={9} step={1} value={compressionLevel} onChange={e => setCompressionLevel(Number(e.target.value))}
            className="w-full accent-amber-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Rapido</span>
            <span>Maximo</span>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <button
          onClick={handleProcess}
          disabled={processing}
          className="w-full py-3.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-200 hover:shadow-amber-300"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Procesando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {mode === 'zip' ? <Archive size={18} /> : <FolderOpen size={18} />}
              {mode === 'zip' ? 'Comprimir Archivos' : 'Extraer Archivos'}
            </span>
          )}
        </button>
      )}

      {result && (
        <div className={`p-4 rounded-xl text-sm font-medium ${result.startsWith('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
          {result}
        </div>
      )}

      {extractedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <h4 className="font-semibold text-slate-800 mb-3">Archivos extraidos</h4>
          {extractedFiles.map((file, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
              <span className="text-sm text-slate-700 truncate">{file.name}</span>
              <button onClick={() => handleDownloadExtracted(file)}
                className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-medium flex-shrink-0 ml-3">
                <Download size={14} />
                Descargar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
