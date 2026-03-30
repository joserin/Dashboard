import React, { useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
      if (file) {
          onFileSelect(file);
      }
  };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        onFileSelect(file);
        }
    };

    const containerClasses = `relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-3 transition-all hover:border-blue-500/50 hover:bg-blue-50/5 ${
        isLoading ? "opacity-50 pointer-events-none" : ""
    }`;

  return (
    <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={containerClasses}
        onClick={() => fileInputRef.current?.click()}
        >
        <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-1 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                {isLoading ? (
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                )}
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-bold text-on-surface">Haz clic para subir o arrastra tu Excel</p>
                <p className="text-xs text-on-surface-variant">Formatos soportados: .xlsx, .xls</p>
            </div>
        </div>
    </div>
  );
};
/*
export const HeaderUploadButton: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <button 
      onClick={() => fileInputRef.current?.click()}
      disabled={isLoading}
      className="flex items-center gap-2 text-orange-700 font-medium text-base
       hover:text-orange-600 transition-all cursor-pointer active:opacity-80 disabled:opacity-50"
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      Upload Excel
    </button>
  );
};*/
