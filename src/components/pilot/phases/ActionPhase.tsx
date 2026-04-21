'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { AreaHead } from '@/lib/types';

interface ActionPhaseProps {
  role: string;
  sessionId: string;
  selectedSiloRole: string | null;
  areaHeads: AreaHead[];
  updateState: (update: any) => void;
  state: any;
}

export const ActionPhase: React.FC<ActionPhaseProps> = ({ 
  role, 
  sessionId, 
  selectedSiloRole, 
  areaHeads, 
  updateState, 
  state 
}) => {
  const [actionText, setActionText] = useState('');
  const [actionSent, setActionSent] = useState(false);

  const selectedSiloData = areaHeads.find(s => s.role === selectedSiloRole);

  const handleActionSubmit = () => {
    if (!actionText.trim() || !selectedSiloRole) return;

    const newProposal = {
      id: `${sessionId}-${Date.now()}`,
      siloRole: selectedSiloRole,
      role,
      sessionId,
      text: actionText.trim(),
      timestamp: Date.now(),
      weight: 0.5,
    };

    updateState({
      context: {
        ...state.context,
        actionProposals: [...(state.context.actionProposals || []), newProposal],
      },
    });

    setActionSent(true);
    setTimeout(() => {
      setActionSent(false);
      setActionText('');
    }, 4000);
  };

  if (actionSent) {
    return (
      <div className="py-20 text-center uppercase tracking-widest text-amber-500 font-bold">
        Acción Registrada
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel bg-stone-900/60 border border-amber-500/30 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative"
    >
      <header className="mb-8">
        <span className="text-[10px] font-black tracking-[0.4em] text-amber-500/60 uppercase mb-4 block">Fase ACTION • {role}</span>
        {!selectedSiloRole ? (
          <div className="p-4 rounded-xl bg-stone-800/40 border border-stone-700/30 text-stone-400 italic">El Oráculo está seleccionando el silo objetivo...</div>
        ) : selectedSiloData ? (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-[9px] uppercase tracking-wider text-amber-500/60 font-bold">Objetivo</p>
            <p className="text-lg font-serif italic text-amber-300">{selectedSiloData.role}</p>
            <p className="text-xs text-stone-400 mt-2">{selectedSiloData.successMetric}</p>
          </div>
        ) : null}
      </header>

      {selectedSiloRole && (
        <div className="space-y-8">
          <textarea
            value={actionText}
            onChange={(e) => setActionText(e.target.value)}
            placeholder="Escribe tu propuesta de acción..."
            className="w-full min-h-[200px] bg-stone-950/40 border border-amber-500/20 rounded-3xl p-7 text-stone-200 focus:ring-2 focus:ring-amber-500/40 resize-none"
          />
          <button
            onClick={handleActionSubmit}
            disabled={!actionText.trim()}
            className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 bg-gradient-to-br from-amber-600 to-amber-800 text-stone-100 shadow-xl disabled:opacity-20 transition-all duration-300"
          >
            <Plus size={15} /> Registrar Acción
          </button>
        </div>
      )}
    </motion.div>
  );
};
