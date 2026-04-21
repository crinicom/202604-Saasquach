import { useRitual } from '../../hooks/useRitual';
import { useTheme } from '../../hooks/useTheme';
import { BoardView } from './BoardView';
import { motion, AnimatePresence } from 'framer-motion';
import { SasquachBrain } from '../../logic/brain/brainLogic';
import { AlertCircle } from 'lucide-react';

/**
 * BoardRoot: The Mirror Narrative Orchestrator
 * Improved stacking context for visibility.
 * Dynamic theming based on tenant.
 */
export const BoardRoot = () => {
  const { state, tenantConfig } = useRitual();
  const { cssVariables } = useTheme();

  const missingSilos = SasquachBrain.detectSilos(state);
  const showSiloWarning = state.currentPhase === 'INQUIRY' || state.currentPhase === 'CONVERGENCE';

  return (
    <div 
      className="min-h-screen bg-stone-950 text-stone-200 overflow-hidden relative font-sans"
      style={cssVariables as React.CSSProperties}
    >
      {/* 1. Dynamic Background Layer (z-0) - uses tenant primaryColor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {/* Subtle texture */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]" />
         {/* Dynamic Glow based on tenant */}
         <div 
            className="absolute inset-0 transition-colors duration-1000"
            style={{ backgroundColor: tenantConfig.primaryColor, opacity: 0.15 }}
         />
      </div>

      {/* 2. Main content Layer (z-10) */}
      <div className="absolute inset-0 z-10 flex flex-col">
        <header className="relative z-30 flex justify-between items-start p-12">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-sasquach-gold shadow-[0_0_10px_#c3a343] animate-pulse" />
              <h2 className="text-stone-500 text-[10px] font-black tracking-[0.5em] uppercase">The Mirror • {tenantConfig.institutionName}</h2>
            </div>
            <h1 className="text-5xl text-sasquach-gold font-light tracking-tight italic">
              Phase: <span className="font-bold uppercase tracking-normal not-italic text-stone-100">{state.currentPhase}</span>
            </h1>
          </div>
          <div className="text-right glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md">
            <p className="text-stone-500 text-[9px] uppercase tracking-[0.4em] mb-2">Ritual ID</p>
            <p className="font-mono text-sasquach-gold/80 text-sm tracking-widest">{state.context.ritualId}</p>
          </div>
        </header>

        <main className="flex-1 relative z-10">
          <BoardView />
        </main>

        <footer className="p-12 relative z-30 flex justify-between items-end pointer-events-none">
          <div className="max-w-sm space-y-4 pointer-events-auto">
            <AnimatePresence>
              {showSiloWarning && missingSilos.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mb-4 p-6 glass-panel rounded-3xl border border-red-500/30 bg-red-950/20 backdrop-blur-xl"
                >
                  <div className="flex items-start gap-4">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <div className="space-y-1">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Detector de Silos</h4>
                       <p className="text-stone-300 text-xs italic leading-relaxed">
                          Faltan voces críticas de: <span className="text-stone-100 font-bold not-italic">{missingSilos.join(', ')}</span>. 
                          ¿Quién controla el recurso bloqueante?
                       </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-8 glass-panel rounded-[2rem] border border-sasquach-gold/10 bg-stone-900/80 backdrop-blur-2xl shadow-2xl">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-1 rounded-full bg-sasquach-gold/50" />
                  <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.4em]">Ecosistema Externo</h3>
               </div>
               <div className="space-y-5">
                  <div className="h-1 w-full bg-stone-800/40 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.min((state.context.whyResponses.length / 5) * 100, 100)}%` }}
                       className="h-full bg-sasquach-gold shadow-[0_0_15px_rgba(195,163,67,0.4)]" 
                     />
                  </div>
                  <p className="text-stone-400 text-xs italic leading-relaxed opacity-80">
                    {state.context.whySummary || '"Voces sincronizadas..."'}
                  </p>
               </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
