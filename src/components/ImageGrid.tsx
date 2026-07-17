import React, { useState } from 'react';
import { 
  Trash2, Sliders, Download, Eye, FileImage, 
  AlertTriangle, RefreshCw, Sparkles, CheckCircle2 
} from 'lucide-react';
import { ImageItem } from '../types';

interface ImageGridProps {
  items: ImageItem[];
  onDelete: (id: string) => void;
  onEditClick: (item: ImageItem) => void;
  onDownloadClick: (item: ImageItem) => void;
  onRename: (id: string, newName: string) => void;
  onRetry: (id: string) => void;
}

export default function ImageGrid({ 
  items, 
  onDelete, 
  onEditClick, 
  onDownloadClick, 
  onRename, 
  onRetry 
}: ImageGridProps) {
  
  // Track toggle states for displaying original vs processed for each image
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({});

  const toggleShowOriginal = (id: string) => {
    setShowOriginalMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <FileImage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-700 text-lg">No photos uploaded yet / कोई फोटो नहीं है</h3>
        <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
          अपनी फोटो अपलोड करें (अधिकतम 10 फोटो)। बैकग्राउंड आटोमेटिक हटा दिया जाएगा।
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const isOriginalActive = showOriginalMap[item.id] || false;
        
        // Use processed image if background removed, or original if failed/idle
        const previewUrl = isOriginalActive 
          ? item.originalUrl 
          : (item.finalDataUrl || item.processedUrl || item.originalUrl);

        return (
          <div 
            key={item.id} 
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
          >
            {/* Image Preview Window */}
            <div className="relative aspect-[227/253] bg-slate-100 border-b border-slate-100 flex items-center justify-center overflow-hidden group select-none">
              
              {/* Checkerboard background for transparent results */}
              {!isOriginalActive && item.status === 'done' && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]" />
              )}

              {/* Display Image */}
              <img 
                src={previewUrl} 
                alt={item.customName} 
                referrerPolicy="no-referrer"
                className={`max-h-full max-w-full object-contain transition-transform z-10 ${
                  item.status === 'done' && !isOriginalActive ? 'w-[227px] h-[253px] shadow-sm border border-slate-200' : ''
                }`}
              />

              {/* View Switcher Overlay (Original vs Crop Output) */}
              {item.status === 'done' && (
                <button
                  onClick={() => toggleShowOriginal(item.id)}
                  className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full hover:bg-slate-900 transition-all font-semibold font-sans shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isOriginalActive ? 'Show Processed (227x253)' : 'Show Original'}
                </button>
              )}

              {/* Resolution Badge */}
              <span className="absolute top-3 right-3 z-20 bg-indigo-600/90 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded font-mono font-bold shadow-sm">
                {item.status === 'done' && !isOriginalActive ? '227 × 253 px' : 'Original Size'}
              </span>

              {/* Progress/Error States Overlay */}
              {item.status !== 'done' && item.status !== 'failed' && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-4 text-center">
                  <div className="bg-white/10 p-2.5 rounded-full mb-3 text-indigo-300 animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h4 className="text-white text-xs font-bold font-sans tracking-wide">
                    {item.progressMessage}
                  </h4>
                  <div className="w-40 bg-white/20 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono mt-1 font-semibold">
                    {item.progress}%
                  </span>
                </div>
              )}

              {item.status === 'failed' && (
                <div className="absolute inset-0 bg-red-950/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-4 text-center text-white">
                  <AlertTriangle className="w-8 h-8 text-rose-400 mb-2 animate-bounce" />
                  <h4 className="text-rose-300 text-xs font-bold">Failed / विफल रहा</h4>
                  <p className="text-[10px] text-slate-300 mt-1 max-w-[200px] leading-relaxed">
                    {item.error || 'Could not process background removal'}
                  </p>
                  <button
                    onClick={() => onRetry(item.id)}
                    className="mt-3 bg-rose-600 hover:bg-rose-500 text-[10px] font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-md transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry / दोबारा कोशिश करें
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Details Panel */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              
              {/* File Rename Input */}
              <div className="mb-3">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  File Name / फोटो का नाम:
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <input
                    type="text"
                    value={item.customName}
                    onChange={(e) => onRename(item.id, e.target.value)}
                    className="bg-transparent text-slate-700 text-xs font-semibold focus:outline-none w-full min-w-0"
                    placeholder="Enter file name"
                  />
                  <span className="text-xs text-slate-400 font-mono select-none font-medium">.png</span>
                </div>
              </div>

              {/* Status / Quick info */}
              <div className="flex items-center justify-between text-[11px] mb-4 text-slate-500">
                <span className="truncate max-w-[150px] font-mono" title={item.originalFile.name}>
                  Original: {item.originalFile.name}
                </span>
                {item.status === 'done' && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-500" /> Auto BG Removed
                  </span>
                )}
              </div>

              {/* Actions Grid */}
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Remove Image / फोटो हटाएं"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
                
                <button
                  disabled={item.status !== 'done'}
                  onClick={() => onEditClick(item)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    item.status === 'done'
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  Adjust & Edit / साइज व सुधार
                </button>

                <button
                  disabled={item.status !== 'done'}
                  onClick={() => onDownloadClick(item)}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                    item.status === 'done'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Download / सेव
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
