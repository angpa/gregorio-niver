import { getGuests } from "@/app/actions";

export const dynamic = "force-dynamic";

interface ListaPageProps {
  searchParams: Promise<{ pin?: string }>;
}

export default async function ListaPage({ searchParams }: ListaPageProps) {
  const { pin } = await searchParams;

  // Updated PIN for security
  if (pin !== "fran2026") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 text-red-600 animate-pulse">
          <span className="text-6xl font-nosifer">X</span>
        </div>
        <h1 className="text-red-600 font-metal tracking-[0.3em] uppercase text-4xl mb-4">
          ACCESS DENIED
        </h1>
        <p className="text-zinc-500 text-xs tracking-widest max-w-xs uppercase font-metal">
          GET OUT OF THE PIT.
        </p>
      </div>
    );
  }

  const { guests: invitados, error: dbError } = await getGuests();

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16 selection:bg-red-600 selection:text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <div className="mb-4 text-red-600 text-4xl font-nosifer drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
            G
          </div>
          <h1 className="text-4xl md:text-6xl font-metal tracking-[0.1em] mb-4 uppercase italic">
            LISTA DE CONVIDADOS
          </h1>
          <p className="text-zinc-500 text-sm tracking-[0.5em] uppercase font-metal italic">
            GREGÓRIO METAL BASH 2026
          </p>

          {dbError && (
            <div className="mt-8 p-4 rounded-none bg-red-900/10 border-l-4 border-red-600 text-red-400 text-xs font-mono max-w-lg mx-auto text-left overflow-auto">
              <p className="font-bold mb-2 uppercase tracking-widest">⚠️ SYSTEM ERROR:</p>
              {dbError}
            </div>
          )}

          <div className="mt-8 text-2xl opacity-40 grayscale filter">
            🤘 ⚡ 🔥 💀 🤘
          </div>
        </header>

        <div className="relative overflow-hidden border-t-2 border-b-2 border-red-600 bg-zinc-950/60 backdrop-blur-md transform -skew-x-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 font-metal">
                <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-red-600 font-bold italic">#</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-red-600 font-bold italic">NOME</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-red-600 font-bold italic hidden md:table-cell text-center">STATUS</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-red-600 font-bold italic text-right">TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {invitados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 italic text-sm font-metal uppercase tracking-widest">
                    PIT IS EMPTY. WAITING FOR CONFIRMATIONS...
                  </td>
                </tr>
              ) : (
                invitados.map((invitado, index) => (
                  <tr key={invitado.id} className="hover:bg-red-600/5 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-zinc-600">
                      {(invitados.length - index).toString().padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300 group-hover:text-white transition-colors tracking-widest uppercase font-metal">
                        {invitado.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-center">
                      <span className="text-[10px] px-3 py-1 bg-red-950/30 text-red-500 border border-red-900/50 font-bold uppercase tracking-widest italic">
                        IN THE PIT
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] text-zinc-600 font-mono">
                        {new Date(invitado.fecha).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="mt-16 text-center">
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-8" />
          <p className="text-sm text-zinc-500 tracking-[0.8em] uppercase font-metal italic">
            TOTAL CREW: {invitados.length}
          </p>
        </footer>
      </div>
    </div>
  );
}
