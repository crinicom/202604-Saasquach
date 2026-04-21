'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2 } from 'lucide-react';

interface ConvergencePhaseProps {
  role: string;
  state: any;
  submitFact: (causeId: string, text: string) => void;
  validateCause: (causeId: string) => void;
  isValidationGateCleared: () => boolean;
}

export const ConvergencePhase: React.FC<ConvergencePhaseProps> = ({ 
  role, 
  state, 
  submitFact, 
  validateCause,
  isValidationGateCleared 
}) => {
  const [activeRootCause, setActiveRootCause] = useState<string | null>(null);
  const [factText, setFactText] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel bg-stone-900/60 border border-indigo-500/30 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative"
    >
      <header className="mb-8">
        <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400/60 uppercase mb-4 block">Fase CONVERGENCE • {role}</span>
        <h2 className="text-2xl font-serif italic text-stone-100 leading-snug">Valida las causas raíz detectadas por el Oráculo.</h2>
        <p className="text-stone-500 text-xs mt-4 italic">Requiere ≥2 hechos de ≥2 roles distintos para avanzar.</p>
      </header>
      
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {state.context.rootCauses.map((cause: any) => {
          const facts = state.context.verifiableFacts.filter((f: any) => f.rootCauseId === cause.id);
          const distinctRoles = new Set(facts.map((f: any) => f.role));
          const isValidated = cause.status === 'validated';
          
          return (
            <div key={cause.id} className={`p-6 rounded-3xl border transition-all ${isValidated ? 'bg-emerald-900/20 border-emerald-500/40' : 'bg-stone-950/40 border-stone-800/80'}`}>
              <div className="flex justify-between items-start gap-4 mb-4">
                 <h4 className="text-stone-200 font-serif italic text-lg leading-tight">{cause.label}</h4>
                 <div className="flex gap-2">
                    {Array.from(distinctRoles).map(r => (
                      <div key={r as string} className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" title={r as string} />
                    ))}
                 </div>
              </div>

              <div className="mb-6 space-y-2">
                 <div className="flex justify-between text-[8px] uppercase tracking-widest text-stone-500">
                    <span>Evidencia Clínica</span>
                    <span>{distinctRoles.size}/2 Roles</span>
                 </div>
                 <div className="h-1 w-full bg-stone-900 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${Math.min((distinctRoles.size / 2) * 100, 100)}%` }} className={`h-full ${distinctRoles.size >= 2 ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                 </div>
              </div>

              <div className="space-y-3 mb-6">
                 {facts.map((fact: any) => (
                   <p key={fact.id} className="text-[11px] text-stone-400 italic"><span className="text-stone-500 not-italic font-bold uppercase tracking-tighter mr-1">{fact.role}:</span> "{fact.text}"</p>
                 ))}
              </div>

              {activeRootCause === cause.id ? (
                <div className="space-y-4 pt-4 border-t border-stone-800">
                  <textarea value={factText} onChange={(e) => setFactText(e.target.value)} placeholder="Aporta un [HECHO VERIFICABLE]..." className="w-full min-h-[100px] bg-stone-950/60 border border-stone-800 rounded-2xl p-4 text-stone-200 text-xs" />
                  <div className="flex gap-2">
                    <button onClick={() => setActiveRootCause(null)} className="flex-1 py-3 rounded-xl bg-stone-900 text-stone-500 text-[9px] font-black uppercase tracking-widest">Cancelar</button>
                    <button onClick={() => { submitFact(cause.id, factText.trim()); setFactText(''); setActiveRootCause(null); }} className="flex-[2] py-3 rounded-xl bg-indigo-600 text-stone-100 text-[9px] font-black uppercase tracking-widest">Aportar Hecho</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setActiveRootCause(cause.id)} className="flex-1 py-3 rounded-xl bg-stone-900/80 border border-stone-800/80 text-stone-400 text-[9px] font-black uppercase tracking-widest hover:text-stone-200 flex items-center justify-center gap-2">
                    <Plus size={10} /> Añadir Hecho
                  </button>
                  {!isValidated && distinctRoles.size >= 2 && (
                    <button onClick={() => validateCause(cause.id)} className="flex-1 py-3 rounded-xl bg-emerald-600 text-stone-100 text-[9px] font-black uppercase tracking-widest animate-pulse">Validar Causa</button>
                  )}
                  {isValidated && <div className="flex-1 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><CheckCircle2 size={12} /> Validado</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isValidationGateCleared() && (
        <div className="mt-10 p-5 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 text-center text-emerald-400 text-[10px] uppercase tracking-widest font-black">Validación Clínica Completa</div>
      )}
    </motion.div>
  );
};
