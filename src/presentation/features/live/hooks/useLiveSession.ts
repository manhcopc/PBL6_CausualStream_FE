import { useCallback, useEffect, useRef, useState } from 'react';
import type { StreamCaptionDto, StreamResponseDto } from '@/adapters/api/contracts';
import type { AnalysisSession, PredictionEvent, SessionStatus } from '@/domain/entities/analysis';
import { appConfig } from '@/infrastructure/config/appConfig';
import { ApiError } from '@/infrastructure/http/HttpClient';
import { causalStreamRepository } from '@/infrastructure/di/container';
import { StreamingClient, StreamingError } from '@/infrastructure/ws/StreamingClient';
import { SessionUseCases } from '@/use-cases/sessions/SessionUseCases';
import { enqueueLiveFrame, shouldCompressFrame, type QueuedFrame } from './liveQueue';

const DEMO_EVENT_COUNT = 4;
const ADVANCE_DELAY_MS = 1_400;
const FRAME_INTERVAL_MS = 500;
const MAX_RECONNECT_ATTEMPTS = 6;
const sessionUseCases = new SessionUseCases(causalStreamRepository);

export interface LiveMetrics {
  acknowledgedFrames: number;
  droppedFrames: number;
  reconnects: number;
  queueDepth: number;
  queueWaitMs: number | null;
  roundTripMs: number | null;
  inferenceMs: number | null;
  otherMs: number | null;
  captionLagMs: number | null;
}

const initialMetrics: LiveMetrics = {
  acknowledgedFrames: 0, droppedFrames: 0, reconnects: 0, queueDepth: 0,
  queueWaitMs: null, roundTripMs: null, inferenceMs: null, otherMs: null, captionLagMs: null,
};

const errorMessage = (error: unknown): string => {
  if (error instanceof ApiError) return `${error.message} (${error.code})`;
  if (error instanceof StreamingError) return `${error.message} (${error.code})`;
  return 'Đã xảy ra lỗi ngoài dự kiến.';
};

const captureFrame = (video: HTMLVideoElement, compressed: boolean): string | null => {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return null;
  const width = Math.min(video.videoWidth, compressed ? 480 : 640);
  const height = Math.round((video.videoHeight / video.videoWidth) * width);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', compressed ? 0.55 : 0.72).split(',', 2)[1] ?? null;
};

const streamCaptionToEvent = (message: StreamCaptionDto): PredictionEvent => ({
  id: message.event_id,
  sessionId: message.stream_id,
  timestamp: `${Math.floor(message.end_ms / 60_000).toString().padStart(2, '0')}:${Math.floor((message.end_ms % 60_000) / 1_000).toString().padStart(2, '0')}`,
  seconds: message.end_ms / 1_000,
  action: 'Phát mô tả mới',
  actionEn: 'Streaming caption',
  confidence: null,
  decision: 'SPEAK',
  captionDecision: 'EMIT',
  message: message.caption,
  source: message.is_mock ? 'AI Mock' : 'AI Service',
  description: `Sự kiện ${message.start_ms}-${message.end_ms} ms từ ${message.model_id}.`,
});

export function useLiveSession() {
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [history, setHistory] = useState<PredictionEvent[]>([]);
  const [cursor, setCursor] = useState(0);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [metrics, setMetrics] = useState<LiveMetrics>(initialMetrics);
  const lastRoundTripRef = useRef<number | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamClientRef = useRef<StreamingClient | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileVideoRef = useRef(false);
  const streamStartedAtRef = useRef(0);
  const frameIndexRef = useRef(0);

  useEffect(() => () => {
    abortRef.current?.abort();
    streamClientRef.current?.close();
    if (activeSessionIdRef.current) {
      void fetch(`${appConfig.apiBaseUrl}/api/v1/sessions/${encodeURIComponent(activeSessionIdRef.current)}`, {
        method: 'DELETE', keepalive: true,
      }).catch(() => undefined);
      activeSessionIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (status !== 'running' || !session || session.mode !== 'DEMO') return;
    if (cursor >= DEMO_EVENT_COUNT) {
      setStatus('stopped');
      void sessionUseCases.complete(session.id)
        .then(() => setSession((value) => value ? { ...value, status: 'COMPLETED' } : value))
        .catch((requestError) => setError(errorMessage(requestError)));
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = window.setTimeout(async () => {
      try {
        const event = await sessionUseCases.advanceDemo(session.id, cursor, controller.signal);
        setHistory((items) => [...items, event]);
        setCursor((value) => value + 1);
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.code === 'REQUEST_ABORTED') return;
        setError(errorMessage(requestError));
        setStatus('stopped');
      }
    }, cursor === 0 ? 100 : ADVANCE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [cursor, session, status]);

  useEffect(() => {
    if (status !== 'running' || !session || session.mode !== 'LIVE') return;
    let cancelled = false;
    let sending = false;
    let ended = false;
    let finishing = false;
    let lastCapturedTimestamp = -1;
    const queue: QueuedFrame[] = [];

    const finish = () => {
      if (cancelled || finishing || !ended || sending || queue.length) return;
      finishing = true;
      setStatus('stopped');
      streamClientRef.current?.close();
      void sessionUseCases.complete(session.id)
        .then(() => {
          activeSessionIdRef.current = null;
          setSession((value) => value ? { ...value, status: 'COMPLETED' } : value);
        })
        .catch((requestError) => setError(errorMessage(requestError)));
    };

    const sendWithRecovery = async (item: QueuedFrame): Promise<{ response: StreamResponseDto | null; roundTripMs: number | null }> => {
      let lastError: unknown = new StreamingError('STREAM_CLOSED', 'Luồng đã đóng.');
      for (let attempt = 0; attempt <= MAX_RECONNECT_ATTEMPTS; attempt += 1) {
        if (cancelled) throw lastError;
        if (attempt > 0) {
          streamClientRef.current?.close();
          await new Promise((resolve) => window.setTimeout(resolve, Math.min(500 * (2 ** (attempt - 1)), 4_000)));
          if (cancelled) throw lastError;
          try {
            const remote = await sessionUseCases.get(session.id);
            if (remote.status !== 'ACTIVE') {
              throw new StreamingError('SESSION_NOT_ACTIVE', 'Phiên không còn hoạt động.');
            }
            if (remote.lastFrameIndex !== null && remote.lastFrameIndex >= item.frame.frame_index) {
              const storedEvents = await causalStreamRepository.listSessionEvents(session.id);
              if (!cancelled) {
                setHistory((current) => {
                  const known = new Set(current.map((event) => event.id));
                  return [...current, ...storedEvents.filter((event) => !known.has(event.id))];
                });
              }
              return { response: null, roundTripMs: null };
            }
            const replacement = new StreamingClient(appConfig.wsBaseUrl);
            await replacement.connect(session.id);
            streamClientRef.current = replacement;
            setMetrics((current) => ({ ...current, reconnects: current.reconnects + 1 }));
          } catch (recoveryError) {
            lastError = recoveryError;
            if (recoveryError instanceof StreamingError && recoveryError.code === 'SESSION_NOT_ACTIVE') throw recoveryError;
            continue;
          }
        }
        try {
          const client = streamClientRef.current;
          if (!client) throw new StreamingError('STREAM_CLOSED', 'Luồng đã đóng.');
          const attemptStartedAt = performance.now();
          const response = await client.sendFrame(item.frame);
          return { response, roundTripMs: Math.round(performance.now() - attemptStartedAt) };
        } catch (sendError) {
          lastError = sendError;
          if (sendError instanceof StreamingError && ![
            'STREAM_CLOSED', 'STREAM_NOT_OPEN', 'WEBSOCKET_ERROR', 'RESPONSE_TIMEOUT',
            'FRAME_OUT_OF_ORDER', 'AI_SERVICE_UNAVAILABLE',
          ].includes(sendError.code)) throw sendError;
        }
      }
      throw lastError;
    };

    const sendNext = async () => {
      if (cancelled || sending || !queue.length) {
        finish();
        return;
      }
      const item = queue.shift();
      if (!item) return;
      sending = true;
      try {
        const sentAt = performance.now();
        const { response, roundTripMs } = await sendWithRecovery(item);
        const receivedAt = performance.now();
        const inferenceMs = response?.type === 'caption' ? response.inference_ms : null;
        if (roundTripMs !== null) lastRoundTripRef.current = roundTripMs;
        const currentMediaMs = fileVideoRef.current
          ? (videoRef.current?.currentTime ?? 0) * 1_000
          : receivedAt - streamStartedAtRef.current;
        setMetrics((current) => ({
          ...current,
          acknowledgedFrames: current.acknowledgedFrames + 1,
          queueDepth: queue.length,
          queueWaitMs: Math.round(sentAt - item.capturedAt),
          roundTripMs: roundTripMs ?? current.roundTripMs,
          inferenceMs: inferenceMs ?? current.inferenceMs,
          otherMs: inferenceMs === null || roundTripMs === null
            ? current.otherMs : Math.max(0, Math.round(roundTripMs - inferenceMs)),
          captionLagMs: response?.type === 'caption'
            ? Math.max(0, Math.round(currentMediaMs - response.end_ms)) : current.captionLagMs,
        }));
        if (response?.type === 'caption') {
          const event = streamCaptionToEvent(response);
          if (!cancelled) {
            setHistory((items) => items.some((item) => item.id === event.id) ? items : [...items, event]);
          }
        }
      } catch (requestError) {
        if (cancelled) return;
        setError(errorMessage(requestError));
        setStatus('stopped');
        streamClientRef.current?.close();
        void sessionUseCases.complete(session.id)
          .then(() => {
            activeSessionIdRef.current = null;
            setSession((value) => value ? { ...value, status: 'COMPLETED' } : value);
          })
          .catch(() => undefined);
        return;
      } finally {
        sending = false;
      }
      if (!cancelled) void sendNext();
    };

    const capture = () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (fileVideoRef.current && video?.ended) {
        ended = true;
        finish();
        return;
      }
      if (fileVideoRef.current && video?.paused) return;
      const image = video ? captureFrame(video, shouldCompressFrame(queue.length, lastRoundTripRef.current)) : null;
      if (!image || !video) return;
      const timestamp = fileVideoRef.current
        ? Math.round(video.currentTime * 1_000)
        : Math.max(0, Math.round(performance.now() - streamStartedAtRef.current));
      if (timestamp <= lastCapturedTimestamp) return;
      lastCapturedTimestamp = timestamp;
      const dropped = enqueueLiveFrame(queue, {
        frame: {
          type: 'frame', stream_id: session.id, frame_index: frameIndexRef.current++,
          timestamp_ms: timestamp, image_b64: image,
        },
        capturedAt: performance.now(),
      });
      setMetrics((current) => ({ ...current, queueDepth: queue.length, droppedFrames: current.droppedFrames + dropped }));
      void sendNext();
    };

    const intervalId = window.setInterval(capture, FRAME_INTERVAL_MS);
    capture();
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [session, status]);

  const start = useCallback(async (
    mode: 'demo' | 'camera' | 'video' | 'youtube',
    video: HTMLVideoElement | null = null,
  ) => {
    abortRef.current?.abort();
    streamClientRef.current?.close();
    setIsConnecting(true);
    setError('');
    setHistory([]);
    setCursor(0);
    setMetrics(initialMetrics);
    lastRoundTripRef.current = null;
    try {
      const created = mode !== 'demo'
        ? await sessionUseCases.startLive(mode === 'video' || mode === 'youtube' ? 'VIDEO' : 'CAMERA')
        : await sessionUseCases.startDemo();
      if (mode !== 'demo') {
        const streamingClient = new StreamingClient(appConfig.wsBaseUrl);
        try {
          await streamingClient.connect(created.id);
          if (mode === 'video' && video) {
            video.currentTime = 0;
            await video.play();
          }
        } catch (streamError) {
          streamingClient.close();
          await sessionUseCases.complete(created.id).catch(() => undefined);
          throw streamError;
        }
        streamClientRef.current = streamingClient;
        videoRef.current = video;
        fileVideoRef.current = mode === 'video';
        streamStartedAtRef.current = performance.now();
        frameIndexRef.current = 0;
      }
      setSession(created);
      if (mode !== 'demo') activeSessionIdRef.current = created.id;
      setStatus('running');
    } catch (requestError) {
      setError(errorMessage(requestError));
      setStatus('idle');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const pause = useCallback(async () => {
    if (!session) return;
    abortRef.current?.abort();
    try {
      setSession(await sessionUseCases.pause(session.id));
      if (fileVideoRef.current) videoRef.current?.pause();
      setStatus('paused');
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  }, [session]);

  const resume = useCallback(async () => {
    if (!session) return;
    try {
      setSession(await sessionUseCases.resume(session.id));
      if (fileVideoRef.current) await videoRef.current?.play();
      setStatus('running');
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  }, [session]);

  const stop = useCallback(async () => {
    abortRef.current?.abort();
    streamClientRef.current?.close();
    streamClientRef.current = null;
    if (fileVideoRef.current) videoRef.current?.pause();
    setStatus('stopped');
    if (!session) return;
    try {
      await sessionUseCases.complete(session.id);
      activeSessionIdRef.current = null;
      setSession((value) => value ? { ...value, status: 'COMPLETED' } : value);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  }, [session]);

  return { session, status, history, error, isConnecting, metrics, start, pause, resume, stop };
}
