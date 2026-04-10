import { useRitual } from '../../context/RitualContext';
import { Send, Target } from 'lucide-react';

export const PilotRoot = () => {
  const { state, updateState, nextPhase } = useRitual();

  const handleWhyUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateState({ context: { ...state.context, whySummary: e.target.value } });
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <header className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-sasquach-gold text-[10px] font-black tracking-widest uppercase">The Pilot</h2>
          <h1 className="text-xl font-bold">{state.currentPhase}</h1>
        </div>
        <button 
          onClick={nextPhase}
          className="bg-sasquach-gold text-stone-950 px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 active:scale-95 transition-transform"
        >
          SIGUIENTE <Target size={14} />
        </button>
      </header>

      <main className="flex-1 p-6 space-y-8">
        <section className="space-y-4">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Tu Propósito (Why)</label>
          <textarea 
            value={state.context.whySummary}
            onChange={handleWhyUpdate}
            placeholder="¿Por qué estamos resolviendo esto hoy?"
            className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-sasquach-gold/50 min-h-[150px] transition-colors"
          />
          <p className="text-[10px] text-stone-600 italic">"Los datos ingresados aquí se sincronizan de forma anónima con El Espejo."</p>
        </section>

        <section className="p-6 bg-forest-900/20 border border-forest-800/50 rounded-2xl flex items-center justify-between">
           <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center">
                 <Send size={18} className="text-sasquach-gold" />
              </div>
              <div>
                 <p className="text-xs font-bold uppercase tracking-tighter">Estado de Sincronización</p>
                 <p className="text-[10px] text-stone-500">Conectado vía BroadcastChannel</p>
              </div>
           </div>
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </section>
      </main>

      <footer className="p-6 border-t border-stone-800 bg-stone-900/30 text-[10px] text-stone-600 text-center uppercase tracking-widest">
        Sasquach Clinical Engine V1.0
      </footer>
    </div>
  );
};
