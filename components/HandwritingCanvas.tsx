
import React, { useRef, useState, useEffect } from 'react';

interface Props {
  onCapture: (base64: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

const HandwritingCanvas: React.FC<Props> = ({ onCapture, onClear, isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b'; // dark slate
    ctx.lineWidth = 3;
    ctxRef.current = ctx;

    // Fill with white background (important for OCR)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isLoading) return;
    setIsDrawing(true);
    const { x, y } = getPos(e);
    ctxRef.current?.beginPath();
    ctxRef.current?.moveTo(x, y);
    setHasContent(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctxRef.current || isLoading) return;
    const { x, y } = getPos(e);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    ctxRef.current?.closePath();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    ctxRef.current.fillStyle = '#ffffff';
    ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onClear();
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    onCapture(base64);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="relative bg-white rounded-3xl overflow-hidden border-2 border-slate-100 shadow-inner group">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-48 cursor-crosshair touch-none transition-opacity ${isLoading ? 'opacity-30' : 'opacity-100'}`}
          style={{ touchAction: 'none' }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-dare-teal border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-dare-teal uppercase tracking-widest">Neural Analysis...</p>
            </div>
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={handleClear}
            className="p-2 bg-slate-100 text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-sm"
            title="Clear Canvas"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={handleCapture}
          disabled={!hasContent || isLoading}
          className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-dare-teal transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
        >
          <span>Analyze Handwriting</span>
          <span className="text-lg">✍️</span>
        </button>
      </div>
    </div>
  );
};

export default HandwritingCanvas;
