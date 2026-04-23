'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRitual } from '@/lib/context/RitualContext';
import { RitualPhase } from '@/lib/types';

const PHASES: { id: RitualPhase; label: string; gate?: string }[] = [
  { id: 'WHY', label: 'Por qué?' },
  { id: 'INQUIRY', label: 'Inquiry' },
  { id: 'CONVERGENCE', label: 'Convergencia', gate: '≥2 facts' },
  { id: 'ACTION', label: 'Acción' },
  { id: 'DESIGN', label: 'Diseño' },
];

export const PhaseNavigator: React.FC = () => {
  const { state, nextPhase, isValidationGateCleared, isBoard } = useRitual();
  
  const currentIndex = PHASES.findIndex(p => p.id === state.currentPhase);
  const currentPhase = PHASES[currentIndex];
  const canAdvance = isValidationGateCleared();

  const handleAdvance = () => {
    if (!canAdvance) {
      console.warn('[PhaseNavigator] Blocked by validation gate');
      return;
    }
    nextPhase();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-stone-950/95 border-t border-stone-800 backdrop-blur-xl">
      {/* Phase Progress */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-3">
        {PHASES.map((phase, idx) => {
          const isActive = idx === currentIndex;
          const isComplete = idx < currentIndex;
          const isLocked = idx > currentIndex;
          const phaseRequiresGate = phase.gate && idx > PHASES.findIndex(p => p.gate);
          
          return (
            <React.Fragment key={phase.id}>
              <div className="flex flex-col items-center">
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${isComplete ? 'bg-emerald-500 text-stone-950' : ''}
                    ${isActive ? 'bg-sasquach-gold text-stone-950 animate-pulse' : ''}
                    ${isLocked ? 'bg-stone-800 text-stone-600' : ''}
                  `}
                >
                  {isComplete ? <CheckCircle2 size={14} /> : idx + 1}
                </div>
                <span className={`text-[8px] uppercase tracking-wider mt-1 ${isActive ? 'text-sasquach-gold' : 'text-stone-600'}`}>
                  {phase.label}
                </span>
              </div>
              {idx < PHASES.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${isComplete ? 'bg-emerald-500' : 'bg-stone-800'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Gate Status & Advance Button */}
      <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
        {currentPhase.gate && !canAdvance && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/30 border border-red-500/30">
            <AlertTriangle size={12} className="text-red-500" />
            <span className="text-[10px] text-red-400 uppercase tracking-wider">
              Requiere: {currentPhase.gate}
            </span>
          </div>
        )}

        {isBoard && (
          <button
            onClick={handleAdvance}
            disabled={!canAdvance}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all
              ${canAdvance 
                ? 'bg-sasquach-gold text-stone-950 hover:bg-sasquach-gold/80 shadow-lg shadow-sasquach-gold/20' 
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }
            `}
          >
            {canAdvance ? (
              <>Siguiente <ChevronRight size={14} /></>
            ) : (
              <><Lock size={12} /> Esperando</>
            )}
          </button>
        )}
      </div>

      {/* Helper text for pilot */}
      {!isBoard && currentPhase.gate && (
        <p className="text-center text-[10px] text-stone-500 mt-2">
          El BOARD avanza las fases cuando se cumple el gate
        </p>
      )}
    </div>
  );
};