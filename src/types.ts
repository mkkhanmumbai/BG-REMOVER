export interface AdjustSettings {
  zoom: number;       // e.g. 1.0, scales the image
  x: number;          // x offset in canvas
  y: number;          // y offset in canvas
  rotation: number;   // rotation in degrees (-180 to 180)
  bgColor: string;    // background color behind transparent image (e.g. 'transparent', '#ffffff', '#e0f2fe', '#f8fafc')
}

export type ProcessingStatus = 'idle' | 'loading_model' | 'processing' | 'done' | 'failed';

export interface ImageItem {
  id: string;
  originalName: string;
  customName: string;
  originalFile: File;
  originalUrl: string;         // blob url for preview
  processedBlob: Blob | null;   // the transparent background image from AI
  processedUrl: string | null;  // blob url for processed preview
  
  // Current final output ready for download
  finalDataUrl: string | null;  // base64 dataUrl of the final 227x253 px result
  
  // Status of automatic background removal
  status: ProcessingStatus;
  progress: number;            // 0 to 100 for processing progress bar
  progressMessage: string;     // e.g., "Downloading AI Model...", "Removing Background..."
  error?: string;
  
  // Interactive adjustment settings
  adjustSettings: AdjustSettings;
  
  // Eraser edits (for manual brush eraser)
  // We can store a history of stroke data or a custom transparent drawing canvas dataUrl
  eraserMaskUrl: string | null; 
}
