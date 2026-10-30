import { useEffect, useState } from 'react';
import { causalStreamRepository } from '@/infrastructure/di/container';

export interface ModelActivity {
  sessionCount: number;
  captionCount: number;
  inferenceSamples: number;
  p50InferenceMs: number | null;
  p95InferenceMs: number | null;
  lastSessionAt: string | null;
}

const percentile = (values: number[], fraction: number): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return Math.round(sorted[Math.ceil(fraction * sorted.length) - 1]);
};

export function useModelActivity(modelVersion?: string, revision = 0) {
  const [activity, setActivity] = useState<ModelActivity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!modelVersion) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    setActivity(null);
    causalStreamRepository.listSessions(controller.signal)
      .then(async (sessions) => {
        const recent = sessions.filter((session) => session.mode === 'LIVE' && session.modelVersion === modelVersion).slice(0, 5);
        const eventGroups = await Promise.all(recent.map((session) => causalStreamRepository.listSessionEvents(session.id, controller.signal)));
        const captions = eventGroups.flat().filter((event) => event.captionDecision === 'EMIT');
        const inferenceTimes = captions.flatMap((event) => event.inferenceMs == null ? [] : [event.inferenceMs]);
        if (controller.signal.aborted) return;
        setActivity({
          sessionCount: recent.length,
          captionCount: captions.length,
          inferenceSamples: inferenceTimes.length,
          p50InferenceMs: percentile(inferenceTimes, 0.5),
          p95InferenceMs: percentile(inferenceTimes, 0.95),
          lastSessionAt: recent[0]?.startedAt ?? null,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Không thể tải số liệu từ lịch sử phiên.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [modelVersion, revision]);

  return { activity, isLoading, error };
}
