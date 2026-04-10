import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { RoomState, RitualPhase, RitualEvent } from '../types';
import { ITransport } from '../sync/transport';
import { BroadcastTransport } from '../sync/BroadcastTransport';

interface RitualContextType {
  state: RoomState;
  updateState: (update: Partial<RoomState>) => void;
  nextPhase: () => void;
  isPilot: boolean;
  isBoard: boolean;
}

const initialState: RoomState = {
  roomId: 'forest-room-1',
  status: 'active',
  currentPhase: 'WHY',
  context: {
    whySummary: '',
    areaHeads: [],
    rootCauses: [],
  },
  mermaidCode: '',
  frictionMap: [],
};

const RitualContext = createContext<RitualContextType | undefined>(undefined);

export const RitualProvider: React.FC<{ children: React.ReactNode; mode: 'board' | 'pilot' }> = ({ children, mode }) => {
  const [state, setState] = useState<RoomState>(initialState);
  
  // Agnostic transport
  const transport = useMemo<ITransport>(() => new BroadcastTransport(), []);

  useEffect(() => {
    // Listen for sync events
    const unsubscribe = transport.subscribe((event) => {
      // Only process events from the other side
      if (event.sender !== mode.toUpperCase()) {
        setState((prev) => ({ ...prev, ...event.payload }));
      }
    });

    return () => {
      unsubscribe();
      transport.close();
    };
  }, [transport, mode]);

  const updateState = (update: Partial<RoomState>) => {
    setState((prev) => {
      const newState = { ...prev, ...update };
      // Broadcast update
      transport.publish({
        type: 'DATA_UPDATE',
        payload: update,
        sender: mode.toUpperCase() as 'BOARD' | 'PILOT',
      });
      return newState;
    });
  };

  const nextPhase = () => {
    const phases: RitualPhase[] = ['WHY', 'INQUIRY', 'CONVERGENCE', 'DESIGN'];
    const currentIndex = phases.indexOf(state.currentPhase);
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      updateState({ currentPhase: nextPhase });
    }
  };

  return (
    <RitualContext.Provider value={{ 
      state, 
      updateState, 
      nextPhase,
      isPilot: mode === 'pilot',
      isBoard: mode === 'board'
    }}>
      {children}
    </RitualContext.Provider>
  );
};

export const useRitual = () => {
  const context = useContext(RitualContext);
  if (!context) throw new Error('useRitual must be used within a RitualProvider');
  return context;
};
