"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import MandalaBackground from "@/components/MandalaBackground";
import MandalaOverlay from "@/components/MandalaOverlay";
import InvitationCard from "@/components/InvitationCard";
import { useMobile } from "@/hooks/useMobile";

type Phase = "landing" | "invitation";

export default function GregorioBirthdayPage() {
  const isMobile = useMobile();
  const [phase, setPhase] = useState<Phase>("landing");
  const [fadeIn, setFadeIn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Real-time tracking loop using Web Audio API
  const startBeatTracking = useCallback(() => {
    if (!audioRef.current || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Initialize global pulses
    (window as any).__beatPulse = 0;
    (window as any).__bassPulse = 0;
    (window as any).__midPulse = 0;
    (window as any).__treblePulse = 0;

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);

      // Analyze frequency bands
      // Bass: 20-250Hz (approx. first 10 bins for 2048 FFT)
      let bassSum = 0;
      for (let i = 0; i < 10; i++) bassSum += dataArray[i];
      const bass = bassSum / 10 / 255;

      // Mid: 250-4000Hz (approx. bins 10-150)
      let midSum = 0;
      for (let i = 10; i < 150; i++) midSum += dataArray[i];
      const mid = midSum / 140 / 255;

      // Treble: 4000-20000Hz (approx. bins 150-512)
      let trebleSum = 0;
      for (let i = 150; i < 512; i++) trebleSum += dataArray[i];
      const treble = trebleSum / 362 / 255;

      // Detect Beat (strong bass peak)
      const currentBeat = (window as any).__beatPulse || 0;
      if (bass > 0.75 && currentBeat < 0.1) {
        (window as any).__beatPulse = 1;
      }

      // Update global pulses with some smoothing/scaling
      (window as any).__bassPulse = Math.pow(bass, 1.5) * 1.2;
      (window as any).__midPulse = Math.pow(mid, 1.2) * 1.5;
      (window as any).__treblePulse = Math.pow(treble, 1.2) * 2.0;

      // Decay core beat pulse
      (window as any).__beatPulse = Math.max(0, currentBeat * 0.92);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Transition from landing to invitation + start music + beats
  const startInvitation = () => {
    setPhase("invitation");
    setTimeout(() => setFadeIn(true), 50);

    if (audioRef.current) {
      // 1. Create AudioContext if not exists
      if (!audioContextRef.current) {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;

        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
      }

      // 2. Play
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => {
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
        startBeatTracking();
      }).catch((e) =>
        console.log("Audio play blocked:", e)
      );
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-black text-white font-sans selection:bg-red-600 selection:text-white">
      {/* 3D METAL BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <Canvas
          dpr={isMobile ? 1 : [1, 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 15, 30], fov: 60 }}
          style={{ width: "100%", height: "100%" }}
        >
          <MandalaBackground isMobile={isMobile} />
        </Canvas>
      </div>

      <MandalaOverlay />

      <div className="pointer-events-none fixed inset-0 z-[2] bg-gradient-to-t from-black via-transparent to-black/60" />

      {phase === "landing" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-center px-6">
          <div className="mb-6 animate-pulse">
            <span className="text-red-600 text-6xl md:text-8xl font-nosifer tracking-tighter drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">
              G
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-metal tracking-wider mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-zinc-600">
            GREGÓRIO
          </h1>

          <p className="text-xl md:text-2xl font-light text-red-600/90 tracking-[0.4em] mb-12 font-metal">
            BIRTHDAY BASH 2026
          </p>

          <button
            onClick={startInvitation}
            className="
              group relative px-12 py-5
              rounded-none
              border-2 border-red-600/50
              bg-black/40
              text-xl md:text-2xl font-metal tracking-[0.2em]
              text-white
              shadow-[0_0_30px_rgba(255,0,0,0.2)]
              hover:bg-red-600
              hover:shadow-[0_0_60px_rgba(255,0,0,0.6)]
              hover:border-white
              hover:text-black
              transition-all duration-300
              cursor-pointer overflow-hidden
              skew-x-[-12deg]
            "
            id="btn-start-invitation"
          >
            <span className="relative z-10 block skew-x-[12deg]">JOIN THE PIT</span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white transition-transform duration-300" />
          </button>

          <div className="mt-16 flex gap-4 text-2xl opacity-50 grayscale hover:grayscale-0 transition-all">
            <span title="Metal">🤘</span>
            <span title="Lightning">⚡</span>
            <span title="Fire">🔥</span>
            <span title="Skull">💀</span>
          </div>
        </div>
      )}

      {phase === "invitation" && (
        <div
          className={`
            relative z-10
            min-h-[100dvh]
            flex items-center justify-center
            transition-opacity duration-1000 ease-in-out
            ${fadeIn ? "opacity-100" : "opacity-0"}
          `}
        >
          <div className="relative w-full max-w-4xl mx-auto px-6 py-16 pb-32">
            <InvitationCard />
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src="/music/Mama Said.mp3"
        loop
        playsInline
      />

      {phase !== "landing" && (
        <button
          onClick={toggleMute}
          className="
            fixed bottom-6 right-6 z-50
            w-14 h-14 rounded-none
            flex items-center justify-center
            border-2 border-red-600/40
            bg-black/80 backdrop-blur-sm
            text-red-500
            hover:text-white hover:border-white
            hover:bg-red-600
            transition-all duration-300
            cursor-pointer
            shadow-[0_0_20px_rgba(255,0,0,0.2)]
            skew-x-[-10deg]
          "
          id="btn-toggle-mute"
          title={isMuted ? "Unmute" : "Mute"}
        >
          <div className="skew-x-[10deg]">
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </div>
        </button>
      )}

      <div className="fixed bottom-3 left-0 right-0 text-center pointer-events-none z-[2]">
        <p className="text-[10px] uppercase tracking-[0.8em] text-red-900/40 font-metal">
          GREGÓRIO METAL BASH v2.0
        </p>
      </div>
    </div>
  );
}
