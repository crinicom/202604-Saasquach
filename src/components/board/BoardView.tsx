import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitual } from '../../context/RitualContext';
import { SasquachAvatar } from '../sasquach/SasquachAvatar';

/**
 * BoardView: Refined for maximum reliability and visibility.
 * Uses direct rendering to ensure orbs are visible regardless of ref-handling issues.
 */
export const BoardView: React.FC = () => {
  const { state } = useRitual();
  const responses = state.context.whyResponses;

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent">
      {/* 1. Background Atmosphere: Subtle depth */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-900/20 rounded-full blur-[120px]" />
      </div>

      {/* 2. The Purpose Cloud */}
      <div className="absolute inset-0 z-20">
        <AnimatePresence>
          {responses.map((entry, idx) => {
            const key = `orb-${entry.timestamp}-${idx}`;
            
            // Distribute orbs in a circle
            const angle = (idx / Math.max(responses.length, 1)) * Math.PI * 2;
            const radius = 20 + (idx % 2) * 10;
            const x = 50 + Math.cos(angle) * radius;
            const y = 45 + Math.sin(angle) * radius;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1, delay: idx * 0.2 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 p-6 rounded-full flex items-center justify-center text-center backdrop-blur-md border border-sasquach-gold/20 shadow-2xl"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  background: 'radial-gradient(circle, rgba(16, 46, 26, 0.9) 0%, rgba(10, 31, 18, 0.95) 100%)',
                  minWidth: '220px',
                }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5 + idx, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-[9px] uppercase tracking-[0.4em] text-sasquach-gold/60 font-bold mb-2 block font-sans">
                    {entry.role}
                  </span>
                  <p className="text-stone-100 text-lg font-serif italic leading-snug">
                    "{entry.text}"
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 3. Narrative Zero State */}
      {responses.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-12 h-12 border-2 border-sasquach-gold/20 border-t-sasquach-gold rounded-full animate-spin mx-auto" />
            <p className="text-stone-600 font-serif italic uppercase tracking-[0.4em] text-xs">
              Aguardando el Propósito...
            </p>
          </motion.div>
        </div>
      )}

      {/* 4. Sasquach Observer: Force visible with high z-index and explicit positioning */}
      <div className="absolute bottom-12 right-12 z-50">
        <SasquachAvatar state="Waiting" />
      </div>
    </div>
  );
};
