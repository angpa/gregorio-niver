"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * Metal Overlay: Sharp, lightning-like geometry reactive to music.
 */
export default function MetalOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const rafRef = useRef<number>(0);

  const getPulses = useCallback(() => {
    const w = window as any;
    return {
      beat: w.__beatPulse || 0,
      bass: w.__bassPulse || 0,
      mid: w.__midPulse || 0,
      treble: w.__treblePulse || 0,
    };
  }, []);

  const draw = useCallback(() => {
    if (!canvasRef.current) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }

    const centerX = w / 2;
    const centerY = h / 2;
    const pulses = getPulses();
    const { bass, mid, treble, beat } = pulses;

    // Trail fade effect (more aggressive)
    ctx.fillStyle = `rgba(0, 0, 0, ${0.15 - beat * 0.05})`;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(centerX, centerY);

    // Faster rotation
    rotationRef.current += 0.001 + mid * 0.08 + treble * 0.04;
    ctx.rotate(rotationRef.current);

    const levels = 4;
    const segments = 8; // Fewer segments for a sharper look
    const colors = ["#FFFFFF", "#A5A9B4", "#FF0000", "#00F2FF"];

    for (let l = 0; l < levels; l++) {
      const levelFactor = (l + 1) / levels;
      const bandValue = l < 1 ? treble : l < 3 ? mid : bass;
      const baseRadius = 60 + l * 80;

      ctx.save();
      ctx.rotate(
        l * (Math.PI / 4) +
          rotationRef.current * (l % 2 === 0 ? 1.2 : -1.2) * 0.5
      );

      for (let s = 0; s < segments; s++) {
        ctx.save();
        ctx.rotate(((Math.PI * 2) / segments) * s);

        // Sharp "Lightning" spike shape
        const growth = bandValue * 200 * levelFactor + beat * 50;
        const spikeLength = baseRadius + growth;
        const spikeWidth = 5 + mid * 20 * levelFactor;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        // Zig-zag/Sharp lines instead of curves
        ctx.lineTo(spikeWidth, spikeLength * 0.4);
        ctx.lineTo(-spikeWidth * 0.5, spikeLength * 0.7);
        ctx.lineTo(0, spikeLength);
        ctx.lineTo(spikeWidth * 0.5, spikeLength * 0.7);
        ctx.lineTo(-spikeWidth, spikeLength * 0.4);
        ctx.closePath();

        ctx.strokeStyle = colors[l % colors.length];
        ctx.lineWidth = 1 + treble * 6 + beat * 4;
        ctx.globalAlpha = (0.2 + bandValue * 0.6 + beat * 0.4) * (1 - l * 0.2);
        
        // Add glow for outer levels
        if (l > 1) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = colors[l % colors.length];
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;

        // "Sparks" on treble peaks
        if (treble > 0.6 && l === 0) {
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(0, spikeLength, 2 + treble * 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();
    }

    // Expanding radial core on Bass (Red/White)
    if (bass > 0.2) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 50 + bass * 250);
      g.addColorStop(0, `rgba(255, 0, 0, ${bass * 0.6})`);
      g.addColorStop(0.5, `rgba(255, 255, 255, ${bass * 0.2})`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 50 + bass * 250, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    rafRef.current = requestAnimationFrame(draw);
  }, [getPulses]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
