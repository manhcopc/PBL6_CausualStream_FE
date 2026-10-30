import { useEffect, useRef, useState } from 'react';
import { Box, Gauge, Monitor, Pause, Play, Sparkles, Square, Users, Zap } from 'lucide-react';
import {
  Button,
  CameraMock,
  Card,
  PageHeader,
  PageShell,
  Pill,
  PredictionPanel,
  PredictionTable,
  StatCard,
  Timeline,
} from '@/presentation/components';
import { useLiveSession } from './hooks/useLiveSession';
import { LiveMetricsPanel } from './LiveMetricsPanel';
import { youtubeVideoId } from './youtube';

export function LiveAnalysisPage() {
  const { session, status, history, error, isConnecting, metrics, start, pause, resume, stop } = useLiveSession();
  const [mode, setMode] = useState<'demo' | 'camera' | 'video' | 'youtube'>('demo');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const current = history[history.length - 1];
  const locked = isConnecting || status === 'running' || status === 'paused';

  useEffect(() => () => stream?.getTracks().forEach((track) => track.stop()), [stream]);
  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);
  useEffect(() => {
    if (mode !== 'youtube' || !stream || !videoRef.current) return;
    videoRef.current.srcObject = stream;
    void videoRef.current.play().catch(() => undefined);
  }, [mode, stream]);
  useEffect(() => {
    if (mode !== 'youtube' || !stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    const onEnded = () => {
      setStream(null);
      setCameraError('Chia sẻ tab đã dừng. Phiên LIVE được kết thúc.');
      void stop();
    };
    track.addEventListener('ended', onEnded);
    return () => track.removeEventListener('ended', onEnded);
  }, [mode, stream, stop]);

  const enableCamera = async () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setMode('camera');
    setCameraError('');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(media);
    } catch {
      setMode('demo');
      setCameraError('Không thể truy cập webcam. Phiên phân tích vẫn dùng kịch bản Demo của backend.');
    }
  };

  const enableDemo = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setMode('demo');
  };

  const enableVideo = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setMode('video');
    setCameraError('');
  };

  const enableYoutube = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setMode('youtube');
    setCameraError('');
  };

  const embedYoutube = () => {
    const id = youtubeVideoId(youtubeUrl);
    setYoutubeId(id);
    setCameraError(id ? '' : 'Hãy nhập URL video hoặc livestream YouTube trực tiếp, ví dụ youtube.com/live/ID.');
  };

  const shareYoutubeTab = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setCameraError('Trình duyệt này không hỗ trợ chia sẻ tab. Hãy dùng Chrome hoặc Edge trên localhost/HTTPS.');
      return;
    }
    try {
      const media = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 2 }, audio: false });
      if (!media.getVideoTracks().length) {
        media.getTracks().forEach((track) => track.stop());
        throw new Error('No video track');
      }
      stream?.getTracks().forEach((track) => track.stop());
      setStream(media);
    } catch {
      setCameraError('Chưa chia sẻ được tab. Hãy chọn tab đang phát YouTube trong hộp thoại của trình duyệt.');
    }
  };

  const selectVideo = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setCameraError('Vui lòng chọn một tệp video.');
      return;
    }
    setVideoUrl(URL.createObjectURL(file));
    setVideoName(file.name);
    setCameraError('');
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Phân tích trực tiếp"
        title="Phân tích trực tiếp"
        description="Điều khiển phiên phân tích và nhận caption events từ CausalStream Backend theo thời gian thực."
        action={
          <Pill tone={session ? 'green' : 'blue'}>
            <Sparkles size={16} /> {session ? `Backend session ${session.id.slice(0, 8)}` : 'Sẵn sàng kết nối Backend'}
          </Pill>
        }
      />
      {error ? <div className="notice warning"><strong>Không thể tiếp tục phiên:</strong> {error}</div> : null}
      {cameraError ? <div className="notice warning">{cameraError}</div> : null}
      <div className="live-grid">
        <Card className="camera-card">
          <div className="segmented live-source-tabs">
            <button className={mode === 'demo' ? 'active' : ''} onClick={enableDemo} disabled={locked}>Demo Mode</button>
            <button className={mode === 'camera' ? 'active' : ''} onClick={enableCamera} disabled={locked}>Camera Live</button>
            <button className={mode === 'video' ? 'active' : ''} onClick={enableVideo} disabled={locked}>Video Live</button>
            <button className={mode === 'youtube' ? 'active' : ''} onClick={enableYoutube} disabled={locked}>YouTube Live</button>
          </div>
          {mode === 'video' ? <>
            <input type="file" accept="video/*" aria-label="Chọn video để thử luồng LIVE" onChange={(event) => selectVideo(event.target.files?.[0])} disabled={status === 'running' || status === 'paused'} />
            {videoName ? <small>{videoName}</small> : null}
            <div className="camera-mock">
              <video ref={videoRef} src={videoUrl ?? undefined} muted playsInline />
            </div>
          </> : mode === 'youtube' ? <div className="youtube-source">
            <div className="youtube-url-row">
              <input
                type="url"
                aria-label="URL livestream YouTube"
                placeholder="https://www.youtube.com/live/..."
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') embedYoutube(); }}
                disabled={locked}
              />
              <Button onClick={embedYoutube} variant="secondary" disabled={locked}>Nhúng video</Button>
            </div>
            {youtubeId ? <>
              <div className="youtube-player">
                <iframe
                  title="Livestream YouTube để demo"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?playsinline=1`}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <a className="text-link" href={`https://www.youtube.com/watch?v=${youtubeId}`} target="_blank" rel="noopener noreferrer">Mở video trong tab YouTube để chia sẻ</a>
              <div className="youtube-capture-row">
                <Button icon={Monitor} variant="secondary" onClick={shareYoutubeTab} disabled={locked}>Chia sẻ tab YouTube</Button>
                <small>Trong hộp thoại, chọn tab YouTube đang phát. AI nhận khung hình từ tab được chia sẻ.</small>
              </div>
              {stream ? <div className="youtube-capture-preview">
                <strong>Hình ảnh đang gửi đến AI</strong>
                <video ref={videoRef} autoPlay playsInline muted />
              </div> : null}
            </> : <div className="notice">Nhập liên kết video hoặc livestream YouTube để bắt đầu.</div>}
          </div> : <CameraMock stream={mode === 'camera' ? stream : null} videoRef={videoRef} />}
          <div className="control-row">
            <Button icon={Play} onClick={() => start(mode, videoRef.current)} disabled={locked || (mode === 'camera' && !stream) || (mode === 'video' && !videoUrl) || (mode === 'youtube' && (!youtubeId || !stream))}>
              {isConnecting ? 'Đang kết nối...' : 'Start'}
            </Button>
            <Button icon={Pause} variant="secondary" onClick={pause} disabled={status !== 'running'}>Pause</Button>
            <Button icon={Play} variant="secondary" onClick={resume} disabled={status !== 'paused'}>Resume</Button>
            <Button icon={Square} variant="ghost" onClick={stop} disabled={!session || status === 'stopped'}>Stop</Button>
          </div>
          <small className="mock-label">
            {mode === 'camera'
              ? 'Khung hình camera được gửi qua Backend đến AI Service. Kết quả hiển thị sau khi AI xử lý đủ dữ liệu.'
              : mode === 'video'
                ? 'Video phát trong trình duyệt; frame được gửi đến AI Service và caption được lưu trong lịch sử phiên.'
                : mode === 'youtube'
                  ? 'Player nhúng chỉ để xem. Khung hình phân tích lấy từ tab bạn chọn chia sẻ; Pause tạm dừng gửi frame, không điều khiển YouTube.'
                : 'Caption events đến từ kịch bản Demo bền vững của Backend API.'}
          </small>
        </Card>
        <PredictionPanel event={current} status={status} />
      </div>
      <div className="dashboard-row">
        <Timeline events={history} activeId={current?.id} />
        <StatCard icon={Users} label="Phiên hiện tại" value={session ? session.status : 'Chưa tạo'} meta={session?.mode ?? (mode === 'demo' ? 'DEMO' : 'LIVE')} tone="green" />
        <StatCard icon={Zap} label="Sự kiện đã nhận" value={String(history.length)} meta="Từ Backend API" />
        <StatCard icon={Gauge} label="Chế độ xử lý" value={session?.mode ?? (mode === 'demo' ? 'DEMO' : 'LIVE')} meta="Luồng phiên hiện tại" tone="green" />
        <StatCard icon={Box} label="Phiên bản mô hình" value={session?.modelVersion ?? 'Chưa xác định'} meta="Do backend cung cấp" />
      </div>
      {session?.mode === 'LIVE' ? <LiveMetricsPanel metrics={metrics} /> : null}
      <PredictionTable events={history} title="Caption events của phiên hiện tại" />
    </PageShell>
  );
}
