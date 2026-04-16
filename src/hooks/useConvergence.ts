import { useCallback, useMemo, useState } from 'react';
import { useRitual } from './useRitual';
import { AreaHead, WhyEntry, SimilarNodes, ParticipantRole } from '../types';

const SIMILARITY_THRESHOLD = 0.7;

const ALIAS_MAP: Record<string, string[]> = {
  'laboratorio': ['lab', 'laboratorio central', 'lab clínico', 'laboratorio clínico', 'lab central'],
  'farmacia': ['far', 'farmacia hospitalaria', 'droguería'],
  'admisión': ['admisiones', 'recepción', 'atención al paciente', 'recepcion', 'admision'],
  'dirección': ['direccion', 'gerencia', 'directorio', 'administración'],
  'enfermería': ['enfermeria', 'enfermeros', 'equipo de enfermería'],
  'kinesiología': ['kinesiologia', 'kines', 'fisioterapia', 'fisio'],
  'infectología': ['infectologia', 'infectólogos', 'control de infecciones'],
  'imagenología': ['imagenologia', 'radiología', 'rayos x', 'resonancia'],
  'cirugía': ['cirugia', 'quirófano', 'quirófanos', 'block quirúrgico'],
  'urgencia': ['emergencia', 'emergencias', 'shock', 'trauma'],
  'uci': ['terapia intensiva', 'cuidados intensivos', 'uti'],
};

const longestCommonSubstring = (a: string, b: string): string => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  const matrix: number[][] = Array(aLower.length + 1).fill(null).map(() => Array(bLower.length + 1).fill(0));
  
  let maxLength = 0;
  let endIndex = 0;
  
  for (let i = 1; i <= aLower.length; i++) {
    for (let j = 1; j <= bLower.length; j++) {
      if (aLower[i - 1] === bLower[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
        if (matrix[i][j] > maxLength) {
          maxLength = matrix[i][j];
          endIndex = i;
        }
      }
    }
  }
  
  return aLower.substring(endIndex - maxLength, endIndex);
};

const calculateSimilarity = (a: string, b: string): number => {
  const normA = a.toLowerCase().trim();
  const normB = b.toLowerCase().trim();
  
  if (normA === normB) return 1.0;
  
  if (normA.includes(normB) || normB.includes(normA)) return 0.9;
  
  const common = longestCommonSubstring(normA, normB);
  if (common.length > 3) {
    const ratio = common.length / Math.max(normA.length, normB.length);
    if (ratio >= 0.5) return Math.min(0.85, ratio + 0.3);
  }
  
  for (const [key, aliases] of Object.entries(ALIAS_MAP)) {
    const allTerms = [key, ...aliases];
    const inA = allTerms.some(term => normA.includes(term));
    const inB = allTerms.some(term => normB.includes(term));
    if (inA && inB) return 0.85;
  }
  
  const wordsA = normA.split(/\s+/);
  const wordsB = normB.split(/\s+/);
  const commonWords = wordsA.filter(w => wordsB.includes(w));
  if (commonWords.length > 0) {
    return 0.6 + (commonWords.length * 0.1);
  }
  
  return 0;
};

const calculateInitialWeight = (
  entry: Partial<WhyEntry | AreaHead>,
  existingCount: number,
  type: 'why' | 'area'
): number => {
  let weight = 0.5;
  
  if (type === 'why') {
    const whyEntry = entry as Partial<WhyEntry>;
    if (whyEntry.text && whyEntry.text.length > 30) weight += 0.15;
    if (whyEntry.text && whyEntry.text.length > 60) weight += 0.1;
    
    if (existingCount === 0) weight += 0.2;
    
    const hasSpecificWords = /\d+|porcentaje|métrica|indicador|objetivo/i.test(whyEntry.text || '');
    if (hasSpecificWords) weight += 0.1;
  }
  
  if (type === 'area') {
    const areaEntry = entry as Partial<AreaHead>;
    if (areaEntry.successMetric && areaEntry.successMetric.length > 20) weight += 0.15;
    
    const hasMetricKeywords = /kpi|tiempo|horas|días|porcentaje|reducir|aumentar|meta/i.test(areaEntry.successMetric || '');
    if (hasMetricKeywords) weight += 0.15;
    
    if (existingCount === 0) weight += 0.15;
  }
  
  return Math.min(1, Math.max(0.1, weight));
};

export interface UseConvergenceReturn {
  whyResponses: WhyEntry[];
  areaHeads: AreaHead[];
  similarPairs: SimilarNodes[];
  promoteNode: (id: string, type: 'why' | 'area') => void;
  discardNode: (id: string, type: 'why' | 'area') => void;
  restoreNode: (id: string, type: 'why' | 'area') => void;
  adjustWeight: (id: string, type: 'why' | 'area', delta: number) => void;
  mergeNodes: (sourceId: string, targetId: string) => void;
  reinforceWhyEntry: (entryTimestamp: number, role: ParticipantRole, comment?: string) => void;
  getActiveNodes: () => (WhyEntry | AreaHead)[];
  getDiscardedNodes: () => (WhyEntry | AreaHead)[];
  dismissSimilarPair: (source: string, target: string) => void;
}

export const useConvergence = (): UseConvergenceReturn => {
  const { state, updateState } = useRitual();
  const { whyResponses, areaHeads } = state.context;
  const [dismissedPairs, setDismissedPairs] = useState<Set<string>>(new Set());
  
  console.log(`[USE_CONVERGENCE] Hook called. state.currentPhase: ${state.currentPhase}, areaHeads: ${areaHeads.length}`);

  const similarPairs = useMemo((): SimilarNodes[] => {
    if (state.currentPhase !== 'CONVERGENCE') return [];
    
    const pairs: SimilarNodes[] = [];
    const checked = new Set<string>();
    
    for (let i = 0; i < areaHeads.length; i++) {
      for (let j = i + 1; j < areaHeads.length; j++) {
        const a = areaHeads[i];
        const b = areaHeads[j];
        
        if (a.status === 'discarded' || b.status === 'discarded') continue;
        
        const pairKey = [a.role, b.role].sort().join('|');
        if (checked.has(pairKey)) continue;
        checked.add(pairKey);
        
        if (dismissedPairs.has(pairKey)) continue;
        
        const similarity = calculateSimilarity(a.role, b.role);
        if (similarity >= SIMILARITY_THRESHOLD) {
          pairs.push({
            source: a.role,
            target: b.role,
            similarity,
          });
        }
      }
    }
    
    return pairs;
  }, [areaHeads, state.currentPhase, dismissedPairs]);

  const promoteNode = useCallback((id: string, type: 'why' | 'area') => {
    if (type === 'why') {
      updateState({
        context: {
          ...state.context,
          whyResponses: whyResponses.map(r => 
            r.role === id 
              ? { ...r, status: 'promoted' as const, weight: 1, promotedAt: Date.now() }
              : r
          ),
        },
      });
    } else {
      updateState({
        context: {
          ...state.context,
          areaHeads: areaHeads.map(a => 
            a.role === id 
              ? { ...a, status: 'promoted' as const, weight: 1, promotedAt: Date.now() }
              : a
          ),
        },
      });
    }
  }, [whyResponses, areaHeads, state.context, updateState]);

  const discardNode = useCallback((id: string, type: 'why' | 'area') => {
    if (type === 'why') {
      updateState({
        context: {
          ...state.context,
          whyResponses: whyResponses.map(r => 
            r.role === id 
              ? { ...r, status: 'discarded' as const, weight: 0.1 }
              : r
          ),
        },
      });
    } else {
      updateState({
        context: {
          ...state.context,
          areaHeads: areaHeads.map(a => 
            a.role === id 
              ? { ...a, status: 'discarded' as const, weight: 0.1 }
              : a
          ),
        },
      });
    }
  }, [whyResponses, areaHeads, state.context, updateState]);

  const restoreNode = useCallback((id: string, type: 'why' | 'area') => {
    if (type === 'why') {
      updateState({
        context: {
          ...state.context,
          whyResponses: whyResponses.map(r => 
            r.role === id 
              ? { ...r, status: 'active' as const, weight: 0.5 }
              : r
          ),
        },
      });
    } else {
      updateState({
        context: {
          ...state.context,
          areaHeads: areaHeads.map(a => 
            a.role === id 
              ? { ...a, status: 'active' as const, weight: 0.5 }
              : a
          ),
        },
      });
    }
  }, [whyResponses, areaHeads, state.context, updateState]);

  const adjustWeight = useCallback((id: string, type: 'why' | 'area', delta: number) => {
    if (type === 'why') {
      updateState({
        context: {
          ...state.context,
          whyResponses: whyResponses.map(r => 
            r.role === id 
              ? { ...r, weight: Math.min(1, Math.max(0.1, r.weight + delta)) }
              : r
          ),
        },
      });
    } else {
      updateState({
        context: {
          ...state.context,
          areaHeads: areaHeads.map(a => 
            a.role === id 
              ? { ...a, weight: Math.min(1, Math.max(0.1, a.weight + delta)) }
              : a
          ),
        },
      });
    }
  }, [whyResponses, areaHeads, state.context, updateState]);

  const mergeNodes = useCallback((sourceRole: string, targetRole: string) => {
    console.log(`[MERGE] mergeNodes called with source="${sourceRole}", target="${targetRole}"`);
    console.log(`[MERGE] Current areaHeads:`, areaHeads.map(a => a.role));
    
    const targetNode = areaHeads.find(a => a.role === targetRole);
    if (!targetNode) {
      console.log(`[MERGE] ERROR: targetNode not found for "${targetRole}"`);
      return;
    }

    const sourceNode = areaHeads.find(a => a.role === sourceRole);
    console.log(`[MERGE] sourceNode:`, sourceNode);
    console.log(`[MERGE] targetNode:`, targetNode);
    
    const mergedNode: AreaHead = {
      ...targetNode,
      role: targetRole,
      weight: Math.max(targetNode.weight, sourceNode?.weight || 0.5) + 0.1,
      mergedFrom: [
        ...(targetNode.mergedFrom || []),
        sourceRole,
      ],
      successMetric: targetNode.successMetric,
    };

    const newAreaHeads = [
      ...areaHeads.filter(a => a.role !== targetRole && a.role !== sourceRole),
      mergedNode,
    ];
    
    console.log(`[MERGE] New areaHeads after merge:`, newAreaHeads.map(a => a.role));
    console.log(`[MERGE] Calling updateState - replacing entire areaHeads array`);

    updateState({
      context: {
        whySummary: state.context.whySummary,
        whyResponses: state.context.whyResponses,
        areaHeads: newAreaHeads,
        rootCauses: state.context.rootCauses,
        actionProposals: state.context.actionProposals,
        selectedSilo: state.context.selectedSilo,
      },
    });
    
    console.log(`[MERGE] updateState called successfully`);
  }, [areaHeads, state.context, updateState]);

  const dismissSimilarPair = useCallback((source: string, target: string) => {
    const pairKey = [source, target].sort().join('|');
    console.log(`[DISMISS] Dismissing pair: ${pairKey}`);
    setDismissedPairs(prev => new Set([...prev, pairKey]));
  }, []);

  const reinforceWhyEntry = useCallback((entryTimestamp: number, reinforcingRole: ParticipantRole, comment?: string) => {
    const newReinforcement = {
      role: reinforcingRole,
      timestamp: Date.now(),
      comment,
    };

    updateState({
      context: {
        ...state.context,
        whyResponses: whyResponses.map(r => {
          if (r.timestamp === entryTimestamp) {
            const newWeight = Math.min(1, r.weight + 0.15);
            return {
              ...r,
              weight: newWeight,
              reinforcements: [...(r.reinforcements || []), newReinforcement],
            };
          }
          return r;
        }),
      },
    });
  }, [whyResponses, state.context, updateState]);

  const getActiveNodes = useCallback(() => {
    const whyActive = whyResponses.filter(r => r.status !== 'discarded');
    const areaActive = areaHeads.filter(a => a.status !== 'discarded');
    return [...whyActive, ...areaActive].sort((a, b) => b.weight - a.weight);
  }, [whyResponses, areaHeads]);

  const getDiscardedNodes = useCallback(() => {
    const whyDiscarded = whyResponses.filter(r => r.status === 'discarded');
    const areaDiscarded = areaHeads.filter(a => a.status === 'discarded');
    return [...whyDiscarded, ...areaDiscarded];
  }, [whyResponses, areaHeads]);

  return {
    whyResponses,
    areaHeads,
    similarPairs,
    promoteNode,
    discardNode,
    restoreNode,
    adjustWeight,
    mergeNodes,
    reinforceWhyEntry,
    getActiveNodes,
    getDiscardedNodes,
    dismissSimilarPair,
  };
};

export { calculateInitialWeight, calculateSimilarity };
