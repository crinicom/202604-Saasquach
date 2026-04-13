import React, { createContext, useContext } from 'react';
import { RoomState, RitualPhase, ParticipantRole } from '../types';
import { useSasquachSync } from '../hooks/useSasquachSync';

interface RitualContextType {
  state: RoomState;
  updateState: (update: Partial<RoomState>) => void;
  nextPhase: () => void;
  role: ParticipantRole;
  isBoard: boolean;
}

const RitualContext = createContext<RitualContextType | undefined>(undefined);

export const RitualProvider: React.FC<{ children: React.ReactNode; role: ParticipantRole }> = ({ children, role }) => {
  const { state, updateData, changePhase, isBoard } = useSasquachSync(role);

  const nextPhase = () => {
    const phases: RitualPhase[] = ['WHY', 'INQUIRY', 'CONVERGENCE', 'DESIGN'];
    const currentIndex = phases.indexOf(state.currentPhase);
    if (currentIndex < phases.length - 1) {
      changePhase(phases[currentIndex + 1]);
    }
  };

  return (
    <RitualContext.Provider value={{ 
      state, 
      updateState: updateData, 
      nextPhase,
      role,
      isBoard
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
