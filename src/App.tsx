import React, { useState, useEffect } from 'react';
import { 
  Download, Trash2, Image as ImageIcon, Sparkles, 
  CheckCircle, RefreshCw, AlertCircle, Info, FileArchive
} from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

import { ImageItem, AdjustSettings } from './types';
import Header from './components/Header';
import UploadDropzone from './components/UploadDropzone';
import ImageGrid from './components/ImageGrid';
import ImageAdjuster from './components/ImageAdjuster';
import HelpSection from './components/HelpSection';
import { renderFinalImage, downloadSingleImage, downloadAllAsZip } from './utils/imageHelper';

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [activeAdjustingItem, setActiveAdjustingItem] = useState<ImageItem | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Clean up Object URLs when items are deleted or component unmounts
  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
      });
    };
  }, []);

  // Handle files selected via dropzone/input
  const handleFilesSelected = (files: FileList) => {
    setGlobalError(null);
    const availableSlots = 10 - items.length;
    
    if (availableSlots <= 0) {
      setGlobalError("You have already uploaded 10 photos! Please delete some to upload more. / आप पहले ही 10 फोटो अपलोड कर चुके हैं!");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    
    if (Array.from(files).length > availableSlots) {
      setGlobalError(`Only ${availableSlots} photo(s) could be added because the limit is 10. / अधिकतम 10 फोटो लिमिट के कारण केवल ${availableSlots} फोटो जोड़े गए।`);
    }

    const newItems: ImageItem[] = filesToProcess.map((file) => {
      const id = Math.random().toString(36).substring(2, 9);
      
      // Extract file name without extension
      const lastDotIndex = file.name.lastIndexOf('.');
      const originalName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
      
      // Clean name for output file (remove spaces and special characters if needed, or leave as customName)
      const cleanName = originalName.replace(/[\s#%&{}\\<>*?/$!'":@+`|=]+/g, '_');

      const originalUrl = URL.createObjectURL(file);

      return {
        id,
        originalName: file.name,
        customName: cleanName,
        originalFile: file,
        originalUrl,
        processedBlob: null,
        processedUrl: null,
        finalDataUrl: null,
        status: 'idle',
        progress: 0,
        progressMessage: 'Waiting / कतार में है...',
        adjustSettings: {
          zoom: 1.0,
          x: 0,
          y: 0,
          rotation: 0,
          bgColor: 'transparent'
        },
        eraserMaskUrl: null
      };
    });

    setItems((prev) => [...prev, ...newItems]);

    // Start background removal for each newly added item
    newItems.forEach((item) => {
      processBackgroundRemoval(item);
    });
  };

  // Run the AI background removal
  const processBackgroundRemoval = async (item: ImageItem) => {
    updateItemStatus(item.id, {
      status: 'loading_model',
      progress: 5,
      progressMessage: 'Initializing AI Model / एआई मॉडल शुरू हो रहा है...'
    });

    try {
      // removeBackground from @imgly/background-removal works entirely client-side
      const processedBlob = await removeBackground(item.originalFile, {
        progress: (key, current, total) => {
          const pct = Math.round((current / total) * 100) || 0;
          let msg = 'Removing background / बैकग्राउंड हटाया जा रहा है...';
          
          if (key.includes('fetch')) {
            msg = 'Downloading AI model / मॉडल डाउनलोड हो रहा है (पहली बार)...';
          } else if (key.includes('onnx')) {
            msg = 'Loading AI neural network / एआई नेटवर्क लोड हो रहा है...';
          } else if (key.includes('compute')) {
            msg = 'Segmenting image background / बैकग्राउंड को साफ़ किया जा रहा है...';
          }

          updateItemStatus(item.id, {
            progress: Math.min(Math.max(pct, 5), 98), // keep within 5-98% during active progress
            progressMessage: `${msg}`
          });
        }
      });

      const processedUrl = URL.createObjectURL(processedBlob);

      // Create a temporary item representation to generate the initial 227x253 image
      const updatedItemMock: ImageItem = {
        ...item,
        status: 'done',
        processedBlob,
        processedUrl,
      };

      // Render the final cropped 227x253 image with default settings
      const finalDataUrl = await renderFinalImage(updatedItemMock);

      updateItemStatus(item.id, {
        status: 'done',
        progress: 100,
        progressMessage: 'Done / पूरा हुआ',
        processedBlob,
        processedUrl,
        finalDataUrl
      });

    } catch (error: any) {
      console.error('Background removal failed for', item.originalName, error);
      
      // Fallback: If AI fails (e.g. WebAssembly or browser compatibility issues),
      // we don't block the user! We let them use the original image directly
      // so they can manually crop, erase, or change background color anyway!
      // This is extremely user-friendly and reliable.
      try {
        const fallbackMock: ImageItem = {
          ...item,
          status: 'done',
          processedUrl: item.originalUrl, // use original as processed base
        };
        const finalDataUrl = await renderFinalImage(fallbackMock);

        updateItemStatus(item.id, {
          status: 'done',
          progress: 100,
          progressMessage: 'Manual Mode (AI Unavailable)',
          processedBlob: null,
          processedUrl: item.originalUrl,
          finalDataUrl,
          error: error.message || 'AI Background Removal is not supported in this browser. You can still manually crop and adjust!'
        });
      } catch (fallbackError) {
        updateItemStatus(item.id, {
          status: 'failed',
          progress: 0,
          progressMessage: 'Failed / असफल रहा',
          error: error.message || 'Error processing photo. Please retry.'
        });
      }
    }
  };

  // Update a single item's status in state
  const updateItemStatus = (id: string, updates: Partial<ImageItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Delete an image item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => {
      const itemToDelete = prev.find(item => item.id === id);
      if (itemToDelete) {
        if (itemToDelete.originalUrl) URL.revokeObjectURL(itemToDelete.originalUrl);
        if (itemToDelete.processedUrl) URL.revokeObjectURL(itemToDelete.processedUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
    setGlobalError(null);
  };

  // Re-run background removal for failed items
  const handleRetryItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      processBackgroundRemoval(item);
    }
  };

  // Handle renaming of processed files
  const handleRenameItem = (id: string, newName: string) => {
    // Keep name clean of illegal filename chars
    const cleanName = newName.replace(/[\s#%&{}\\<>*?/$!'":@+`|=]+/g, '_');
    updateItemStatus(id, { customName: cleanName });
  };

  // Open the interactive Adjuster modal
  const handleEditClick = (item: ImageItem) => {
    setActiveAdjustingItem(item);
  };

  // Save changes from the Adjuster modal
  const handleSaveAdjustments = async (settings: AdjustSettings, maskUrl: string | null) => {
    if (!activeAdjustingItem) return;

    // Build temporary updated item to render
    const updatedItemMock: ImageItem = {
      ...activeAdjustingItem,
      adjustSettings: settings,
      eraserMaskUrl: maskUrl
    };

    try {
      const finalDataUrl = await renderFinalImage(updatedItemMock);
      
      updateItemStatus(activeAdjustingItem.id, {
        adjustSettings: settings,
        eraserMaskUrl: maskUrl,
        finalDataUrl
      });
    } catch (e) {
      console.error('Error saving adjustments', e);
    }

    setActiveAdjustingItem(null);
  };

  // Download a single PNG image
  const handleDownloadSingle = (item: ImageItem) => {
    if (item.finalDataUrl) {
      downloadSingleImage(item.finalDataUrl, `${item.customName}.png`);
    }
  };

  // Download all completed images as a ZIP file
  const handleDownloadAllAsZip = async () => {
    const completedItems = items.filter(item => item.status === 'done' && item.finalDataUrl);
    
    if (completedItems.length === 0) {
      setGlobalError("No fully processed images ready for download. / डाउनलोड के लिए कोई इमेज तैयार नहीं है।");
      return;
    }

    setIsDownloadingAll(true);
    setGlobalError(null);

    try {
      const zipData = completedItems.map(item => ({
        dataUrl: item.finalDataUrl!,
        name: item.customName
      }));
      
      await downloadAllAsZip(zipData);
    } catch (error) {
      console.error("ZIP creation failed", error);
      setGlobalError("Failed to create ZIP archive. Please download images individually. / जिप फ़ाइल नहीं बनाई जा सकी।");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const processedCount = items.filter(item => item.status === 'done').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-indigo-500/30 selection:text-indigo-900">
      
      {/* Top Header */}
      <Header totalCount={items.length} doneCount={processedCount} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold text-red-700">
              {globalError}
            </div>
          </div>
        )}

        {/* Upload Area */}
        <UploadDropzone 
          onFilesSelected={handleFilesSelected} 
          currentCount={items.length} 
        />

        {/* Bulk Actions Header */}
        {items.length > 0 && (
          <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-xs text-slate-500 font-sans font-medium">
                आपकी फ़ाइलें सुरक्षित हैं। सभी इमेज आपके कंप्यूटर पर ही प्रोसेस की जाती हैं।
              </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setItems([])}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-all"
              >
                <Trash2 className="w-4 h-4" /> Clear All / सब हटाएं
              </button>

              <button
                disabled={processedCount === 0 || isDownloadingAll}
                onClick={handleDownloadAllAsZip}
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition-all ${
                  processedCount > 0 && !isDownloadingAll
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100'
                }`}
              >
                {isDownloadingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Packaging ZIP...
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4" /> Download All ZIP / सब डाउनलोड करें (ZIP)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Grid display of uploaded images */}
        <div className="max-w-7xl mx-auto">
          <ImageGrid
            items={items}
            onDelete={handleDeleteItem}
            onEditClick={handleEditClick}
            onDownloadClick={handleDownloadSingle}
            onRename={handleRenameItem}
            onRetry={handleRetryItem}
          />
        </div>

        {/* FAQ & Help Section */}
        <HelpSection />

      </main>

      {/* Adjuster Modal overlay */}
      {activeAdjustingItem && (
        <ImageAdjuster
          item={activeAdjustingItem}
          onClose={() => setActiveAdjustingItem(null)}
          onSave={handleSaveAdjustments}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-sans mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 AI Background Remover & Resizer Tool.</p>
          <p className="flex items-center gap-1">
            Made for high-speed passport and ID photo preparation. W: 227px × H: 253px, 72 DPI.
          </p>
        </div>
      </footer>

    </div>
  );
}
