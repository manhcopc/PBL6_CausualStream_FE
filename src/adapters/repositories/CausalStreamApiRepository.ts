import type { CausalStreamRepository } from '@/domain/interfaces/CausalStreamRepository';
import type { AnalysisSession, ModelInfo, PredictionEvent, SystemStatus } from '@/domain/entities/analysis';
import type {
  CaptionEventDto,
  CaptionEventListDto,
  ModelInfoDto,
  PredictionListDto,
  SessionDto,
  SessionListDto,
  SystemStatusDto,
} from '@/adapters/api/contracts';
import { causalStreamMapper } from '@/adapters/mappers/causalStreamMapper';
import { HttpClient } from '@/infrastructure/http/HttpClient';

export class CausalStreamApiRepository implements CausalStreamRepository {
  public constructor(private readonly http: HttpClient) {}

  public async createDemoSession(scenarioId: string, signal?: AbortSignal): Promise<AnalysisSession> {
    const dto = await this.http.request<SessionDto>('/api/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ source: 'DEMO', mode: 'DEMO', scenario_id: scenarioId }),
      signal,
    });
    return causalStreamMapper.session(dto);
  }

  public async createLiveSession(source: 'CAMERA' | 'VIDEO', signal?: AbortSignal): Promise<AnalysisSession> {
    const dto = await this.http.request<SessionDto>('/api/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ source, mode: 'LIVE' }),
      signal,
    });
    return causalStreamMapper.session(dto);
  }

  public async getSession(sessionId: string, signal?: AbortSignal): Promise<AnalysisSession> {
    const dto = await this.http.request<SessionDto>(`/api/v1/sessions/${sessionId}`, { signal });
    return causalStreamMapper.session(dto);
  }

  public async advanceDemo(sessionId: string, expectedCursor: number, signal?: AbortSignal): Promise<PredictionEvent> {
    const dto = await this.http.request<CaptionEventDto>(`/api/v1/sessions/${sessionId}/advance`, {
      method: 'POST',
      body: JSON.stringify({ expected_cursor: expectedCursor }),
      signal,
    });
    return causalStreamMapper.captionEvent(dto);
  }

  public async pauseSession(sessionId: string, signal?: AbortSignal): Promise<AnalysisSession> {
    return this.changeSessionState(sessionId, 'pause', signal);
  }

  public async resumeSession(sessionId: string, signal?: AbortSignal): Promise<AnalysisSession> {
    return this.changeSessionState(sessionId, 'resume', signal);
  }

  public async completeSession(sessionId: string, signal?: AbortSignal): Promise<void> {
    await this.http.request(`/api/v1/sessions/${sessionId}`, { method: 'DELETE', signal });
  }

  public async listSessions(signal?: AbortSignal): Promise<AnalysisSession[]> {
    const dto = await this.http.request<SessionListDto>('/api/v1/sessions?limit=50&offset=0', { signal });
    return dto.items.map(causalStreamMapper.session);
  }

  public async listSessionEvents(sessionId: string, signal?: AbortSignal): Promise<PredictionEvent[]> {
    const captions: PredictionEvent[] = [];
    let offset = 0;
    while (true) {
      const page = await this.http.request<CaptionEventListDto>(
        `/api/v1/sessions/${sessionId}/caption-events?limit=200&offset=${offset}`,
        { signal },
      );
      captions.push(...page.items.map(causalStreamMapper.captionEvent));
      offset += page.items.length;
      if (offset >= page.total || page.items.length === 0) break;
    }
    if (captions.length > 0) return captions;

    const predictionDto = await this.http.request<PredictionListDto>(
      `/api/v1/sessions/${sessionId}/predictions?limit=200&offset=0`,
      { signal },
    );
    return predictionDto.items.map(causalStreamMapper.prediction);
  }

  public async getModelInfo(signal?: AbortSignal): Promise<ModelInfo> {
    const dto = await this.http.request<ModelInfoDto>('/api/v1/models/current', { signal });
    return causalStreamMapper.modelInfo(dto);
  }

  public async getSystemStatus(signal?: AbortSignal): Promise<SystemStatus> {
    const dto = await this.http.request<SystemStatusDto>('/api/v1/system/status', { signal });
    return causalStreamMapper.systemStatus(dto);
  }

  private async changeSessionState(
    sessionId: string,
    action: 'pause' | 'resume',
    signal?: AbortSignal,
  ): Promise<AnalysisSession> {
    const dto = await this.http.request<SessionDto>(`/api/v1/sessions/${sessionId}/${action}`, {
      method: 'POST',
      signal,
    });
    return causalStreamMapper.session(dto);
  }
}
