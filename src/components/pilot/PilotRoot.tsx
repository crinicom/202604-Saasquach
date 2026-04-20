import { useRitual } from '../../hooks/useRitual';
import { Target } from 'lucide-react';
import { PilotView } from './PilotView';

/**
 * PilotRoot: Mobile Orchestrator
 * Extracts role from RitualContext (synced with URL via App.tsx) 
 * and renders the appropriate view based on the current phase.
 */
export const PilotRoot = () => {
  const { state, nextPhase, role, tenantConfig } = useRitual();

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col font-sans selection:bg-sasquach-gold/30 selection:text-stone-950">
      {/* Visual Header with Ritual Identity */}
      <header className="p-6 border-b border-stone-900 flex justify-between items-center bg-stone-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-sasquach-gold shadow-[0_0_8px_#c3a343]" />
              <h2 className="text-sasquach-gold/60 text-[9px] font-black tracking-[0.4em] uppercase">Pilot Control • {role}</h2>
          </div>
          <h1 className="text-lg font-serif italic text-stone-200">
            Phase: <span className="font-sans font-bold uppercase tracking-normal not-italic text-stone-100">{state.currentPhase}</span>
          </h1>
        </div>
        
        {/* Next Phase Master Control - Only visible to admin-level or for demo purposes */}
        <button 
          onClick={nextPhase}
          className="bg-sasquach-gold text-stone-950 px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-lg shadow-sasquach-gold/10 hover:scale-105 active:scale-95 transition-all"
        >
          SIGUIENTE <Target size={14} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <section className="max-w-md mx-auto py-4">
           {/* Rendering Phase View: Context is provided via RitualProvider */}
           <PilotView />
        </section>

        {/* Sync Status - Sticky Bottom */}
        <section className="p-4 mx-4 mb-4 bg-stone-900/40 border border-stone-800/50 rounded-2xl flex items-center justify-between backdrop-blur-md">
           <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-deep/20 flex items-center justify-center border border-emerald-deep/20 text-sasquach-gold">
                 <Target size={14} />
              </div>
              <div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-stone-500">Sync Status</p>
                 <p className="text-[10px] text-stone-400 font-medium tracking-tight">Authenticated as {role}</p>
              </div>
           </div>
           <div className="flex gap-1 pr-2">
              <span className="w-1 h-1 rounded-full bg-sasquach-gold animate-pulse"></span>
              <span className="w-1 h-1 rounded-full bg-sasquach-gold opacity-50"></span>
           </div>
        </section>
      </main>

      <footer className="p-6 border-t border-stone-900 bg-black/40 text-[9px] text-stone-700 text-center uppercase tracking-[0.5em] font-medium">
        {tenantConfig.institutionName} • Ritual {state.context.ritualId}
      </footer>
    </div>
  );
};
