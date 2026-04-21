'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ChevronDown, ThumbsUp, Plus, CheckCircle2 } from 'lucide-react';
import { WhyEntry } from '@/lib/types';

interface WhyPhaseProps {
  role: string;
  whyResponses: WhyEntry[];
  updateState: (update: any) => void;
  reinforceWhyEntry: (timestamp: number, role: string, comment?: string) => void;
  state: any;
}

export const WhyPhase: React.FC<WhyPhaseProps> = ({ 
  role, 
  whyResponses, 
  updateState, 
  reinforceWhyEntry, 
  state 
}) => {
  const [text, setText] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [showExistingIdeas, setShowExistingIdeas] = useState(false);
  const [selectedForReinforce, setSelectedForReinforce] = useState<number | null>(null);
  const [reinforceComment, setReinforceComment] = useState('');

  const handleWhySubmit = async () => {
    if (!text.trim()) return;

    const newEntry = {
      role,
      text: text.trim(),
      timestamp: Date.now(),
      weight: 0.5,
      status: 'active' as const,
      reinforcements: [],
    };

    updateState({
      context: {
        ...state.context,
        whyResponses: [...state.context.whyResponses, newEntry],
      },
    });

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setText('');
      setShowExistingIdeas(false);
    }, 4000);
  };

  const handleReinforce = (entry: WhyEntry) => {
    setSelectedForReinforce(entry.timestamp);
  };

  const handleReinforceSubmit = () => {
    if (selectedForReinforce === null) return;
    reinforceWhyEntry(selectedForReinforce, role, reinforceComment.trim() || undefined);
    setSelectedForReinforce(null);
    setReinforceComment('');
    setIsSent(true);
    setTimeout(() => setIsSent(false), 4000);
  };

  if (isSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 px-12 text-center space-y-6"
      >
        <div className="w-24 h-24 bg-sasquach-gold/10 rounded-full flex items-center justify-center text-sasquach-gold border border-sasquach-gold/20">
          <CheckCircle2 size={48} strokeWidth={1} />
        </div>
        <div className="space-y-2">
          <h3 className="text-sasquach-gold text-xl font-serif italic">Propósito Semeado</h3>
          <p className="text-stone-500 text-xs uppercase tracking-widest">Sincronización Exitosa</p>
        </div>
      </motion.div>
    );
  }

  if (selectedForReinforce) {
    const selectedEntry = whyResponses.find(r => r.timestamp === selectedForReinforce);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel bg-stone-900/60 border border-sasquach-gold/30 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        <header className="mb-10">
          <span className="text-[10px] font-black tracking-[0.4em] text-sasquach-gold/60 uppercase mb-4 block">Reforzar Idea</span>
          <h2 className="text-3xl font-serif italic text-stone-100">Refuerza esta idea con tu perspectiva</h2>
        </header>

        {selectedEntry && (
          <div className="mb-8 p-4 rounded-xl bg-stone-800/40 border border-stone-700/30">
            <p className="text-stone-400 text-xs uppercase tracking-wider mb-2">Idea Original</p>
            <p className="text-stone-200 text-sm font-serif italic">"{selectedEntry.text}"</p>
            <p className="text-[9px] text-stone-500 uppercase tracking-wider mt-2">{selectedEntry.role}</p>
          </div>
        )}

        <div className="space-y-8">
          <textarea
            value={reinforceComment}
            onChange={(e) => setReinforceComment(e.target.value)}
            placeholder="Añade un dato, contexto o simplemente vota en silencio..."
            className="w-full min-h-[120px] bg-stone-950/40 border border-stone-800/80 rounded-3xl p-7 text-stone-200 focus:outline-none focus:ring-1 focus:ring-sasquach-gold/30 resize-none"
          />
          <div className="flex gap-3">
            <button onClick={() => setSelectedForReinforce(null)} className="flex-1 py-5 rounded-2xl bg-stone-800 text-stone-400 uppercase tracking-widest text-[10px] font-black">Cancelar</button>
            <button onClick={handleReinforceSubmit} className="flex-[2] py-5 rounded-2xl bg-gradient-to-br from-sasquach-gold/80 to-sasquach-gold text-stone-950 uppercase tracking-widest text-[10px] font-black shadow-xl">
              <ThumbsUp size={15} className="inline mr-2" /> Reforzar
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      className="glass-panel bg-stone-900/60 border border-stone-800/40 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
    >
      <header className="mb-10">
        <span className="text-[10px] font-black tracking-[0.4em] text-sasquach-gold/40 uppercase mb-4 block">Fase WHY • {role}</span>
        <h2 className="text-3xl font-serif italic text-stone-100 leading-snug">¿Cuál es el impacto humano más profundo que queremos proteger?</h2>
      </header>

      {whyResponses.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowExistingIdeas(!showExistingIdeas)}
            className="w-full py-3 px-4 rounded-xl bg-stone-800/50 border border-stone-700/50 flex items-center justify-between text-stone-400 hover:text-stone-200 transition-colors"
          >
            <span className="flex items-center gap-2 text-xs uppercase tracking-wider"><Eye size={14} /> Ver Ideas del Bosque ({whyResponses.length})</span>
            <motion.div animate={{ rotate: showExistingIdeas ? 180 : 0 }}><ChevronDown size={16} /></motion.div>
          </button>
          <AnimatePresence>
            {showExistingIdeas && (
              <motion.div initial={{ opacity: 0, maxHeight: 0 }} animate={{ opacity: 1, maxHeight: 400 }} exit={{ opacity: 0, maxHeight: 0 }} className="overflow-hidden">
                <div className="pt-4 space-y-3 max-h-64 overflow-y-auto">
                  {whyResponses.map((entry) => {
                    const hasReinforced = entry.reinforcements?.some(r => r.role === role);
                    return (
                      <div key={entry.timestamp} className={`p-4 rounded-xl border ${hasReinforced ? 'bg-emerald-900/20 border-emerald-600/30' : 'bg-stone-800/30 border-stone-700/30'}`} onClick={() => !hasReinforced && handleReinforce(entry)}>
                        <div className="flex justify-between gap-3">
                          <p className="text-stone-200 text-sm font-serif italic leading-snug">"{entry.text}"</p>
                          {hasReinforced ? <CheckCircle2 size={16} className="text-emerald-400" /> : <ThumbsUp size={14} className="text-sasquach-gold" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="space-y-8">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe el propósito..."
          className="w-full min-h-[180px] bg-stone-950/40 border border-stone-800/80 rounded-3xl p-7 text-stone-200 placeholder:text-stone-700/60 focus:outline-none resize-none font-sans text-lg"
        />
        <button
          onClick={handleWhySubmit}
          disabled={!text.trim()}
          className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 bg-gradient-to-br from-emerald-600 to-emerald-900 text-stone-100 shadow-xl disabled:opacity-20 transition-all duration-300"
        >
          <Plus size={15} /> Enviar Nueva Idea
        </button>
      </div>
    </motion.div>
  );
};
