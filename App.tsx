import React, { useState, useCallback } from 'react';
import { Upload, AlertTriangle, CheckCircle, Smartphone, BarChart3, ShieldCheck, Github, Scan, Activity, Layers } from 'lucide-react';
import { ForensicViewer } from './components/ForensicViewer';
import { StatsCharts } from './components/StatsCharts';
import { analyzeImageWithGemini } from './services/geminiService';
import { AnalysisResult } from './types';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Please upload an image file.");
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        alert("File too large. Max 10MB.");
        return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setResult(null); // Reset results
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!imageSrc) return;
    setIsAnalyzing(true);
    
    // Smooth scroll to results area
    setTimeout(() => {
        document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const data = await analyzeImageWithGemini(imageSrc, file?.type || 'image/png');
    setResult(data);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50 selection:bg-primary-100 selection:text-primary-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Veritas<span className="text-primary-600">AI</span></span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Documentation</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">API</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">About</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        
        {/* Hero & Upload Section */}
        <section className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wide border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Powered by Gemini Vision 2.5
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              Detect the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Unseen</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Upload any image to analyze forensic artifacts, noise patterns, and lighting inconsistencies using advanced AI detection models.
            </p>
          </div>

          <div 
            className={`
              relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300
              ${isDragging ? 'border-primary-500 bg-primary-50/50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-primary-400 hover:bg-slate-50'}
              ${imageSrc ? 'h-auto p-4' : 'h-80 flex flex-col items-center justify-center'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input 
              type="file" 
              onChange={handleInputChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              accept="image/png, image/jpeg, image/webp"
            />

            {!imageSrc ? (
              <div className="text-center space-y-4 pointer-events-none">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors duration-300">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">Click or drag image to upload</p>
                  <p className="text-sm text-slate-500">JPG, PNG, WebP up to 10MB</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full">
                <div className="flex items-center justify-between mb-4 px-2">
                   <div className="flex items-center gap-3">
                     <span className="font-semibold text-slate-700 truncate max-w-[200px]">{file?.name}</span>
                     <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{(file!.size / 1024 / 1024).toFixed(2)} MB</span>
                   </div>
                   <button 
                     onClick={(e) => { e.preventDefault(); setImageSrc(null); setFile(null); setResult(null); }}
                     className="z-20 text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                   >
                     Remove
                   </button>
                </div>
                <img src={imageSrc} alt="Preview" className="w-full max-h-96 object-contain rounded-2xl bg-slate-900/5 border border-slate-200" />
                
                {!result && !isAnalyzing && (
                  <div className="mt-6 flex justify-center pb-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startAnalysis(); }}
                      className="z-20 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <Scan className="w-5 h-5" />
                      Run Forensic Analysis
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Loading State */}
        {isAnalyzing && (
            <div id="analysis-section" className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-primary-600 animate-pulse" />
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-900">Analyzing Complexity</h3>
                    <p className="text-slate-500">Scanning noise patterns and compression artifacts...</p>
                </div>
            </div>
        )}

        {/* Results Section */}
        {result && (
          <section id="analysis-section" className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Verdict Banner */}
            <div className={`
              rounded-2xl p-6 border flex flex-col md:flex-row items-center justify-between gap-6
              ${result.verdict === 'LIKELY_AI' ? 'bg-red-50 border-red-100' : 
                result.verdict === 'LIKELY_REAL' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}
            `}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                   result.verdict === 'LIKELY_AI' ? 'bg-red-100 text-red-600' : 
                   result.verdict === 'LIKELY_REAL' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {result.verdict === 'LIKELY_AI' ? <AlertTriangle size={32} /> : 
                   result.verdict === 'LIKELY_REAL' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {result.verdict === 'LIKELY_AI' ? 'Likely AI Generated' : 
                     result.verdict === 'LIKELY_REAL' ? 'Likely Authentic' : 'Inconclusive Analysis'}
                  </h2>
                  <p className="text-slate-600 mt-1">{result.reasoning}</p>
                </div>
              </div>
              <div className="text-right hidden md:block">
                 <div className="text-sm text-slate-500 uppercase font-semibold tracking-wider">Detection Confidence</div>
                 <div className="text-3xl font-bold text-slate-900">{result.metrics.aiProbability > 50 ? result.metrics.aiProbability : 100 - result.metrics.aiProbability}%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Col: Visual Analysis */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary-500" />
                            Visual Forensics
                        </h3>
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">WebGL / Canvas</span>
                    </div>
                    {imageSrc && <ForensicViewer originalImageSrc={imageSrc} />}
                    <p className="text-sm text-slate-500 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="font-semibold">Note:</span> Toggle between analysis modes to reveal hidden artifacts. 
                        AI images often show unusually consistent noise patterns or "perfect" smooth edges in complex areas.
                    </p>
                 </div>

                 {/* Technical Breakdown */}
                 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Technical Anomalies</h3>
                    <ul className="space-y-3">
                        {result.technicalDetails.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                                {detail}
                            </li>
                        ))}
                    </ul>
                 </div>
              </div>

              {/* Right Col: Stats */}
              <div className="space-y-6">
                <StatsCharts metrics={result.metrics} />
                
                {/* Mobile Friendly Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-slate-300">
                            <Smartphone className="w-5 h-5" />
                            <span className="text-sm font-medium">Mobile Optimization</span>
                        </div>
                        <h4 className="text-lg font-semibold mb-2">View on any device</h4>
                        <p className="text-sm text-slate-400">
                            Our analysis engine is optimized for mobile browsers, processing 4K imagery directly on your device with minimal latency.
                        </p>
                    </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-slate-400" />
                <span className="text-slate-500 font-medium">Veritas AI Forensics</span>
            </div>
            <div className="text-sm text-slate-400">
                &copy; {new Date().getFullYear()} Veritas Inc. All rights reserved.
            </div>
            <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors"><Github className="w-5 h-5" /></a>
            </div>
        </div>
      </footer>
    </div>
  );
}

export default App;