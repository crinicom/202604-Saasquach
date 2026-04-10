export type RitualPhase = 'WHY' | 'INQUIRY' | 'CONVERGENCE' | 'DESIGN';

export interface RootCause {
  id: string;
  label: string;
  votes: number;
  status: 'pending' | 'validated';
}

export interface AreaHead {
  role: string;
  successMetric: string;
}

export interface FrictionPoint {
  nodeId: string;
  type: 'friction' | 'approval';
  count: number;
}

export interface RoomContext {
  whySummary: string;
  areaHeads: AreaHead[];
  rootCauses: RootCause[];
}

export interface RoomState {
  roomId: string;
  status: 'active' | 'completed';
  currentPhase: RitualPhase;
  context: RoomContext;
  mermaidCode: string;
  frictionMap: FrictionPoint[];
}

export interface RitualEvent {
  type: 'PHASE_CHANGE' | 'DATA_UPDATE' | 'FRICTION_TOGGLE';
  payload: Partial<RoomState>;
  sender: 'BOARD' | 'PILOT';
}
