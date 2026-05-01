import { useState } from 'react';
import { FileText, Merge, Split, Image, Download, Info } from 'lucide-react';
import DropZone from './DropZone';
import { mergePdfs, splitPdf, imagesToPdf, compressPdf, getPdfInfo, downloadBlob } from '../utils/pdfUtils';

type PdfMode = 'merge' | 'split' | 'imageToPdf' | 'compress' | 'info';

const modes: { id: PdfMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'merge', label: 'Unir PDFs', icon: <Merge size={18} />, desc: 'Combina varios PDFs en uno solo' },
  { id: 'split', label: 'Dividir PDF', icon: <Split size={18} />, desc: 'Separa cada pagina en un PDF individual' },
  { id: 'imageToPdf', label: 'Imagen a PDF', icon: <Image size={18} />, desc: 'Convierte imagenes a documento PDF' },
  { id: 'compress', label: 'Comprimir PDF', icon: <Download size={18} />, desc: 'Reduce el tamano del archivo PDF' },
  { id: 'info', label: 'Info PDF', icon: <Info size={18} />, desc: 'Obtiene informacion del documento' },
];

export default function PdfTools() {
  const [mode, setMode] = useState<PdfMode>('merge');
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pages: number; title: string; author: string; size: string } | null>(null);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResult(null);
    setPdfInfo(null);
    try {
      switch (mode) {
        case 'merge': {
          const merged = await mergePdfs(files);
          downloadBlob(merged, 'documento_unido.pdf');
          setResult('PDFs unidos exitosamente');
          break;
        }
        case 'split': {
          const pages = await splitPdf(files[0]);
          for (let i = 0; i < pages.length; i++) {
            downloadBlob(pages[i], `pagina_${i + 1}.pdf`);
          }
          setResult(`PDF dividido en ${pages.length} paginas`);
          break;
        }
        case 'imageToPdf': {
          const pdf = await imagesToPdf(files);
          downloadBlob(pdf, 'imagenes_a_pdf.pdf');
          setResult('Imagenes convertidas a PDF');
          break;
        }
        case 'compress': {
          const compressed = await compressPdf(files[0]);
          const originalSize = files[0].size;
          const compressedSize = compressed.length;
          const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
          downloadBlob(compressed, 'comprimido.pdf');
          setResult(`PDF comprimido. Ahorro: ${savings}%`);
          break;
        }
        case 'info': {
          const info = await getPdfInfo(files[0]);
          setPdfInfo(info);
          setResult(null);
          break;
        }
      }
    } catch (err) {
      setResult('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
    setProcessing(false);
  };

  const accept = mode === 'imageToPdf' ? 'image/*' : '.pdf';
  const multiple = mode === 'merge' || mode === 'imageToPdf';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setFiles([]); setResult(null); setPdfInfo(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${mode === m.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
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
        accept={accept}
        multiple={multiple}
        onFiles={(newFiles) => setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles)}
        files={files}
        onRemoveFile={(i) => setFiles(prev => prev.filter((_, idx) => idx !== i))}
        label={multiple ? 'Arrastra archivos aqui' : 'Arrastra tu archivo aqui'}
        sublabel="o haz clic para seleccionar"
      />

      {files.length > 0 && (
        <button
          onClick={handleProcess}
          disabled={processing}
          className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Procesando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FileText size={18} />
              {mode === 'merge' ? 'Unir PDFs' : mode === 'split' ? 'Dividir PDF' : mode === 'imageToPdf' ? 'Convertir a PDF' : mode === 'compress' ? 'Comprimir PDF' : 'Ver Informacion'}
            </span>
          )}
        </button>
      )}

      {result && (
        <div className={`p-4 rounded-xl text-sm font-medium ${result.startsWith('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
          {result}
        </div>
      )}

      {pdfInfo && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h4 className="font-semibold text-slate-800">Informacion del PDF</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-400 block">Paginas</span><span className="font-semibold text-slate-700">{pdfInfo.pages}</span></div>
            <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-400 block">Tamano</span><span className="font-semibold text-slate-700">{pdfInfo.size}</span></div>
            <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-400 block">Titulo</span><span className="font-semibold text-slate-700">{pdfInfo.title}</span></div>
            <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-400 block">Autor</span><span className="font-semibold text-slate-700">{pdfInfo.author}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
