'use client';

import React from 'react';
const { createContext, useMemo, useCallback } = React;
import { RoomState, RitualPhase, ParticipantRole, RefortifySiloPayload, TenantConfig, DEFAULT_TENANT_CONFIG } from '@/lib/types';
import { useSasquachSync } from '@/lib/hooks/useSasquachSync';

interface RitualContextType {
  state: RoomState;
  updateState: (update: Partial<RoomState>) => void;
  nextPhase: () => void;
  changePhase: (phase: RitualPhase) => void;
  refortifySilo: (payload: RefortifySiloPayload) => void;
  findMatchingSilo: (name: string) => { silo: any; similarity: number };
  submitFact: (rootCauseId: string, text: string) => void;
  validateCause: (rootCauseId: string) => void;
  isValidationGateCleared: () => boolean;
  role: ParticipantRole;
  sessionId: string;
  ritualId: string;
  isBoard: boolean;
  tenantConfig: TenantConfig;
}

export const RitualContext = createContext<RitualContextType | undefined>(undefined);

export const useRitual = () => {
  const context = React.useContext(RitualContext);
  if (context === undefined) {
    throw new Error('useRitual must be used within a RitualProvider');
  }
  return context;
};

const getTenantConfigFromRitualId = (ritualId: string): TenantConfig => {
  const tenants: Record<string, TenantConfig> = {
    'LOBBY': {
      primaryColor: '#059669',
      secondaryColor: '#c3a343',
      primaryGradient: 'radial-gradient(circle at center, rgba(6, 78, 59, 0.4) 0%, rgba(2, 6, 23, 1) 70%)',
      glowColor: 'rgba(6, 78, 59, 0.3)',
      institutionName: 'Sasquach Original',
      ritualTagline: 'Motor de Ejecución Clínica',
    },
    'URGENCIAS': {
      primaryColor: '#dc2626',
      secondaryColor: '#f59e0b',
      primaryGradient: 'radial-gradient(circle at center, rgba(220, 38, 38, 0.4) 0%, rgba(2, 6, 23, 1) 70%)',
      glowColor: 'rgba(220, 38, 38, 0.3)',
      institutionName: 'Sala de Urgencias',
      ritualTagline: 'Decisiones que Salvan Vidas',
    },
    'LAB': {
      primaryColor: '#2563eb',
      secondaryColor: '#06b6d4',
      primaryGradient: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.4) 0%, rgba(2, 6, 23, 1) 70%)',
      glowColor: 'rgba(37, 99, 235, 0.3)',
      institutionName: 'Laboratorio Central',
      ritualTagline: 'Precisión Diagnóstica',
    },
    'UCI': {
      primaryColor: '#7c3aed',
      secondaryColor: '#ec4899',
      primaryGradient: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.4) 0%, rgba(2, 6, 23, 1) 70%)',
      glowColor: 'rgba(124, 58, 237, 0.3)',
      institutionName: 'Unidad de Cuidados Intensivos',
      ritualTagline: 'Vigilancia Crítica',
    },
    'QUIRÓFANO': {
      primaryColor: '#0891b2',
      secondaryColor: '#ffffff',
      primaryGradient: 'radial-gradient(circle at center, rgba(8, 145, 178, 0.4) 0%, rgba(2, 6, 23, 1) 70%)',
      glowColor: 'rgba(8, 145, 178, 0.3)',
      institutionName: 'Block Quirúrgico',
      ritualTagline: 'Excelencia Quirúrgica',
    },
  };
  
  return tenants[ritualId] || { ...DEFAULT_TENANT_CONFIG, institutionName: ritualId };
};

export const RitualProvider: React.FC<{ children: React.ReactNode; role: ParticipantRole }> = ({ children, role }) => {
  const { state, updateData, changePhase, refortifySilo, findMatchingSilo, isBoard, sessionId, ritualId } = useSasquachSync(role);

  const tenantConfig = useMemo(() => getTenantConfigFromRitualId(ritualId), [ritualId]);

  const isValidationGateCleared = useCallback(() => {
    // Current gate: Transition from CONVERGENCE to ACTION or DESIGN requires validated causes
    if (state.currentPhase !== 'CONVERGENCE') return true;

    const validatedCauses = state.context.rootCauses.filter(c => c.status === 'validated');
    if (validatedCauses.length === 0) return false;

    // Rule: At least one cause must have facts from 2 different roles
    return validatedCauses.some(cause => {
      const facts = state.context.verifiableFacts.filter(f => f.rootCauseId === cause.id);
      const roles = new Set(facts.map(f => f.role));
      return facts.length >= 2 && roles.size >= 2;
    });
  }, [state.context.rootCauses, state.context.verifiableFacts, state.currentPhase]);

  const nextPhase = () => {
    if (!isValidationGateCleared()) {
      console.warn('[VALIDATION_GATE] Phase transition blocked. Insufficient clinical evidence.');
      return;
    }

    const phases: RitualPhase[] = ['WHY', 'INQUIRY', 'CONVERGENCE', 'ACTION', 'DESIGN'];
    const currentIndex = phases.indexOf(state.currentPhase);
    if (currentIndex < phases.length - 1) {
      changePhase(phases[currentIndex + 1]);
    }
  };

  const submitFact = (rootCauseId: string, text: string) => {
    const newFact = {
      id: crypto.randomUUID(),
      rootCauseId,
      text,
      role,
      sessionId,
      timestamp: Date.now(),
    };
    
    handleUpdateState({
      context: {
        ...state.context,
        verifiableFacts: [...state.context.verifiableFacts, newFact]
      }
    });
  };

  const validateCause = (rootCauseId: string) => {
    const updatedCauses = state.context.rootCauses.map(c => 
      c.id === rootCauseId ? { ...c, status: 'validated' as const } : c
    );
    
    handleUpdateState({
      context: {
        ...state.context,
        rootCauses: updatedCauses
      }
    });
  };

  const handleRefortifySilo = useCallback((payload: RefortifySiloPayload) => {
    refortifySilo({ ...payload, sessionId });
  }, [refortifySilo, sessionId]);

  const handleUpdateState = useCallback((update: Partial<RoomState>) => {
    console.log(`[RITUAL_CONTEXT] updateState called with keys:`, Object.keys(update));
    if (update.context?.areaHeads) {
      console.log(`[RITUAL_CONTEXT] areaHeads in update:`, update.context.areaHeads.map((a: any) => a.role));
    }
    updateData(update);
  }, [updateData]);

  return (
    <RitualContext.Provider value={{ 
      state, 
      updateState: handleUpdateState, 
      nextPhase,
      changePhase,
      refortifySilo: handleRefortifySilo,
      findMatchingSilo,
      submitFact,
      validateCause,
      isValidationGateCleared,
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
