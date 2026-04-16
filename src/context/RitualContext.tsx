import React, { createContext } from 'react';
import { RoomState, RitualPhase, ParticipantRole, RefortifySiloPayload } from '../types';
import { useSasquachSync } from '../hooks/useSasquachSync';

interface RitualContextType {
  state: RoomState;
  updateState: (update: Partial<RoomState>) => void;
  nextPhase: () => void;
  changePhase: (phase: RitualPhase) => void;
  refortifySilo: (payload: RefortifySiloPayload) => void;
  findMatchingSilo: (name: string) => { silo: any; similarity: number };
  role: ParticipantRole;
  sessionId: string;
  isBoard: boolean;
}

export const RitualContext = createContext<RitualContextType | undefined>(undefined);

export const RitualProvider: React.FC<{ children: React.ReactNode; role: ParticipantRole }> = ({ children, role }) => {
  const { state, updateData, changePhase, refortifySilo, findMatchingSilo, isBoard, sessionId } = useSasquachSync(role);

  const nextPhase = () => {
    const phases: RitualPhase[] = ['WHY', 'INQUIRY', 'CONVERGENCE', 'DESIGN'];
    const currentIndex = phases.indexOf(state.currentPhase);
    if (currentIndex < phases.length - 1) {
      changePhase(phases[currentIndex + 1]);
    }
  };

  const handleRefortifySilo = (payload: RefortifySiloPayload) => {
    refortifySilo({ ...payload, sessionId });
  };

  const handleUpdateState = (update: Partial<RoomState>) => {
    console.log(`[RITUAL_CONTEXT] updateState called with keys:`, Object.keys(update));
    if (update.context?.areaHeads) {
      console.log(`[RITUAL_CONTEXT] areaHeads in update:`, update.context.areaHeads.map((a: any) => a.role));
    }
    updateData(update);
  };

  return (
    <RitualContext.Provider value={{ 
      state, 
      updateState: handleUpdateState, 
      nextPhase,
      changePhase,
      refortifySilo: handleRefortifySilo,
      findMatchingSilo,
      role,
      sessionId,
      isBoard
    }}>
      {children}
    </RitualContext.Provider>
  );
};
