import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, RitualPhase, RitualEvent, ParticipantRole, AreaHead, RefortifySiloPayload, Voter } from '../types';
import { ITransport } from '../sync/transport';
import { BroadcastTransport } from '../sync/BroadcastTransport';
import { createSupabaseTransport } from '../sync/SupabaseTransport';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY);

const SIMILARITY_THRESHOLD = 0.8;

const getRitualIdFromUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get('room');
  if (roomParam && roomParam.trim()) {
    return roomParam.trim().toUpperCase();
  }
  return 'LOBBY';
};

const getChannelName = (ritualId: string): string => `sasquach_ritual_${ritualId}`;

const ritualIdGlobal = getRitualIdFromUrl();
const CHANNEL_NAME = getChannelName(ritualIdGlobal);

console.log(`[RITUAL_ID] Initialized with ritualId: "${ritualIdGlobal}", channel: "${CHANNEL_NAME}"`);

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

const findMatchingSilo = (
  silos: AreaHead[],
  newName: string
): { silo: AreaHead | null; similarity: number } => {
  const normalizedNew = normalizeSiloName(newName);
  let bestMatch: AreaHead | null = null;
  let bestSimilarity = 0;
  
  for (const silo of silos) {
    if (silo.status === 'discarded') continue;
    
    const normalizedExisting = normalizeSiloName(silo.role);
    
    if (normalizedNew === normalizedExisting) {
      console.log(`[FIND_MATCH] Exact match: "${normalizedNew}" === "${normalizedExisting}"`);
      return { silo, similarity: 1.0 };
    }
    
    const similarity = calculateSimilarity(silo.role, newName);
    console.log(`[FIND_MATCH] Comparing "${normalizedNew}" with "${normalizedExisting}": similarity=${similarity.toFixed(2)}`);
    
    if (similarity > bestSimilarity && similarity >= SIMILARITY_THRESHOLD) {
      bestSimilarity = similarity;
      bestMatch = silo;
    }
  }
  
  if (bestMatch) {
    console.log(`[FIND_MATCH] Best match: "${bestMatch.role}" with similarity ${bestSimilarity.toFixed(2)}`);
  } else {
    console.log(`[FIND_MATCH] No match found for "${normalizedNew}" (threshold: ${SIMILARITY_THRESHOLD})`);
  }
  
  return { silo: bestMatch, similarity: bestSimilarity };
};

const initialState: RoomState = {
  roomId: 'forest-room-1',
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
  
  const [currentRitualId, setCurrentRitualId] = useState<string>(() => getRitualIdFromUrl());
  const currentRitualIdRef = useRef<string>(currentRitualId);
  currentRitualIdRef.current = currentRitualId;
  
  const getSessionId = (): string => {
    const STORAGE_KEY = 'sasquach_voter_id';
    let sessionId = localStorage.getItem(STORAGE_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, sessionId);
      console.log(`[SESSION] New sessionId generated and stored: ${sessionId}`);
    } else {
      console.log(`[SESSION] Restored sessionId from storage: ${sessionId}`);
    }
    return sessionId;
  };
  
  const sessionIdRef = useRef<string>(getSessionId());
  const sessionId = sessionIdRef.current;

  // CREAR TRANSPORT INMEDIATAMENTE (no en useEffect)
  const transportRef = useRef<ITransport | null>(null);
  const getOrCreateTransport = (): ITransport => {
    if (!transportRef.current) {
      if (USE_SUPABASE) {
        transportRef.current = createSupabaseTransport(SUPABASE_URL, SUPABASE_KEY, currentRitualId);
        console.log(`[SYNC] Using Supabase transport for ritual: "${currentRitualId}"`);
      } else {
        const channelName = getChannelName(currentRitualId);
        transportRef.current = new BroadcastTransport(channelName);
        console.log(`[SYNC] Using BroadcastChannel: "${channelName}" (ritualId: "${currentRitualId}")`);
      }
    }
    return transportRef.current;
  };
  const transport = getOrCreateTransport();

  useEffect(() => {
    let isUpdating = false;
    
    const handleUrlChange = () => {
      if (isUpdating) return;
      
      const newRitualId = getRitualIdFromUrl();
      const currentId = currentRitualIdRef.current;
      
      console.log(`[URL_SYNC] URL changed. New ritualId: "${newRitualId}", current: "${currentId}"`);
      
      if (newRitualId !== currentId) {
        isUpdating = true;
        console.log(`[URL_SYNC] Ritual ID changed from "${currentId}" to "${newRitualId}"`);
        
        if (transportRef.current) {
          console.log(`[URL_SYNC] Closing old transport channel`);
          transportRef.current.close();
          transportRef.current = null;
        }
        
        const newChannelName = getChannelName(newRitualId);
        transportRef.current = new BroadcastTransport(newChannelName);
        console.log(`[URL_SYNC] Created new transport with channel: "${newChannelName}"`);
        
        setCurrentRitualId(newRitualId);
        currentRitualIdRef.current = newRitualId;
        
        setState((prev) => ({
          ...prev,
          context: {
            ...prev.context,
            ritualId: newRitualId,
          },
        }));
        
        setTimeout(() => { isUpdating = false; }, 100);
      }
    };
    
    window.addEventListener('popstate', handleUrlChange);
    const intervalId = setInterval(handleUrlChange, 500);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(intervalId);
    };
  }, []);

  const stateRef = useRef<RoomState>(state);
  
  useEffect(() => {
    stateRef.current = state;
    console.log(`[USE_SASQUACH_SYNC] State updated. currentPhase: ${state.currentPhase}, areaHeads: ${state.context.areaHeads.length}`);
  }, [state]);

  const mergeState = useCallback((prev: RoomState, patch: Partial<RoomState>): RoomState => {
    const newState = { ...prev, ...patch };
    
    if (patch.context && prev.context) {
      const mergedContext = { ...prev.context };
      const patchContext = patch.context;
      
      (Object.keys(patchContext) as Array<keyof typeof patchContext>).forEach((key) => {
        const incoming = patchContext[key];
        const current = prev.context[key];

        if (key === 'areaHeads' && Array.isArray(incoming) && Array.isArray(current)) {
          const prevHeads = current as AreaHead[];
          const incomingHeads = incoming as AreaHead[];
          
          if (incomingHeads.length === 0) {
            console.log(`[MERGE_STATE] areaHeads: Incoming is empty, keeping existing: ${prevHeads.length}`);
            return;
          }
          
          console.log(`[MERGE_STATE] areaHeads: Merging by role. Previous: ${prevHeads.length}, Incoming: ${incomingHeads.length}`);
          console.log(`[MERGE_STATE] Previous areaHeads:`, prevHeads.map(a => a.role));
          console.log(`[MERGE_STATE] Incoming areaHeads:`, incomingHeads.map(a => a.role));
          
          const merged = [...prevHeads];
          incomingHeads.forEach((incomingSilo) => {
            const existingIndex = merged.findIndex(s => s.role === incomingSilo.role);
            if (existingIndex >= 0) {
              if (incomingSilo.weight > merged[existingIndex].weight) {
                merged[existingIndex] = incomingSilo;
              }
            } else {
              merged.push(incomingSilo);
            }
          });
          
          mergedContext.areaHeads = merged;
          return;
        }

        if (key === 'actionProposals' && Array.isArray(incoming) && Array.isArray(current)) {
          const prevProposals = current as any[];
          const incomingProposals = incoming as any[];
          console.log(`[MERGE_STATE] actionProposals: Merging. Previous: ${prevProposals.length}, Incoming: ${incomingProposals.length}`);
          console.log(`[MERGE_STATE] Previous proposals:`, prevProposals.map((p: any) => p.text?.slice(0, 20)));
          console.log(`[MERGE_STATE] Incoming proposals:`, incomingProposals.map((p: any) => p.text?.slice(0, 20)));
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
          (mergedContext as any)[key] = merged;
        } else if (key === 'selectedSilo') {
          (mergedContext as any)[key] = incoming;
          console.log(`[MERGE_STATE] selectedSilo merged: "${incoming}"`);
        } else {
          (mergedContext as any)[key] = incoming;
        }
      });

      newState.context = mergedContext;
    }
    console.log(`[MERGE_STATE] State merge complete. areaHeads: ${newState.context.areaHeads.map(a => a.role).join(', ')}`);
    return newState;
  }, []);

  const handleRefortifySilo = useCallback((payload: RefortifySiloPayload) => {
    const { areaName, successMetric, voterRole, sessionId: voterSessionId } = payload;
    
    console.log(`[REFORTIFY] === INICIO ===`);
    console.log(`[REFORTIFY] Payload received:`, { areaName, successMetric, voterRole, voterSessionId });
    
    const currentSilos = stateRef.current.context.areaHeads;
    console.log(`[REFORTIFY] Current silos in state:`, currentSilos.length);
    currentSilos.forEach((s, i) => {
      console.log(`[REFORTIFY]   [${i}] "${s.role}" - votedBy: ${s.votedBy.map(v => `${v.role}:${v.sessionId.slice(0,8)}`).join(', ')}, weight: ${s.weight}`);
    });
    
    const { silo: matchingSilo } = findMatchingSilo(currentSilos, areaName);
    
    if (matchingSilo) {
      console.log(`[REFORTIFY] Match found: "${matchingSilo.role}"`);
      console.log(`[REFORTIFY] Current votedBy:`, matchingSilo.votedBy.map(v => `${v.role}:${v.sessionId.slice(0,8)}`));
      console.log(`[REFORTIFY] voterRole to check: "${voterRole}", sessionId: "${voterSessionId?.slice(0,8)}"`);
      
      const alreadyVoted = matchingSilo.votedBy.some(v => v.role === voterRole && v.sessionId === voterSessionId);
      console.log(`[REFORTIFY] Already voted? ${alreadyVoted}`);
      
      if (alreadyVoted) {
        console.log(`[REFORTIFY] BLOCKING - ${voterRole}:${voterSessionId?.slice(0,8)} already voted for this silo`);
        console.log(`[REFORTIFY] === FIN (BLOQUEADO) ===`);
        return;
      }
      
      const newWeight = Math.min(1, matchingSilo.weight + 0.15);
      console.log(`[REFORTIFY] Weight: ${matchingSilo.weight} -> ${newWeight}`);
      
      const newVoter: Voter = {
        role: voterRole,
        sessionId: voterSessionId || sessionId,
        timestamp: Date.now(),
      };
      
      const updatedSilos = currentSilos.map(s => 
        s.role === matchingSilo.role
          ? { ...s, weight: newWeight, votedBy: [...s.votedBy, newVoter] }
          : s
      );
      
      console.log(`[REFORTIFY] Updating silo "${matchingSilo.role}" with new votedBy`);
      console.log(`[REFORTIFY] === FIN (ACTUALIZADO) ===`);
      
      setState(prev => mergeState(prev, { context: { ...prev.context, areaHeads: updatedSilos } }));
      
      transport.publish({
        type: 'DATA_UPDATE',
        payload: { context: { ...stateRef.current.context, areaHeads: updatedSilos } },
        sender: role,
        timestamp: Date.now(),
        sessionId,
      } as any);
    } else {
      console.log(`[REFORTIFY] No match found - creating new silo`);
      
      const newVoter: Voter = {
        role: voterRole,
        sessionId: voterSessionId || sessionId,
        timestamp: Date.now(),
      };
      
      const newSilo: AreaHead = {
        role: areaName,
        successMetric: successMetric || '',
        weight: 1,
        status: 'active',
        votedBy: [newVoter],
      };
      
      console.log(`[REFORTIFY] New silo:`, newSilo);
      console.log(`[REFORTIFY] === FIN (NUEVO) ===`);
      
      const updatedSilos = [...currentSilos, newSilo];
      
      setState(prev => mergeState(prev, { context: { ...prev.context, areaHeads: updatedSilos } }));
      
      transport.publish({
        type: 'DATA_UPDATE',
        payload: { context: { ...stateRef.current.context, areaHeads: updatedSilos } },
        sender: role,
        timestamp: Date.now(),
        sessionId,
      } as any);
    }
  }, [mergeState, role, transport, sessionId]);

  useEffect(() => {
    const unsubscribe = transport.subscribe((event: RitualEvent) => {
      const eventSessionId = (event as any).sessionId;
      const eventRitualId = (event.payload as any)?.context?.ritualId;
      
      if (eventRitualId && eventRitualId !== currentRitualId) {
        console.log(`[SUBSCRIBE] ⛔ Ignoring event from different ritual: "${eventRitualId}" (my ritual: "${currentRitualId}")`);
        return;
      }
      
      const eventSender = (event as any).sender;
      const isSameSession = eventSessionId === sessionId;
      const isSameRole = eventSender === role;
      
      if (isSameSession && isSameRole) {
        console.log(`[SUBSCRIBE] ⛔ Ignoring own event (same session AND role): ${event.type} from ${event.sender} (session: ${eventSessionId?.slice(0,8) || 'unknown'}, mySession: ${sessionId.slice(0,8)})`);
        return;
      }
      
      if (isSameSession && !isSameRole) {
        console.log(`[SUBSCRIBE] ✓ Accepting event from different role, same session: ${event.type} from ${event.sender} (my role: ${role})`);
      }

      console.log(`[SUBSCRIBE] Event received: ${event.type} from ${event.sender} (session: ${eventSessionId?.slice(0,8) || 'unknown'}, ritual: ${eventRitualId || 'unknown'})`);

      switch (event.type) {
        case 'SYNC_REQUEST':
          console.log(`[SUBSCRIBE] Sending SYNC_RESPONSE as BOARD`);
          if (role === 'BOARD') {
            transport.publish({
              type: 'SYNC_RESPONSE',
              payload: stateRef.current,
              sender: 'BOARD',
              timestamp: Date.now(),
              sessionId,
            } as any);
          }
          break;

        case 'SYNC_RESPONSE': {
          console.log(`[SUBSCRIBE] Processing SYNC_RESPONSE, updating state`);
          console.log(`[SUBSCRIBE]   selectedSilo in SYNC: "${(event.payload as any)?.context?.selectedSilo}"`);
          const payload = event.payload as Partial<RoomState>;
          
          const needsSchemaMigration = payload.context?.areaHeads?.some(
            (ah: any) => Array.isArray(ah.votedBy) && typeof ah.votedBy[0] === 'string'
          );
          
          if (needsSchemaMigration) {
            console.log(`[SUBSCRIBE] Detected old schema (votedBy as strings), migrating to new schema`);
            const migratedPayload: Partial<RoomState> = {
              ...payload,
              context: {
                ritualId: ritualIdGlobal,
                whySummary: payload.context?.whySummary || '',
                whyResponses: payload.context?.whyResponses || [],
                rootCauses: payload.context?.rootCauses || [],
                areaHeads: [],
                actionProposals: [],
                selectedSilo: null,
                ruptureCommitment: null,
              },
            };
            setState((prev) => mergeState(prev, migratedPayload));
          } else {
            setState((prev) => mergeState(prev, payload));
          }
          break;
        }

        case 'PHASE_CHANGE':
          console.log(`[SUBSCRIBE] Phase changing to:`, (event.payload as any)?.currentPhase);
          setState((prev) => mergeState(prev, event.payload as Partial<RoomState>));
          break;

        case 'DATA_UPDATE': {
          console.log(`[SUBSCRIBE] Processing DATA_UPDATE`);
          console.log(`[SUBSCRIBE]   areaHeads in payload:`, (event.payload as any)?.context?.areaHeads?.length || 0);
          console.log(`[SUBSCRIBE]   selectedSilo in payload: "${(event.payload as any)?.context?.selectedSilo}"`);
          const payload = event.payload as Partial<RoomState>;
          
          const needsSchemaMigration = payload.context?.areaHeads?.some(
            (ah: any) => Array.isArray(ah.votedBy) && typeof ah.votedBy[0] === 'string'
          );
          
          if (needsSchemaMigration) {
            console.log(`[SUBSCRIBE] Detected old schema in DATA_UPDATE, migrating to new schema`);
            const migratedPayload: Partial<RoomState> = {
              ...payload,
              context: {
                ritualId: ritualIdGlobal,
                whySummary: payload.context?.whySummary || '',
                whyResponses: payload.context?.whyResponses || [],
                rootCauses: payload.context?.rootCauses || [],
                areaHeads: [],
                actionProposals: [],
                selectedSilo: null,
                ruptureCommitment: null,
              },
            };
            setState((prev) => mergeState(prev, migratedPayload));
          } else {
            setState((prev) => mergeState(prev, payload));
          }
          break;
        }
        
        case 'REFORTIFY_SILO':
          console.log(`[SUBSCRIBE] Processing REFORTIFY_SILO from ${event.sender}`);
          handleRefortifySilo(event.payload as RefortifySiloPayload);
          break;
        
        default:
          console.log(`[SUBSCRIBE] Unknown event type: ${event.type}`);
          break;
      }
    });

    if (role !== 'BOARD') {
      console.log(`[INIT] ${role} requesting SYNC`);
      transport.publish({
        type: 'SYNC_REQUEST',
        payload: {},
        sender: role,
        timestamp: Date.now(),
        sessionId,
      } as any);
    } else {
      console.log(`[INIT] BOARD initialized`);
    }

    return () => {
      unsubscribe();
    };
  }, [role, transport, mergeState, handleRefortifySilo, sessionId]);

  const updateData = useCallback((newData: Partial<RoomState>) => {
    console.log(`[UPDATE_DATA] === BEGIN ===`);
    console.log(`[UPDATE_DATA] Sending update:`, Object.keys(newData));
    if (newData.context?.areaHeads) {
      console.log(`[UPDATE_DATA] areaHeads in update:`, newData.context.areaHeads.map(a => a.role));
    }
    if (newData.context?.selectedSilo !== undefined) {
      console.log(`[UPDATE_DATA] selectedSilo in update: "${newData.context.selectedSilo}"`);
    }
    
    setState((prev) => {
      const newState = mergeState(prev, newData);
      console.log(`[UPDATE_DATA] State merged. New areaHeads count:`, newState.context.areaHeads.length);
      console.log(`[UPDATE_DATA] New areaHeads:`, newState.context.areaHeads.map(a => a.role));
      console.log(`[UPDATE_DATA] selectedSilo is now: "${newState.context.selectedSilo}"`);
      console.log(`[UPDATE_DATA] === END ===`);
      return newState;
    });
    
    console.log(`[UPDATE_DATA] setState called. Transport publish queued.`);
    
    const enrichedData = {
      ...newData,
      context: {
        ...newData.context,
        ritualId: currentRitualId,
      },
    };
    
    transport.publish({
      type: 'DATA_UPDATE',
      payload: enrichedData,
      sender: role,
      timestamp: Date.now(),
      sessionId,
    } as any);
  }, [role, transport, mergeState, sessionId]);

  const changePhase = useCallback((newPhase: RitualPhase) => {
    console.log(`[CHANGE_PHASE] Changing to: ${newPhase}`);
    const payload = { currentPhase: newPhase };
    setState((prev) => mergeState(prev, payload));

    transport.publish({
      type: 'PHASE_CHANGE',
      payload,
      sender: role,
      timestamp: Date.now(),
      sessionId,
    } as any);
  }, [role, transport, mergeState, sessionId]);

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
