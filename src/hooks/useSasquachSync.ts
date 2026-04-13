import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, RitualPhase, RitualEvent, ParticipantRole } from '../types';
import { ITransport } from '../sync/transport';
import { BroadcastTransport } from '../sync/BroadcastTransport';

const initialState: RoomState = {
  roomId: 'forest-room-1',
  status: 'active',
  currentPhase: 'WHY',
  context: {
    whySummary: '',
    whyResponses: [],
    areaHeads: [],
    rootCauses: [],
  },
  mermaidCode: '',
  frictionMap: [],
};

export const useSasquachSync = (role: ParticipantRole) => {
  const [state, setState] = useState<RoomState>(initialState);
  const transportRef = useRef<ITransport | null>(null);

  // Initialize transport once
  if (!transportRef.current) {
    transportRef.current = new BroadcastTransport();
  }
  const transport = transportRef.current;

  const stateRef = useRef<RoomState>(state);
  
  // Sync ref with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Deep merge helper for local state updates
  const mergeState = useCallback((prev: RoomState, patch: Partial<RoomState>): RoomState => {
    const newState = { ...prev, ...patch };
    
    // Deep merge context to prevent overwriting arrays
    if (patch.context && prev.context) {
      const mergedContext = { ...prev.context, ...patch.context };
      
      // Generic Array Merge: Identify keys that are arrays and merge them instead of replacing
      Object.keys(patch.context).forEach((key) => {
        const k = key as keyof typeof patch.context;
        const incoming = patch.context[k];
        const current = prev.context[k];

        if (Array.isArray(incoming) && Array.isArray(current)) {
          // Merge logic with duplicate detection
          const merged = [...current];
          incoming.forEach((item: any) => {
            // Duplicate detection: matches on role + timestamp if available, otherwise exact match
            const isDuplicate = merged.some(existing => {
              if (item?.timestamp && item?.role) {
                return existing?.timestamp === item.timestamp && existing?.role === item.role;
              }
              return JSON.stringify(existing) === JSON.stringify(item);
            });
            
            if (!isDuplicate) {
              merged.push(item);
            }
          });
          (mergedContext as any)[k] = merged;
        }
      });

      newState.context = mergedContext;
    }
    return newState;
  }, []);

  // Handle incoming events
  useEffect(() => {
    const unsubscribe = transport.subscribe((event: RitualEvent) => {
      // Don't process our own events
      if (event.sender === role) return;

      console.log(`[useSasquachSync] Event received:`, event.type, 'from', event.sender);

      switch (event.type) {
        case 'SYNC_REQUEST':
          if (role === 'BOARD') {
            // The Board provides the GROUND TRUTH from its current ref value
            transport.publish({
              type: 'SYNC_RESPONSE',
              payload: stateRef.current,
              sender: 'BOARD',
              timestamp: Date.now(),
            });
          }
          break;

        case 'SYNC_RESPONSE':
        case 'PHASE_CHANGE':
        case 'DATA_UPDATE':
          setState((prev) => mergeState(prev, event.payload));
          break;
        
        default:
          break;
      }
    });

    // Welcome Protocol: Late joiners (Pilots) request sync
    if (role !== 'BOARD') {
      transport.publish({
        type: 'SYNC_REQUEST',
        payload: {},
        sender: role,
        timestamp: Date.now(),
      });
    }

    return () => {
      unsubscribe();
    };
  }, [role, transport, mergeState]);

  // Actions
  const updateData = useCallback((newData: Partial<RoomState>) => {
    setState((prev) => mergeState(prev, newData));
    
    transport.publish({
      type: 'DATA_UPDATE',
      payload: newData,
      sender: role,
      timestamp: Date.now(),
    });
  }, [role, transport, mergeState]);

  const changePhase = useCallback((newPhase: RitualPhase) => {
    const payload = { currentPhase: newPhase };
    setState((prev) => mergeState(prev, payload));

    transport.publish({
      type: 'PHASE_CHANGE',
      payload,
      sender: role,
      timestamp: Date.now(),
    });
  }, [role, transport, mergeState]);

  return {
    state,
    updateData,
    changePhase,
    role,
    isBoard: role === 'BOARD'
  };
};
