import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CloudUpload, Download, Play, Square, Video } from 'lucide-react';
import {
  Button, Card, CardTitle, InfoRows, PageHeader, PageShell, Pill,
  PredictionPanel, PredictionTable, Timeline,
} from '@/presentation/components';
import { useLiveSession } from '@/presentation/features/live/hooks/useLiveSession';
import { LiveMetricsPanel } from '@/presentation/features/live/LiveMetricsPanel';
import { exportPredictions } from '@/use-cases/predictions/exportPredictions';

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds)) return 'Chưa xác định';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

export function VideoAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [fileError, setFileError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { session, status, history, error, isConnecting, metrics, start, stop } = useLiveSession();
  const running = status === 'running' || status === 'paused' || isConnecting;
  const current = history[history.length - 1];

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  const chooseFile = (selected?: File) => {
    if (!selected || running) return;
    if (!selected.type.startsWith('video/')) {
      setFileError('Vui lòng chọn tệp video.');
      return;
    }
    if (selected.size > MAX_VIDEO_SIZE) {
      setFileError('Video vượt quá giới hạn 500 MB.');
      return;
    }
    setFileError('');
    setFile(selected);
    setUrl(URL.createObjectURL(selected));
    setDuration('');
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Phân tích video"
        title={<>Phân tích <span>video</span></>}
        description="Phát video trong trình duyệt và gửi khung hình qua Backend tới model AI theo thời gian thực."
        action={<Pill tone={session?.mode === 'LIVE' ? 'green' : 'blue'}>{session?.modelVersion ?? 'Chưa kết nối model'}</Pill>}
      />
      {fileError ? <div className="notice warning">{fileError}</div> : null}
      {error ? <div className="notice warning">{error}</div> : null}
      <p className="video-live-hint">Muốn thử livestream YouTube? <Link to="/live" className="text-link">Mở Phân tích trực tiếp</Link>.</p>
      <div className="video-top-grid">
        <Card className="upload-card">
          <label
            className="drop-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              chooseFile(event.dataTransfer.files[0]);
            }}
          >
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              disabled={running}
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
            <CloudUpload size={72} />
            <strong>{file?.name ?? 'Chọn video để phân tích'}</strong>
            <span>Kéo và thả video vào đây hoặc chọn tệp từ thiết bị.</span>
            <small>Hỗ trợ MP4, WebM, MOV. Tối đa 500 MB. Video chỉ được đọc trong trình duyệt; Backend nhận các khung hình.</small>
          </label>
        </Card>
        <Card>
          <CardTitle icon={Video} title="Thông tin phiên" />
          <InfoRows rows={[
            ['Tên video', file?.name ?? 'Chưa chọn'],
            ['Thời lượng', duration || 'Chưa xác định'],
            ['Trạng thái', session?.status ?? 'Chưa bắt đầu'],
            ['Mô hình', session?.modelVersion ?? 'Chưa kết nối'],
            ['Caption đã nhận', String(history.length)],
          ]} />
          {session?.status === 'COMPLETED'
            ? <div className="notice success"><CheckCircle2 /> Phiên đã hoàn tất; caption được lưu trong lịch sử Backend.</div>
            : null}
        </Card>
      </div>
      <div className="video-main-grid">
        <Card className="video-preview-card">
          {url ? (
            <video
              ref={videoRef}
              src={url}
              controls={!running}
              playsInline
              muted
              onLoadedMetadata={(event) => setDuration(formatDuration(event.currentTarget.duration))}
            />
          ) : <div className="notice">Chọn video để bắt đầu phiên LIVE.</div>}
          <div className="control-row">
            <Button icon={Play} onClick={() => start('video', videoRef.current)} disabled={!file || running}>
              {isConnecting ? 'Đang kết nối...' : 'Bắt đầu phân tích'}
            </Button>
            <Button icon={Square} variant="secondary" onClick={stop} disabled={!running || isConnecting}>Dừng phiên</Button>
            <Button icon={Download} variant="secondary" onClick={() => exportPredictions(history, 'json')} disabled={!history.length}>Xuất JSON</Button>
            <Button icon={Download} variant="secondary" onClick={() => exportPredictions(history, 'csv')} disabled={!history.length}>Xuất CSV</Button>
          </div>
          <small className="mock-label">Model xử lý bốn khung hình đã quan sát mỗi cửa sổ. Caption xuất hiện khi có kết quả mới.</small>
        </Card>
        <div className="video-results-stack">
          <PredictionPanel event={current} status={status} />
          <Timeline events={history} activeId={current?.id} />
        </div>
      </div>
      {session ? <LiveMetricsPanel metrics={metrics} /> : null}
      <PredictionTable events={history} title="Caption từ model AI" />
    </PageShell>
  );
}
