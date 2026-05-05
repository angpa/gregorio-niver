"use client";

import { useEffect, useState } from "react";
import RSVPForm from "./RSVPForm";

export default function InvitationCard() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`
        w-full max-w-2xl mx-auto mt-10
        transition-all duration-1000 ease-out delay-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
    >
      <div
        className="
          relative overflow-hidden
          border-t-4 border-b-4 border-red-600
          shadow-[0_0_60px_rgba(255,0,0,0.15)]
          skew-x-[-1deg]
        "
        style={{
          background:
            "linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(60,0,0,0.4) 50%, rgba(20,20,20,0.95) 100%)",
        }}
      >
        {/* Metal texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative p-10 md:p-14 text-center">
          {/* Decorative top */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="h-1 w-20 bg-red-600 shadow-[0_0_15px_rgba(255,0,0,0.8)]" />
            <span className="text-white text-3xl font-metal">⚡</span>
            <div className="h-1 w-20 bg-red-600 shadow-[0_0_15px_rgba(255,0,0,0.8)]" />
          </div>

          {/* Main invitation text */}
          <h2 className="text-4xl md:text-6xl font-metal text-white mb-4 tracking-tighter uppercase italic">
            ESTÁS INVITADO AL
          </h2>
          <h2 className="text-5xl md:text-7xl font-metal text-red-600 mb-10 tracking-widest uppercase drop-shadow-[2px_2px_0px_rgba(255,255,255,0.2)]">
            METAL BASH
          </h2>

          {/* Cat emojis - Metalized */}
          <div className="flex justify-center gap-4 text-3xl mb-12 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            <span title="Leia" className="hover:scale-150 transition-transform duration-300 cursor-default">💀</span>
            <span title="Alberta" className="hover:scale-150 transition-transform duration-300 cursor-default">🐈‍⬛</span>
            <span title="Deimos" className="hover:scale-150 transition-transform duration-300 cursor-default">🤘</span>
            <span title="Pastelito" className="hover:scale-150 transition-transform duration-300 cursor-default">🐈‍⬛</span>
            <span title="Skinny" className="hover:scale-150 transition-transform duration-300 cursor-default">💀</span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <div className="flex flex-col items-center gap-2 p-6 border border-zinc-800 bg-zinc-950/40 transform -skew-x-6">
              <span className="text-xs uppercase tracking-[0.6em] text-red-600 font-bold">
                DATE / FECHA
              </span>
              <p className="text-3xl md:text-4xl font-metal text-white uppercase italic">
                23 DE MAYO
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 p-6 border border-zinc-800 bg-zinc-950/40 transform skew-x-6">
              <span className="text-xs uppercase tracking-[0.6em] text-red-600 font-bold">
                DOORS / HORA
              </span>
              <p className="text-3xl md:text-4xl font-metal text-white uppercase italic">
                A PARTIR 21:30HS
              </p>
            </div>
          </div>

          {/* Location Section */}
          <div className="flex flex-col items-center gap-3 mb-12 p-8 border-2 border-zinc-800 bg-zinc-950/60 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1 text-[10px] font-bold tracking-[0.3em] text-white">
              VENUE / LUGAR
            </div>
            <p className="text-xl md:text-2xl font-metal text-white uppercase">
              R. Julia Huga Maria Negrello, 244
            </p>
            <p className="text-lg font-metal text-zinc-400 uppercase">
              Umbará, Curitiba
            </p>
            <a
              href="https://share.google/wZUeyIL3Eb5id4I1m"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-6 py-2 bg-white text-black font-bold tracking-widest hover:bg-red-600 hover:text-white transition-colors duration-300 uppercase text-sm"
              id="link-location"
            >
              Get Directions ↗
            </a>
          </div>

          {/* Additional Info Section */}
          <div className="grid grid-cols-1 gap-6 mb-12 pt-8 border-t border-zinc-800">
            <div className="text-center">
              <span className="text-[10px] uppercase tracking-[0.5em] text-red-600 font-bold block mb-2">PROVISIONS / COMIDAS</span>
              <p className="text-lg text-white font-metal italic uppercase">
                Haverá <span className="text-red-500">Comidas e Bebidas</span> para todos!
              </p>
            </div>
          </div>

          {/* RSVP FORM */}
          <div className="mt-12 bg-black/60 p-1 border border-red-600/30">
            <RSVPForm />
          </div>

          {/* Decorative bottom */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent to-red-600" />
            <span className="text-red-600 text-xl font-metal">🤘</span>
            <div className="h-1 w-32 bg-gradient-to-l from-transparent to-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
