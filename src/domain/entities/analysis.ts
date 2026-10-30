export type Decision = 'WAIT' | 'SPEAK' | 'UPDATE';
export type SessionStatus = 'idle' | 'running' | 'paused' | 'stopped';
export type CaptionDecision = 'WAIT' | 'EMIT' | 'REVISE' | 'WITHDRAW';
export type BackendSessionStatus = 'CREATED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';

export type PredictionEvent = {
  id: string;
  sessionId: string;
  timestamp: string;
  seconds: number;
  action: string;
  actionEn: string;
  confidence: number | null;
  inferenceMs?: number | null;
  decision: Decision;
  captionDecision?: CaptionDecision;
  message: string;
  source: string;
  description: string;
};

export type AnalysisSession = {
  id: string;
  source: 'CAMERA' | 'VIDEO' | 'DEMO';
  mode: 'DEMO' | 'LIVE';
  status: BackendSessionStatus;
  modelVersion: string;
  isDemo: boolean;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  cursor: number;
  lastFrameIndex: number | null;
};

export type ModelInfo = {
  provider: string;
  providerType: string;
  modelName: string;
  modelVersion: string;
  realModelReady: boolean;
  supportedModes: Array<'DEMO' | 'LIVE'>;
};

export type SystemStatus = {
  backend: { status: string };
  aiService: Record<string, unknown> & { status?: string };
  activeSessions: number;
};

export type ModelMetric = {
  name: string;
  version: string;
  architecture: string;
  experimentId: string;
  dataset: string;
  accuracy: number;
  macroF1: number;
  early25: number;
  early50: number;
  early75: number;
  early100: number;
  ece: number;
  latency: number;
  memory: number;
  status: string;
};
