import React, { useState, useRef } from 'react';
import { Upload, Image, AlertCircle, FilePlus } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesSelected: (files: FileList) => void;
  currentCount: number;
}

export default function UploadDropzone({ onFilesSelected, currentCount }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isLimitReached = currentCount >= 10;

  return (
    <div className="max-w-7xl mx-auto mb-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        className="hidden"
        disabled={isLimitReached}
      />

      <div
        onDragOver={isLimitReached ? undefined : handleDragOver}
        onDragLeave={isLimitReached ? undefined : handleDragLeave}
        onDrop={isLimitReached ? undefined : handleDrop}
        onClick={isLimitReached ? undefined : triggerFileInput}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed text-center p-8 sm:p-12 transition-all flex flex-col items-center justify-center ${
          isLimitReached 
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-70' 
            : isDragActive
              ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99] shadow-inner'
              : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/50 cursor-pointer'
        }`}
      >
        {/* Background ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className={`p-4 rounded-full mb-4 transition-all ${
          isLimitReached
            ? 'bg-slate-100 text-slate-400'
            : isDragActive
              ? 'bg-indigo-100 text-indigo-600 scale-110'
              : 'bg-indigo-50 text-indigo-500 group-hover:scale-105'
        }`}>
          {isLimitReached ? (
            <AlertCircle className="w-8 h-8" />
          ) : (
            <Upload className="w-8 h-8 animate-bounce" style={{ animationDuration: '3s' }} />
          )}
        </div>

        {isLimitReached ? (
          <div className="space-y-1">
            <h3 className="font-bold text-slate-700 text-base font-sans">
              Photo Upload Limit Reached / फोटो लिमिट पूरी हो गई है
            </h3>
            <p className="text-slate-400 text-xs">
              आप एक बार में अधिकतम 10 फोटो ही प्रोसेस कर सकते हैं। अन्य अपलोड करने के लिए कृपया पहले वाली फोटो हटाएं।
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="font-bold text-slate-700 text-base font-sans">
              Select or Drag Photos Here / फोटो सेलेक्ट करें या यहाँ खींचकर छोड़ें
            </h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
              आप <strong>1 से 10 फोटो</strong> एक साथ अपलोड कर सकते हैं। आटोमेटिक बैकग्राउंड हटाने के बाद, हर फोटो <strong>227×253 पिक्सल</strong> साइज में बदल जाएगी।
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                JPG, PNG, WEBP supported
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Max 10 files
              </span>
            </div>
          </div>
        )}

        {/* Current status display when files exist */}
        {currentCount > 0 && (
          <div className="mt-6 flex items-center gap-2 bg-indigo-50 border border-indigo-100/50 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-700">
            <FilePlus className="w-4 h-4" />
            <span>Currently Uploaded: {currentCount} / 10 Photos</span>
          </div>
        )}
      </div>
    </div>
  );
}
