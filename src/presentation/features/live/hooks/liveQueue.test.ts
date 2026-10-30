import { describe, expect, it } from 'vitest';
import { enqueueLiveFrame, shouldCompressFrame, type QueuedFrame } from './liveQueue';

describe('live backpressure', () => {
  it('retains a contiguous four-frame window when the queue grows too old', () => {
    const queue: QueuedFrame[] = [];
    let dropped = 0;
    for (let index = 0; index < 13; index += 1) {
      dropped += enqueueLiveFrame(queue, {
        capturedAt: index * 500,
        frame: { type: 'frame', stream_id: 's', frame_index: index, timestamp_ms: index * 500, image_b64: 'a' },
      });
    }
    expect(dropped).toBe(9);
    expect(queue.map((item) => item.frame.timestamp_ms)).toEqual([4500, 5000, 5500, 6000]);
  });

  it('compresses images under queue or roundtrip pressure without changing sample timing', () => {
    expect(shouldCompressFrame(4, null)).toBe(true);
    expect(shouldCompressFrame(0, 2_001)).toBe(true);
    expect(shouldCompressFrame(0, 500)).toBe(false);
  });
});
