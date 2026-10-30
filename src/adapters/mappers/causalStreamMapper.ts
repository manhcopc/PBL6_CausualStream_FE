import type { AnalysisSession, Decision, ModelInfo, PredictionEvent, SystemStatus } from '@/domain/entities/analysis';
import type { CaptionEventDto, ModelInfoDto, PredictionDto, SessionDto, SystemStatusDto } from '@/adapters/api/contracts';

const captionLabels = {
  WAIT: ['Đang quan sát', 'Observing'],
  EMIT: ['Phát mô tả mới', 'Emit caption'],
  REVISE: ['Điều chỉnh mô tả', 'Revise caption'],
  WITHDRAW: ['Thu hồi mô tả', 'Withdraw caption'],
} as const;

const captionDecisionToUi = (decision: CaptionEventDto['decision']): Decision => {
  if (decision === 'EMIT') return 'SPEAK';
  if (decision === 'REVISE' || decision === 'WITHDRAW') return 'UPDATE';
  return 'WAIT';
};

const formatTimestamp = (timestampMs: number): string => {
  const totalSeconds = Math.floor(timestampMs / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const causalStreamMapper = {
  session(dto: SessionDto): AnalysisSession {
    return {
      id: dto.session_id,
      source: dto.source,
      mode: dto.mode,
      status: dto.status,
      modelVersion: dto.model_version,
      isDemo: dto.is_demo,
      createdAt: dto.created_at,
      startedAt: dto.started_at,
      endedAt: dto.ended_at,
      cursor: dto.demo_cursor,
      lastFrameIndex: dto.last_frame_index,
    };
  },

  captionEvent(dto: CaptionEventDto): PredictionEvent {
    const [action, actionEn] = captionLabels[dto.decision];
    return {
      id: dto.event_id,
      sessionId: dto.session_id,
      timestamp: formatTimestamp(dto.timestamp_ms),
      seconds: dto.timestamp_ms / 1000,
      action,
      actionEn,
      confidence: null,
      inferenceMs: dto.inference_ms ?? null,
      decision: captionDecisionToUi(dto.decision),
      captionDecision: dto.decision,
      message: dto.text ?? (dto.decision === 'WITHDRAW' ? 'Mô tả trước đó đã được thu hồi.' : '-'),
      source: dto.is_demo ? 'Backend Demo' : 'Backend',
      description: `Sự kiện ${dto.decision} từ ${dto.model_version}.`,
    };
  },

  prediction(dto: PredictionDto): PredictionEvent {
    return {
      id: dto.prediction_id,
      sessionId: dto.session_id,
      timestamp: formatTimestamp(dto.timestamp_ms),
      seconds: dto.timestamp_ms / 1000,
      action: dto.action_label,
      actionEn: dto.action_id,
      confidence: dto.confidence,
      decision: dto.decision,
      message: dto.message ?? '-',
      source: dto.is_demo ? 'Backend Demo' : 'AI Service',
      description: `Prediction từ ${dto.model_version}.`,
    };
  },

  modelInfo(dto: ModelInfoDto): ModelInfo {
    return {
      provider: dto.provider,
      providerType: dto.provider_type,
      modelName: dto.model_name,
      modelVersion: dto.model_version,
      realModelReady: dto.real_model_ready,
      supportedModes: dto.supported_modes,
    };
  },

  systemStatus(dto: SystemStatusDto): SystemStatus {
    return { backend: dto.backend, aiService: dto.ai_service, activeSessions: dto.active_sessions };
  },
};
