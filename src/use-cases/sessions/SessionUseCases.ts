import type { CausalStreamRepository } from '@/domain/interfaces/CausalStreamRepository';

export class SessionUseCases {
  public constructor(private readonly repository: CausalStreamRepository) {}

  public startDemo(signal?: AbortSignal) {
    return this.repository.createDemoSession('cup_interaction', signal);
  }

  public startLive(source: 'CAMERA' | 'VIDEO' = 'CAMERA', signal?: AbortSignal) {
    return this.repository.createLiveSession(source, signal);
  }

  public get(sessionId: string, signal?: AbortSignal) {
    return this.repository.getSession(sessionId, signal);
  }

  public advanceDemo(sessionId: string, cursor: number, signal?: AbortSignal) {
    return this.repository.advanceDemo(sessionId, cursor, signal);
  }

  public pause(sessionId: string, signal?: AbortSignal) {
    return this.repository.pauseSession(sessionId, signal);
  }

  public resume(sessionId: string, signal?: AbortSignal) {
    return this.repository.resumeSession(sessionId, signal);
  }

  public complete(sessionId: string, signal?: AbortSignal) {
    return this.repository.completeSession(sessionId, signal);
  }
}
