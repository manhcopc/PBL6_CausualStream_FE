import type { BackendSessionStatus, CaptionDecision } from '@/domain/entities/analysis';

export interface SessionDto {
  session_id: string;
  source: 'CAMERA' | 'VIDEO' | 'DEMO';
  mode: 'DEMO' | 'LIVE';
  status: BackendSessionStatus;
  model_version: string;
  is_demo: boolean;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  demo_cursor: number;
  last_frame_index: number | null;
}

export interface SessionListDto { items: SessionDto[]; total: number; limit: number; offset: number }

export interface CaptionEventDto {
  event_id: string;
  session_id: string;
  event_index: number;
  timestamp_ms: number;
  decision: CaptionDecision;
  text: string | null;
  model_version: string;
  is_demo: boolean;
  inference_ms?: number | null;
  is_mock?: boolean;
  created_at: string | null;
}

export interface CaptionEventListDto { items: CaptionEventDto[]; total: number; limit: number; offset: number }

export interface PredictionDto {
  prediction_id: string;
  session_id: string;
  frame_index: number;
  timestamp_ms: number;
  action_id: string;
  action_label: string;
  confidence: number | null;
  decision: 'WAIT' | 'SPEAK' | 'UPDATE';
  message: string | null;
  model_version: string;
  is_demo: boolean;
}

export interface PredictionListDto { items: PredictionDto[]; total: number; limit: number; offset: number }

export interface ModelInfoDto {
  provider: string;
  provider_type: string;
  model_name: string;
  model_version: string;
  real_model_ready: boolean;
  supported_modes: Array<'DEMO' | 'LIVE'>;
}

export interface SystemStatusDto {
  backend: { status: string };
  ai_service: Record<string, unknown> & { status?: string };
  active_sessions: number;
}

export interface StreamFrameDto {
  type: 'frame';
  stream_id: string;
  frame_index: number;
  timestamp_ms: number;
  image_b64: string;
}

export interface StreamCaptionDto {
  type: 'caption';
  stream_id: string;
  event_id: string;
  start_ms: number;
  end_ms: number;
  caption: string;
  model_id: string;
  inference_ms: number | null;
  processing_delay_ms: number | null;
  is_mock: boolean;
}

export interface StreamNoEventDto {
  type: 'no_event';
  stream_id: string;
  frame_index: number;
  timestamp_ms: number;
}

export interface StreamErrorDto {
  type: 'error';
  code: string;
  message: string;
  details: Record<string, unknown> | null;
}

export type StreamResponseDto = StreamCaptionDto | StreamNoEventDto | StreamErrorDto;
