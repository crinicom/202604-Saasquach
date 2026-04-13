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

export interface WhyEntry {
  role: ParticipantRole;
  text: string;
  timestamp: number;
}

export interface RoomContext {
  whySummary: string;
  whyResponses: WhyEntry[];
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

export type ParticipantRole = 'BOARD' | 'DOCTOR' | 'NURSE' | 'KINE' | 'INFECTOLOGIST' | 'ADMIN';

export interface RitualEvent {
  type: 'PHASE_CHANGE' | 'DATA_UPDATE' | 'FRICTION_TOGGLE' | 'SYNC_REQUEST' | 'SYNC_RESPONSE';
  payload: Partial<RoomState>;
  sender: ParticipantRole;
  timestamp: number;
}
