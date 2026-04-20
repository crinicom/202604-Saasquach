export type RitualPhase = 'WHY' | 'INQUIRY' | 'ACTION' | 'CONVERGENCE' | 'DESIGN';

export type NodeStatus = 'active' | 'promoted' | 'discarded';

export interface WeightedEntry {
  weight: number;
  status: NodeStatus;
  promotedAt?: number;
}

export interface RootCause {
  id: string;
  label: string;
  votes: number;
  status: 'pending' | 'validated';
}

export interface Voter {
  role: ParticipantRole;
  sessionId: string;
  timestamp: number;
}

export interface AreaHead extends WeightedEntry {
  role: string;
  successMetric: string;
  votedBy: Voter[];
  aliases?: string[];
  mergedFrom?: string[];
}

export interface Reinforcement {
  role: ParticipantRole;
  timestamp: number;
  comment?: string;
}

export interface WhyEntry extends WeightedEntry {
  role: ParticipantRole;
  text: string;
  timestamp: number;
  reinforcements: Reinforcement[];
}

export interface RoomContext {
  ritualId: string;
  whySummary: string;
  whyResponses: WhyEntry[];
  areaHeads: AreaHead[];
  rootCauses: RootCause[];
  actionProposals: ActionProposal[];
  selectedSilo: string | null;
  ruptureCommitment: string | null;
}

export interface ActionProposal {
  id: string;
  siloRole: string;
  role: ParticipantRole;
  sessionId: string;
  text: string;
  timestamp: number;
  weight: number;
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

export type RitualEventType = 
  | 'PHASE_CHANGE' 
  | 'DATA_UPDATE' 
  | 'FRICTION_TOGGLE' 
  | 'SYNC_REQUEST' 
  | 'SYNC_RESPONSE'
  | 'REFORTIFY_SILO'
  | 'MISSION_COMPLETE';

export interface RefortifySiloPayload {
  areaName: string;
  successMetric?: string;
  voterRole: ParticipantRole;
  sessionId: string;
}

export interface MissionCompletePayload {
  actionId: string;
  actionText: string;
  selectedSilo: string;
}

export interface RitualEvent {
  type: RitualEventType;
  payload: Partial<RoomState> | RefortifySiloPayload | MissionCompletePayload;
  sender: ParticipantRole;
  timestamp: number;
  sessionId?: string;
}

export interface FrictionPoint {
  nodeId: string;
  type: 'friction' | 'approval';
  count: number;
}

export interface SimilarNodes {
  source: string;
  target: string;
  similarity: number;
  merged?: boolean;
}

export interface TenantConfig {
  primaryColor: string;
  secondaryColor: string;
  institutionName: string;
  logoUrl?: string;
  ritualTagline: string;
}

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  primaryColor: '#059669',
  secondaryColor: '#c3a343',
  institutionName: 'Sasquach Original',
  ritualTagline: 'Motor de Ejecución Clínica',
};
