import React, { useRef, useEffect, useState } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCw, Move, Eraser, 
  Paintbrush, RotateCcw, Check, RefreshCcw, Info
} from 'lucide-react';
import { ImageItem, AdjustSettings } from '../types';
import { loadImage } from '../utils/imageHelper';

interface ImageAdjusterProps {
  item: ImageItem;
  onClose: () => void;
  onSave: (settings: AdjustSettings, maskUrl: string | null) => void;
}

export default function ImageAdjuster({ item, onClose, onSave }: ImageAdjusterProps) {
  // Modal states
  const [activeTab, setActiveTab] = useState<'transform' | 'eraser'>('transform');
  
  // Transformation states
  const [zoom, setZoom] = useState(item.adjustSettings.zoom);
  const [xOffset, setXOffset] = useState(item.adjustSettings.x);
  const [yOffset, setYOffset] = useState(item.adjustSettings.y);
  const [rotation, setRotation] = useState(item.adjustSettings.rotation);
  const [bgColor, setBgColor] = useState(item.adjustSettings.bgColor);

  // Brush / Eraser states
  const [brushMode, setBrushMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState(15);
  
  // UI scaling factor for the editor canvas
  // Standard output is 227x253. We display it at 1.5x on screen for comfortable editing.
  const SCALE_FACTOR = 1.5;
  const CANVAS_WIDTH = 227;
  const CANVAS_HEIGHT = 253;
  const DISPLAY_WIDTH = CANVAS_WIDTH * SCALE_FACTOR;
  const DISPLAY_HEIGHT = CANVAS_HEIGHT * SCALE_FACTOR;

  // Canvas Refs
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // holds 227x253 mask
  
  // Interaction Tracking
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  
  // Cache the loaded base image (processed or original)
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);

  // Load the base image on mount
  useEffect(() => {
    let active = true;
    const imgUrl = item.processedUrl || item.originalUrl;
    loadImage(imgUrl).then((img) => {
      if (active) {
        setBaseImage(img);
      }
    }).catch(err => {
      console.error('Failed to load base image for adjuster', err);
    });
    return () => {
      active = false;
    };
  }, [item]);

  // Initialize the mask canvas with existing mask if available
  useEffect(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (item.eraserMaskUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        redraw();
      };
      img.src = item.eraserMaskUrl;
    } else {
      redraw();
    }
  }, [baseImage]);

  // Core drawing routine
  const redraw = () => {
    const canvas = mainCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas || !baseImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw using scale factor for sharp display
    ctx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    ctx.save();
    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);

    // 1. Draw Background Color
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      // Draw a checkerboard pattern internally so the user can see transparency
      drawCheckerboard(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // 2. Draw Transformed Image
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2 + xOffset, CANVAS_HEIGHT / 2 + yOffset);
    ctx.rotate((rotation * Math.PI) / 180);

    const imgAspect = baseImage.width / baseImage.height;
    const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
    
    let drawWidth = CANVAS_WIDTH;
    let drawHeight = CANVAS_HEIGHT;

    if (imgAspect > canvasAspect) {
      drawHeight = CANVAS_HEIGHT * zoom;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = CANVAS_WIDTH * zoom;
      drawHeight = drawWidth / imgAspect;
    }

    ctx.drawImage(baseImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // 3. Apply the Eraser Mask (draws with destination-out on top of the image)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(maskCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();

    ctx.restore(); // restore scale factor ctx
  };

  // Helper to draw checkerboard background
  const drawCheckerboard = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const size = 8;
    for (let x = 0; x < w; x += size * 2) {
      for (let y = 0; y < h; y += size * 2) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x, y, size, size);
        ctx.fillRect(x + size, y + size, size, size);
        
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x + size, y, size, size);
        ctx.fillRect(x, y + size, size, size);
      }
    }
  };

  // Trigger redraw on settings changes
  useEffect(() => {
    redraw();
  }, [baseImage, zoom, xOffset, yOffset, rotation, bgColor]);

  // Get mouse coordinates relative to canvas, accounting for UI scaling
  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    // Position on display canvas
    const displayX = e.clientX - rect.left;
    const displayY = e.clientY - rect.top;
    
    // Position on actual 227x253 space
    return {
      x: displayX / SCALE_FACTOR,
      y: displayY / SCALE_FACTOR
    };
  };

  // Mouse Down handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasMousePos(e);
    setIsMouseDown(true);
    lastMousePos.current = pos;

    if (activeTab === 'eraser') {
      drawBrush(pos.x, pos.y, true);
    }
  };

  // Mouse Move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasMousePos(e);
    
    if (!isMouseDown || !lastMousePos.current) return;

    if (activeTab === 'transform') {
      // Pan/Move image
      const dx = pos.x - lastMousePos.current.x;
      const dy = pos.y - lastMousePos.current.y;
      setXOffset(prev => prev + dx);
      setYOffset(prev => prev + dy);
      lastMousePos.current = pos;
    } else if (activeTab === 'eraser') {
      // Draw brush stroke
      drawBrush(pos.x, pos.y, false);
      lastMousePos.current = pos;
    }
  };

  // Mouse Up handler
  const handleMouseUp = () => {
    setIsMouseDown(false);
    lastMousePos.current = null;
  };

  // Draw Brush on the mask canvas
  const drawBrush = (x: number, y: number, isStart: boolean) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    
    if (brushMode === 'erase') {
      // Erasing means painting black color on the mask
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
    } else {
      // Restoring means removing mask, i.e., clearing black color from mask canvas
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    }

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (isStart || !lastMousePos.current) {
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.moveTo(lastMousePos.current.x, lastMousePos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.restore();
    redraw();
  };

  // Reset current tab adjustments
  const handleReset = () => {
    if (activeTab === 'transform') {
      setZoom(1.0);
      setXOffset(0);
      setYOffset(0);
      setRotation(0);
      setBgColor('transparent');
    } else {
      // Clear mask canvas
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return;
      const ctx = maskCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        redraw();
      }
    }
  };

  // Complete adjustments and save
  const handleSave = () => {
    const maskCanvas = maskCanvasRef.current;
    let maskDataUrl: string | null = null;
    
    if (maskCanvas) {
      // Check if mask has any drawings by checking pixel data
      const ctx = maskCanvas.getContext('2d');
      if (ctx) {
        const imgData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        let hasMask = false;
        for (let i = 3; i < imgData.data.length; i += 4) {
          if (imgData.data[i] > 0) {
            hasMask = true;
            break;
          }
        }
        if (hasMask) {
          maskDataUrl = maskCanvas.toDataURL('image/png');
        }
      }
    }

    onSave({
      zoom,
      x: xOffset,
      y: yOffset,
      rotation,
      bgColor
    }, maskDataUrl);
  };

  const presetBgColors = [
    { value: 'transparent', name: 'Transparent / पारदर्शी', class: 'bg-transparent border-2 border-dashed border-slate-300' },
    { value: '#ffffff', name: 'White / सफ़ेद', class: 'bg-white border border-slate-300' },
    { value: '#e0f2fe', name: 'Light Blue / हल्का नीला', class: 'bg-sky-100 border border-slate-300' },
    { value: '#3b82f6', name: 'Blue / नीला', class: 'bg-blue-500 border border-slate-300' },
    { value: '#f8fafc', name: 'Off-White / ऑफ-व्हाइट', class: 'bg-slate-50 border border-slate-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg font-sans">
              Adjust & Edit Photo / फोटो एडजस्ट करें
            </h3>
            <p className="text-xs text-slate-400">
              {item.customName}.png — Size: 227 × 253 px
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab('transform')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'transform'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Move className="w-4 h-4" />
            Size & Position / साइज और पोजीशन
          </button>
          <button
            onClick={() => setActiveTab('eraser')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'eraser'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eraser className="w-4 h-4" />
            Manual Background Eraser / हाथ से मिटाएं (ब्रश)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8 items-center md:items-stretch justify-center">
          
          {/* Canvas Preview Area */}
          <div className="relative flex flex-col items-center justify-center bg-slate-900/95 p-8 rounded-2xl border border-slate-950 grow-0 shrink-0 select-none overflow-hidden">
            
            {/* Ambient Sleek radial grid backdrop */}
            <div className="absolute inset-0 opacity-25 sleek-radial-grid pointer-events-none" />

            {/* The 227x253 box visual bounds */}
            <div className="relative z-10 shadow-2xl rounded overflow-hidden outline-2 outline-indigo-500 outline-offset-4" 
                 style={{ width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT }}>
              
              {/* Working display Canvas */}
              <canvas
                ref={mainCanvasRef}
                width={DISPLAY_WIDTH}
                height={DISPLAY_HEIGHT}
                className={`w-full h-full cursor-crosshair block`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />

              {/* Grid overlay for Transform tab to help centering face */}
              {activeTab === 'transform' && (
                <div className="absolute inset-0 pointer-events-none border border-indigo-500/30 flex items-center justify-center">
                  {/* Grid Lines */}
                  <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-indigo-500/20" />
                  <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-indigo-500/20" />
                  <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-indigo-500/20" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-indigo-500/20" />
                  
                  {/* Centering Oval for Face */}
                  <div className="w-24 h-32 rounded-[50%] border border-dashed border-indigo-500/40" />
                </div>
              )}

              {/* Circular cursor representation for Eraser tab */}
              {activeTab === 'eraser' && isMouseDown && lastMousePos.current && (
                <div 
                  className="absolute rounded-full border border-red-500 bg-red-200/30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: lastMousePos.current.x * SCALE_FACTOR,
                    top: lastMousePos.current.y * SCALE_FACTOR,
                    width: brushSize * SCALE_FACTOR,
                    height: brushSize * SCALE_FACTOR,
                  }}
                />
              )}
            </div>

            {/* Instruction under photo */}
            <p className="mt-3 text-xs text-slate-300 font-sans flex items-center gap-1 z-10">
              {activeTab === 'transform' ? (
                <>
                  <Move className="w-3.5 h-3.5 text-indigo-400" />
                  <span>फोटो को एडजस्ट करने के लिए माउस से खींचें (Drag)</span>
                </>
              ) : (
                <>
                  <Eraser className="w-3.5 h-3.5 text-indigo-400" />
                  <span>मिटाने के लिए फोटो पर ब्रश चलाएं (Left click & draw)</span>
                </>
              )}
            </p>

            {/* Scale indicator */}
            <span className="mt-1 text-[10px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded z-10">
              Canvas Display Zoom: {SCALE_FACTOR}x (Exact Output: 227×253 px)
            </span>
          </div>

          {/* Hidden Canvas for Mask storage */}
          <canvas
            ref={maskCanvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="hidden"
          />

          {/* Controls Area */}
          <div className="flex-1 flex flex-col justify-between py-2 min-w-0 w-full">
            
            {/* Tab 1 Controls: Transform */}
            {activeTab === 'transform' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Zoom / आकार बदलें</h4>
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-slate-400" />
                    <input
                      type="range"
                      min="0.1"
                      max="4.0"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <ZoomIn className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 font-mono w-10 text-right">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Rotate / घुमाएं</h4>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => setRotation(0)} />
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <RotateCw className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 font-mono w-10 text-right">
                      {rotation}°
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Background Color / बैकग्राउंड रंग</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {presetBgColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBgColor(color.value)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs text-left border transition-all ${
                          bgColor === color.value
                            ? 'border-indigo-600 bg-indigo-50/50 font-semibold text-indigo-700 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md shrink-0 ${color.class}`} style={{ backgroundColor: color.value === 'transparent' ? undefined : color.value }} />
                        <span className="truncate">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex gap-2 text-xs text-slate-500">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p>
                    सरकारी फॉर्म्स में अक्सर सफ़ेद (White) या हल्के नीले (Light Blue) बैकग्राउंड की मांग की जाती है। आप इसे यहाँ से चुन सकते हैं!
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2 Controls: Eraser */}
            {activeTab === 'eraser' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Brush Mode / ब्रश का प्रकार</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBrushMode('erase')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold border transition-all ${
                        brushMode === 'erase'
                          ? 'bg-red-50 text-red-700 border-red-200 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Eraser className="w-4 h-4" />
                      Erase Mode / मिटाएं
                    </button>
                    <button
                      onClick={() => setBrushMode('restore')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold border transition-all ${
                        brushMode === 'restore'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Paintbrush className="w-4 h-4" />
                      Restore Mode / वापस लाएं
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex justify-between">
                    <span>Brush Size / ब्रश का साइज</span>
                    <span className="text-xs font-mono text-slate-500 font-semibold">{brushSize}px</span>
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">Small</span>
                    <input
                      type="range"
                      min="3"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-400">Large</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex gap-2 text-xs text-slate-500">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-700 block mb-1">How Manual Eraser works:</strong>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Erase:</strong> फोटो के जिस हिस्से को मिटाना है, वहाँ माउस दबाकर घुमाएं।</li>
                      <li><strong>Restore:</strong> गलती से मिटे हुए हिस्से को वापस लाने के लिए Restore चुनकर ब्रश करें।</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-between border-t border-slate-150 pt-4 mt-6">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
                Reset current edits / रीसेट करें
              </button>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                >
                  Cancel / निरस्त करें
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  <Check className="w-4 h-4" />
                  Apply & Save / सेव करें
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
