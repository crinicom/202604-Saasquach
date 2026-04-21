'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, ThumbsUp, Target, CheckCircle2 } from 'lucide-react';
import { AreaHead } from '@/lib/types';

interface InquiryPhaseProps {
  role: string;
  sessionId: string;
  areaHeads: AreaHead[];
  refortifySilo: (payload: any) => void;
  state: any;
}

export const InquiryPhase: React.FC<InquiryPhaseProps> = ({ 
  role, 
  sessionId, 
  areaHeads, 
  refortifySilo, 
  state 
}) => {
  const [externalArea, setExternalArea] = useState('');
  const [successMetric, setSuccessMetric] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [showExistingSilos, setShowExistingSilos] = useState(false);
  const [pilotSelectedSilo, setPilotSelectedSilo] = useState<string | null>(null);

  const activeSilos = areaHeads.filter(s => s.status !== 'discarded');

  const handleSiloSelect = (silo: AreaHead) => {
    setPilotSelectedSilo(silo.role);
    setExternalArea(silo.role);
    setSuccessMetric(silo.successMetric);
  };

  const handleInquirySubmit = () => {
    if (!externalArea.trim()) return;

    refortifySilo({
      areaName: externalArea.trim(),
      successMetric: successMetric.trim() || undefined,
      voterRole: role,
      sessionId,
    });

    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setExternalArea('');
      setSuccessMetric('');
      setPilotSelectedSilo(null);
      setShowExistingSilos(false);
    }, 3000);
  };

  if (inquirySent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 px-12 text-center space-y-6"
      >
        <div className="w-24 h-24 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 size={48} strokeWidth={1} />
        </div>
        <div className="space-y-2">
          <h3 className="text-emerald-400 text-xl font-serif italic">Voto Registrado</h3>
          <p className="text-stone-500 text-xs uppercase tracking-widest">El Cerebro ha Procesado</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel bg-stone-900/60 border border-stone-800/40 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
    >
      <header className="mb-10">
        <span className="text-[10px] font-black tracking-[0.4em] text-sasquach-gold/40 uppercase mb-4 block">Fase INQUIRY • {role}</span>
        <h2 className="text-3xl font-serif italic text-stone-100 leading-snug">¿Qué actor externo habita este ecosistema?</h2>
      </header>

      {activeSilos.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowExistingSilos(!showExistingSilos)}
            className="w-full py-3 px-4 rounded-xl bg-stone-800/50 border border-stone-700/50 flex items-center justify-between text-stone-400 hover:text-stone-200 transition-colors"
          >
            <span className="flex items-center gap-2 text-xs uppercase tracking-wider"><Building2 size={14} /> Ver Silos del Bosque ({activeSilos.length})</span>
            <motion.div animate={{ rotate: showExistingSilos ? 180 : 0 }}><ChevronDown size={16} /></motion.div>
          </button>
          <AnimatePresence>
            {showExistingSilos && (
              <motion.div initial={{ opacity: 0, maxHeight: 0 }} animate={{ opacity: 1, maxHeight: 300 }} exit={{ opacity: 0, maxHeight: 0 }} className="overflow-hidden">
                <div className="pt-4 space-y-2 max-h-48 overflow-y-auto">
                  {activeSilos.map((silo) => {
                    const hasVoted = silo.votedBy.some(v => v.role === role && v.sessionId === sessionId);
                    return (
                      <div key={silo.role} className={`p-3 rounded-xl border ${hasVoted ? 'bg-emerald-900/20 border-emerald-600/30' : 'bg-stone-800/30 border-stone-700/30'}`} onClick={() => !hasVoted && handleSiloSelect(silo)}>
                        <div className="flex justify-between">
                          <p className="text-stone-200 text-sm font-serif italic">{silo.role}</p>
                          {hasVoted ? <CheckCircle2 size={14} className="text-emerald-400" /> : <ThumbsUp size={12} className="text-sasquach-gold" />}
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

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-stone-400 text-xs uppercase tracking-wider"><Building2 size={14} className="text-sasquach-gold/50" /> Área Externa</label>
          <textarea
            value={externalArea}
            onChange={(e) => { setExternalArea(e.target.value); setPilotSelectedSilo(null); }}
            placeholder="Ej: Laboratorio, Admisión..."
            className="w-full min-h-[80px] bg-stone-950/40 border border-stone-800/80 rounded-3xl p-6 text-stone-200 resize-none"
          />
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-stone-400 text-xs uppercase tracking-wider"><Target size={14} className="text-sasquach-gold/50" /> Métrica de Éxito</label>
          <textarea
            value={successMetric}
            onChange={(e) => setSuccessMetric(e.target.value)}
            placeholder="¿Qué KPI les importa?"
            className="w-full min-h-[80px] bg-stone-950/40 border border-stone-800/80 rounded-3xl p-6 text-stone-200 resize-none"
          />
        </div>
        <button
          onClick={handleInquirySubmit}
          disabled={!externalArea.trim()}
          className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 bg-gradient-to-br from-emerald-600 to-emerald-900 text-stone-100 shadow-xl disabled:opacity-20 transition-all duration-300"
        >
          <ThumbsUp size={15} /> <span>{pilotSelectedSilo ? 'Votar por este Silo' : 'Registrar nuevo Actor'}</span>
        </button>
      </div>
    </motion.div>
  );
};
