'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRitual } from '@/lib/hooks/useRitual';
import { useConvergence } from '@/lib/hooks/useConvergence';

// Phase Components
import { WhyPhase } from './phases/WhyPhase';
import { InquiryPhase } from './phases/InquiryPhase';
import { ActionPhase } from './phases/ActionPhase';
import { ConvergencePhase } from './phases/ConvergencePhase';
import { DesignPhase } from './phases/DesignPhase';

export const PilotView: React.FC = () => {
  const { 
    state, 
    updateState, 
    role, 
    sessionId, 
    refortifySilo,
    submitFact,
    validateCause,
    isValidationGateCleared 
  } = useRitual();
  
  const { whyResponses, reinforceWhyEntry, areaHeads } = useConvergence();

  const renderCurrentPhase = () => {
    switch (state.currentPhase) {
      case 'WHY':
        return (
          <WhyPhase 
            key="why"
            role={role}
            whyResponses={whyResponses}
            updateState={updateState}
            reinforceWhyEntry={reinforceWhyEntry}
            state={state}
          />
        );
      
      case 'INQUIRY':
        return (
          <InquiryPhase 
            key="inquiry"
            role={role}
            sessionId={sessionId}
            areaHeads={areaHeads}
            refortifySilo={refortifySilo}
            state={state}
          />
        );

      case 'CONVERGENCE':
        return (
          <ConvergencePhase 
            key="convergence"
            role={role}
            state={state}
            submitFact={submitFact}
            validateCause={validateCause}
            isValidationGateCleared={isValidationGateCleared}
          />
        );

      case 'ACTION':
        return (
          <ActionPhase 
            key="action"
            role={role}
            sessionId={sessionId}
            selectedSiloRole={state.context.selectedSilo}
            areaHeads={areaHeads}
            updateState={updateState}
            state={state}
          />
        );

      case 'DESIGN':
        return (
          <DesignPhase 
            key="design"
            role={role}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center py-20 text-stone-500 italic">
            Esperando instrucciones del Oráculo...
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto relative px-5 py-6 overflow-hidden min-h-screen">
      <AnimatePresence mode="wait">
        {renderCurrentPhase()}
      </AnimatePresence>
    </div>
  );
};
