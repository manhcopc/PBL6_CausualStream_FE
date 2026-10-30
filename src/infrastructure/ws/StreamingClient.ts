import type { StreamFrameDto, StreamResponseDto } from '@/adapters/api/contracts';

const CONNECT_TIMEOUT_MS = 10_000;
const RESPONSE_TIMEOUT_MS = 60_000;

export class StreamingError extends Error {
  public constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'StreamingError';
  }
}

export class StreamingClient {
  private socket: WebSocket | null = null;
  private pending: {
    resolve: (response: StreamResponseDto) => void;
    reject: (error: StreamingError) => void;
    timeoutId: number;
  } | null = null;

  public constructor(private readonly baseUrl: string) {}

  public connect(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(`${this.baseUrl}/api/v1/streams/${encodeURIComponent(sessionId)}`);
      this.socket = socket;
      let connected = false;
      const timeoutId = window.setTimeout(() => {
        socket.close();
        reject(new StreamingError('CONNECT_TIMEOUT', 'Kết nối streaming quá thời gian chờ.'));
      }, CONNECT_TIMEOUT_MS);

      socket.onopen = () => {
        window.clearTimeout(timeoutId);
        connected = true;
        resolve();
      };
      socket.onmessage = (event) => this.handleMessage(event.data);
      socket.onerror = () => {
        window.clearTimeout(timeoutId);
        if (!connected) reject(new StreamingError('WEBSOCKET_ERROR', 'Không thể kết nối streaming tới backend.'));
      };
      socket.onclose = () => {
        window.clearTimeout(timeoutId);
        if (!connected) reject(new StreamingError('STREAM_CLOSED', 'Kết nối streaming đã đóng.'));
        this.rejectPending('STREAM_CLOSED', 'Kết nối streaming đã đóng.');
      };
    });
  }

  public sendFrame(frame: StreamFrameDto): Promise<StreamResponseDto> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new StreamingError('STREAM_NOT_OPEN', 'Kết nối streaming chưa sẵn sàng.'));
    }
    if (this.pending) {
      return Promise.reject(new StreamingError('FRAME_IN_FLIGHT', 'Frame trước vẫn đang xử lý.'));
    }

    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pending = null;
        reject(new StreamingError('RESPONSE_TIMEOUT', 'AI không phản hồi frame trong thời gian cho phép.'));
      }, RESPONSE_TIMEOUT_MS);
      this.pending = { resolve, reject, timeoutId };
      this.socket?.send(JSON.stringify(frame));
    });
  }

  public close(): void {
    this.rejectPending('STREAM_CLOSED', 'Kết nối streaming đã đóng.');
    this.socket?.close(1000);
    this.socket = null;
  }

  private handleMessage(raw: string): void {
    if (!this.pending) return;
    try {
      const response = JSON.parse(raw) as StreamResponseDto;
      const pending = this.pending;
      this.pending = null;
      window.clearTimeout(pending.timeoutId);
      if (response.type === 'error') {
        pending.reject(new StreamingError(response.code, response.message));
      } else {
        pending.resolve(response);
      }
    } catch {
      this.rejectPending('INVALID_STREAM_RESPONSE', 'Backend trả về thông điệp streaming không hợp lệ.');
    }
  }

  private rejectPending(code: string, message: string): void {
    if (!this.pending) return;
    const pending = this.pending;
    this.pending = null;
    window.clearTimeout(pending.timeoutId);
    pending.reject(new StreamingError(code, message));
  }
}
