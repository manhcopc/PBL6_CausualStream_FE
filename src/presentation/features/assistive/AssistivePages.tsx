import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity, BarChart3, Bell, Box, Calendar, Camera, CheckCircle2, Clock3,
  CloudUpload, Copy, Database, Download, FileText, Gauge, Home, Info,
  LineChart as LineChartIcon, Lock, LogOut, Mic2, Monitor, Pause, Play,
  RefreshCw, Search, Settings, Shield, Share2, SlidersHorizontal, Sparkles,
  Square, User, Users, Video, Volume2, Wand2, Zap,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Button, CameraMock, Card, CardTitle, ChartCard, CheckRow, InfoRows,
  MetricTile, PageHeader, PageShell, Pill, PredictionPanel, PredictionTable,
  ServiceTable, SettingCard, SettingField, StatCard, StatusBadge, Timeline, Toggle,
  ToggleRow, VideoTimeline,
} from '@/presentation/components';
import {
  allHistory, mockEvents, models, monthlyData, resourceData, sessions,
  trainingData, trendData,
} from '@/adapters/mock/causalStreamMockData';
import type { Decision, PredictionEvent, SessionStatus } from '@/domain/entities/analysis';
import { exportPredictions } from '@/use-cases/predictions/exportPredictions';

export function AssistivePage() {
  const [state, setState] = useState<Decision>('SPEAK');
  const event = mockEvents.find((item) => item.decision === state) ?? mockEvents[2];
  return (
    <PageShell>
      <PageHeader
        title="Assistive Mode"
        description="Giao diện hỗ trợ thị giác ưu tiên camera, trạng thái phiên và phản hồi giọng nói trên mọi kích thước màn hình."
        action={<div className="control-row"><Link className="btn secondary" to="/assistive/history"><Clock3 size={18} /> Lịch sử</Link><Link className="btn secondary" to="/assistive/settings"><Settings size={18} /> Cài đặt</Link></div>}
      />
      <div className="assistive-grid">
        <CameraMock />
        <Card className={`assistive-state ${state.toLowerCase()}`}>
          <span>Trạng thái hiện tại</span>
          <StatusBadge decision={state} />
          <h2>{event.action}</h2>
          <p>{event.message === '-' ? 'Đang quan sát thêm trước khi phát thông báo.' : event.message}</p>
          <div className="confidence-bar"><span style={{ width: `${(event.confidence ?? 0) * 100}%` }} /></div>
          <div className="control-row">
            {(['WAIT', 'SPEAK', 'UPDATE'] as Decision[]).map((decision) => (
              <Button key={decision} variant={decision === state ? 'primary' : 'secondary'} onClick={() => setState(decision)}>{decision}</Button>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

export function AssistiveHistoryPage() {
  return (
    <PageShell>
      <PageHeader title="Lịch sử thông báo hỗ trợ" description="Các phản hồi bằng giọng nói và cập nhật trạng thái gần nhất trong chế độ hỗ trợ." />
      <PredictionTable events={mockEvents} />
    </PageShell>
  );
}

export function AssistiveSettingsPage() {
  return (
    <PageShell>
      <PageHeader title="Cài đặt hỗ trợ" description="Tùy chỉnh âm thanh, camera và loại thông báo cho chế độ Assistive." />
      <div className="summary-grid">
        <SettingCard title="Phản hồi giọng nói" icon={Volume2} />
        <SettingCard title="Camera mặc định" icon={Camera} />
        <SettingCard title="Ngôn ngữ" icon={Monitor} />
        <SettingCard title="Quyền riêng tư" icon={Shield} />
      </div>
    </PageShell>
  );
}


interface AssistivePagesProps { page: 'main' | 'history' | 'settings' }

export default function AssistivePages({ page }: AssistivePagesProps) {
  if (page === 'history') return <AssistiveHistoryPage />;
  if (page === 'settings') return <AssistiveSettingsPage />;
  return <AssistivePage />;
}
