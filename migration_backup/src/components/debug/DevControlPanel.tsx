import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitual } from '../../hooks/useRitual';
import { navigateTo } from '../../utils/navigation';
import { ParticipantRole } from '../../types';

export const DevControlPanel: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const { state, updateState, changePhase, ritualId, tenantConfig } = useRitual();

  const handleChangeRoom = () => {
    const newRoomId = roomInput.trim().toUpperCase() || 'LOBBY';
    navigateTo({ room: newRoomId });
  };

  const handleQuickRoomChange = (room: string) => {
    navigateTo({ room });
  };

  const handleReset = () => {
    updateState({
      context: {
        ritualId: state.context.ritualId,
        whySummary: '',
        whyResponses: [],
        areaHeads: [],
        rootCauses: [],
        actionProposals: [],
        selectedSilo: null,
        ruptureCommitment: null,
      },
      currentPhase: 'WHY',
    });
  };

  const handleWipeEmergency = () => {
    updateState({
      context: {
        ritualId: state.context.ritualId,
        whySummary: '',
        whyResponses: [],
        areaHeads: [],
        rootCauses: [],
        actionProposals: [],
        selectedSilo: null,
        ruptureCommitment: null,
      },
      currentPhase: 'WHY',
    });
  };

  const generateVoter = (role: ParticipantRole) => ({
    role,
    sessionId: Math.random().toString(36).substring(2, 15),
    timestamp: Date.now(),
  });

  const generateRandomVoters = (count: number) => {
    const roles: ParticipantRole[] = ['DOCTOR', 'NURSE', 'KINE', 'INFECTOLOGIST', 'ADMIN'];
    return Array.from({ length: count }, () => generateVoter(roles[Math.floor(Math.random() * roles.length)]));
  };

  const handleGenerateSiloConsensus = () => {
    const testSilos = [
      {
        role: 'Laboratorio',
        successMetric: 'Tiempo de procesamiento < 2 horas',
        weight: 0.7 + Math.random() * 0.2,
        status: 'active' as const,
        votedBy: generateRandomVoters(3 + Math.floor(Math.random() * 3)),
      },
      {
        role: 'Admisión',
        successMetric: 'Tiempo de espera < 15 minutos',
        weight: 0.6 + Math.random() * 0.3,
        status: 'active' as const,
        votedBy: generateRandomVoters(3 + Math.floor(Math.random() * 3)),
      },
      {
        role: 'Farmacia',
        successMetric: 'Disponibilidad de medicamentos 95%',
        weight: 0.6 + Math.random() * 0.3,
        status: 'active' as const,
        votedBy: generateRandomVoters(3 + Math.floor(Math.random() * 3)),
      },
    ];

    updateState({
      context: {
        ...state.context,
        areaHeads: testSilos,
      },
    });
  };

  const handleSimulateActionStorm = () => {
    const targetSilo = state.context.selectedSilo || 
      (state.context.areaHeads.length > 0 ? state.context.areaHeads[0].role : null);
    
    if (!targetSilo) {
      console.log('[SIMULATOR] No hay silos disponibles para atacar');
      return;
    }

    console.log('[SIMULATOR] Inyectando tormenta para:', targetSilo);

    if (state.context.selectedSilo !== targetSilo) {
      updateState({
        context: {
          ...state.context,
          selectedSilo: targetSilo,
        },
      });
    }

    if (state.currentPhase !== 'ACTION') {
      changePhase('ACTION');
    }

    const simulatedActions = [
      { id: `sim-${Date.now()}-1`, siloRole: targetSilo, role: 'DOCTOR' as ParticipantRole, sessionId: Math.random().toString(36).substring(2, 15), text: 'Kits quirúrgicos pre-armados', timestamp: Date.now(), weight: 0.8 },
      { id: `sim-${Date.now()}-2`, siloRole: targetSilo, role: 'NURSE' as ParticipantRole, sessionId: Math.random().toString(36).substring(2, 15), text: 'Validación por QR en pasillo', timestamp: Date.now() + 1, weight: 0.6 },
      { id: `sim-${Date.now()}-3`, siloRole: targetSilo, role: 'KINE' as ParticipantRole, sessionId: Math.random().toString(36).substring(2, 15), text: 'Checkpoint de lavado de manos', timestamp: Date.now() + 2, weight: 0.7 },
      { id: `sim-${Date.now()}-4`, siloRole: targetSilo, role: 'DOCTOR' as ParticipantRole, sessionId: Math.random().toString(36).substring(2, 15), text: 'Señalización de flujo unidireccional', timestamp: Date.now() + 3, weight: 0.55 },
      { id: `sim-${Date.now()}-5`, siloRole: targetSilo, role: 'INFECTOLOGIST' as ParticipantRole, sessionId: Math.random().toString(36).substring(2, 15), text: 'Automatización de altas médicas', timestamp: Date.now() + 4, weight: 0.65 },
    ];

    const existingActions = state.context.actionProposals || [];
    
    updateState({
      context: {
        ...state.context,
        selectedSilo: targetSilo,
        actionProposals: [...existingActions, ...simulatedActions],
      },
    });

    console.log('[SIMULATOR] Tormenta inyectada:', simulatedActions.length, 'acciones');
  };

  const handleResetResponses = () => {
    updateState({
      context: {
        ...state.context,
        whyResponses: [],
      },
    });
  };

  const handleAddTestResponses = () => {
    const testRoles = ['DOCTOR', 'NURSE', 'KINE', 'INFECTOLOGIST'] as ParticipantRole[];
    const testTexts = [
      'Proteger la vida de los pacientes con estándares internacionales de calidad',
      'Brindar cuidado humanizado y digno a cada persona',
      'Recuperar la funcionalidad y autonomía del paciente',
      'Prevenir infecciones nosocomiales mediante protocolos estrictos',
    ];
    
    const newResponses = testRoles.map((role, i) => ({
      role,
      text: testTexts[i],
      timestamp: Date.now() + i,
      weight: 0.5 + Math.random() * 0.4,
      status: 'active' as const,
      reinforcements: [],
    }));

    updateState({
      context: {
        ...state.context,
        whyResponses: newResponses,
      },
    });
  };

  const handleAddTestAreas = () => {
    const createVoter = (role: ParticipantRole, idx: number) => ({
      role,
      sessionId: `dev-test-${role}-${idx}-${Date.now()}`,
      timestamp: Date.now(),
    });

    const testAreas = [
      { 
        role: 'Laboratorio', 
        successMetric: 'Tiempo de procesamiento < 2 horas', 
        weight: 0.7, 
        votedBy: [createVoter('DOCTOR', 1), createVoter('NURSE', 1)] 
      },
      { 
        role: 'Farmacia', 
        successMetric: 'Disponibilidad de medicamentos 95%', 
        weight: 0.6, 
        votedBy: [createVoter('NURSE', 2)] 
      },
      { 
        role: 'Admisión', 
        successMetric: 'Tiempo de espera < 15 minutos', 
        weight: 0.5, 
        votedBy: [] 
      },
      { 
        role: 'Lab', 
        successMetric: 'Resultados en 24 horas', 
        weight: 0.75, 
        votedBy: [createVoter('KINE', 1), createVoter('INFECTOLOGIST', 1)] 
      },
    ];

    const newAreas = testAreas.map((area) => ({
      ...area,
      status: 'active' as const,
    }));

    updateState({
      context: {
        ...state.context,
        areaHeads: newAreas,
      },
    });
  };

  return (
    <div className="fixed top-4 left-4 z-[100] font-mono text-xs">
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-stone-900/95 border border-stone-700 rounded-lg p-4 shadow-2xl min-w-[220px]"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-700">
              <span className="text-sasquach-gold uppercase tracking-widest">Dev Panel</span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-stone-500 hover:text-stone-300 transition-colors"
              >
                [−]
              </button>
            </div>

            <div className="space-y-3">
              <div 
                className="border border-emerald-500/30 bg-emerald-900/20 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 uppercase tracking-wider text-[10px] font-bold">
                    Sesión Segura: {ritualId}
                  </span>
                </div>
                <p className="text-[9px] text-stone-400">
                  {tenantConfig.institutionName}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-stone-600 uppercase tracking-wider text-[10px]">Cambiar de Sala</p>
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder={ritualId}
                  className="w-full px-2 py-1.5 bg-stone-800 border border-stone-700 rounded text-[10px] text-stone-200 placeholder:text-stone-500 uppercase focus:outline-none focus:border-sasquach-gold/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleChangeRoom()}
                />
                <button
                  onClick={handleChangeRoom}
                  className="w-full px-2 py-1.5 bg-sasquach-gold/20 text-sasquach-gold border border-sasquach-gold/30 rounded hover:bg-sasquach-gold/30 transition-all text-[10px] uppercase tracking-wider font-bold"
                >
                  Cambiar Hospital
                </button>
                <div className="flex flex-wrap gap-1 pt-1">
                  {['LOBBY', 'URGENCIAS', 'LAB', 'UCI'].map((room) => (
                    <button
                      key={room}
                      onClick={() => handleQuickRoomChange(room)}
                      className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider transition-all ${
                        ritualId === room
                          ? 'bg-emerald-600/30 text-emerald-400'
                          : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                      }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-stone-700 my-2" />

              <div className="flex items-center justify-between">
                <span className="text-stone-500 uppercase tracking-wider">Phase:</span>
                <span className="text-emerald-400 font-bold">{state.currentPhase}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 uppercase tracking-wider">WHY:</span>
                <span className="text-stone-300">{state.context.whyResponses.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 uppercase tracking-wider">Areas:</span>
                <span className="text-stone-300">{state.context.areaHeads.length}</span>
              </div>

              <div className="h-px bg-stone-700 my-2" />

              <div className="space-y-2">
                <p className="text-stone-600 uppercase tracking-wider text-[10px]">Phase Control</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => changePhase('WHY')}
                    disabled={state.currentPhase === 'WHY'}
                    className={`px-2 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all ${
                      state.currentPhase === 'WHY'
                        ? 'bg-emerald-600/30 text-emerald-400 cursor-default'
                        : 'bg-stone-800 text-stone-300 hover:bg-emerald-600/30 hover:text-emerald-300'
                    }`}
                  >
                    WHY
                  </button>
                  <button
                    onClick={() => changePhase('INQUIRY')}
                    disabled={state.currentPhase === 'INQUIRY'}
                    className={`px-2 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all ${
                      state.currentPhase === 'INQUIRY'
                        ? 'bg-emerald-600/30 text-emerald-400 cursor-default'
                        : 'bg-stone-800 text-stone-300 hover:bg-emerald-600/30 hover:text-emerald-300'
                    }`}
                  >
                    INQUIRY
                  </button>
                  <button
                    onClick={() => changePhase('CONVERGENCE')}
                    disabled={state.currentPhase === 'CONVERGENCE'}
                    className={`px-2 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all ${
                      state.currentPhase === 'CONVERGENCE'
                        ? 'bg-sasquach-gold/30 text-sasquach-gold cursor-default'
                        : 'bg-stone-800 text-stone-300 hover:bg-sasquach-gold/30 hover:text-sasquach-gold'
                    }`}
                  >
                    CONVERGENCE
                  </button>
                  <button
                    onClick={() => changePhase('ACTION')}
                    disabled={state.currentPhase === 'ACTION'}
                    className={`px-2 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all ${
                      state.currentPhase === 'ACTION'
                        ? 'bg-emerald-600/30 text-emerald-400 cursor-default'
                        : 'bg-stone-800 text-stone-300 hover:bg-emerald-600/30 hover:text-emerald-300'
                    }`}
                  >
                    ACTION
                  </button>
                </div>
                {state.currentPhase === 'CONVERGENCE' && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => changePhase('ACTION')}
                    className="w-full px-2 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded hover:bg-amber-500/30 transition-all text-[10px] uppercase tracking-wider font-bold"
                  >
                    Iniciar Acción sobre Objetivo
                  </motion.button>
                )}
                {state.currentPhase === 'ACTION' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full px-2 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] uppercase tracking-wider font-bold text-center"
                  >
                    Fase de Acción Activa
                  </motion.div>
                )}
              </div>

              <div className="h-px bg-stone-700 my-2" />

              <div className="space-y-2">
                <p className="text-stone-600 uppercase tracking-wider text-[10px]">State Control</p>
                <button
                  onClick={handleResetResponses}
                  className="w-full px-2 py-1.5 bg-amber-600/20 text-amber-400 rounded hover:bg-amber-600/30 transition-all text-[10px] uppercase tracking-wider"
                >
                  Clear Responses
                </button>
                <button
                  onClick={handleReset}
                  className="w-full px-2 py-1.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-all text-[10px] uppercase tracking-wider"
                >
                  Full Reset
                </button>
              </div>

              <div className="h-px bg-stone-700 my-2" />

              <div className="space-y-2">
                <p className="text-stone-600 uppercase tracking-wider text-[10px]">Add Test Data</p>
                <button
                  onClick={handleAddTestResponses}
                  className="w-full px-2 py-1.5 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 transition-all text-[10px] uppercase tracking-wider"
                >
                  + Add WHY Responses
                </button>
                <button
                  onClick={handleAddTestAreas}
                  className="w-full px-2 py-1.5 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 transition-all text-[10px] uppercase tracking-wider"
                >
                  + Add Area Heads
                </button>
              </div>

              <div className="h-px bg-stone-700 my-2" />

              <div 
                className="border border-purple-500/30 bg-purple-900/10 rounded-lg p-4 mt-4 space-y-2"
              >
                <p className="text-purple-400 uppercase tracking-wider text-[10px] font-bold">SIMULADOR DE RITUAL</p>
                
                <button
                  onClick={handleGenerateSiloConsensus}
                  className="w-full px-2 py-2 bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 transition-all text-[10px] uppercase tracking-wider"
                >
                  Generar Consenso de Silos
                </button>
                
                <button
                  onClick={handleSimulateActionStorm}
                  disabled={!state.context.selectedSilo}
                  className={`w-full px-2 py-2 rounded transition-all text-[10px] uppercase tracking-wider ${
                    !state.context.selectedSilo
                      ? 'bg-stone-800/50 text-stone-600 cursor-not-allowed'
                      : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
                  }`}
                >
                  Tormenta de Acciones
                </button>
                
                {!state.context.selectedSilo && (
                  <p className="text-[8px] text-stone-500 text-center">
                    (Requiere silo seleccionado)
                  </p>
                )}
                
                <div className="h-px bg-purple-500/20 my-1" />
                
                <button
                  onClick={handleWipeEmergency}
                  className="w-full px-2 py-2 bg-red-700/30 text-red-400 border border-red-600/30 rounded hover:bg-red-700/40 transition-all text-[10px] uppercase tracking-wider font-bold"
                >
                  Wipe Total
                </button>
              </div>

              <div className="text-[9px] text-stone-600 uppercase tracking-wider space-y-1 mt-2">
                <p>Right-click nodes for menu</p>
                <p>Double-click for actions</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-stone-900/95 border border-stone-700 rounded-lg px-3 py-2 text-stone-500 hover:text-sasquach-gold hover:border-sasquach-gold/30 transition-all font-mono text-[10px] uppercase tracking-widest"
        >
          [DEV]
        </button>
      )}
    </div>
  );
};
