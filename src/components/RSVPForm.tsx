"use client";

import { useState } from "react";
import { submitRSVP } from "@/app/actions";

export default function RSVPForm() {
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      // 1. Attempt to save to Database via Server Action
      const formData = new FormData();
      formData.append("nombre", nombre);
      const dbResult = await submitRSVP(formData);

      // 2. ALWAYS attempt to send email notification
      let emailSuccess = false;
      try {
        const emailResponse = await fetch("https://formsubmit.co/ajax/gregorio.fogaca@gmail.com", {
          method: "POST",
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `Nova confirmação Metal: ${nombre}`,
            Nombre: nombre,
            Evento: "Cumple Gregório Metal Bash",
            _template: "table"
          }),
        });
        if (emailResponse.ok) emailSuccess = true;
      } catch (err) {
        console.error("Email notification failed", err);
      }

      // 3. Determine overall success
      if (dbResult.success || emailSuccess) {
        setMessage({ 
          type: "success", 
          text: "WELCOME TO THE PIT! CONFIRMED."
        });
        setNombre("");
      } else {
        setMessage({ type: "error", text: "ERROR. TRY AGAIN OR SEND DIRECT MESSAGE." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "CRITICAL FAILURE. TRY AGAIN." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 bg-zinc-950 border-2 border-red-900/40 transform skew-x-[-2deg]">
      <h3 className="text-center text-red-600 font-metal tracking-[0.3em] mb-6 uppercase text-lg italic">
        CONFIRM YOUR ATTENDANCE
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="YOUR NAME..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={isSubmitting}
            className="
              w-full px-4 py-3 
              bg-zinc-900 border-b-2 border-red-600/50 rounded-none
              text-white placeholder:text-zinc-700
              focus:border-red-600 focus:bg-zinc-800
              outline-none transition-all duration-300
              font-metal text-center tracking-widest uppercase
            "
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !nombre.trim()}
          className="
            w-full py-4 
            bg-red-700 hover:bg-red-600
            disabled:bg-zinc-900
            text-white font-metal text-xl tracking-[0.2em]
            rounded-none shadow-lg transform skew-x-[4deg]
            transition-all duration-300
            flex items-center justify-center gap-2
            cursor-pointer
            border-2 border-transparent hover:border-white
          "
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "SUBMIT RSVP"
          )}
        </button>
      </form>

      {message && (
        <div 
          className={`
            mt-6 p-4 text-sm text-center font-metal tracking-widest
            animate-in fade-in zoom-in-95
            ${message.type === "success" ? "bg-zinc-900 text-green-500 border-l-4 border-green-500" : "bg-zinc-900 text-red-500 border-l-4 border-red-500"}
          `}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
