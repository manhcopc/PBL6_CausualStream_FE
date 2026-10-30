import { useCallback, useEffect, useState } from 'react';
import type { ModelInfo, SystemStatus } from '@/domain/entities/analysis';
import { causalStreamRepository } from '@/infrastructure/di/container';
import { ApiError } from '@/infrastructure/http/HttpClient';

export function useBackendOverview() {
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    Promise.allSettled([
      causalStreamRepository.getSystemStatus(controller.signal),
      causalStreamRepository.getModelInfo(controller.signal),
    ]).then(([systemResult, modelResult]) => {
      if (systemResult.status === 'fulfilled') setSystem(systemResult.value);
      if (modelResult.status === 'fulfilled') setModel(modelResult.value);
      const failure = systemResult.status === 'rejected' ? systemResult.reason : modelResult.status === 'rejected' ? modelResult.reason : null;
      if (failure && !(failure instanceof ApiError && failure.code === 'REQUEST_ABORTED')) {
        setError(failure instanceof ApiError ? `${failure.message} (${failure.code})` : 'Không thể tải trạng thái hệ thống.');
      }
      setUpdatedAt(new Date());
      setIsLoading(false);
    });
    return () => controller.abort();
  }, [revision]);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  return { system, model, error, isLoading, updatedAt, refresh };
}
