import type { AnalysisSession, ModelInfo, PredictionEvent, SystemStatus } from '@/domain/entities/analysis';

export interface CausalStreamRepository {
  createDemoSession(scenarioId: string, signal?: AbortSignal): Promise<AnalysisSession>;
  createLiveSession(source: 'CAMERA' | 'VIDEO', signal?: AbortSignal): Promise<AnalysisSession>;
  getSession(sessionId: string, signal?: AbortSignal): Promise<AnalysisSession>;
  advanceDemo(sessionId: string, expectedCursor: number, signal?: AbortSignal): Promise<PredictionEvent>;
  pauseSession(sessionId: string, signal?: AbortSignal): Promise<AnalysisSession>;
  resumeSession(sessionId: string, signal?: AbortSignal): Promise<AnalysisSession>;
  completeSession(sessionId: string, signal?: AbortSignal): Promise<void>;
  listSessions(signal?: AbortSignal): Promise<AnalysisSession[]>;
  listSessionEvents(sessionId: string, signal?: AbortSignal): Promise<PredictionEvent[]>;
  getModelInfo(signal?: AbortSignal): Promise<ModelInfo>;
  getSystemStatus(signal?: AbortSignal): Promise<SystemStatus>;
}
