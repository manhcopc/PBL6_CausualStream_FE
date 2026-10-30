import type { StreamFrameDto } from '@/adapters/api/contracts';

export interface QueuedFrame {
  frame: StreamFrameDto;
  capturedAt: number;
}

const MAX_QUEUED_FRAMES = 12;
const RECOVERY_WINDOW_FRAMES = 4;

export function enqueueLiveFrame(queue: QueuedFrame[], item: QueuedFrame): number {
  queue.push(item);
  if (queue.length <= MAX_QUEUED_FRAMES) return 0;
  const dropped = queue.length - RECOVERY_WINDOW_FRAMES;
  queue.splice(0, dropped);
  return dropped;
}

export function shouldCompressFrame(queueDepth: number, lastRoundTripMs: number | null): boolean {
  return queueDepth >= 4 || (lastRoundTripMs !== null && lastRoundTripMs > 2_000);
}
