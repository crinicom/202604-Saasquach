import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RoomState, RitualPhase, ParticipantRole, RefortifySiloPayload, AreaHead, RitualEvent, RitualEventType, WhyEntry } from '../types';

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

console.log(`[SYNC] Initialized with ritualId: "${ritualIdGlobal}"`);

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

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log(`[SYNC] Supabase client created for ${SUPABASE_URL}`);
  } catch (e) {
    console.error(`[SYNC] Failed to create client:`, e);
  }
} else {
  console.warn(`[SYNC] Missing config - realtime sync disabled`);
}

interface SyncChannel {
  publish(event: RitualEvent): Promise<void>;
  subscribe(handler: (event: RitualEvent) => void): () => void;
  close(): void;
}

const createSupabaseBroadcastChannel = (ritualId: string): SyncChannel | null => {
  if (!supabase) return null;
  
  const channelName = `sasquach-${ritualId.toLowerCase()}`;
  const channel = supabase.channel(channelName);
  
  const handlers: Set<(event: RitualEvent) => void> = new Set();
  
  channel.on('broadcast', { event: 'ritual-update' }, (payload: { payload: RitualEvent }) => {
    console.log(`[SYNC] Broadcast received:`, payload.payload?.type);
    handlers.forEach(handler => handler(payload.payload));
  });
  
  let isSubscribed = false;
  channel.subscribe((status) => {
    console.log(`[SYNC] Channel status: ${status}`);
    isSubscribed = status === 'SUBSCRIBED';
  });
  
  return {
    publish: async (event: RitualEvent) => {
      if (!isSubscribed) {
        console.warn(`[SYNC] Not subscribed, trying to send...`);
      }
      try {
        await channel.send({
          type: 'broadcast',
          event: 'ritual-update',
          payload: event,
        });
      } catch (e) {
        console.warn(`[SYNC] Broadcast send failed:`, e);
      }
    },
    subscribe: (handler: (event: RitualEvent) => void) => {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    close: () => {
      supabase?.removeChannel(channel);
      handlers.clear();
    },
  };
};

const syncChannel = supabase ? createSupabaseBroadcastChannel(ritualIdGlobal) : null;

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
      console.log(`[SESSION] New sessionId: ${sessionId}`);
    }
    return sessionId;
  };
  
  const sessionIdRef = useRef<string>(getSessionId());
  const sessionId = sessionIdRef.current;
  
  const stateRef = useRef<RoomState>(state);
  const whyResponsesRef = useRef<WhyEntry[]>([]);
  const areaHeadsRef = useRef<AreaHead[]>([]);
  const actionProposalsRef = useRef<any[]>([]);
  
  useEffect(() => {
    stateRef.current = state;
    whyResponsesRef.current = state.context.whyResponses;
    areaHeadsRef.current = state.context.areaHeads;
    actionProposalsRef.current = state.context.actionProposals;
  }, [state]);

  useEffect(() => {
    if (!syncChannel) {
      console.log(`[SYNC] No sync channel, skipping broadcast subscription`);
      return;
    }
    
    console.log(`[SYNC] Setting up sync channel subscription`);
    
    const unsubscribe = syncChannel.subscribe((event: RitualEvent) => {
      console.log(`[SYNC] Received event:`, event.type);
      
      if (event.type === 'WHY_ENTRY' || event.type === 'DATA_UPDATE') {
        const payload = event.payload as any;
        
        if (payload.context?.whyResponses) {
          const newResponses = payload.context.whyResponses;
          console.log(`[SYNC] Processing ${newResponses.length} whyResponses`);
          
          setState((prev) => {
            const merged = [...prev.context.whyResponses];
            newResponses.forEach((newR: WhyEntry) => {
              const exists = merged.some(
                r => r.timestamp === newR.timestamp && r.role === newR.role
              );
              if (!exists) {
                merged.push(newR);
              }
            });
            return {
              ...prev,
              context: { ...prev.context, whyResponses: merged },
            };
          });
        }
        
        if (payload.context?.areaHeads) {
          const newAreas = payload.context.areaHeads;
          console.log(`[SYNC] Processing ${newAreas.length} areaHeads`);
          
          setState((prev) => {
            const merged = [...prev.context.areaHeads];
            newAreas.forEach((newA: AreaHead) => {
              const existingIdx = merged.findIndex(a => a.role === newA.role);
              if (existingIdx >= 0) {
                if (newA.weight > merged[existingIdx].weight) {
                  merged[existingIdx] = newA;
                }
              } else {
                merged.push(newA);
              }
            });
            return {
              ...prev,
              context: { ...prev.context, areaHeads: merged },
            };
          });
        }
        
        if (payload.context?.actionProposals) {
          const newProposals = payload.context.actionProposals;
          console.log(`[SYNC] Processing ${newProposals.length} actionProposals`);
          
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

        if (payload.mermaidCode !== undefined) {
          setState((prev) => ({ ...prev, mermaidCode: payload.mermaidCode }));
        }
        
        if (payload.frictionMap !== undefined) {
          setState((prev) => ({ ...prev, frictionMap: payload.frictionMap }));
        }
      }
      
      if (event.type === 'MISSION_COMPLETE') {
        const payload = event.payload as any;
        console.log(`[SYNC] MISSION_COMPLETE received`);
        setState((prev) => ({
          ...prev,
          context: { ...prev.context, ruptureCommitment: payload.actionText },
        }));
      }
      
      if (event.type === 'PHASE_CHANGE') {
        const payload = event.payload as any;
        console.log(`[SYNC] PHASE_CHANGE to:`, payload.phase);
        setState((prev) => ({ ...prev, currentPhase: payload.phase }));
      }
    });
    
    return () => {
      console.log(`[SYNC] Cleaning up sync subscription`);
      unsubscribe();
    };
  }, []);

  const mergeState = useCallback((prev: RoomState, patch: Partial<RoomState>): RoomState => {
    const newState = { ...prev, ...patch };
    
    if (patch.context && prev.context) {
      newState.context = { ...prev.context };
      
      for (const [key, value] of Object.entries(patch.context)) {
        const current = (prev.context as any)[key];
        const incoming = value;
        
        if (key === 'areaHeads' && Array.isArray(incoming) && Array.isArray(current)) {
          if (incoming.length === 0) continue;
          
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
  
  const publishToSync = useCallback(async (eventType: RitualEventType, payload: any) => {
    const event: RitualEvent = {
      type: eventType as RitualEventType,
      payload,
      sender: role,
      timestamp: Date.now(),
      sessionId,
    };
    
    if (syncChannel) {
      console.log(`[SYNC] Publishing ${eventType} via Supabase Broadcast`);
      await syncChannel.publish(event);
    } else {
      console.log(`[SYNC] No sync channel available for ${eventType}`);
    }
  }, [role, sessionId]);
  
  const updateData = useCallback(async (newData: Partial<RoomState>) => {
    console.log(`[SYNC] updateData called with:`, Object.keys(newData));
    
    setState((prev) => {
      const newState = mergeState(prev, newData);
      return newState;
    });
    
    if (newData.context?.whyResponses) {
      const responses = newData.context.whyResponses;
      if (responses.length > 0) {
        const lastResponse = responses[responses.length - 1];
        console.log(`[SYNC] Publishing WHY:`, lastResponse.text?.slice(0, 30));
        
        await publishToSync('WHY_ENTRY', newData);
        
        if (supabase && lastResponse.text) {
          try {
            const { error } = await supabase.from('why_entries').insert({
              ritual_id: currentRitualId,
              session_id: sessionId,
              role: role,
              text: lastResponse.text,
              timestamp: lastResponse.timestamp,
              weight: lastResponse.weight || 0.5,
              status: lastResponse.status || 'active',
              reinforced_by: lastResponse.reinforcements || [],
            });
            
            if (error) {
              console.warn(`[SYNC] WHY insert failed:`, error);
            } else {
              console.log(`[SYNC] WHY insert success`);
            }
          } catch (e) {
            console.warn(`[SYNC] WHY insert exception:`, e);
          }
        }
      }
    }
    
    if (newData.context?.areaHeads) {
      const areas = newData.context.areaHeads;
      console.log(`[SYNC] Publishing ${areas.length} areaHeads`);
      
      await publishToSync('AREA_HEAD', newData);
      
      if (supabase && areas.length > 0) {
        const lastArea = areas[areas.length - 1];
        try {
          const { error } = await supabase.from('area_heads').insert({
            ritual_id: currentRitualId,
            session_id: sessionId,
            role: lastArea.role,
            success_metric: lastArea.successMetric || '',
            weight: lastArea.weight || 0.5,
            status: lastArea.status || 'active',
            voted_by: lastArea.votedBy || [],
            merged_from: lastArea.mergedFrom || [],
          });
          
          if (error) {
            console.warn(`[SYNC] Area head insert failed:`, error);
          } else {
            console.log(`[SYNC] Area head insert success`);
          }
        } catch (e) {
          console.warn(`[SYNC] Area head insert exception:`, e);
        }
      }
    }
    
    if (newData.context?.actionProposals) {
      const proposals = newData.context.actionProposals;
      if (proposals.length > 0) {
        const lastProposal = proposals[proposals.length - 1];
        console.log(`[SYNC] Publishing ACTION:`, lastProposal.text?.slice(0, 30));
        
        await publishToSync('ACTION_PROPOSAL', newData);
        
        if (supabase && lastProposal.text) {
          try {
            const { error } = await supabase.from('actions').insert({
              ritual_id: currentRitualId,
              session_id: sessionId,
              role: role,
              silo_role: lastProposal.siloRole,
              text: lastProposal.text,
              timestamp: lastProposal.timestamp,
              weight: lastProposal.weight || 0.5,
            });
            
            if (error) {
              console.warn(`[SYNC] Action insert failed:`, error);
            } else {
              console.log(`[SYNC] Action insert success`);
            }
          } catch (e) {
            console.warn(`[SYNC] Action insert exception:`, e);
          }
        }
      }
    }
    if (newData.mermaidCode !== undefined || newData.frictionMap !== undefined) {
      console.log(`[SYNC] Publishing Mermaid/Friction update`);
      await publishToSync('DATA_UPDATE', newData);
    }
  }, [role, mergeState, sessionId, publishToSync]);
  
  const changePhase = useCallback(async (newPhase: RitualPhase) => {
    console.log(`[SYNC] Changing phase to: ${newPhase}`);
    
    setState((prev) => mergeState(prev, { currentPhase: newPhase }));
    
    await publishToSync('PHASE_CHANGE', { phase: newPhase });
  }, [mergeState, publishToSync]);
  
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