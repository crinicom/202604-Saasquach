import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { RoomState, RitualPhase, ParticipantRole, RefortifySiloPayload, AreaHead, RitualEvent } from '../types';
import { BroadcastTransport } from '../sync/BroadcastTransport';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getRitualIdFromUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get('room');
  if (roomParam && roomParam.trim()) {
    return roomParam.trim().toUpperCase();
  }
  return 'LOBBY';
};

const normalizeSiloName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
};

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
  const normA = normalizeSiloName(a);
  const normB = normalizeSiloName(b);
  
  if (normA === normB) return 1.0;
  if (normA.includes(normB) || normB.includes(normA)) return 0.9;
  
  const common = longestCommonSubstring(normA, normB);
  if (common.length > 3) {
    const ratio = common.length / Math.max(normA.length, normB.length);
    if (ratio >= 0.5) return Math.min(0.85, ratio + 0.3);
  }
  
  for (const [key, aliases] of Object.entries(ALIAS_MAP)) {
    const allTerms = [key, ...aliases];
    if (allTerms.some(term => normA.includes(term)) && allTerms.some(term => normB.includes(term))) {
      return 0.85;
    }
  }
  
  const wordsA = normA.split(/\s+/);
  const wordsB = normB.split(/\s+/);
  const commonWords = wordsA.filter(w => wordsB.includes(w));
  if (commonWords.length > 0) {
    return 0.6 + (commonWords.length * 0.1);
  }
  
  return 0;
};

const ritualIdGlobal = getRitualIdFromUrl();

console.log(`[SUPABASE_SYNC] Initialized with ritualId: "${ritualIdGlobal}"`);

const initialState: RoomState = {
  roomId: ritualIdGlobal,
  status: 'active',
  currentPhase: 'WHY',
  context: {
    ritualId: ritualIdGlobal,
    whySummary: '',
    whyResponses: [],
    areaHeads: [],
    rootCauses: [],
    actionProposals: [],
    selectedSilo: null,
    ruptureCommitment: null,
  },
  mermaidCode: '',
  frictionMap: [],
};

console.log(`[SUPABASE_SYNC] Initializing... URL: ${SUPABASE_URL ? 'present' : 'MISSING'}, KEY: ${SUPABASE_KEY ? 'present' : 'MISSING'}`);

const channelName = `sasquach_ritual_${ritualIdGlobal}`;
const broadcastChannel = new BroadcastTransport(channelName);
console.log(`[SYNC] BroadcastChannel created: ${channelName}`);

let supabase: ReturnType<typeof createClient> | null = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log(`[SUPABASE_SYNC] Supabase client created for ${SUPABASE_URL}`);
  } catch (e) {
    console.error(`[SUPABASE_SYNC] Failed to create client:`, e);
  }
} else {
  console.error(`[SUPABASE_SYNC] Missing config - falling back to BroadcastChannel`);
}

export const useSasquachSync = (role: ParticipantRole) => {
  const [state, setState] = useState<RoomState>(() => {
    const urlRitualId = getRitualIdFromUrl();
    return {
      ...initialState,
      context: {
        ...initialState.context,
        ritualId: urlRitualId,
      },
    };
  });
  
  const currentRitualId = getRitualIdFromUrl();
  
  const getSessionId = (): string => {
    const STORAGE_KEY = 'sasquach_voter_id';
    let sessionId = localStorage.getItem(STORAGE_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, sessionId);
      console.log(`[SESSION] New sessionId generated: ${sessionId}`);
    }
    return sessionId;
  };
  
  const sessionIdRef = useRef<string>(getSessionId());
  const sessionId = sessionIdRef.current;
  
  const stateRef = useRef<RoomState>(state);
  const actionProposalsRef = useRef<any[]>([]);
  
useEffect(() => {
    stateRef.current = state;
    actionProposalsRef.current = state.context.actionProposals;
  }, [state]);

  useEffect(() => {
    console.log(`[SYNC] Setting up BroadcastChannel subscription for ritual: ${currentRitualId}`);
    
    const broadcastUnsubscribe = broadcastChannel.subscribe((event: RitualEvent) => {
      if (event.type === 'DATA_UPDATE') {
        const payload = event.payload as any;
        if (payload.context?.actionProposals) {
          const newProposals = payload.context.actionProposals;
          console.log(`[SYNC] BroadcastChannel received ${newProposals.length} proposals`);
          
          setState((prev) => {
            const merged = [...prev.context.actionProposals];
            newProposals.forEach((newP: any) => {
              const exists = merged.some(
                p => p.id === newP.id || (p.sessionId === newP.sessionId && p.text === newP.text)
              );
              if (!exists) {
                merged.push(newP);
              }
            });
            return {
              ...prev,
              context: { ...prev.context, actionProposals: merged },
            };
          });
        }
      }
      if (event.type === 'MISSION_COMPLETE') {
        const payload = event.payload as any;
        console.log(`[SYNC] MISSION_COMPLETE via BroadcastChannel`);
        setState((prev) => ({
          ...prev,
          context: { ...prev.context, ruptureCommitment: payload.actionText },
        }));
      }
    });
    
    return () => {
      console.log(`[SYNC] Cleaning up BroadcastChannel subscription`);
      broadcastUnsubscribe();
    };
  }, [currentRitualId]);

  useEffect(() => {
    if (!supabase || !currentRitualId) {
      console.warn(`[SUPABASE_SYNC] Skipping Supabase subscription - no client or no ritualId, using BroadcastChannel only`);
      return;
    }
    
    console.log(`[SUPABASE_SYNC] Setting up Supabase subscription for ritual: ${currentRitualId}`);
    
    const channel = supabase.channel(`ritual-${currentRitualId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'actions',
        filter: `ritual_id=eq.${currentRitualId}`,
      }, (payload: any) => {
        console.log(`[SUPABASE_SYNC] 📥 Raw payload:`, payload);
        const newAction = payload.new;
        console.log(`[SUPABASE_SYNC] 📥 INSERT received:`, newAction);
        
        const incomingProposals = actionProposalsRef.current || [];
        
        const exists = incomingProposals.some(
          p => p.id === newAction.id || (p.sessionId === newAction.session_id && p.text === newAction.text)
        );
        
        if (!exists) {
          console.log(`[SUPABASE_SYNC] Adding new action proposal to state: ${newAction.text?.slice(0, 30)}...`);
          
          setState((prev) => {
            const newProposal = {
              id: newAction.id,
              siloRole: newAction.silo_role,
              role: newAction.role,
              sessionId: newAction.session_id,
              text: newAction.text,
              timestamp: newAction.timestamp,
              weight: 0.5,
            };
            
            return {
              ...prev,
              context: {
                ...prev.context,
                actionProposals: [...prev.context.actionProposals, newProposal],
              },
            };
          });
        } else {
          console.log(`[SUPABASE_SYNC] Duplicate action, ignoring`);
        }
      })
      .subscribe((status) => {
        console.log(`[SUPABASE_SYNC] Subscription status: ${status}`);
        if (status === 'CHANNEL_ERROR') {
          console.warn(`[SUPABASE_SYNC] Supabase failed, relying on BroadcastChannel fallback`);
        }
      });
    
    return () => {
      console.log(`[SUPABASE_SYNC] Cleaning up Supabase subscription`);
      supabase?.removeChannel(channel);
    };
  }, [currentRitualId]);
  
  const mergeState = useCallback((prev: RoomState, patch: Partial<RoomState>): RoomState => {
    const newState = { ...prev, ...patch };
    
    if (patch.context && prev.context) {
      newState.context = { ...prev.context };
      
      for (const [key, value] of Object.entries(patch.context)) {
        const current = (prev.context as any)[key];
        const incoming = value;
        
        console.log(`[MERGE_STATE] Processing key: ${key}`);
        
        if (key === 'areaHeads' && Array.isArray(incoming) && Array.isArray(current)) {
          if (incoming.length === 0) {
            console.log(`[MERGE_STATE] areaHeads: Incoming empty, keeping existing: ${current.length}`);
            continue;
          }
          
          const merged = [...current];
          incoming.forEach((incomingSilo: AreaHead) => {
            const existingIndex = merged.findIndex(s => s.role === incomingSilo.role);
            if (existingIndex >= 0) {
              if (incomingSilo.weight > merged[existingIndex].weight) {
                merged[existingIndex] = incomingSilo;
              }
            } else {
              merged.push(incomingSilo);
            }
          });
          
          newState.context.areaHeads = merged;
          continue;
        }
        
        if (Array.isArray(incoming) && Array.isArray(current)) {
          const merged = [...current];
          incoming.forEach((item: any) => {
            const isDuplicate = merged.some((existing: any) => {
              if (item?.timestamp && existing?.timestamp) {
                return existing.timestamp === item.timestamp && existing.role === item.role;
              }
              if (item?.role && existing?.role) {
                return existing.role === item.role;
              }
              return JSON.stringify(existing) === JSON.stringify(item);
            });
            
            if (!isDuplicate) {
              merged.push(item);
            }
          });
          (newState.context as any)[key] = merged;
        } else {
          (newState.context as any)[key] = incoming;
        }
      }
    }
    
    return newState;
  }, []);
  
  const updateData = useCallback(async (newData: Partial<RoomState>) => {
    console.log(`[UPDATE_DATA] Sending update:`, Object.keys(newData));
    
    setState((prev) => {
      const newState = mergeState(prev, newData);
      return newState;
    });
    
    if (newData.context?.actionProposals) {
      const proposals = newData.context.actionProposals;
      if (proposals.length > 0) {
        const lastProposal = proposals[proposals.length - 1];
        
        console.log(`[UPDATE_DATA] Broadcasting via BroadcastChannel:`, lastProposal.text?.slice(0, 30));
        
        broadcastChannel.publish({
          type: 'DATA_UPDATE',
          payload: newData,
          sender: role,
          timestamp: Date.now(),
          sessionId,
        } as any);
        console.log(`[UPDATE_DATA] BroadcastChannel publish done`);
        
        if (supabase && lastProposal.text) {
          console.log(`[UPDATE_DATA] Attempting Supabase insert...`);
          
          const insertData = {
            ritual_id: currentRitualId,
            session_id: sessionId,
            role: role,
            silo_role: lastProposal.siloRole,
            text: lastProposal.text,
            timestamp: lastProposal.timestamp,
            weight: lastProposal.weight || 0.5,
          };
          
          try {
            const { data, error } = await (supabase.from('actions') as any).insert(insertData);
            if (error) {
              console.warn(`[UPDATE_DATA] Supabase insert failed (fallback working):`, error);
            } else {
              console.log(`[UPDATE_DATA] Supabase insert success:`, data);
            }
          } catch (e) {
            console.warn(`[UPDATE_DATA] Supabase insert exception:`, e);
          }
        }
      }
    }
    
    if (newData.context?.areaHeads) {
      console.log(`[UPDATE_DATA] areaHeads update:`, newData.context.areaHeads.map(a => a.role));
    }
  }, [role, mergeState, sessionId]);
  
  const changePhase = useCallback((newPhase: RitualPhase) => {
    console.log(`[CHANGE_PHASE] Changing to: ${newPhase}`);
    setState((prev) => mergeState(prev, { currentPhase: newPhase }));
  }, [mergeState]);
  
  const handleRefortifySilo = useCallback((payload: RefortifySiloPayload & { sessionId: string }) => {
    console.log(`[REFORTIFY] area: ${payload.areaName}`);
    
    setState((prev) => {
      const areaHeads = [...prev.context.areaHeads];
      const existingIdx = areaHeads.findIndex(a => a.role === payload.areaName);
      
      if (existingIdx >= 0) {
        const newWeight = Math.min(3.0, areaHeads[existingIdx].weight + 0.5);
        areaHeads[existingIdx] = {
          ...areaHeads[existingIdx],
          weight: newWeight,
          status: 'active',
          votedBy: [...areaHeads[existingIdx].votedBy, { role: payload.voterRole, sessionId: payload.sessionId, timestamp: Date.now() }],
        };
      }
      
      return {
        ...prev,
        context: { ...prev.context, areaHeads },
      };
    });
  }, []);
  
  const findMatchingSilo = useCallback((areaHeads: AreaHead[], name: string) => {
    if (!areaHeads.length || !name) {
      return { silo: null, similarity: 0 };
    }
    
    let bestMatch = areaHeads[0];
    let bestSimilarity = 0;
    
    for (const silo of areaHeads) {
      const similarity = calculateSimilarity(name, silo.role);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = silo;
      }
    }
    
    return { silo: bestMatch, similarity: bestSimilarity };
  }, []);
  
  return {
    state,
    updateData,
    changePhase,
    refortifySilo: handleRefortifySilo,
    findMatchingSilo: (name: string) => findMatchingSilo(state.context.areaHeads, name),
    role,
    sessionId,
    ritualId: currentRitualId,
    isBoard: role === 'BOARD'
  };
};