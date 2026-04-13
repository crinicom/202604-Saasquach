import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import { useRitual } from '../../context/RitualContext';

/**
 * PilotView: High-fidelity mobile interface for the WHY phase.
 * Optimized for discrete submission with a smooth fade-out transition.
 */
export const PilotView: React.FC = () => {
  const { state, updateState, role } = useRitual();
  const [text, setText] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    // Package the response with the required role identity
    const newEntry = {
      role,
      text: text.trim(),
      timestamp: Date.now(),
    };

    // Incremental update to the forest
    updateState({
      context: {
        whyResponses: [newEntry],
      },
    });

    // Visual feedback: Start transition
    setIsSent(true);
    
    // Clear and reset after the cinematic transition
    setTimeout(() => {
      setIsSent(false);
      setText('');
    }, 4000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto relative px-5 py-6 overflow-hidden">
      <AnimatePresence mode="wait">
        {!isSent ? (
          <motion.div
            key="ritual-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} // Smooth fade-out with blur
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

            <div className="relative z-10 space-y-8">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe el propósito..."
                className="w-full min-h-[180px] bg-stone-950/40 border border-stone-800/80 rounded-3xl p-7 text-stone-200 placeholder:text-stone-700/60 focus:outline-none focus:ring-1 focus:ring-sasquach-gold/30 transition-all resize-none font-sans text-lg"
              />

              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 transition-all relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-900 text-stone-100 shadow-xl shadow-emerald-950/40 hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-20 transition-all duration-300"
              >
                <span>Enviar al Bosque</span>
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-state"
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
      </AnimatePresence>

      {/* Persistent Tactile Identity */}
      <footer className="text-center mt-4">
        <p className="text-[9px] text-stone-600 uppercase tracking-[0.4em] opacity-50">
          Digital Witness • {role}
        </p>
      </footer>
    </div>
  );
};
