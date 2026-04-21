'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DesignPhaseProps {
  role: string;
}

export const DesignPhase: React.FC<DesignPhaseProps> = ({ role }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel bg-stone-900/60 border border-emerald-500/30 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative"
    >
       <header className="mb-8">
        <span className="text-[10px] font-black tracking-[0.4em] text-emerald-400/60 uppercase mb-4 block">Fase DESIGN • {role}</span>
        <h2 className="text-2xl font-serif italic text-stone-100 leading-snug">Identifica puntos de fricción en el flujo propuesto.</h2>
      </header>
      
      <p className="text-stone-400 text-sm italic mb-6">El diagrama se ha proyectado en el Espejo. Observa la estructura y prepárate para la ejecución clínica.</p>
      
      <div className="py-12 bg-stone-950/40 rounded-3xl border border-stone-800 flex items-center justify-center">
         <div className="text-center space-y-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto animate-ping" />
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Visualizando Estructura en el Espejo</p>
         </div>
      </div>
    </motion.div>
  );
};
