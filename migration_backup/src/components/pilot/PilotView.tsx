import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Eye, Target, ThumbsUp, Plus, ChevronDown, Building2 } from 'lucide-react';
import { useRitual } from '../../hooks/useRitual';
import { useConvergence } from '../../hooks/useConvergence';
import { AreaHead, WhyEntry } from '../../types';

export const PilotView: React.FC = () => {
  const { state, updateState, role, sessionId, refortifySilo, tenantConfig } = useRitual();
  const { whyResponses, reinforceWhyEntry } = useConvergence();
  
  const [text, setText] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [showExistingIdeas, setShowExistingIdeas] = useState(false);
  const [selectedForReinforce, setSelectedForReinforce] = useState<number | null>(null);
  const [reinforceComment, setReinforceComment] = useState('');
  
  const [externalArea, setExternalArea] = useState('');
  const [successMetric, setSuccessMetric] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [showExistingSilos, setShowExistingSilos] = useState(false);
  const [pilotSelectedSilo, setPilotSelectedSilo] = useState<string | null>(null);

  const [actionText, setActionText] = useState('');
  const [actionSent, setActionSent] = useState(false);

  const isWhyPhase = state.currentPhase === 'WHY';
  const isInquiryPhase = state.currentPhase === 'INQUIRY';
  const isActionPhase = state.currentPhase === 'ACTION';
  const isConvergencePhase = state.currentPhase === 'CONVERGENCE';
  const isDesignPhase = state.currentPhase === 'DESIGN';
  
  const selectedSiloRole = state.context.selectedSilo;
  const activeSilos = state.context.areaHeads.filter(s => s.status !== 'discarded');
  const selectedSiloData = activeSilos.find(s => s.role === selectedSiloRole);

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
        whyResponses: [newEntry],
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
    setTimeout(() => {
      setIsSent(false);
    }, 4000);
  };

  const cancelReinforce = () => {
    setSelectedForReinforce(null);
    setReinforceComment('');
  };

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

  const toggleExistingIdeas = () => {
    setShowExistingIdeas(!showExistingIdeas);
    if (showExistingIdeas) {
      setSelectedForReinforce(null);
      setReinforceComment('');
    }
  };

  const toggleExistingSilos = () => {
    setShowExistingSilos(!showExistingSilos);
    if (showExistingSilos) {
      setPilotSelectedSilo(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto relative px-5 py-6 overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* WHY Phase - Main View */}
        {isWhyPhase && !isSent && !selectedForReinforce && (
          <motion.div
            key="why-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-panel bg-stone-900/60 border border-stone-800/40 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <header className="mb-10 relative z-10">
              <span className="text-[10px] font-black tracking-[0.4em] text-sasquach-gold/40 uppercase mb-4 block">
                Fase WHY • {role}
              </span>
              <h2 className="text-3xl font-serif italic text-stone-100 leading-snug drop-shadow-sm">
                ¿Cuál es el impacto humano más profundo que queremos proteger?
              </h2>
            </header>

            {whyResponses.length > 0 && (
              <div className="mb-6 relative z-10">
                <button
                  onClick={toggleExistingIdeas}
                  className="w-full py-3 px-4 rounded-xl bg-stone-800/50 border border-stone-700/50 flex items-center justify-between text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Eye size={14} />
                    Ver Ideas del Bosque ({whyResponses.length})
                  </span>
                  <motion.div
                    animate={{ rotate: showExistingIdeas ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showExistingIdeas && (
                    <motion.div
                      initial={{ opacity: 0, maxHeight: 0 }}
                      animate={{ opacity: 1, maxHeight: 400 }}
                      exit={{ opacity: 0, maxHeight: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="pt-4 space-y-3 max-h-64 overflow-y-auto">
                        {whyResponses.map((entry, idx) => {
                          const hasReinforced = entry.reinforcements?.some(r => r.role === role);
                          return (
                            <motion.div
                              key={entry.timestamp}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                hasReinforced 
                                  ? 'bg-emerald-900/20 border-emerald-600/30' 
                                  : 'bg-stone-800/30 border-stone-700/30 hover:border-sasquach-gold/30 hover:bg-stone-800/50'
                              }`}
                              onClick={() => !hasReinforced && handleReinforce(entry)}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-stone-200 text-sm font-serif italic leading-snug">
                                    "{entry.text.length > 60 ? entry.text.substring(0, 60) + '...' : entry.text}"
                                  </p>
                                  <p className="text-[9px] text-stone-500 uppercase tracking-wider mt-1">
                                    {entry.role} • {entry.reinforcements?.length || 0} refuerzos
                                  </p>
                                </div>
                                {hasReinforced ? (
                                  <div className="w-8 h-8 rounded-full bg-emerald-600/30 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-sasquach-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-sasquach-gold/40 transition-colors">
                                    <ThumbsUp size={14} className="text-sasquach-gold" />
                                  </div>
                                )}
                              </div>
                              {entry.reinforcements && entry.reinforcements.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {entry.reinforcements.map((r, i) => (
                                    <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400/60 uppercase tracking-wider">
                                      {r.role}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="relative z-10 space-y-8">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe el propósito..."
                className="w-full min-h-[180px] bg-stone-950/40 border border-stone-800/80 rounded-3xl p-7 text-stone-200 placeholder:text-stone-700/60 focus:outline-none focus:ring-1 focus:ring-sasquach-gold/30 transition-all resize-none font-sans text-lg"
              />

              <button
                onClick={handleWhySubmit}
                disabled={!text.trim()}
                className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 transition-all relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-900 text-stone-100 shadow-xl shadow-emerald-950/40 hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-20 transition-all duration-300"
              >
                <Plus size={15} />
                <span>Enviar Nueva Idea</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* WHY Phase - Reinforce View */}
        {isWhyPhase && !isSent && selectedForReinforce && (
          <motion.div
            key="reinforce-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-panel bg-stone-900/60 border border-sasquach-gold/30 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <header className="mb-10 relative z-10">
              <span className="text-[10px] font-black tracking-[0.4em] text-sasquach-gold/60 uppercase mb-4 block">
                Reforzar Idea
              </span>
              <h2 className="text-3xl font-serif italic text-stone-100 leading-snug drop-shadow-sm">
                Refuerza esta idea con tu perspectiva
              </h2>
            </header>

            {(() => {
              const selectedEntry = whyResponses.find(r => r.timestamp === selectedForReinforce);
              if (!selectedEntry) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-4 rounded-xl bg-stone-800/40 border border-stone-700/30"
                >
                  <p className="text-stone-400 text-xs uppercase tracking-wider mb-2">Idea Original</p>
                  <p className="text-stone-200 text-sm font-serif italic">
                    "{selectedEntry.text}"
                  </p>
                  <p className="text-[9px] text-stone-500 uppercase tracking-wider mt-2">
                    {selectedEntry.role}
                  </p>
                </motion.div>
              );
            })()}

            <div className="relative z-10 space-y-8">
              <textarea
                value={reinforceComment}
                onChange={(e) => setReinforceComment(e.target.value)}
                placeholder="Añade un dato, contexto o simplemente vota en silencio..."
                className="w-full min-h-[120px] bg-stone-950/40 border border-stone-800/80 rounded-3xl p-7 text-stone-200 placeholder:text-stone-700/60 focus:outline-none focus:ring-1 focus:ring-sasquach-gold/30 transition-all resize-none font-sans text-base"
              />

              <div className="flex gap-3">
                <button
                  onClick={cancelReinforce}
                  className="flex-1 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all bg-stone-800 text-stone-400 hover:bg-stone-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReinforceSubmit}
                  className="flex-[2] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all relative overflow-hidden bg-gradient-to-br from-sasquach-gold/80 to-sasquach-gold text-stone-950 shadow-xl hover:shadow-sasquach-gold/20 active:scale-95"
                >
                  <ThumbsUp size={15} />
                  <span>Reforzar (+Peso)</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* WHY Success State */}
        {isWhyPhase && isSent && (
          <motion.div
            key="why-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 px-12 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-sasquach-gold/10 rounded-full flex items-center justify-center text-sasquach-gold border border-sasquach-gold/20"
            >
              <CheckCircle2 size={48} strokeWidth={1} />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-sasquach-gold text-xl font-serif italic">Propósito Semeado</h3>
              <p className="text-stone-500 text-xs uppercase tracking-widest">Sincronización Exitosa</p>
            </div>
          </motion.div>
        )}

        {/* INQUIRY Phase */}
        {isInquiryPhase && !inquirySent && (
          <motion.div
            key="inquiry-phase"
            initial={{ opacity: 0, y: 30, filter: 'blur(15px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel bg-stone-900/60 border border-stone-800/40 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <header className="mb-10 relative z-10">
              <span className="text-[10px] font-black tracking-[0.4em] text-sasquach-gold/40 uppercase mb-4 block">
                Fase INQUIRY • {role}
              </span>
              <h2 className="text-3xl font-serif italic text-stone-100 leading-snug drop-shadow-sm">
                ¿Qué actor externo habita este ecosistema?
              </h2>
              <p className="text-stone-500 text-sm mt-4 font-sans italic">
                Identifica las áreas que interactúan con nuestro flujo.
              </p>
            </header>

            {/* Existing Silos List */}
            {activeSilos.length > 0 && (
              <div className="mb-6 relative z-10">
                <button
                  onClick={toggleExistingSilos}
                  className="w-full py-3 px-4 rounded-xl bg-stone-800/50 border border-stone-700/50 flex items-center justify-between text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Building2 size={14} />
                    Ver Silos del Bosque ({activeSilos.length})
                  </span>
                  <motion.div
                    animate={{ rotate: showExistingSilos ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showExistingSilos && (
                    <motion.div
                      initial={{ opacity: 0, maxHeight: 0 }}
                      animate={{ opacity: 1, maxHeight: 300 }}
                      exit={{ opacity: 0, maxHeight: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="pt-4 space-y-2 max-h-48 overflow-y-auto">
                        {activeSilos.map((silo, idx) => {
                          const hasVoted = silo.votedBy.some(v => v.role === role && v.sessionId === sessionId);
                          return (
                            <motion.div
                              key={silo.role}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                hasVoted 
                                  ? 'bg-emerald-900/20 border-emerald-600/30' 
                                  : 'bg-stone-800/30 border-stone-700/30 hover:border-sasquach-gold/30 hover:bg-stone-800/50'
                              }`}
                              onClick={() => !hasVoted && handleSiloSelect(silo)}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-stone-200 text-sm font-serif italic">
                                    {silo.role}
                                  </p>
                                  <p className="text-[9px] text-stone-500 uppercase tracking-wider mt-1">
                                    {silo.votedBy.length} votos • peso: {Math.round(silo.weight * 100)}%
                                  </p>
                                </div>
                                {hasVoted ? (
                                  <div className="w-7 h-7 rounded-full bg-emerald-600/30 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-sasquach-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-sasquach-gold/40 transition-colors">
                                    <ThumbsUp size={12} className="text-sasquach-gold" />
                                  </div>
                                )}
                              </div>
                              {silo.votedBy.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {silo.votedBy.map((voter) => (
                                    <span key={voter.sessionId} className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400/60 uppercase tracking-wider">
                                      {voter.role}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="relative z-10 space-y-6">
              {/* External Area Field */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-stone-400 text-xs uppercase tracking-wider">
                  <Building2 size={14} className="text-sasquach-gold/50" />
                  Área Externa Identificada
                </label>
                <textarea
                  value={externalArea}
                  onChange={(e) => {
                    setExternalArea(e.target.value);
                    setPilotSelectedSilo(null);
                  }}
                  placeholder="Ej: Laboratorio, Admisión, Farmacia, Dirección..."
                  className="w-full min-h-[80px] bg-stone-950/40 border border-stone-800/80 rounded-3xl p-6 text-stone-200 placeholder:text-stone-700/60 focus:outline-none focus:ring-1 focus:ring-sasquach-gold/30 transition-all resize-none font-sans text-base"
                />
                {pilotSelectedSilo && (
                  <p className="text-[9px] text-emerald-400 uppercase tracking-wider">
                    ← Votando por silo existente
                  </p>
                )}
              </div>

              {/* Success Metric Field */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-stone-400 text-xs uppercase tracking-wider">
                  <Target size={14} className="text-sasquach-gold/50" />
                  Métrica de Éxito (Perspectiva Externa)
                </label>
                <textarea
                  value={successMetric}
                  onChange={(e) => setSuccessMetric(e.target.value)}
                  placeholder="¿Cómo miden ellos su propio éxito? ¿Qué KPI les importa?"
                  className="w-full min-h-[80px] bg-stone-950/40 border border-stone-800/80 rounded-3xl p-6 text-stone-200 placeholder:text-stone-700/60 focus:outline-none focus:ring-1 focus:ring-sasquach-gold/30 transition-all resize-none font-sans text-base"
                />
              </div>

              <button
                onClick={handleInquirySubmit}
                disabled={!externalArea.trim()}
                className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 transition-all relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-900 text-stone-100 shadow-xl shadow-emerald-950/40 hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-20 transition-all duration-300"
              >
                <ThumbsUp size={15} />
                <span>{pilotSelectedSilo ? 'Votar por este Silo' : 'Registrar nuevo Actor'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* INQUIRY Success State */}
        {isInquiryPhase && inquirySent && (
          <motion.div
            key="inquiry-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-32 px-12 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30"
            >
              <CheckCircle2 size={48} strokeWidth={1} />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-emerald-400 text-xl font-serif italic">Voto Registrado</h3>
              <p className="text-stone-500 text-xs uppercase tracking-widest">El Cerebro ha Procesado</p>
            </div>
          </motion.div>
        )}

        {/* ACTION Phase */}
        {isActionPhase && !actionSent && (
          <motion.div
            key="action-phase"
            initial={{ opacity: 0, y: 30, filter: 'blur(15px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel bg-stone-900/60 border border-amber-500/30 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <header className="mb-8 relative z-10">
              <span className="text-[10px] font-black tracking-[0.4em] text-amber-500/60 uppercase mb-4 block">
                Fase ACTION • {role}
              </span>
              
              {!selectedSiloRole ? (
                <div className="mb-6 p-4 rounded-xl bg-stone-800/40 border border-stone-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500/60 animate-pulse" />
                    <p className="text-sm text-stone-400 font-sans italic">
                      El Oráculo está seleccionando el silo objetivo...
                    </p>
                  </div>
                </div>
              ) : selectedSiloData ? (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <p className="text-[9px] uppercase tracking-wider text-amber-500/60 mb-1">Objetivo</p>
                  <p className="text-lg font-serif italic text-amber-300">
                    {selectedSiloData.role}
                  </p>
                  <p className="text-xs text-stone-400 mt-2 font-sans">
                    {selectedSiloData.successMetric}
                  </p>
                </div>
              ) : null}
              
              {selectedSiloRole && (
                <>
                  <h2 className="text-2xl font-serif italic text-stone-100 leading-snug drop-shadow-sm">
                    ¿Qué acción mínima y concreta rompería la métrica de este silo hoy?
                  </h2>
                </>
              )}
            </header>

            {selectedSiloRole && (
              <div className="relative z-10 space-y-8">
                <textarea
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="Escribe tu propuesta de acción..."
                  className="w-full min-h-[200px] bg-stone-950/40 border border-amber-500/20 rounded-3xl p-7 text-stone-200 placeholder:text-stone-700/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all resize-none font-sans text-base"
                />

                <div className="p-4 rounded-xl bg-stone-800/30 border border-stone-700/30">
                  <p className="text-[10px] text-stone-500 font-sans italic leading-relaxed">
                    No busques la solución definitiva, busca el ritual que inicie el cambio.
                  </p>
                </div>

                <button
                  onClick={handleActionSubmit}
                  disabled={!actionText.trim()}
                  className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 transition-all relative overflow-hidden bg-gradient-to-br from-amber-600 to-amber-800 text-stone-100 shadow-xl shadow-amber-950/40 hover:shadow-amber-500/20 active:scale-95 disabled:opacity-20 transition-all duration-300"
                >
                  <Plus size={15} />
                  <span>Registrar Acción</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* CONVERGENCE Phase */}
        {isConvergencePhase && (
          <motion.div
            key="convergence-phase"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel bg-stone-900/60 border border-indigo-500/30 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <header className="mb-8 relative z-10">
              <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400/60 uppercase mb-4 block">
                Fase CONVERGENCE • {role}
              </span>
              <h2 className="text-2xl font-serif italic text-stone-100 leading-snug">
                Valida las causas raíz detectadas por el Oráculo.
              </h2>
            </header>
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {state.context.areaHeads.map((silo) => (
                <div key={silo.role} className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex justify-between items-center">
                    <p className="text-indigo-300 font-serif italic text-sm">{silo.role}</p>
                    <button 
                      className="px-4 py-2 rounded-lg bg-indigo-600/40 border border-indigo-500/40 text-indigo-100 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 transition-colors"
                      onClick={() => {
                        // Hook para validar causa
                        console.log('Validating:', silo.role);
                        updateState({
                          context: {
                             ...state.context,
                             areaHeads: state.context.areaHeads.map(ah => 
                               ah.role === silo.role ? { ...ah, status: 'validated' as any } : ah
                             )
                          }
                        });
                      }}
                    >
                      {silo.status === 'validated' ? 'Validado' : 'Validar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* DESIGN Phase */}
        {isDesignPhase && (
          <motion.div
            key="design-phase"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel bg-stone-900/60 border border-emerald-500/30 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
             <header className="mb-8 relative z-10">
              <span className="text-[10px] font-black tracking-[0.4em] text-emerald-400/60 uppercase mb-4 block">
                Fase DESIGN • {role}
              </span>
              <h2 className="text-2xl font-serif italic text-stone-100 leading-snug">
                Identifica puntos de fricción en el flujo propuesto.
              </h2>
            </header>
            
            <p className="text-stone-400 text-sm italic mb-6">
              El diagrama se ha proyectado en el Espejo. Selecciona los nodos para marcar riesgos.
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
               {(() => {
                 const nodes: {id: string, label: string}[] = [];
                 const lines = state.mermaidCode.split('\n');
                 lines.forEach(line => {
                    const match = line.match(/^\s*(\w+)\s*[\[\(\{](.+)[\]\)\}]/);
                    if (match && match[1] !== 'Start') {
                      nodes.push({ id: match[1], label: match[2] });
                    }
                 });

                 if (nodes.length === 0) {
                   return (
                     <div className="p-8 text-center border border-dashed border-stone-800 rounded-[2rem] bg-stone-900/40">
                        <p className="text-stone-600 text-[10px] uppercase tracking-[0.3em] font-bold">Aguardando Estructura...</p>
                     </div>
                   );
                 }

                 return nodes.map(node => {
                    const existingMap = state.frictionMap.find(f => f.nodeId === node.id);
                    return (
                      <div key={node.id} className="p-4 rounded-2xl bg-stone-950/40 border border-stone-800/60 flex flex-col gap-4">
                         <p className="text-stone-300 text-sm font-serif italic">"{node.label}"</p>
                         <div className="flex gap-2">
                            <button 
                              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                existingMap?.type === 'friction' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-stone-800 text-stone-500'
                              }`}
                              onClick={() => {
                                 const newMap = [...state.frictionMap];
                                 const idx = newMap.findIndex(f => f.nodeId === node.id);
                                 if (idx >= 0) {
                                   if (newMap[idx].type === 'friction') newMap.splice(idx, 1);
                                   else newMap[idx] = { ...newMap[idx], type: 'friction' };
                                 } else {
                                   newMap.push({ nodeId: node.id, type: 'friction', count: 1 });
                                 }
                                 updateState({ frictionMap: newMap });
                              }}
                            >
                               Riesgo
                            </button>
                            <button 
                              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                existingMap?.type === 'approval' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-stone-800 text-stone-500'
                              }`}
                              onClick={() => {
                                 const newMap = [...state.frictionMap];
                                 const idx = newMap.findIndex(f => f.nodeId === node.id);
                                 if (idx >= 0) {
                                   if (newMap[idx].type === 'approval') newMap.splice(idx, 1);
                                   else newMap[idx] = { ...newMap[idx], type: 'approval' };
                                 } else {
                                   newMap.push({ nodeId: node.id, type: 'approval', count: 1 });
                                 }
                                 updateState({ frictionMap: newMap });
                              }}
                            >
                               Aprobación
                            </button>
                         </div>
                      </div>
                    );
                 });
               })()}
            </div>
          </motion.div>
        )}

        {/* ACTION Success State */}
        {isActionPhase && actionSent && (
          <motion.div
            key="action-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-32 px-12 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-amber-600/20 rounded-full flex items-center justify-center text-amber-400 border border-amber-500/30"
            >
              <CheckCircle2 size={48} strokeWidth={1} />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-amber-400 text-xl font-serif italic">Acción Registrada</h3>
              <p className="text-stone-500 text-xs uppercase tracking-widest">El Ritmo ha Comenzado</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <footer className="text-center mt-4">
        <p className="text-[9px] text-stone-600 uppercase tracking-[0.4em] opacity-50">
          {tenantConfig.institutionName} • {role}
        </p>
      </footer>
    </div>
  );
};
