import { useEffect, useRef, type RefObject } from 'react';
import { Activity, ChevronDown, Clock3, Copy, FileText, Mic2, Shield, Sparkles, Users, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PredictionEvent, SessionStatus } from '@/domain/entities/analysis';
import { Card, CardTitle, Pill, StatusBadge } from './ui';

export function CameraMock({
  compact = false,
  stream,
  videoRef: externalVideoRef,
}: {
  compact?: boolean;
  stream?: MediaStream | null;
  videoRef?: RefObject<HTMLVideoElement>;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef ?? localVideoRef;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`camera-mock ${compact ? 'compact' : ''}`}>
      {stream ? <video ref={videoRef} autoPlay playsInline muted /> : <div className="camera-scene">
        <div className="desk" />
        <div className="plant plant-a" />
        <div className="plant plant-b" />
        <div className="person">
          <div className="head" />
          <div className="body" />
          <div className="arm upper" />
          <div className="arm lower" />
          <div className="hand" />
        </div>
        <div className="cup" />
      </div>}
      <div className="camera-top-left">
        <span className="live-dot" />
        Camera trực tiếp
        <ChevronDown size={16} />
      </div>
      <div className="camera-top-right">
        <span>HD</span>
      </div>
      {!stream ? <>
        <div className="box-label human">Người (0.98)</div>
        <div className="detection-box human-box" />
        <div className="box-label cup-label">Cốc (0.95)</div>
        <div className="detection-box cup-box" />
        <svg className="pose-lines" viewBox="0 0 500 300" aria-hidden="true">
          <polyline points="176,124 168,162 210,196 282,212 352,222" />
          <circle cx="176" cy="124" r="5" />
          <circle cx="168" cy="162" r="5" />
          <circle cx="210" cy="196" r="5" />
          <circle cx="282" cy="212" r="5" />
          <circle cx="352" cy="222" r="5" />
        </svg>
        <div className="camera-overlay-card">
          <span>Nhận diện hành động</span>
          <strong>Đang nhấc cốc</strong>
          <small>Độ tin cậy: 92%</small>
          <div className="confidence-bar"><span style={{ width: '92%' }} /></div>
        </div>
      </> : null}
      <div className="camera-bottom-left">
        <Activity size={20} />
        Phân tích thời gian thực...
      </div>
      {!stream ? <div className="camera-bottom-right">
        <Users size={18} />
        3 người trong khung hình
      </div> : null}
    </div>
  );
}

export function PredictionPanel({ event, status }: { event?: PredictionEvent; status: SessionStatus }) {
  const confidenceLabel = event?.confidence == null ? 'N/A' : `${Math.round(event.confidence * 100)}%`;
  return (
    <Card className="prediction-panel">
      <CardTitle
        icon={Shield}
        title="Kết quả phân tích thời gian thực"
        action={<Pill tone={status === 'running' ? 'green' : 'gray'}>{status === 'running' ? 'Đang phân tích...' : 'Chưa phân tích'}</Pill>}
      />
      <div className="prediction-stats">
        <MetricTile icon={Mic2} label="Hành động hiện tại" value={event?.action ?? 'Đang quan sát'} sub={event?.actionEn} />
        <MetricTile label="Độ tin cậy" value={confidenceLabel} progress={event?.confidence ?? undefined} />
        <MetricTile icon={Volume2} label="Quyết định" value={event ? <StatusBadge decision={event.decision} /> : 'Đang chờ'} sub={event?.captionDecision} />
      </div>
      <div className="message-box">
        <div><FileText size={19} /> Nội dung phản hồi (Text Output)</div>
        <blockquote>“{!event || event.message === '-' ? 'Hệ thống tiếp tục quan sát, chưa có caption.' : event.message}”</blockquote>
        <button className="icon-button"><Copy size={18} /></button>
      </div>
      <div className="context-box">
        <Sparkles size={20} />
        <div>
          <strong>Ngữ cảnh phân tích</strong>
          <span>{event?.description ?? 'Caption sẽ xuất hiện khi AI đã quan sát đủ khung hình.'}</span>
        </div>
      </div>
    </Card>
  );
}

export function MetricTile({
  icon: Icon,
  label,
  value,
  sub,
  progress,
}: {
  icon?: typeof Activity;
  label: string;
  value: React.ReactNode;
  sub?: string;
  progress?: number;
}) {
  return (
    <div className="metric-tile">
      {Icon ? <div className="icon-disc blue"><Icon size={26} /></div> : null}
      <span>{label}</span>
      <strong>{value}</strong>
      {progress !== undefined ? <div className="confidence-bar"><span style={{ width: `${progress * 100}%` }} /></div> : null}
      {sub ? <small>{sub}</small> : null}
    </div>
  );
}

export function Timeline({ events, activeId }: { events: PredictionEvent[]; activeId?: string }) {
  const visibleEvents = events.slice(-8);
  return (
    <Card className="timeline-card">
      <CardTitle icon={Clock3} title="Dòng thời gian dự đoán" action={<small>{visibleEvents.length} / {events.length} sự kiện gần nhất</small>} />
      <div className="timeline">
        {visibleEvents.map((event) => (
          <div key={event.id} className={`timeline-node ${event.id === activeId ? 'active' : ''}`}>
            <span />
            <strong>{event.decision}</strong>
            <em>{event.timestamp}</em>
            <small>{event.action}</small>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PredictionTable({ events, title = 'Danh sách lịch sử dự đoán' }: { events: PredictionEvent[]; title?: string }) {
  return (
    <Card className="table-card">
      <CardTitle icon={FileText} title={title} action={<Link to="/history" className="text-link">Xem thêm</Link>} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Thời gian</th>
              <th>Hành động</th>
              <th>Độ tin cậy</th>
              <th>Quyết định</th>
              <th>Nội dung phản hồi</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={event.id}>
                <td>{index + 1}</td>
                <td>{event.timestamp}</td>
                <td>{event.action} <span className="muted">({event.actionEn})</span></td>
                <td className="success-text">{event.confidence === null ? 'N/A' : `${Math.round(event.confidence * 100)}%`}</td>
                <td><StatusBadge decision={event.decision} /></td>
                <td>{event.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function VideoTimeline({ onSeek }: { onSeek: (seconds: number) => void }) {
  const marks = [
    { t: 0, label: '00:00', text: '' },
    { t: 5, label: '00:05', text: 'Đang làm việc' },
    { t: 12, label: '00:12', text: 'Đang nhấc cốc' },
    { t: 14, label: '00:14', text: 'Đưa cốc về phía bàn' },
    { t: 21, label: '00:21', text: 'Không có hành động đáng kể' },
    { t: 28, label: '00:28', text: '' },
  ];
  return (
    <div className="video-timeline">
      <CardTitle icon={Clock3} title="Mốc thời gian" action={<span>00:12 / 00:28</span>} />
      <div className="seek-line">
        {marks.map((mark) => (
          <button key={mark.t} style={{ left: `${(mark.t / 28) * 100}%` }} onClick={() => onSeek(mark.t)}>
            <span />
            <strong>{mark.label}</strong>
            <small>{mark.text}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
