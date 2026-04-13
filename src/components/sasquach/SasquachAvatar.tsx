import React from 'react';
import { motion } from 'framer-motion';

interface SasquachAvatarProps {
  state?: 'Waiting' | 'Thinking' | 'Active';
}

export const SasquachAvatar: React.FC<SasquachAvatarProps> = ({ state = 'Waiting' }) => {
  return (
    <div className="relative w-48 h-48 flex items-end justify-center">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 w-32 h-32 bg-sasquach-gold/20 rounded-full blur-3xl"
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
          animate={state === 'Waiting' ? {
            scale: [1, 1.02, 1],
            rotate: [-1, 1, -1],
          } : {}}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* The Eyes (Mystic glowing points) */}
        <motion.g
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <circle cx="85" cy="80" r="3" fill="#c3a343" />
          <circle cx="115" cy="80" r="3" fill="#c3a343" />
        </motion.g>

        {/* Decorative horn/branch structures */}
        <path
          d="M80 30 L70 10 M120 30 L130 10"
          stroke="#c3a343"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </motion.svg>

      {/* Label */}
      <div className="absolute -bottom-4 text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-sasquach-gold opacity-50 font-bold block">
          Protector del Sinek
        </span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-stone-500 font-mono">
          State: {state}
        </span>
      </div>
    </div>
  );
};
