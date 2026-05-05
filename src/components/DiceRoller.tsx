"use client";

import { useState, useRef, useEffect } from "react";

const SYLLABLES = ["AH", "RA", "PA", "TSA", "NA", "DHI"];
const TIBETAN_CHARS: Record<string, string> = {
  "AH": "ཨ་",
  "RA": "ར་",
  "PA": "པ་",
  "TSA": "ཙ་",
  "NA": "ན་",
  "DHI": "དྷཱིཿ",
  "?": "༅"
};

const getSecureSyllable = () => {
  const array = new Uint32Array(1);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
    return SYLLABLES[array[0] % SYLLABLES.length];
  }
  return SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)];
};

interface DiceRollerProps {
  onResult: (first: string, second: string) => void;
  isRolling: boolean;
  setIsRolling: (val: boolean) => void;
}

export default function DiceRoller({
  onResult,
  isRolling,
  setIsRolling,
}: DiceRollerProps) {
  const [diceResults, setDiceResults] = useState<string[]>(["?", "?"]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rapidly cycle syllables during rolling
  useEffect(() => {
    if (isRolling) {
      intervalRef.current = setInterval(() => {
        setDiceResults([
          SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)],
          SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)]
        ]);
      }, 70); // Very fast cycling
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRolling]);

  const rollDice = () => {
    if (isRolling) return;

    setIsRolling(true);

    // Final result logic
    timeoutRef.current = setTimeout(() => {
      const first = getSecureSyllable();
      const second = getSecureSyllable();

      setDiceResults([first, second]);
      setIsRolling(false);
      onResult(first, second);
    }, 1200); // Slightly shorter duration for snappier feel
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-6">
        {diceResults.map((val, i) => (
          <div
            key={i}
            className={`
              w-24 h-24 md:w-32 md:h-32
              bg-gradient-to-br from-amber-700/20 to-red-900/40
              border-2 border-amber-500/40 rounded-2xl
              flex flex-col items-center justify-center
              shadow-[0_0_40px_rgba(218,165,32,0.2)]
              transition-all duration-300
              ${isRolling ? "animate-dice-shake scale-110" : "scale-100"}
            `}
          >
            <span className="text-4xl md:text-5xl font-tibetan text-amber-200 drop-shadow-[0_0_10px_rgba(255,255,225,0.3)]">
               {TIBETAN_CHARS[val] || TIBETAN_CHARS["?"]}
            </span>
            <span className="text-[10px] mt-2 uppercase tracking-widest text-amber-500/50 font-mono">
              {val === "?" ? "" : val}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={rollDice}
        disabled={isRolling}
        className={`
          relative px-10 py-4 
          rounded-full border border-amber-500/30
          bg-amber-900/10 text-amber-200 font-light
          tracking-[0.3em] uppercase transition-all duration-500
          hover:bg-amber-500/20 hover:border-amber-400 hover:scale-105
          disabled:opacity-40 disabled:cursor-wait
          group overflow-hidden
          cursor-pointer
        `}
      >
        <span className="relative z-10 font-medium">
          {isRolling ? "Sorteando..." : "Lanzar Dados"}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </button>

      <style jsx global>{`
        @keyframes dice-shake {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-4px, 4px) rotate(-5deg); }
          50% { transform: translate(4px, -4px) rotate(5deg); }
          75% { transform: translate(-4px, -4px) rotate(-5deg); }
          100% { transform: translate(4px, 4px) rotate(5deg); }
        }
        .animate-dice-shake {
          animation: dice-shake 0.1s infinite;
        }
      `}</style>
    </div>
  );
}
