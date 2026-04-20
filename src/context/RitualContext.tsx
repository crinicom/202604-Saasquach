import React, { createContext, useMemo } from 'react';
import { RoomState, RitualPhase, ParticipantRole, RefortifySiloPayload, TenantConfig, DEFAULT_TENANT_CONFIG } from '../types';
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
  ritualId: string;
  isBoard: boolean;
  tenantConfig: TenantConfig;
}

export const RitualContext = createContext<RitualContextType | undefined>(undefined);

const getTenantConfigFromRitualId = (ritualId: string): TenantConfig => {
  const tenants: Record<string, TenantConfig> = {
    'LOBBY': {
      primaryColor: '#059669',
      secondaryColor: '#c3a343',
      institutionName: 'Sasquach Original',
      ritualTagline: 'Motor de Ejecución Clínica',
    },
    'URGENCIAS': {
      primaryColor: '#dc2626',
      secondaryColor: '#f59e0b',
      institutionName: 'Sala de Urgencias',
      ritualTagline: 'Decisiones que Salvan Vidas',
    },
    'LAB': {
      primaryColor: '#2563eb',
      secondaryColor: '#06b6d4',
      institutionName: 'Laboratorio Central',
      ritualTagline: 'Precisión Diagnóstica',
    },
    'UCI': {
      primaryColor: '#7c3aed',
      secondaryColor: '#ec4899',
      institutionName: 'Unidad de Cuidados Intensivos',
      ritualTagline: 'Vigilancia Crítica',
    },
    'QUIRÓFANO': {
      primaryColor: '#0891b2',
      secondaryColor: '#ffffff',
      institutionName: 'Block Quirúrgico',
      ritualTagline: 'Excelencia Quirúrgica',
    },
  };
  
  return tenants[ritualId] || { ...DEFAULT_TENANT_CONFIG, institutionName: ritualId };
};

export const RitualProvider: React.FC<{ children: React.ReactNode; role: ParticipantRole }> = ({ children, role }) => {
  const { state, updateData, changePhase, refortifySilo, findMatchingSilo, isBoard, sessionId, ritualId } = useSasquachSync(role);

  const tenantConfig = useMemo(() => getTenantConfigFromRitualId(ritualId), [ritualId]);

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
      ritualId,
      isBoard,
      tenantConfig,
    }}>
      {children}
    </RitualContext.Provider>
  );
};
