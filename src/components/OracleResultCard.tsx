"use client";

import { useEffect, useState } from "react";

export interface OracleResult {
  id: number;
  silabas: string;
  tibetano: string;
  titulo: string;
  resumen: string;
  suavizado: string | null;
}

interface OracleResultCardProps {
  result: OracleResult;
  onReset: () => void;
}

export default function OracleResultCard({
  result,
  onReset,
}: OracleResultCardProps) {
  const [visible, setVisible] = useState(false);
  const isBadFortune = result.suavizado !== null;

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`
        w-full max-w-lg mx-auto 
        transition-all duration-1000 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
    >
      {/* Result Card */}
      <div
        className="
          relative rounded-3xl overflow-hidden
          border border-amber-500/30
          shadow-[0_0_60px_rgba(218,165,32,0.15)]
        "
        style={{
          background:
            "linear-gradient(135deg, rgba(139,0,0,0.15) 0%, rgba(10,0,5,0.95) 40%, rgba(0,40,40,0.15) 100%)",
        }}
      >
        {/* Parchment texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative p-8 md:p-10">
          {/* Tibetan syllables header */}
          <div className="text-center mb-6">
            <p className="text-5xl md:text-6xl text-amber-300 font-tibetan mb-2 drop-shadow-[0_0_15px_rgba(218,165,32,0.5)]">
              {result.tibetano}
            </p>
            <p className="text-sm uppercase tracking-[0.4em] text-amber-500/70 font-mono">
              {result.silabas}
            </p>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/30" />
            <span className="text-amber-500/50 text-lg">༄</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/30" />
          </div>

          {/* Title */}
          <h3 className="text-center text-xl md:text-2xl font-light text-white mb-6 tracking-wide">
            {result.titulo}
          </h3>

          {/* Content */}
          {isBadFortune ? (
            /* Bad fortune with cat intervention */
            <div className="space-y-4">
              {/* Original reading - crossed out / dimmed */}
              <div className="relative p-4 rounded-xl bg-red-900/10 border border-red-500/20">
                <div className="absolute -top-3 left-4">
                  <span className="text-xs bg-red-900/60 text-red-300 px-3 py-1 rounded-full border border-red-500/30">
                    Lectura Original
                  </span>
                </div>
                <p className="text-base md:text-lg text-red-200/50 line-through decoration-red-500/40 leading-relaxed mt-2 italic font-parchment">
                  {result.resumen}
                </p>
              </div>

              {/* Cat intervention */}
              <div className="relative p-5 rounded-xl bg-amber-900/10 border border-amber-500/30 shadow-[0_0_20px_rgba(218,165,32,0.1)]">
                <div className="absolute -top-3 left-4">
                  <span className="text-xs bg-amber-900/60 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
                    <span>🐱</span> Intervención Gatuna
                  </span>
                </div>
                <p className="text-amber-100 leading-relaxed mt-2 text-base md:text-lg font-parchment">
                  {result.suavizado}
                </p>
              </div>
            </div>
          ) : (
            /* Good fortune */
            <div className="p-5 rounded-xl bg-emerald-900/10 border border-emerald-500/20">
              <p className="text-emerald-50 leading-relaxed text-base md:text-lg font-parchment">
                {result.resumen}
              </p>
            </div>
          )}

          {/* Oracle number */}
          <div className="mt-6 text-center">
            <span className="text-[10px] uppercase tracking-[0.5em] text-amber-500/30 font-mono">
              MÖ #{result.id} de 36
            </span>
          </div>
        </div>
      </div>

      {/* Try Again Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onReset}
          className="
            text-xs uppercase tracking-[0.3em] text-amber-400/50
            hover:text-amber-300 transition-colors duration-300
            cursor-pointer
          "
          id="btn-try-again"
        >
          ↻ Consultar de nuevo
        </button>
      </div>
    </div>
  );
}
