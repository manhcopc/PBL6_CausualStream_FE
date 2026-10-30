export class ApiError extends Error {
  public constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details: unknown = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorEnvelope {
  error?: { code?: string; message?: string; details?: unknown };
}

export class HttpClient {
  public constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
  ) {}

  public async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const timeoutController = new AbortController();
    const timeoutId = window.setTimeout(() => timeoutController.abort(), this.timeoutMs);
    const signal = init.signal
      ? AbortSignal.any([init.signal, timeoutController.signal])
      : timeoutController.signal;

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal,
        headers: { 'Content-Type': 'application/json', ...init.headers },
      });
      const payload = await this.parseBody(response);
      if (!response.ok) {
        const envelope = payload as ErrorEnvelope;
        throw new ApiError(
          envelope.error?.code ?? 'HTTP_ERROR',
          envelope.error?.message ?? `Request failed with status ${response.status}.`,
          response.status,
          envelope.error?.details,
        );
      }
      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('REQUEST_ABORTED', 'Yêu cầu đã bị hủy hoặc quá thời gian chờ.', 0);
      }
      throw new ApiError('NETWORK_ERROR', 'Không thể kết nối tới CausalStream Backend.', 0, error);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private async parseBody(response: Response): Promise<unknown> {
    if (response.status === 204) return null;
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new ApiError('INVALID_RESPONSE', 'Backend trả về dữ liệu không hợp lệ.', response.status);
    }
  }
}
