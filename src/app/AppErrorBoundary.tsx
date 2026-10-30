import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('CausalStream render error', error, errorInfo);
  }

  public render(): ReactNode {
    if (!this.state.error) return this.props.children;

    const isChunkLoadError = /dynamically imported module|loading chunk/i.test(this.state.error.message);

    return (
      <main className="main-shell">
        <div className="page-shell">
          <section className="card empty-state">
            <h1>Không thể tải giao diện</h1>
            <p>
              {isChunkLoadError
                ? 'Phiên bản ứng dụng đã thay đổi trong lúc trang đang mở. Hãy tải lại để nhận bundle mới.'
                : 'Ứng dụng gặp lỗi ngoài dự kiến. Bạn có thể tải lại trang để tiếp tục.'}
            </p>
            <button className="btn primary" type="button" onClick={() => window.location.reload()}>
              Tải lại trang
            </button>
          </section>
        </div>
      </main>
    );
  }
}
