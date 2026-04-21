import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronUp, ChevronDown, Target, GitMerge, Eye, EyeOff, MapPin, AlertTriangle } from 'lucide-react';
import { useRitual } from '../../hooks/useRitual';
import { useConvergence } from '../../hooks/useConvergence';
import { SasquachAvatar } from '../sasquach/SasquachAvatar';
import { RitualPhase, AreaHead, WhyEntry, SimilarNodes, ActionProposal } from '../../types';

const transitionOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { delay: 0.5, duration: 0.5 } },
};

interface NodeContextMenuProps {
  node: WhyEntry | AreaHead;
  type: 'why' | 'area';
  position: { x: number; y: number };
  onClose: () => void;
  onPromote: () => void;
  onDiscard: () => void;
  onRestore: () => void;
  onAdjustWeight: (delta: number) => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  node,
  type,
  position,
  onClose,
  onPromote,
  onDiscard,
  onRestore,
  onAdjustWeight,
}) => {
  const isDiscarded = node.status === 'discarded';
  const isPromoted = node.status === 'promoted';

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute z-[70] bg-stone-900/95 border border-stone-700 rounded-xl p-3 shadow-2xl min-w-[180px]"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-700">
          <div className={`w-2 h-2 rounded-full ${isPromoted ? 'bg-sasquach-gold' : isDiscarded ? 'bg-stone-600' : 'bg-emerald-500'}`} />
          <span className="text-[10px] uppercase tracking-widest text-sasquach-gold font-bold">
            {type === 'why' ? (node as WhyEntry).role : (node as AreaHead).role}
          </span>
        </div>

        <div className="space-y-1">
          {!isDiscarded && (
            <>
              <button
                onClick={onPromote}
                className="w-full px-3 py-2 text-left text-xs rounded-lg hover:bg-sasquach-gold/20 text-stone-300 hover:text-sasquach-gold flex items-center gap-2"
              >
                <ChevronUp size={14} className="text-sasquach-gold" />
                Promover al Centro
              </button>
              <button
                onClick={() => onAdjustWeight(0.2)}
                className="w-full px-3 py-2 text-left text-xs rounded-lg hover:bg-emerald-600/20 text-stone-300 hover:text-emerald-400 flex items-center gap-2"
              >
                <Target size={14} className="text-emerald-500" />
                Aumentar Peso (+0.2)
              </button>
              <button
                onClick={() => onAdjustWeight(-0.2)}
                className="w-full px-3 py-2 text-left text-xs rounded-lg hover:bg-amber-600/20 text-stone-300 hover:text-amber-400 flex items-center gap-2"
              >
                <Target size={14} className="text-amber-500 rotate-180" />
                Reducir Peso (-0.2)
              </button>
              <div className="h-px bg-stone-700 my-2" />
              <button
                onClick={onDiscard}
                className="w-full px-3 py-2 text-left text-xs rounded-lg hover:bg-red-600/20 text-red-400 flex items-center gap-2"
              >
                <ChevronDown size={14} />
                Descartar al Fondo
              </button>
            </>
          )}

          {isDiscarded && (
            <button
              onClick={onRestore}
              className="w-full px-3 py-2 text-left text-xs rounded-lg hover:bg-emerald-600/20 text-emerald-400 flex items-center gap-2"
            >
              <ChevronUp size={14} />
              Restaurar
            </button>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-stone-700">
          <div className="flex items-center justify-between text-[9px] text-stone-500 uppercase tracking-wider">
            <span>Peso actual</span>
            <span className="text-sasquach-gold font-bold">{Math.round(node.weight * 100)}%</span>
          </div>
          <div className="mt-1 h-1 bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${node.weight * 100}%` }}
              className="h-full bg-sasquach-gold"
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};

interface FusionProposalProps {
  source: string;
  target: string;
  similarity: number;
  onFuse: () => void;
  onDismiss: () => void;
}

const FusionProposal: React.FC<FusionProposalProps> = ({ source, target, similarity, onFuse, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] bg-stone-900/95 border border-amber-500/30 rounded-2xl p-6 shadow-2xl max-w-md"
    >
      <div className="flex items-center gap-2 mb-4">
        <GitMerge size={18} className="text-amber-500" />
        <span className="text-amber-500 text-sm font-bold uppercase tracking-widest">
          El Cerebro detecta similitud
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 text-center p-3 rounded-xl bg-stone-800/50 border border-stone-700">
          <p className="text-stone-300 font-serif italic">{source}</p>
        </div>
        <div className="text-amber-500 font-bold">≈</div>
        <div className="flex-1 text-center p-3 rounded-xl bg-stone-800/50 border border-stone-700">
          <p className="text-stone-300 font-serif italic">{target}</p>
        </div>
      </div>

      <p className="text-stone-500 text-xs mb-6 text-center">
        Similitud: <span className="text-amber-500 font-bold">{Math.round(similarity * 100)}%</span>
      </p>

      <div className="flex gap-3">
        <button
          onClick={onFuse}
          className="flex-1 px-4 py-3 rounded-xl bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <GitMerge size={16} />
          Fusionar
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 px-4 py-3 rounded-xl bg-stone-800 text-stone-400 hover:bg-stone-700 font-bold text-xs uppercase tracking-wider"
        >
          Mantener Separados
        </button>
      </div>
    </motion.div>
  );
};

interface MemorySidebarProps {
  children: React.ReactNode;
  sasquachAttention?: boolean;
}

const MemorySidebar: React.FC<MemorySidebarProps> = ({ children, sasquachAttention = false }) => {
  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(28, 28, 28, 0.75) 100%)',
        boxShadow: '4px 0 40px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className="absolute inset-0 backdrop-blur-xl" />
      
      <div 
        className={`relative flex-1 flex flex-col transition-all duration-700 ${
          sasquachAttention ? 'border-r border-sasquach-gold/30' : 'border-r border-sasquach-gold/10'
        }`}
      >
        {children}
      </div>
    </motion.aside>
  );
};

interface PurposeSlotProps {
  summary: string;
  responseCount: number;
  isVisible: boolean;
  isFromCenter?: boolean;
}

const PurposeSlot: React.FC<PurposeSlotProps> = ({ summary, responseCount, isVisible, isFromCenter = false }) => {
  return (
    <motion.div
      initial={isFromCenter ? { 
        opacity: 1, 
        scale: 1, 
        x: 0, 
        y: 0,
        left: '50%',
        top: '50%'
      } : { opacity: 0, y: -20 }}
      animate={isVisible ? { 
        opacity: 1, 
        scale: 1, 
        x: 0, 
        y: 0,
        left: 'auto',
        top: 'auto'
      } : { opacity: 0, y: -20 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-4 mt-4"
    >
      <div className="relative rounded-xl overflow-hidden"
        style={{
          background: 'rgba(28, 28, 28, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(195, 163, 67, 0.15)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sasquach-gold/5 to-transparent" />
        
        <div className="relative p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={12} className="text-sasquach-gold/60" />
            <span className="text-[8px] uppercase tracking-[0.3em] text-sasquach-gold/60 font-bold">
              NUESTRO NORTE
            </span>
          </div>
          
          <p className="text-stone-200 text-[11px] font-serif italic leading-relaxed line-clamp-3 mb-3">
            "{summary || 'El propósito aguarda...'}"
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-stone-500">
              {responseCount} voces
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-sasquach-gold animate-pulse" />
              <span className="text-[8px] text-stone-500">Referencia</span>
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className="absolute -right-px top-1/4 w-px h-1/2"
        style={{
          background: 'linear-gradient(180deg, rgba(195, 163, 67, 0.4) 0%, rgba(195, 163, 67, 0) 100%)',
        }}
      />
    </motion.div>
  );
};

interface CriticalSiloSlotProps {
  siloRole: string;
  successMetric: string;
  isVisible: boolean;
}

const CriticalSiloSlot: React.FC<CriticalSiloSlotProps> = ({ siloRole, successMetric, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-4 mt-4"
        >
          <div className="relative rounded-xl overflow-hidden"
            style={{
              background: 'rgba(28, 28, 28, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
            
            <div className="relative p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={12} className="text-amber-500/80" />
                <span className="text-[8px] uppercase tracking-[0.3em] text-amber-500/80 font-bold">
                  FRICCIÓN A RESOLVER
                </span>
              </div>
              
              <p className="text-stone-200 text-[11px] font-serif italic leading-relaxed mb-3">
                {siloRole}
              </p>
              
              <div className="p-3 rounded-lg bg-stone-800/40 border border-stone-700/30">
                <p className="text-[9px] uppercase tracking-wider text-stone-500 mb-1">Métrica a Desafiar</p>
                <p className="text-[10px] text-amber-400/80 font-sans italic">
                  {successMetric || 'Sin métrica definida'}
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className="absolute -right-px top-1/4 w-px h-1/2"
            style={{
              background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.4) 0%, rgba(251, 191, 36, 0) 100%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface RuptureCommitmentSlotProps {
  commitment: string | null;
  isVisible: boolean;
}

const RuptureCommitmentSlot: React.FC<RuptureCommitmentSlotProps> = ({ commitment, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && commitment && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-4 mt-4"
        >
          <div className="relative rounded-xl overflow-hidden"
            style={{
              background: 'rgba(28, 28, 28, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(251, 191, 36, 0.6)',
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(251, 191, 36, 0.05)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-sasquach-gold/15 to-transparent" />
            
            <div className="relative p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-sasquach-gold animate-pulse" />
                <span className="text-[8px] uppercase tracking-[0.35em] text-sasquach-gold font-bold">
                  III. ACCIÓN DE RUPTURA
                </span>
              </div>
              
              <p className="text-stone-100 text-[12px] font-serif italic leading-relaxed">
                "{commitment}"
              </p>
            </div>
          </div>
          
          <div 
            className="absolute -right-px top-1/4 w-px h-1/2"
            style={{
              background: 'linear-gradient(180deg, rgba(195, 163, 67, 0.7) 0%, rgba(195, 163, 67, 0) 100%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface CommitmentRevelationProps {
  text: string;
  siloCenter: { x: number; y: number };
  isActive: boolean;
  vmin: number;
}

const CommitmentRevelation: React.FC<CommitmentRevelationProps> = ({ text, siloCenter, isActive, vmin }) => {
  if (!isActive) return null;
  
  const titleSize = Math.max(14, Math.min(20, vmin * 0.025));
  const textSize = Math.max(16, Math.min(28, vmin * 0.04));
  
  return (
    <motion.div
      initial={{ 
        scale: 0, 
        opacity: 0,
        filter: 'brightness(3)',
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        filter: 'brightness(1)',
      }}
      exit={{ 
        scale: 0.8, 
        opacity: 0,
        filter: 'brightness(2)',
      }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 12,
        duration: 1.5,
      }}
      className="absolute pointer-events-none"
      style={{
        left: siloCenter.x,
        top: siloCenter.y,
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
      }}
    >
      <div 
        className="relative rounded-3xl overflow-hidden"
        style={{
          minWidth: `${vmin * 0.4}px`,
          maxWidth: `${vmin * 0.7}px`,
          background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.15) 0%, rgba(28, 28, 28, 0.95) 70%)',
          border: '3px solid rgba(251, 191, 36, 0.8)',
          boxShadow: '0 0 80px rgba(251, 191, 36, 0.5), 0 0 160px rgba(251, 191, 36, 0.3), inset 0 0 60px rgba(251, 191, 36, 0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sasquach-gold/20 via-transparent to-transparent" />
        
        <div className="relative p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-4"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-sasquach-gold animate-pulse" />
              <span 
                className="uppercase tracking-[0.4em] text-sasquach-gold font-black"
                style={{ fontSize: `${titleSize}px` }}
              >
                NUESTRO COMPROMISO
              </span>
              <div className="w-3 h-3 rounded-full bg-sasquach-gold animate-pulse" />
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-sasquach-gold/50 to-transparent" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-stone-100 font-serif italic leading-relaxed"
            style={{ fontSize: `${textSize}px` }}
          >
            "{text}"
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ delay: 1, duration: 2, repeat: Infinity }}
            className="mt-6 w-full h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
};

interface WeightedOrbProps {
  entry: WhyEntry;
  weight: number;
  position: { x: number; y: number };
  index: number;
  isTransitioning: boolean;
  isWhyPhase: boolean;
  onContextMenu: (e: React.MouseEvent, node: WhyEntry) => void;
}

const WeightedOrb: React.FC<WeightedOrbProps> = ({ entry, weight, position, index, isTransitioning, isWhyPhase, onContextMenu }) => {
  const size = 160 + weight * 80;
  const opacity = 0.3 + weight * 0.7;
  const zIndex = 20 + index;

  return (
    <motion.div
      layoutId={`orb-${entry.timestamp}-${index}`}
      initial={{ opacity: 0, scale: 0, x: "50%", y: "50%", filter: 'blur(12px)' }}
      animate={{
        opacity: isTransitioning ? 0 : opacity,
        scale: isTransitioning ? 0.15 : 1,
        x: isTransitioning ? "0%" : `${position.x - 50}%`,
        y: isTransitioning ? "0%" : `${position.y - 50}%`,
        filter: isTransitioning ? 'blur(8px)' : 'blur(0px)',
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        duration: isTransitioning ? 1.2 : 0.8,
        delay: isTransitioning ? index * 0.08 : index * 0.15,
        ease: isTransitioning ? [0.68, -0.55, 0.27, 1.55] : [0.16, 1, 0.3, 1],
      }}
      onContextMenu={(e) => onContextMenu(e, entry)}
      className="absolute rounded-full flex items-center justify-center text-center backdrop-blur-md border shadow-2xl cursor-pointer"
      style={{
        left: '50%',
        top: '50%',
        minWidth: `${size}px`,
        maxWidth: `${size}px`,
        minHeight: `${size}px`,
        maxHeight: `${size}px`,
        zIndex,
        overflow: 'hidden',
        background: `radial-gradient(circle, rgba(16, 46, 26, ${0.7 + weight * 0.3}) 0%, rgba(10, 31, 18, ${0.85 + weight * 0.15}) 100%)`,
        borderColor: `rgba(195, 163, 67, ${0.1 + weight * 0.35})`,
        boxShadow: `0 0 ${20 + weight * 30}px rgba(195, 163, 67, ${0.1 + weight * 0.2})`,
      }}
    >
      <motion.div
        animate={isWhyPhase ? { y: [0, -8, 0] } : {}}
        transition={{
          duration: 3 + (index % 2) * 1.5,
          repeat: isWhyPhase ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-sasquach-gold/60 font-bold mb-2 block font-sans">
          {entry.role}
        </span>
        <p className="text-stone-100 text-base font-serif italic leading-snug px-3 block w-full overflow-hidden">
          <span className="line-clamp-3">"{entry.text}"</span>
        </p>
      </motion.div>
      
      {entry.reinforcements && entry.reinforcements.length > 0 && (
        <motion.div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex -space-x-1"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {[...Array(Math.min(entry.reinforcements.length, 5))].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="w-5 h-5 rounded-full bg-emerald-600/60 border border-emerald-400/40 flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </motion.div>
          ))}
          {entry.reinforcements.length > 5 && (
            <div className="w-5 h-5 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center text-[8px] text-stone-400">
              +{entry.reinforcements.length - 5}
            </div>
          )}
        </motion.div>
      )}
      
      {entry.reinforcements && entry.reinforcements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
          }}
          className="absolute inset-0 rounded-full border border-emerald-400/20 -m-2"
        />
      )}
    </motion.div>
  );
};

interface WeightedSiloNodeProps {
  areaHead: AreaHead;
  index: number;
  isNew?: boolean;
  isMerged?: boolean;
  isSelected?: boolean;
  isSelectable?: boolean;
  isFaded?: boolean;
  isFocused?: boolean;
  isDisintegrating?: boolean;
  onContextMenu: (e: React.MouseEvent, node: AreaHead) => void;
  onSelect: (silo: AreaHead) => void;
  nodeId?: string;
}

const FRAGMENT_COUNT = 12;

const generateFragments = (seed: number, count: number) => {
  const fragments = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const jitter = Math.sin(seed * 9999 + i * 137) * 0.3;
    const distance = 150 + Math.random() * 200;
    fragments.push({
      angle: angle + jitter,
      distance,
      size: 4 + Math.random() * 8,
      delay: i * 0.02,
    });
  }
  return fragments;
};

const WeightedSiloNode: React.FC<WeightedSiloNodeProps> = ({ areaHead, index, isNew, isMerged, isSelected, isSelectable, isFaded, isFocused, isDisintegrating, onContextMenu, onSelect, nodeId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { weight } = areaHead;
  
  const fragments = useMemo(() => generateFragments(areaHead.timestamp || Date.now(), FRAGMENT_COUNT), [areaHead.timestamp]);

  useEffect(() => {
    if (!nodeId || !nodeRef.current) return;
    const updatePosition = () => {
      if (nodeRef.current) {
        const rect = nodeRef.current.getBoundingClientRect();
        window.dispatchEvent(new CustomEvent('silo-position-update', {
          detail: { 
            nodeId, 
            x: rect.x + rect.width / 2, 
            y: rect.y + rect.height / 2,
            width: rect.width,
            height: rect.height
          }
        }));
      }
    };
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [nodeId]);
  const isDiscarded = areaHead.status === 'discarded';
  
  const isHeavyWeight = weight > 1.5;
  const isSingleVoteNoise = areaHead.votedBy.length === 1 && weight <= 1.15;
  
  const baseOpacity = isDisintegrating 
    ? 0 
    : isDiscarded 
      ? 0.2 
      : isFaded 
        ? (isFocused ? 0.1 : 0.1) 
        : isSingleVoteNoise 
          ? 0.4 
          : isSelected 
            ? 0.95 
            : (0.3 + weight * 0.35);

  const baseSize = 110;
  const regularScale = 0.6 + (weight * 0.5);
  const size = baseSize * (isDisintegrating ? 2.5 : regularScale);

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectable && !isDiscarded && !isDisintegrating) {
      e.stopPropagation();
      onSelect(areaHead);
    }
  };

  const springTransition = {
    type: "spring" as const,
    stiffness: isDisintegrating ? 50 : 180,
    damping: isDisintegrating ? 8 : 20,
  };

  const nodeCenterX = isSelected ? '50%' : '50%';
  const nodeCenterY = isSelected ? '50%' : '50%';

  return (
    <div ref={nodeRef} className="relative">
      {isDisintegrating && fragments.map((frag, fragIdx) => (
        <motion.div
          key={fragIdx}
          initial={{ x: 0, y: 0, scale: 1, opacity: 0.8, rotate: 0 }}
          animate={{
            x: Math.cos(frag.angle) * frag.distance,
            y: Math.sin(frag.angle) * frag.distance,
            scale: [1, 0.3, 0],
            opacity: [0.8, 0.3, 0],
            rotate: (frag.angle * 180) / Math.PI,
          }}
          transition={{
            duration: 0.8,
            delay: frag.delay,
            ease: [0.68, -0.55, 0.27, 1.55],
          }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: frag.size,
            height: frag.size,
            left: nodeCenterX,
            top: nodeCenterY,
            transform: 'translate(-50%, -50%)',
            background: isSelected 
              ? 'radial-gradient(circle, rgba(251, 191, 36, 0.9) 0%, rgba(195, 163, 67, 0.5) 100%)'
              : 'radial-gradient(circle, rgba(195, 163, 67, 0.7) 0%, rgba(120, 100, 40, 0.3) 100%)',
            boxShadow: isSelected
              ? '0 0 15px rgba(251, 191, 36, 0.8)'
              : '0 0 8px rgba(195, 163, 67, 0.5)',
          }}
        />
      ))}
      <motion.div
        initial={{ 
          scale: 0, 
          opacity: 0, 
        }}
        animate={{
          scale: isDisintegrating ? [2.5, 3, 0] : (isSelected ? regularScale * 1.15 : regularScale),
          opacity: isDisintegrating ? [0.95, 0.5, 0] : baseOpacity,
          filter: isDisintegrating ? ['brightness(1)', 'brightness(2)', 'brightness(3)'] : 'brightness(1)',
        }}
      whileHover={isSelectable && !isDiscarded && !isDisintegrating ? { scale: regularScale * 1.2 } : {}}
      transition={{
        ...springTransition,
        delay: isNew ? 0 : index * 0.08,
        duration: isDisintegrating ? 1.2 : undefined,
      }}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onContextMenu={(e) => onContextMenu(e, areaHead)}
      className={`relative rounded-full flex flex-col items-center justify-center backdrop-blur-md shadow-xl overflow-visible ${isSelectable && !isDiscarded && !isDisintegrating ? 'cursor-pointer' : ''}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: isDisintegrating
          ? 'radial-gradient(circle, rgba(251, 191, 36, 0.9) 0%, rgba(195, 163, 67, 0.7) 50%, rgba(255, 255, 255, 0.3) 100%)'
          : isDiscarded
            ? 'radial-gradient(circle, rgba(30, 30, 30, 0.5) 0%, rgba(15, 15, 15, 0.6) 100%)'
            : isSingleVoteNoise
              ? 'radial-gradient(circle, rgba(50, 50, 50, 0.3) 0%, rgba(20, 20, 20, 0.4) 100%)'
              : isSelected
                ? `radial-gradient(circle, rgba(40, 80, 50, 0.9) 0%, rgba(20, 50, 30, 0.95) 100%)`
                : `radial-gradient(circle, rgba(20, ${46 + weight * 20}, ${32 + weight * 15}, ${0.7 + weight * 0.3}) 0%, rgba(10, 31, 18, ${0.85 + weight * 0.15}) 100%)`,
        borderWidth: isDisintegrating ? '3px' : isSelected ? '3px' : isMerged ? '2px' : '1px',
        borderStyle: 'solid',
        borderColor: isDisintegrating 
          ? 'rgba(255, 255, 255, 0.9)' 
          : isDiscarded 
            ? 'rgba(100, 100, 100, 0.2)' 
            : isSelected 
              ? 'rgba(251, 191, 36, 1)' 
              : isMerged 
                ? 'rgba(251, 191, 36, 0.8)' 
                : isSingleVoteNoise 
                  ? 'rgba(100, 100, 100, 0.3)' 
                  : `rgba(195, 163, 67, ${0.2 + weight * 0.3})`,
        boxShadow: isDisintegrating
          ? '0 0 60px rgba(251, 191, 36, 0.9), 0 0 120px rgba(251, 191, 36, 0.6)'
          : isDiscarded 
            ? 'none' 
            : isSelected
              ? `0 0 30px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(251, 191, 36, 0.1)`
              : isMerged 
                ? `0 0 ${15 + weight * 25}px rgba(251, 191, 36, 0.4), inset 0 0 15px rgba(251, 191, 36, 0.1)`
                : isHeavyWeight
                  ? `0 0 ${15 + weight * 20}px rgba(195, 163, 67, ${0.15 + weight * 0.15}), inset 0 0 10px rgba(195, 163, 67, 0.05)`
                  : `0 0 ${8 + weight * 12}px rgba(195, 163, 67, ${0.05 + weight * 0.1})`,
        filter: isDisintegrating ? 'brightness(2)' : isDiscarded ? 'grayscale(0.8)' : isSingleVoteNoise ? 'grayscale(0.3)' : isSelected ? 'brightness(1.1)' : 'none',
        zIndex: isSelected || isDisintegrating ? 35 : 20,
      }}
    >
      <div className="text-center px-2">
        {isSelected && (
          <span className="text-[6px] uppercase tracking-[0.15em] text-amber-300 font-bold block mb-0.5 animate-pulse">
            ◎ MARCADO
          </span>
        )}
        {isMerged && !isSelected && (
          <span className="text-[6px] uppercase tracking-[0.15em] text-amber-400/80 font-bold block mb-0.5">
            ★ FUSIONADO
          </span>
        )}
        {isHeavyWeight && !isMerged && !isSelected && (
          <span className="text-[5px] uppercase tracking-[0.1em] text-emerald-400/70 font-bold block mb-0.5">
            ◆ PESADO
          </span>
        )}
        {isSingleVoteNoise && !isSelected && (
          <span className="text-[0.6vmin] uppercase tracking-[0.1em] text-stone-500/60 font-bold block mb-0.5">
            · RUIDO
          </span>
        )}
        <span className="text-[0.9vmin] uppercase tracking-[0.2em] text-sasquach-gold/50 font-bold block mb-1">
          {isHeavyWeight && !isSingleVoteNoise ? 'Centro' : isSingleVoteNoise ? 'Ruido' : 'Área'}
        </span>
        <p className={`text-[1.2vmin] font-serif italic leading-tight px-1 ${isSingleVoteNoise ? 'text-stone-500' : 'text-stone-200'}`}>
          {areaHead.role.length > 12 ? areaHead.role.substring(0, 12) + '...' : areaHead.role}
        </p>
        {isMerged && areaHead.mergedFrom && areaHead.mergedFrom.length > 0 && (
          <p className="text-[0.7vmin] text-amber-500/60 mt-0.5">
            + {areaHead.mergedFrom[0]}
          </p>
        )}
        {(weight >= 0.7 || isHeavyWeight) && !isDiscarded && !isSingleVoteNoise && (
          <div className="mt-1">
            <div className="w-[1.5vmin] h-[1.5vmin] rounded-full bg-sasquach-gold mx-auto" />
          </div>
        )}
      </div>

      {areaHead.votedBy && areaHead.votedBy.length > 0 && (
        <motion.div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex -space-x-1"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {[...Array(Math.min(areaHead.votedBy.length, 5))].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="w-4 h-4 rounded-full bg-emerald-600/60 border border-emerald-400/40 flex items-center justify-center"
            >
              <div className="w-1 h-1 rounded-full bg-emerald-400" />
            </motion.div>
          ))}
          {areaHead.votedBy.length > 5 && (
            <div className="w-4 h-4 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center text-[6px] text-stone-400">
              +{areaHead.votedBy.length - 5}
            </div>
          )}
        </motion.div>
      )}

      {areaHead.votedBy && areaHead.votedBy.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.03, 1],
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
          }}
          className="absolute inset-0 rounded-full border border-emerald-400/20 -m-2"
        />
      )}

      <AnimatePresence>
        {isHovered && !isDiscarded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-56 p-4 rounded-2xl bg-stone-900/95 border border-sasquach-gold/30 shadow-2xl z-50"
          >
            <p className="text-[9px] uppercase tracking-widest text-sasquach-gold/60 font-bold mb-2">
              Métrica de Éxito
            </p>
            <p className="text-stone-300 text-xs font-serif italic">
              {areaHead.successMetric || 'Sin métrica definida'}
            </p>
            <div className="mt-3 pt-2 border-t border-stone-700 space-y-2">
              <div className="flex items-center justify-between text-[9px] text-stone-500">
                <span>Peso</span>
                <span className="text-sasquach-gold font-bold">{Math.round(weight * 100)}%</span>
              </div>
              {areaHead.votedBy && areaHead.votedBy.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-[9px] text-stone-500 uppercase tracking-wider">Votos:</span>
                  {areaHead.votedBy.map((voter) => (
                    <span key={voter.sessionId} className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400/80">
                      {voter.role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 0] }}
          transition={{ duration: 0.6, times: [0, 0.5, 1] }}
          className="absolute inset-0 rounded-full border-2 border-sasquach-gold"
        />
      )}
    </motion.div>
    </div>
  );
};

interface TensionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  index: number;
  opacity: number;
}

const TensionLine: React.FC<TensionLineProps> = ({ from, to, index, opacity }) => {
  return (
    <motion.line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke="url(#tensionGradient)"
      strokeWidth={1 + opacity}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{
        pathLength: 1,
        opacity: [opacity * 0.5, opacity, opacity * 0.5],
      }}
      transition={{
        pathLength: { duration: 0.8, delay: index * 0.1, ease: "easeOut" },
        opacity: { duration: 3, repeat: Infinity, delay: index * 0.5 },
      }}
    />
  );
};

interface SimilarityLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isProposed: boolean;
  index: number;
}

const SimilarityLine: React.FC<SimilarityLineProps> = ({ from, to, isProposed, index }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const perpX = -dy * 0.15;
  const perpY = dx * 0.15;
  
  const ctrlX = midX + perpX;
  const ctrlY = midY + perpY;
  
  const pathD = `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;
  
  const strokeColor = isProposed ? '#f59e0b' : '#6366f1';
  const strokeOpacity = isProposed ? 0.9 : 0.5;
  const strokeWidth = isProposed ? 3 : 2;
  
  return (
    <g>
      <defs>
        <linearGradient id={`similarityGradient-${index}`} gradientUnits="userSpaceOnUse" x1={from.x} y1={from.y} x2={to.x} y2={to.y}>
          <stop offset="0%" stopColor={strokeColor} stopOpacity={strokeOpacity * 0.6} />
          <stop offset="50%" stopColor={strokeColor} stopOpacity={strokeOpacity} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={strokeOpacity * 0.6} />
        </linearGradient>
      </defs>
      <motion.path
        d={pathD}
        fill="none"
        stroke={`url(#similarityGradient-${index})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: [0.6, 1, 0.6] 
        }}
        transition={{
          pathLength: { duration: 0.6, delay: index * 0.15, ease: "easeOut" },
          opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      {isProposed && (
        <motion.circle
          cx={midX}
          cy={midY}
          r={6}
          fill="#f59e0b"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            opacity: [0, 1, 0.8]
          }}
          transition={{ duration: 0.4, delay: 0.3 + index * 0.15 }}
        >
          <animate 
            attributeName="r" 
            values="6;8;6" 
            dur="1.5s" 
            repeatCount="indefinite" 
          />
        </motion.circle>
      )}
    </g>
  );
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

interface SiloOrbitRingProps {
  areaHeads: AreaHead[];
  previousAreaHeads: AreaHead[];
  selectedSilo: AreaHead | null;
  onContextMenu: (e: React.MouseEvent, node: AreaHead) => void;
  onSelectSilo: (silo: AreaHead | null) => void;
  isSelectable: boolean;
  similarPairs?: SimilarNodes[];
  fusionProposal?: SimilarNodes | null;
  isFocused?: boolean;
  isDisintegrating?: boolean;
}

const SiloOrbitRing: React.FC<SiloOrbitRingProps> = ({ areaHeads, previousAreaHeads, selectedSilo, onContextMenu, onSelectSilo, isSelectable, similarPairs = [], fusionProposal, isFocused = false, isDisintegrating = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, vmin: 0 });
  
  useEffect(() => {
    const updateDimensions = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const vmin = Math.min(vw, vh);
      setDimensions({
        width: vw,
        height: vh,
        vmin,
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const activeAreas = areaHeads.filter(a => a.status !== 'discarded');
  const sortedAreas = [...activeAreas].sort((a, b) => b.weight - a.weight);
  const previousRoles = new Set(previousAreaHeads.map(a => a.role));

  const getOrbitPosition = (idx: number, total: number, role: string, isSelected: boolean, isFocusedState: boolean) => {
    if (isFocusedState && isSelected) {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2 + dimensions.vmin * 0.08;
      return { x: centerX, y: centerY, angle: -Math.PI / 2 };
    }
    
    const baseRadiusVmin = isFocusedState ? dimensions.vmin * 0.42 : dimensions.vmin * 0.30;
    const angle = (idx / Math.max(1, total)) * Math.PI * 2 - Math.PI / 2;
    
    const organicOffsetX = (seededRandom(idx + role.length) - 0.5) * dimensions.vmin * 0.08;
    const organicOffsetY = (seededRandom(idx * 2 + role.length) - 0.5) * dimensions.vmin * 0.08;
    
    let x = dimensions.width / 2 + Math.cos(angle) * baseRadiusVmin + organicOffsetX;
    let y = dimensions.height / 2 + Math.sin(angle) * baseRadiusVmin + organicOffsetY;
    
    if (isFocusedState) {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const edgeDist = dist * 1.4;
      x = centerX + (dx / dist) * edgeDist;
      y = centerY + (dy / dist) * edgeDist;
    }
    
    return { x, y, angle };
  };

  const getSiloSize = (weight: number, isSelected: boolean, isFocusedState: boolean) => {
    const baseSize = dimensions.vmin * 0.08;
    let scaleFactor = 0.6 + weight * 0.5;
    if (isFocusedState && isSelected) {
      scaleFactor = 0.8 + weight * 0.3;
    }
    return Math.max(60, Math.min(baseSize * scaleFactor, dimensions.vmin * 0.15));
  };

  const positionMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    sortedAreas.forEach((areaHead, idx) => {
      const isSelected = selectedSilo?.role === areaHead.role;
      const orbit = getOrbitPosition(idx, sortedAreas.length, areaHead.role, isSelected, isFocused);
      map.set(areaHead.role, { x: orbit.x, y: orbit.y });
    });
    return map;
  }, [sortedAreas, dimensions.vmin, dimensions.width, dimensions.height, selectedSilo, isFocused]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-10 w-screen h-screen overflow-visible pointer-events-none"
    >
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="tensionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c3a343" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#c3a343" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#c3a343" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        {sortedAreas.map((areaHead, idx) => {
          const isSelected = selectedSilo?.role === areaHead.role;
          const orbit = getOrbitPosition(idx, sortedAreas.length, areaHead.role, isSelected, isFocused);
          const isNew = !previousRoles.has(areaHead.role);
          const isMerged = !!areaHead.mergedFrom && areaHead.mergedFrom.length > 0;
          const isFaded = selectedSilo !== null && !isSelected;
          const siloSize = getSiloSize(areaHead.weight, isSelected, isFocused);
          
          const centerX = dimensions.width / 2;
          const centerY = isFocused && isSelected ? dimensions.height / 2 + dimensions.vmin * 0.08 : dimensions.height / 2;
          
          return (
            <React.Fragment key={`silo-${areaHead.role}-${idx}`}>
              {!isFaded && (
                <TensionLine
                  from={{ x: centerX, y: centerY }}
                  to={{ x: orbit.x, y: orbit.y }}
                  index={idx}
                  opacity={isSelected ? 0.6 : 0.1}
                />
              )}
              <foreignObject 
                x={orbit.x - siloSize / 2} 
                y={orbit.y - siloSize / 2} 
                width={siloSize} 
                height={siloSize}
              >
                <div className="pointer-events-auto w-full h-full flex items-center justify-center overflow-visible">
                  <WeightedSiloNode
                    areaHead={areaHead}
                    index={idx}
                    isNew={isNew}
                    isMerged={isMerged}
                    isSelected={isSelected}
                    isSelectable={isSelectable}
                    isFaded={isFaded}
                    isFocused={isFocused}
                    isDisintegrating={isDisintegrating && isSelected}
                    onContextMenu={onContextMenu}
                    onSelect={onSelectSilo}
                    nodeId={`silo-${idx}`}
                  />
                </div>
              </foreignObject>
            </React.Fragment>
          );
        })}
        
        {similarPairs.length > 0 && !isFocused && (
          <>
            {similarPairs.map((pair, idx) => {
              const fromPos = positionMap.get(pair.source);
              const toPos = positionMap.get(pair.target);
              if (!fromPos || !toPos) return null;
              
              const isProposed = fusionProposal?.source === pair.source && fusionProposal?.target === pair.target;
              
              return (
                <SimilarityLine
                  key={`similarity-${pair.source}-${pair.target}`}
                  from={fromPos}
                  to={toPos}
                  isProposed={isProposed}
                  index={idx}
                />
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
};

export const BoardView: React.FC = () => {
  const { state, role, updateState } = useRitual();
  const { 
    areaHeads, 
    promoteNode, 
    discardNode, 
    restoreNode, 
    adjustWeight, 
    mergeNodes,
    similarPairs,
    dismissSimilarPair,
    getDiscardedNodes,
    whyResponses 
  } = useConvergence();
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<RitualPhase>(state.currentPhase);
  const [siloFlash, setSiloFlash] = useState(false);
  const [showDiscarded, setShowDiscarded] = useState(false);
  const [selectedSilo, setSelectedSilo] = useState<AreaHead | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    node: WhyEntry | AreaHead;
    type: 'why' | 'area';
    position: { x: number; y: number };
  } | null>(null);
  const [fusionProposal, setFusionProposal] = useState<typeof similarPairs[0] | null>(null);
  const [showPurposeSlot, setShowPurposeSlot] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [siloDisintegrating, setSiloDisintegrating] = useState(false);
  const [ruptureCommitment, setRuptureCommitment] = useState<string | null>(null);
  const [sasquachSuccess, setSasquachSuccess] = useState(false);
  const previousAreaHeadsRef = useRef<AreaHead[]>([]);
  const isBoard = role === 'BOARD';

  useEffect(() => {
    if (state.currentPhase === 'INQUIRY' && currentPhase !== 'INQUIRY') {
      setCurrentPhase('INQUIRY');
      setSelectedSilo(null);
      setShowPurposeSlot(true);
      previousAreaHeadsRef.current = [];
      if (isTransitioning) {
        const timer = setTimeout(() => setIsTransitioning(false), 1500);
        return () => clearTimeout(timer);
      }
    }
    if (state.currentPhase === 'CONVERGENCE' && currentPhase !== 'CONVERGENCE') {
      setCurrentPhase('CONVERGENCE');
      setIsTransitioning(false);
      setSelectedSilo(null);
      setFusionProposal(null);
    }
    if (state.currentPhase === 'WHY') {
      setCurrentPhase('WHY');
      setIsTransitioning(false);
      setSelectedSilo(null);
      setShowPurposeSlot(false);
    }
    if (state.currentPhase === 'ACTION') {
      setCurrentPhase('ACTION');
    }
  }, [state.currentPhase]);

  useEffect(() => {
    if ((currentPhase === 'INQUIRY' || currentPhase === 'CONVERGENCE') && areaHeads.length > previousAreaHeadsRef.current.length) {
      setSiloFlash(true);
      setTimeout(() => setSiloFlash(false), 600);
    }
    previousAreaHeadsRef.current = areaHeads;
  }, [areaHeads, currentPhase]);

  useEffect(() => {
    if (state.currentPhase === 'CONVERGENCE' && similarPairs.length > 0 && !fusionProposal) {
      setFusionProposal(similarPairs[0]);
    }
  }, [similarPairs, state.currentPhase, fusionProposal]);

  useEffect(() => {
    if (isBoard) {
      updateState({
        context: {
          ...state.context,
          selectedSilo: selectedSilo?.role || null,
        },
      });
    }
  }, [selectedSilo, isBoard, state.context, updateState]);

  const orbPositions = useMemo(() => {
    const sortedResponses = [...whyResponses].sort((a, b) => b.weight - a.weight);
    const count = sortedResponses.length;
    if (count === 0) return [];
    
    return sortedResponses.map((_, idx) => {
      const angleBase = (idx / Math.max(count, 1)) * Math.PI * 2;
      const angle = angleBase + (Math.random() - 0.5) * 0.3;
      
      const tier = Math.min(idx, 2);
      const radiusBase = 18 + tier * 12;
      const radius = radiusBase + (Math.random() - 0.5) * 10;
      
      const centerX = 50;
      const centerY = 50;
      const rawX = centerX + Math.cos(angle) * radius;
      const rawY = centerY + Math.sin(angle) * radius;
      
      const x = Math.max(15, Math.min(85, rawX));
      const y = Math.max(20, Math.min(80, rawY));
      
      return { x, y };
    });
  }, [whyResponses.length]);

  const isInquiryPhase = currentPhase === 'INQUIRY';
  const isConvergencePhase = currentPhase === 'CONVERGENCE';
  const activeOrbs = whyResponses.filter(r => r.status !== 'discarded');
  const discardedNodes = getDiscardedNodes();
  const sortedOrbs = [...activeOrbs].sort((a, b) => b.weight - a.weight);

  const handleContextMenu = (e: React.MouseEvent, node: WhyEntry | AreaHead, type: 'why' | 'area') => {
    e.preventDefault();
    const x = ((e.clientX) / window.innerWidth) * 100;
    const y = ((e.clientY) / window.innerHeight) * 100;
    setContextMenu({ node, type, position: { x, y } });
  };

  const handleFuse = () => {
    if (fusionProposal) {
      mergeNodes(fusionProposal.source, fusionProposal.target);
      setFusionProposal(null);
    }
  };

  const handleSelectAction = (actionId: string, actionText: string) => {
    console.log('[ACTION] Selected action:', actionId);
    
    const action = state.context.actionProposals.find(a => a.id === actionId);
    if (!action) return;
    
    setSelectedActionId(actionId);
    setSiloDisintegrating(true);
    setRuptureCommitment(actionText);
    setSasquachSuccess(true);
    
    if (isBoard) {
      updateState({
        context: {
          ...state.context,
          ruptureCommitment: actionText,
          selectedSilo: null,
        },
      });
    }
    
    setTimeout(() => {
      setSelectedSilo(null);
      setSiloDisintegrating(false);
    }, 1200);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vmin] h-[80vmin] bg-emerald-900/20 rounded-full blur-[15vmin]" />
      </div>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            variants={transitionOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-forest-void/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <MemorySidebar sasquachAttention={currentPhase === 'INQUIRY' || currentPhase === 'WHY'}>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {showPurposeSlot && (
              <PurposeSlot
                key="purpose-slot"
                summary={state.context.whySummary}
                responseCount={whyResponses.length}
                isVisible={showPurposeSlot}
                isFromCenter={currentPhase === 'INQUIRY'}
              />
            )}
          </AnimatePresence>
          
          <CriticalSiloSlot
            siloRole={selectedSilo?.role || ''}
            successMetric={selectedSilo?.successMetric || ''}
            isVisible={currentPhase === 'ACTION' && !!selectedSilo}
          />
          
          <RuptureCommitmentSlot
            commitment={ruptureCommitment}
            isVisible={!!ruptureCommitment}
          />
          
          <div className="mx-4 mt-6">
            <div className="text-[8px] uppercase tracking-[0.2em] text-stone-600 mb-3">Sílos Activos</div>
            <div className="space-y-1">
              {areaHeads.filter(a => a.status !== 'discarded').slice(0, 5).map((area) => (
                <div 
                  key={area.role}
                  className="px-2 py-1.5 rounded-lg bg-stone-900/40 backdrop-blur-sm border border-sasquach-gold/10 text-[9px] text-stone-400 truncate"
                >
                  {area.role}
                </div>
              ))}
              {areaHeads.filter(a => a.status !== 'discarded').length > 5 && (
                <div className="text-[8px] text-stone-600 pl-2">
                  +{areaHeads.filter(a => a.status !== 'discarded').length - 5} más
                </div>
              )}
            </div>
          </div>
        </div>
      </MemorySidebar>

      <div className="pl-64">
        <AnimatePresence>
          {isConvergencePhase && discardedNodes.length > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDiscarded(!showDiscarded)}
              className="fixed top-6 left-72 z-40 flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
            >
              {showDiscarded ? <EyeOff size={14} /> : <Eye size={14} />}
              <span className="text-[10px] uppercase tracking-wider">
                Ruido ({discardedNodes.length})
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isConvergencePhase && showDiscarded && discardedNodes.map((node, idx) => (
            <motion.div
              key={`discarded-${idx}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.15, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute rounded-full flex items-center justify-center text-center backdrop-blur-sm border border-stone-800/50"
              style={{
                left: `${30 + Math.random() * 50}%`,
                top: `${20 + Math.random() * 60}%`,
                minWidth: '80px',
                minHeight: '80px',
              }}
            >
              <p className="text-stone-600 text-[10px] font-serif italic px-2">
                {('role' in node) ? (node as AreaHead).role : (node as WhyEntry).role}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {currentPhase === 'WHY' && (
            <div className="absolute inset-0 z-20 pl-64 w-full h-full">
              <AnimatePresence mode="popLayout">
                {sortedOrbs.map((entry, displayIdx) => {
                  const origIdx = whyResponses.findIndex(r => r.timestamp === entry.timestamp);
                  const position = orbPositions[origIdx] || { x: 50, y: 45 };
                  return (
                    <WeightedOrb
                      key={`orb-${entry.timestamp}-${origIdx}`}
                      entry={entry}
                      weight={entry.weight}
                      position={position}
                      index={displayIdx}
                      isTransitioning={isTransitioning}
                      isWhyPhase={true}
                      onContextMenu={(e, node) => handleContextMenu(e, node, 'why')}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {(isInquiryPhase || isConvergencePhase || currentPhase === 'ACTION') && areaHeads.length > 0 && (
            <SiloOrbitRing
              key="silo-orbit-ring"
              areaHeads={areaHeads}
              previousAreaHeads={previousAreaHeadsRef.current}
              selectedSilo={selectedSilo}
              onContextMenu={(e, node) => handleContextMenu(e, node, 'area')}
              onSelectSilo={(silo) => setSelectedSilo(silo && silo.role === selectedSilo?.role ? null : silo)}
              isSelectable={isBoard && (currentPhase === 'CONVERGENCE' || currentPhase === 'ACTION')}
              similarPairs={isConvergencePhase ? similarPairs : []}
              fusionProposal={isConvergencePhase ? fusionProposal : null}
              isFocused={currentPhase === 'ACTION' && selectedSilo !== null}
              isDisintegrating={siloDisintegrating}
            />
          )}
        </AnimatePresence>

        {whyResponses.length === 0 && !isTransitioning && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pl-64">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
              <div className="w-12 h-12 border-2 border-sasquach-gold/20 border-t-sasquach-gold rounded-full animate-spin mx-auto" />
              <p className="text-stone-600 font-serif italic uppercase tracking-[0.4em] text-xs">
                Aguardando el Propósito...
              </p>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {contextMenu && (
            <NodeContextMenu
              node={contextMenu.node}
              type={contextMenu.type}
              position={contextMenu.position}
              onClose={() => setContextMenu(null)}
              onPromote={() => {
                promoteNode(
                  contextMenu.type === 'why' 
                    ? (contextMenu.node as WhyEntry).role 
                    : (contextMenu.node as AreaHead).role,
                  contextMenu.type
                );
                setContextMenu(null);
              }}
              onDiscard={() => {
                discardNode(
                  contextMenu.type === 'why'
                    ? (contextMenu.node as WhyEntry).role
                    : (contextMenu.node as AreaHead).role,
                  contextMenu.type
                );
                setContextMenu(null);
              }}
              onRestore={() => {
                restoreNode(
                  contextMenu.type === 'why'
                    ? (contextMenu.node as WhyEntry).role
                    : (contextMenu.node as AreaHead).role,
                  contextMenu.type
                );
                setContextMenu(null);
              }}
              onAdjustWeight={(delta) => {
                adjustWeight(
                  contextMenu.type === 'why'
                    ? (contextMenu.node as WhyEntry).role
                    : (contextMenu.node as AreaHead).role,
                  contextMenu.type,
                  delta
                );
                setContextMenu(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {fusionProposal && (
            <FusionProposal
              source={fusionProposal.source}
              target={fusionProposal.target}
              similarity={fusionProposal.similarity}
              onFuse={handleFuse}
              onDismiss={() => {
                dismissSimilarPair(fusionProposal.source, fusionProposal.target);
                setFusionProposal(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentPhase === 'ACTION' && selectedSilo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl px-8 py-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-300 text-sm font-bold uppercase tracking-widest">
                    Plan de Acción: {selectedSilo.role}
                  </span>
                </div>
                <p className="text-amber-400/60 text-[10px] mt-1 text-center">
                  {selectedSilo.successMetric || 'Sin métrica definida'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ActionSwarm
          actionProposals={state.context.actionProposals}
          selectedSilo={selectedSilo}
          areaHeads={areaHeads}
          isVisible={currentPhase === 'ACTION' && !!selectedSilo}
          selectedActionId={selectedActionId}
          siloDisintegrating={siloDisintegrating}
          onSelectAction={handleSelectAction}
        />

        {siloDisintegrating && selectedSilo && (
          <CommitmentRevelation
            text={ruptureCommitment || ''}
            siloCenter={{
              x: window.innerWidth / 2,
              y: window.innerHeight / 2 + Math.min(window.innerWidth, window.innerHeight) * SILO_CENTER_OFFSET,
            }}
            isActive={siloDisintegrating}
            vmin={Math.min(window.innerWidth, window.innerHeight)}
          />
        )}

        <div className={`absolute z-50 ${currentPhase === 'ACTION' && selectedSilo ? 'bottom-12 left-1/2 -translate-x-1/2 pl-64' : 'bottom-12 right-12'}`}>
          <SasquachAvatar
            phase={currentPhase}
            isActive={whyResponses.length > 0 && !isTransitioning}
            flashGold={siloFlash || (currentPhase === 'ACTION' && !!selectedSilo)}
            isSuccess={sasquachSuccess}
          />
        </div>
      </div>
    </div>
  );
};

const SILO_CENTER_OFFSET = 0.08;

const getSiloCenterPosition = (
  selectedSiloRole: string | null,
  areaHeads: AreaHead[],
  dimensions: { width: number; height: number; vmin: number }
): { x: number; y: number } | null => {
  if (!selectedSiloRole) return null;
  
  const activeAreas = areaHeads.filter(a => a.status !== 'discarded');
  const sortedAreas = [...activeAreas].sort((a, b) => b.weight - a.weight);
  
  const idx = sortedAreas.findIndex(a => a.role === selectedSiloRole);
  if (idx < 0) return null;
  
  return {
    x: dimensions.width / 2,
    y: dimensions.height / 2 + dimensions.vmin * SILO_CENTER_OFFSET,
  };
};

const ORBIT_RADIUS_VMIN = 0.18;

interface ActionNodeProps {
  action: ActionProposal;
  index: number;
  angle: number;
  scale: number;
  isSelected: boolean;
  isFading: boolean;
  siloPosition: { x: number; y: number };
  siloDisintegrating: boolean;
  vmin: number;
  onClick: () => void;
}

const ActionNode: React.FC<ActionNodeProps> = ({ 
  action, 
  index, 
  angle, 
  scale, 
  isSelected,
  isFading,
  siloPosition,
  siloDisintegrating,
  vmin,
  onClick 
}) => {
  const orbitRadius = vmin * ORBIT_RADIUS_VMIN;
  const orbitalX = siloPosition.x + Math.cos(angle) * orbitRadius;
  const orbitalY = siloPosition.y + Math.sin(angle) * orbitRadius;
  
  const baseOrbSize = Math.max(100, vmin * 0.12);
  const size = baseOrbSize + scale * 15;
  const clampedFontSize = `clamp(${Math.max(10, vmin * 0.015)}px, ${Math.max(11, vmin * 0.022)}px, ${Math.min(16, vmin * 0.03)}px)`;
  
  const targetX = isSelected && siloDisintegrating ? siloPosition.x : orbitalX;
  const targetY = isSelected && siloDisintegrating ? siloPosition.y : orbitalY;
  const targetScale = isSelected && siloDisintegrating ? 1.6 : scale;
  const targetOpacity = isFading ? 0 : 1;
  
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0,
      }}
      animate={{
        opacity: targetOpacity,
        scale: targetScale,
        x: targetX,
        y: targetY,
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        type: 'spring',
        stiffness: isSelected ? 100 : 200,
        damping: isSelected ? 12 : 18,
        mass: 0.5,
        delay: index * 0.05,
      }}
      whileHover={!isFading && !siloDisintegrating ? { scale: scale * 1.15 } : {}}
      onClick={onClick}
      className="absolute cursor-pointer pointer-events-auto"
      style={{
        left: 0,
        top: 0,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 35 : 30,
      }}
    >
      <motion.div
        animate={{
          boxShadow: isSelected ? [
            '0 0 35px rgba(251, 191, 36, 0.9), 0 0 70px rgba(251, 191, 36, 0.6)',
            '0 0 50px rgba(251, 191, 36, 1), 0 0 100px rgba(251, 191, 36, 0.8)',
            '0 0 35px rgba(251, 191, 36, 0.9), 0 0 70px rgba(251, 191, 36, 0.6)',
          ] : [
            '0 0 12px rgba(255, 255, 255, 0.5), 0 0 25px rgba(251, 191, 36, 0.35)',
            '0 0 18px rgba(255, 255, 255, 0.6), 0 0 35px rgba(251, 191, 36, 0.45)',
            '0 0 12px rgba(255, 255, 255, 0.5), 0 0 25px rgba(251, 191, 36, 0.35)',
          ],
        }}
        transition={{ duration: isSelected ? 1 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-2xl flex items-center justify-center backdrop-blur-md"
        style={{
          width: `${size}px`,
          minHeight: `${size * 0.7}px`,
          maxHeight: `${size * 1.4}px`,
          background: isSelected 
            ? `radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(251, 240, 220, 0.9) 40%, rgba(195, 163, 67, 0.7) 100%)`
            : `radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(251, 240, 220, 0.8) 40%, rgba(195, 163, 67, 0.5) 100%)`,
          border: isSelected ? '2px solid rgba(255, 255, 255, 0.95)' : '1.5px solid rgba(255, 255, 255, 0.7)',
        }}
      >
        <div 
          className="w-full h-full flex items-center justify-center p-3"
        >
          <p 
            className="text-center text-stone-800 font-serif italic leading-relaxed break-words hyphens-auto"
            style={{ fontSize: clampedFontSize }}
          >
            {action.text}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface ActionSwarmProps {
  actionProposals: ActionProposal[];
  selectedSilo: AreaHead | null;
  areaHeads: AreaHead[];
  isVisible: boolean;
  selectedActionId: string | null;
  siloDisintegrating: boolean;
  onSelectAction: (actionId: string, actionText: string) => void;
}

const ActionSwarm: React.FC<ActionSwarmProps> = ({ 
  actionProposals, 
  selectedSilo,
  areaHeads,
  isVisible, 
  selectedActionId,
  siloDisintegrating,
  onSelectAction 
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, vmin: 0 });
  const [siloPositions, setSiloPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [siloBounds, setSiloBounds] = useState<Record<string, { width: number; height: number; centerX: number; centerY: number }>>({});
  
  useEffect(() => {
    const handleSiloPosition = (e: CustomEvent) => {
      setSiloPositions(prev => ({ ...prev, [e.detail.nodeId]: { x: e.detail.x, y: e.detail.y } }));
      if (e.detail.width && e.detail.height) {
        setSiloBounds(prev => ({ 
          ...prev, 
          [e.detail.nodeId]: { 
            width: e.detail.width, 
            height: e.detail.height,
            centerX: e.detail.x,
            centerY: e.detail.y
          } 
        }));
      }
    };
    window.addEventListener('silo-position-update', handleSiloPosition as EventListener);
    return () => window.removeEventListener('silo-position-update', handleSiloPosition as EventListener);
  }, []);
  
  useEffect(() => {
    const updateDimensions = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const vmin = Math.min(vw, vh);
      setDimensions({ width: vw, height: vh, vmin });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  const selectedSiloPosition = useMemo(() => {
    if (!selectedSilo) return null;
    const idx = areaHeads.findIndex(a => a.role === selectedSilo.role);
    const nodeId = `silo-${idx}`;
    
    if (siloBounds[nodeId] && siloPositions[nodeId]) {
      const bounds = siloBounds[nodeId];
      return {
        x: bounds.centerX,
        y: bounds.centerY,
        width: bounds.width,
        height: bounds.height,
      };
    }
    
    if (siloPositions[nodeId]) {
      return siloPositions[nodeId];
    }
    
    return getSiloCenterPosition(selectedSilo.role, areaHeads, dimensions);
  }, [selectedSilo, areaHeads, dimensions, siloPositions, siloBounds]);
  
  const filteredActions = useMemo(() => {
    if (!selectedSilo) return [];
    const bySilo = actionProposals.filter((proposal) => proposal.siloRole === selectedSilo.role);
    const unique = bySilo.filter((v, i, a) => a.findIndex(t => t.text === v.text) === i);
    return unique;
  }, [actionProposals, selectedSilo]);
  
  interface SilosPositionWithBounds {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

const orbitRadius = (selectedSiloPosition as SilosPositionWithBounds | undefined)?.width 
    ? (selectedSiloPosition as SilosPositionWithBounds).width! * 1.2 
    : dimensions.vmin * ORBIT_RADIUS_VMIN;
  
  const actionPositions = useMemo(() => {
    if (!selectedSiloPosition || filteredActions.length === 0) return [];
    
    const pos = selectedSiloPosition as SilosPositionWithBounds;
    const centerX = pos.x;
    const centerY = pos.y;
    
    const positions = filteredActions.map((action, idx) => {
      const totalAngles = filteredActions.length;
      const baseAngle = (idx / totalAngles) * Math.PI * 2 - Math.PI / 2;
      
      const jitter = (action.timestamp % 100) / 100;
      const offsetScale = (pos?.width || dimensions.vmin * 0.15);
      const microOffsetX = Math.sin(jitter * Math.PI * 2) * 0.5 * offsetScale;
      const microOffsetY = Math.cos(jitter * Math.PI * 2) * 0.5 * offsetScale;
      
      return {
        x: centerX + Math.cos(baseAngle) * orbitRadius + microOffsetX,
        y: centerY + Math.sin(baseAngle) * orbitRadius + microOffsetY,
        angle: baseAngle,
      };
    });
    return positions;
  }, [filteredActions, selectedSiloPosition, orbitRadius, dimensions.vmin]);
  
  if (!isVisible || !selectedSiloPosition || filteredActions.length === 0) return null;
  
  const selectedAction = filteredActions.find(a => a.id === selectedActionId);
  
  return (
    <div className="fixed inset-0 z-25 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="swarmFeedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {actionPositions.map((pos, idx) => {
          const action = filteredActions[idx];
          const isSelected = action.id === selectedActionId;
          const isFading = Boolean(selectedActionId && !isSelected);
          
          return (
            <g key={`connection-${idx}`}>
              <motion.line
                x1={selectedSiloPosition.x}
                y1={selectedSiloPosition.y}
                x2={pos.x}
                y2={pos.y}
                stroke="url(#swarmFeedGradient)"
                strokeWidth={isSelected ? 2.5 : 1.5}
                strokeDasharray={isSelected ? "none" : "4 4"}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: isFading ? 0 : (isSelected ? 0.7 : 0.35) 
                }}
                transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
              />
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 5 : 3}
                fill="#fbbf24"
                opacity={isFading ? 0 : (isSelected ? 0.9 : 0.5)}
                initial={{ scale: 0 }}
                animate={{ scale: isSelected ? [1, 1.3, 1] : 1 }}
                transition={{ delay: idx * 0.1 + 0.3, duration: isSelected ? 0.8 : 0.3 }}
              />
            </g>
          );
        })}
      </svg>
      
      {actionPositions.map((pos, idx) => {
        const action = filteredActions[idx];
        const isSelected = action.id === selectedActionId;
        const isFading = Boolean(selectedActionId && !isSelected);
        
        return (
          <ActionNode
            key={action.id}
            action={action}
            index={idx}
            angle={pos.angle}
            scale={0.6 + action.weight * 0.4}
            isSelected={isSelected}
            isFading={isFading}
            siloPosition={selectedSiloPosition}
            siloDisintegrating={siloDisintegrating}
            vmin={dimensions.vmin}
            onClick={() => onSelectAction(action.id, action.text)}
          />
        );
      })}

      {selectedAction && siloDisintegrating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 2.2 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.5 }}
          className="absolute pointer-events-none"
          style={{
            left: selectedSiloPosition.x,
            top: selectedSiloPosition.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div 
            className="rounded-full flex items-center justify-center"
            style={{
              width: '140px',
              height: '140px',
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.95) 0%, rgba(195, 163, 67, 0.7) 50%, rgba(120, 100, 40, 0.4) 100%)',
              border: '3px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 0 80px rgba(251, 191, 36, 0.9), 0 0 160px rgba(251, 191, 36, 0.5)',
            }}
          >
            <p className="text-center px-4 text-stone-900 font-serif italic text-sm leading-snug whitespace-normal">
              {selectedAction.text}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
