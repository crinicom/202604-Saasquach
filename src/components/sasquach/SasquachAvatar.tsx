'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RitualPhase } from '../../lib/types';

interface SasquachAvatarProps {
  phase?: RitualPhase;
  isActive?: boolean;
  flashGold?: boolean;
  isSuccess?: boolean;
}

export const SasquachAvatar: React.FC<SasquachAvatarProps> = ({ 
  phase = 'WHY', 
  isActive = false,
  flashGold = false,
  isSuccess = false
}) => {
  const isThinking = phase === 'INQUIRY';
  const isWaiting = phase === 'WHY' && !isActive;
  const isEmitting = flashGold || isSuccess;
  
  return (
    <div className="relative w-48 h-48 flex items-end justify-center">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: isEmitting ? [1, 2.2, 1] : isThinking ? [1, 1.4, 1] : [1, 1.2, 1],
          opacity: isEmitting ? [0.7, 1, 0.7] : isThinking ? [0.4, 0.7, 0.4] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: isEmitting ? 1.5 : isThinking ? 2 : 4,
          repeat: isEmitting ? Infinity : Infinity,
          ease: "easeInOut",
        }}
        className={`absolute bottom-0 w-32 h-32 rounded-full blur-3xl ${
          isEmitting ? 'bg-sasquach-gold/80' : isThinking ? 'bg-emerald-600/30' : 'bg-sasquach-gold/20'
        }`}
      />

      {/* Sasquach Silhouette */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full z-10 drop-shadow-[0_0_15px_rgba(195,163,67,0.3)]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <defs>
          <linearGradient id="sasquachGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c3a343" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0a1f12" />
          </linearGradient>
          
          <filter id="fuzzy">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
          </filter>
        </defs>

        {/* The Body/Cape */}
        <motion.path
          d="M100 20 C60 20 40 60 40 100 C40 150 60 180 100 180 C140 180 160 150 160 100 C160 60 140 20 100 20Z"
          fill="url(#sasquachGradient)"
          filter="url(#fuzzy)"
          animate={
            isThinking ? {
              scale: [1, 1.03, 1],
              rotate: [0, 2, -2, 0],
            } : isWaiting ? {
              scale: [1, 1.02, 1],
              rotate: [-1, 1, -1],
            } : {}
          }
          transition={{
            duration: isThinking ? 3 : 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* The Eyes */}
        <motion.g
          animate={
            isEmitting ? {
              opacity: 1,
              filter: isSuccess ? ['brightness(1)', 'brightness(2)', 'brightness(1)'] : ['brightness(1)', 'brightness(4)', 'brightness(1)'],
            } : isThinking ? {
              opacity: [0.8, 1, 0.8],
            } : isWaiting ? {
              opacity: [0.4, 0.6, 0.4],
            } : {
              opacity: [0.8, 1, 0.8],
            }
          }
          transition={{
            duration: isEmitting ? (isSuccess ? 2 : 0.6) : isThinking ? 1.5 : 5,
            ease: "easeInOut",
          }}
        >
          {/* Left Eye */}
          <motion.circle
            cx="85"
            cy="80"
            r={isEmitting ? 6 : isThinking ? 3 : 3}
            fill={isEmitting ? '#fbbf24' : '#c3a343'}
            animate={isThinking && !isEmitting ? { 
              r: [3, 4, 3],
            } : isSuccess ? {
              r: [6, 7, 6],
            } : {}}
            transition={{ duration: isSuccess ? 1.5 : 1.2, repeat: Infinity }}
          />
          {/* Right Eye */}
          <motion.circle
            cx="115"
            cy="80"
            r={isEmitting ? 6 : isThinking ? 3 : 3}
            fill={isEmitting ? '#fbbf24' : '#c3a343'}
            animate={isThinking && !isEmitting ? { 
              r: [3, 4, 3],
            } : isSuccess ? {
              r: [6, 7, 6],
            } : {}}
            transition={{ duration: isSuccess ? 1.5 : 1.2, repeat: Infinity, delay: 0.1 }}
          />
          
          {/* Thinking indicator: rotating dots */}
          {isThinking && !isEmitting && (
            <>
              <motion.circle
                cx="75"
                cy="70"
                r="1"
                fill="#c3a343"
                animate={{ 
                  opacity: [0, 1, 0],
                  rotate: [0, 360],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                }}
              />
              <motion.circle
                cx="125"
                cy="70"
                r="1"
                fill="#c3a343"
                animate={{ 
                  opacity: [0, 1, 0],
                  rotate: [0, -360],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
            </>
          )}
        </motion.g>
        
        {/* Flash effect ring */}
        {isEmitting && !isSuccess && (
          <>
            <motion.circle
              cx="85"
              cy="80"
              r="8"
              fill="none"
              stroke="#c3a343"
              strokeWidth="2"
              initial={{ opacity: 1, r: 3 }}
              animate={{ opacity: 0, r: 20 }}
              transition={{ duration: 0.6 }}
            />
            <motion.circle
              cx="115"
              cy="80"
              r="8"
              fill="none"
              stroke="#c3a343"
              strokeWidth="2"
              initial={{ opacity: 1, r: 3 }}
              animate={{ opacity: 0, r: 20 }}
              transition={{ duration: 0.6 }}
            />
          </>
        )}

        {/* Decorative horn/branch structures */}
        <path
          d="M80 30 L70 10 M120 30 L130 10"
          stroke="#c3a343"
          strokeWidth="2"
          strokeLinecap="round"
          opacity={isThinking ? "0.8" : "0.5"}
        />
      </motion.svg>

      {/* Label */}
      <div className="absolute -bottom-4 text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-sasquach-gold opacity-50 font-bold block">
          Protector del Sinek
        </span>
        <span className="text-[8px] uppercase tracking-[0.2em] font-mono">
          {isSuccess ? (
            <span className="text-sasquach-gold">Éxito</span>
          ) : flashGold ? (
            <span className="text-sasquach-gold animate-pulse">Processing...</span>
          ) : isThinking ? (
            <span className="text-emerald-400">Thinking...</span>
          ) : isActive ? (
            <span className="text-stone-500">Active</span>
          ) : (
            <span className="text-stone-600">Waiting</span>
          )}
        </span>
      </div>
    </div>
  );
};
