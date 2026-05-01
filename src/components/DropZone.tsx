import { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface DropZoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label: string;
  sublabel?: string;
  files?: File[];
  onRemoveFile?: (index: number) => void;
}

export default function DropZone({ accept, multiple = false, onFiles, label, sublabel, files = [], onRemoveFile }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFiles(droppedFiles);
  }, [onFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      onFiles(selected);
      e.target.value = '';
    }
  }, [onFiles]);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group
          ${isDragging
            ? 'border-emerald-400 bg-emerald-50 scale-[1.02]'
            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
          }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragging ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
            <Upload size={28} />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-700">{label}</p>
            {sublabel && <p className="text-sm text-slate-400 mt-1">{sublabel}</p>}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-600 uppercase">{file.name.split('.').pop()}</span>
                </div>
                <span className="text-sm text-slate-700 truncate">{file.name}</span>
                <span className="text-xs text-slate-400 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              {onRemoveFile && (
                <button onClick={() => onRemoveFile(i)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 ml-2">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
