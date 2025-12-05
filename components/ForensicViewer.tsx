import React, { useEffect, useRef, useState } from 'react';
import { ForensicMode } from '../types';
import { applySobelEdgeDetection, applyNoiseAnalysis, applyELA, resizeImage } from '../utils/imageProcessing';
import { Scan, Activity, Layers, Eye } from 'lucide-react';

interface ForensicViewerProps {
  originalImageSrc: string;
}

export const ForensicViewer: React.FC<ForensicViewerProps> = ({ originalImageSrc }) => {
  const [mode, setMode] = useState<ForensicMode>(ForensicMode.ORIGINAL);
  const [processedSrc, setProcessedSrc] = useState<string>(originalImageSrc);
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset when image changes
    setMode(ForensicMode.ORIGINAL);
    setProcessedSrc(originalImageSrc);
  }, [originalImageSrc]);

  useEffect(() => {
    const process = async () => {
      setIsProcessing(true);
      // Small delay to allow UI to update to loading state
      await new Promise(r => setTimeout(r, 50));

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = originalImageSrc;
      
      img.onload = () => {
        // Resize for performance during analysis
        const canvas = resizeImage(img, 1024);
        let result = originalImageSrc;

        switch (mode) {
          case ForensicMode.EDGE_DETECTION:
            result = applySobelEdgeDetection(canvas);
            break;
          case ForensicMode.NOISE_ANALYSIS:
            result = applyNoiseAnalysis(canvas);
            break;
          case ForensicMode.ERROR_LEVEL:
             result = applyELA(canvas);
             break;
          default:
            result = originalImageSrc;
            break;
        }
        setProcessedSrc(result);
        setIsProcessing(false);
      };
    };

    if (mode !== ForensicMode.ORIGINAL) {
        process();
    } else {
        setProcessedSrc(originalImageSrc);
    }
    
  }, [mode, originalImageSrc]);

  const modes = [
    { id: ForensicMode.ORIGINAL, label: 'Original', icon: Eye },
    { id: ForensicMode.NOISE_ANALYSIS, label: 'Noise Map', icon: Activity },
    { id: ForensicMode.EDGE_DETECTION, label: 'Edge Detect', icon: Scan },
    { id: ForensicMode.ERROR_LEVEL, label: 'ELA Sim', icon: Layers },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-2 ring-primary-600 ring-offset-2' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
            >
              <Icon size={16} />
              {m.label}
            </button>
          );
        })}
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800 group"
      >
        {isProcessing && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        )}
        
        <img 
          src={processedSrc} 
          alt="Analysis View" 
          className="w-full h-full object-contain transition-opacity duration-300"
        />
        
        <div className="absolute bottom-4 left-4 z-10">
          <span className="bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/10">
            {modes.find(m => m.id === mode)?.label} Mode
          </span>
        </div>
      </div>
    </div>
  );
};