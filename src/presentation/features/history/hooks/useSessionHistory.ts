import { useCallback, useEffect, useState } from 'react';
import type { AnalysisSession, PredictionEvent } from '@/domain/entities/analysis';
import { causalStreamRepository } from '@/infrastructure/di/container';
import { ApiError } from '@/infrastructure/http/HttpClient';

const describeError = (error: unknown): string =>
  error instanceof ApiError ? `${error.message} (${error.code})` : 'Không thể tải lịch sử phiên.';

export function useSessionHistory() {
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [events, setEvents] = useState<PredictionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    causalStreamRepository.listSessions(controller.signal)
      .then((items) => {
        setSessions(items);
        setSelectedId((current) => current && items.some((item) => item.id === current) ? current : items[0]?.id ?? '');
      })
      .catch((requestError) => {
        if (requestError instanceof ApiError && requestError.code === 'REQUEST_ABORTED') return;
        setError(describeError(requestError));
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    if (!selectedId) {
      setEvents([]);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    causalStreamRepository.listSessionEvents(selectedId, controller.signal)
      .then(setEvents)
      .catch((requestError) => {
        if (requestError instanceof ApiError && requestError.code === 'REQUEST_ABORTED') return;
        setError(describeError(requestError));
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [selectedId, revision]);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const selectedSession = sessions.find((session) => session.id === selectedId) ?? null;

  return { sessions, selectedId, selectedSession, events, isLoading, error, setSelectedId, refresh };
}
