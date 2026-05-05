/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Mic, 
  Square, 
  Upload, 
  Settings2, 
  Activity,
  ChevronUp,
  Radio,
  Bell,
  Sun,
  Wind,
  Download
} from 'lucide-react';
import { useRef, useEffect, useState, ChangeEvent } from 'react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';

export default function App() {
  const { audioData, isPlaying, isLoading, beatHistory, startMicrophone, startFile, stop } = useAudioAnalyzer();

  const downloadRhythm = () => {
    if (!beatHistory.length) return;
    
    const data = {
      name: "Sachētana Rhythm Map",
      description: "Timestamps of detected beats (in seconds)",
      count: beatHistory.length,
      beats: beatHistory
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sachetana_rhythm_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showControls, setShowControls] = useState(true);
  const rotationRef = useRef(0);

  // Visualization Colors - Tibetan Palette
  const colors = {
    primary: '#D4AF37',   // Gold
    secondary: '#40E0D0', // Turquoise
    accent: '#800000',    // Maroon
    bg: '#0D0404'         // Sacred Dark Red
  };

  useEffect(() => {
    if (!canvasRef.current || !audioData) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { frequencyData, volume } = audioData;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear with slight fade for trail effect
    ctx.fillStyle = 'rgba(13, 4, 4, 0.1)';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Slow base rotation + reactive rotation boost
    rotationRef.current += 0.001 + (volume * 0.03);
    ctx.rotate(rotationRef.current);

    const levels = 4; // Layered mandala effect
    const segments = 12; // Sacred number
    
    for (let l = 0; l < levels; l++) {
      const levelFactor = (l + 1) / levels;
      const dataSubset = frequencyData.slice(0, frequencyData.length / levelFactor);
      const angleStep = (Math.PI * 2) / dataSubset.length;

      ctx.save();
      ctx.rotate(l * (Math.PI / 6) + rotationRef.current * (l % 2 === 0 ? 1 : -1));

      for (let s = 0; s < segments; s++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 / segments) * s);
        
        ctx.beginPath();
        for (let i = 0; i < dataSubset.length; i++) {
          const val = dataSubset[i] / 255;
          // More organic lotus-like shapes
          const r = (80 * levelFactor) + (val * 180 * levelFactor);
          const angle = i * angleStep;
          
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        
        ctx.closePath();
        ctx.lineWidth = 0.5 + (volume * 5);
        ctx.strokeStyle = l === 0 ? colors.primary : l === 1 ? colors.secondary : l === 2 ? colors.accent : '#fff';
        ctx.globalAlpha = 0.5 - (l * 0.1);
        ctx.stroke();

        // Add sacred dots at peaks
        if (audioData.isBeat && l === 0) {
            ctx.fillStyle = colors.primary;
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.primary;
            ctx.beginPath();
            ctx.arc(120, 0, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
      }
      ctx.restore();
    }
    
    ctx.restore();
  }, [audioData]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      startFile(file);
      // Reset the value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#0D0404] font-sans flex flex-col overflow-hidden text-[#D4AF37] tibetan-pattern">
      <div className="atmosphere" />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="audio/*"
      />
      
      {/* Background Pulse */}
      <AnimatePresence>
        {audioData?.isBeat && (
          <motion.div
            key="pulse"
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_70%)] z-0"
          />
        )}
      </AnimatePresence>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth * window.devicePixelRatio}
        height={window.innerHeight * window.devicePixelRatio}
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Header */}
      <header className="relative z-20 p-8 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] flex items-center justify-center p-1 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <div className="w-full h-full rounded-full border border-[#D4AF37]/40 flex items-center justify-center">
              <Sun className="text-[#D4AF37] w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-display font-black tracking-widest glow-text uppercase leading-none">
              SACHETANA <span className="text-xs font-sans font-normal opacity-50 block mt-1 tracking-[0.4em]">Sacred Sound Matrix</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-6">
           {isPlaying && (
              <motion.div 
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="flex items-center gap-6 text-[10px] font-display tracking-widest uppercase"
              >
                <div className="px-5 py-2 glass-panel text-[#40E0D0] rounded-full border-[#40E0D0]/20 flex items-center gap-2">
                  <Wind className="w-3 h-3" />
                  RESPIRACIÓN ACTIVA
                </div>
                <div className="px-5 py-2 glass-panel text-[#D4AF37] rounded-full border-[#D4AF37]/20">
                  SINCRONÍA
                </div>
              </motion.div>
           )}
           <button 
             onClick={() => setShowControls(!showControls)}
             className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center hover:bg-[#D4AF37]/10 transition-all glass-panel group"
           >
             <Settings2 className="w-5 h-5 opacity-60 text-[#D4AF37] group-hover:rotate-90 transition-transform" />
           </button>
        </div>
      </header>

      {/* Center Display */}
      <main className="flex-1 relative z-10 flex items-center justify-center px-8 gap-12">
        {/* Left Side Info */}
        {isPlaying && (
          <motion.aside 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 space-y-8 hidden xl:block"
          >
            <div className="glass-panel p-6 rounded-3xl border-[#D4AF37]/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10"><Sun className="w-12 h-12" /></div>
              <p className="node-label mb-6">Estado del Ser</p>
              <div className="flex justify-between text-center gap-4">
                <div className="flex-1 py-4 bg-black/20 rounded-xl border border-[#D4AF37]/10">
                  <p className="text-3xl font-display font-bold glow-text">108</p>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest mt-2">Pulsaciones</p>
                </div>
                <div className="flex-1 py-4 bg-black/20 rounded-xl border border-[#D4AF37]/10">
                  <p className="text-3xl font-display font-bold glow-text">9.0</p>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest mt-2">Equilibrio</p>
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-3xl border-[#D4AF37]/20">
              <p className="node-label mb-6">Vibración Espiritual</p>
              <div className="space-y-6">
                <div className="border-l-2 border-[#D4AF37] pl-4">
                  <p className="text-[10px] opacity-40 uppercase tracking-widest font-display">Esencia</p>
                  <p className="text-sm font-bold uppercase tracking-tight mt-1">Ecos del Tibet</p>
                </div>
                <div className="border-l-2 border-[#40E0D0] pl-4">
                  <p className="text-[10px] opacity-40 uppercase tracking-widest font-display">Resonancia</p>
                  <p className="text-sm font-bold uppercase tracking-tight mt-1">Frecuencia Áurea</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}

        {/* Center Mandala Ring */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!isPlaying ? (
              <motion.div
                key="initial"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center gap-16 max-w-lg text-center"
              >
                <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                      className="w-80 h-80 rounded-full border-2 border-dashed border-[#D4AF37]/20 flex items-center justify-center p-8"
                    >
                      <div className="w-full h-full rounded-full border border-[#D4AF37]/10 flex items-center justify-center">
                           <div className="w-3/4 h-3/4 rounded-full border border-[#D4AF37]/5" />
                      </div>
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Bell className="w-20 h-20 text-[#D4AF37]/30 floating-element" />
                    </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-5xl font-display font-black tracking-tighter glow-text uppercase leading-none">
                    Armonía <span className="text-[#D4AF37]/60 block mt-2">Universal</span>
                  </h2>
                  <p className="text-[#D4AF37]/50 text-xs leading-relaxed font-sans uppercase tracking-[0.3em] max-w-sm mx-auto">
                    Eleva tu conciencia a través de la representación visual del sonido sagrado.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-3 p-6 glass-panel rounded-3xl hover:bg-[#D4AF37]/10 transition-all active:scale-95 border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group"
                  >
                    <Upload className="w-5 h-5 text-[#D4AF37] group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[10px] font-display font-bold tracking-widest uppercase">Ofrenda</span>
                  </button>
                  <button
                    onClick={startMicrophone}
                    className="flex flex-col items-center justify-center gap-3 p-6 glass-panel rounded-3xl hover:bg-[#D4AF37]/10 transition-all active:scale-95 border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group"
                  >
                    <Mic className="w-5 h-5 text-[#40E0D0] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-display font-bold tracking-widest uppercase">Presencia</span>
                  </button>
                </div>
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-8"
              >
                <Sun className="w-16 h-16 text-[#D4AF37] animate-spin-slow" />
                <p className="text-xl font-display font-bold glow-text uppercase tracking-widest">Invocando Armonía...</p>
              </motion.div>
            ) : (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative flex flex-col items-center"
              >
                <div className="w-[500px] h-[500px] rounded-full border-2 border-dashed border-[#D4AF37]/10 flex items-center justify-center relative">
                    <div className="absolute -top-6 px-5 py-2 glass-panel text-[#D4AF37] text-[10px] font-display font-bold tracking-[0.3em] uppercase rounded-full shadow-2xl">
                      DESPERTAR CONSCIENTE
                    </div>
                    
                    <motion.div
                      animate={{ 
                        scale: audioData?.isBeat ? 1.03 : 1,
                        borderColor: audioData?.isBeat ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.2)'
                      }}
                      className="w-64 h-64 rounded-full border border-[#D4AF37]/20 glass-panel pulse-core flex items-center justify-center shadow-[0_0_60px_rgba(13,4,4,0.6)] transition-all duration-500"
                    >
                       <div className="text-center">
                          <p className={`text-4xl font-display font-black mb-1 tracking-widest transition-all duration-300 ${audioData?.isBeat ? 'text-[#D4AF37]' : 'text-[#D4AF37]/60'}`}>OM</p>
                          <div className="w-16 h-[1px] bg-[#D4AF37]/30 mx-auto"></div>
                          <p className="text-[10px] mt-2 opacity-40 tracking-[0.3em] font-display">SILENCIO</p>
                       </div>
                    </motion.div>

                    <div className="absolute w-full flex justify-between px-10 pointer-events-none">
                      <div className="flex flex-col items-center gap-1 opacity-40">
                           <div className="w-px h-12 bg-gradient-to-b from-[#D4AF37] to-transparent" />
                           <span className="text-[9px] font-display text-[#D4AF37] tracking-widest uppercase">IZQUIERDA</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 opacity-40">
                           <div className="w-px h-12 bg-gradient-to-b from-[#D4AF37] to-transparent" />
                           <span className="text-[9px] font-display text-[#D4AF37] tracking-widest uppercase">DERECHA</span>
                      </div>
                    </div>
                </div>

                <div className="w-96 mt-16 px-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="node-label">Concentración de Prana</span>
                    <span className="text-[10px] font-display opacity-40 uppercase tracking-widest">NIVEL: {(audioData?.volume || 0).toFixed(2)}</span>
                  </div>
                  <div className="h-[2px] w-full bg-[#D4AF37]/10 rounded-full relative overflow-hidden">
                    <motion.div 
                      animate={{ width: `${(audioData?.volume || 0) * 200}%` }}
                      className="h-full bg-gradient-to-r from-[#800000] via-[#D4AF37] to-[#40E0D0] shadow-[0_0_15px_rgba(212,175,55,0.5)]" 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side Info */}
        {isPlaying && (
          <motion.aside 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 space-y-8 hidden xl:block"
          >
            <div className="glass-panel p-7 rounded-[40px] border-[#D4AF37]/20 flex flex-col h-[480px]">
              <p className="node-label mb-8">Manifestación Sonora</p>
              <div className="space-y-5 flex-1">
                {[
                  { id: 'I', name: 'Base Terrenal', freq: 'Fuerza', color: 'text-[#800000]' },
                  { id: 'II', name: 'Pulso Etéreo', freq: 'Claridad', color: '#fff' },
                  { id: 'III', name: 'Luz Celestial', freq: 'Trascendencia', color: 'text-[#40E0D0]' }
                ].map((beat, i) => (
                  <div key={beat.id} className="flex items-center gap-5 bg-black/20 p-4 rounded-2xl border border-[#D4AF37]/10 transition-colors hover:border-[#D4AF37]/30">
                    <div className="w-12 h-12 rounded-full border border-[#D4AF37]/20 flex items-center justify-center font-display text-xs font-bold bg-white/5">
                      {beat.id}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest">{beat.name}</p>
                      <p className={`text-[10px] font-display mt-1 opacity-70 ${beat.color}`}>{beat.freq}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-[#D4AF37]/10">
                <p className="node-label mb-5">Emanación Cromática</p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="aspect-square bg-[#800000] rounded-full border border-[#D4AF37]/30 shadow-lg shadow-black/50"></div>
                  <div className="aspect-square bg-[#D4AF37] rounded-full opacity-60 border border-white/10"></div>
                  <div className="aspect-square bg-[#40E0D0] rounded-full opacity-40 border border-white/5"></div>
                  <div className="aspect-square bg-white/10 rounded-full opacity-10 border border-white/5"></div>
                </div>
                <p className="text-[10px] mt-8 leading-relaxed opacity-40 italic font-medium font-sans">
                  "El sonido es la forma vibratoria de la vacuidad primordial."
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </main>

      {/* Navigation / Bottom Bar */}
      <AnimatePresence>
        {isPlaying && (
          <motion.footer
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="relative z-20 p-10 flex items-center justify-center"
          >
            <div className="w-full max-w-4xl glass-panel p-6 rounded-[32px] flex items-center gap-10 border-[#D4AF37]/20 shadow-2xl">
              <button
                onClick={stop}
                className="w-14 h-14 rounded-full bg-[#D4AF37] text-[#0D0404] flex items-center justify-center hover:bg-[#800000] hover:text-white transition-all active:scale-90 shadow-xl"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>

              <div className="flex-1 h-3 bg-black/40 rounded-full border border-[#D4AF37]/10 relative flex items-center overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(audioData?.volume || 0) * 100}%` }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#800000] to-[#D4AF37]" 
                />
                <div className="w-full h-full flex justify-between opacity-10 pointer-events-none">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="w-px h-full bg-[#D4AF37]" />
                  ))}
                </div>
              </div>

              <button
                onClick={downloadRhythm}
                disabled={beatHistory.length === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-panel border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all disabled:opacity-30 group"
              >
                <Download className="w-4 h-4 text-[#D4AF37] group-hover:bounce" />
                <span className="text-[10px] font-display font-bold tracking-widest uppercase text-[#D4AF37]">Descargar Ritmo</span>
              </button>

              <div className="text-sm font-display font-black tracking-widest glow-text px-6 border-l border-[#D4AF37]/20 flex flex-col items-center">
                <span className="text-[10px] opacity-40 mb-1">MANTRA</span>
                01:08
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Sacred Borders / Decorative rails */}
      <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/20 to-transparent flex flex-col items-center justify-center gap-12 py-10 pointer-events-none">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full ${i % 2 === 0 ? 'bg-[#D4AF37]' : 'bg-[#800000]'}`} />
          ))}
      </div>
      <div className="absolute right-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/20 to-transparent flex flex-col items-center justify-center gap-12 py-10 pointer-events-none">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full ${i % 2 === 0 ? 'bg-[#40E0D0]' : 'bg-[#D4AF37]'}`} />
          ))}
      </div>
    </div>
  );
}
