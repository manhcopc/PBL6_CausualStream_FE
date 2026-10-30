import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity, BarChart3, Bell, Box, Calendar, Camera, CheckCircle2, Clock3,
  CloudUpload, Copy, Database, Download, FileText, Home, Info,
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
import { useBackendOverview } from '@/presentation/hooks/useBackendOverview';

export function HomePage() {
  const { model, system } = useBackendOverview();
  const aiOnline = system?.aiService.status === 'ONLINE';
  const backendOnline = system?.backend.status === 'ONLINE';
  return (
    <PageShell>
      <section className="hero-grid">
        <div className="hero-copy">
          <div className="soft-label">
            <Sparkles size={18} />
            AI cho một thế giới an toàn và chủ động hơn
          </div>
          <h1>
            Causal<span>Stream</span>
          </h1>
          <h2>Trợ lý thị giác thời gian thực với AI</h2>
          <p>
            Hệ thống nhận biết sớm hành động từ video, ước lượng độ tin cậy và cung cấp thông báo theo thời gian
            thực.
          </p>
          <div className="action-card-grid">
            <Link to="/assistive" className="mode-card assistive">
              <div className="round-icon"><User size={34} /></div>
              <div>
                <strong>Chế độ Hỗ trợ</strong>
                <span>Sử dụng camera để nhận biết hành động và nhận thông báo bằng giọng nói.</span>
                <em>Bắt đầu ngay</em>
              </div>
            </Link>
            <Link to="/live" className="mode-card research">
              <div className="round-icon"><BarChart3 size={34} /></div>
              <div>
                <strong>Chế độ Nghiên cứu</strong>
                <span>Thử nghiệm mô hình AI, phân tích kết quả và theo dõi quá trình dự đoán.</span>
                <em>Khám phá ngay</em>
              </div>
            </Link>
          </div>
        </div>
        <CameraMock />
      </section>
      <div className="status-strip">
        <div><span className="live-dot" /><strong>AI Service: <b>{aiOnline ? 'ONLINE' : 'Chưa kết nối'}</b></strong></div>
        <div><Box /><strong>Mô hình: <b>{model?.modelVersion ?? 'Chưa có'}</b></strong></div>
        <div><Activity /><strong>Phiên đang hoạt động: <b>{system?.activeSessions ?? '—'}</b></strong></div>
        <Pill tone={backendOnline && aiOnline ? 'green' : 'amber'}><CheckCircle2 size={16} /> {backendOnline && aiOnline ? 'Backend và AI sẵn sàng' : 'Đang kiểm tra dịch vụ'}</Pill>
      </div>
      <div className="feature-grid">
        <StatCard icon={Shield} label="Phát hiện sớm" value="Chủ động" meta="Dự đoán hành động trước khi rủi ro xảy ra." />
        <StatCard icon={Zap} label="Hỗ trợ kịp thời" value="Thời gian thực" meta="Cảnh báo theo ngữ cảnh thực tế." tone="green" />
        <StatCard icon={Users} label="Ứng dụng đa lĩnh vực" value="An toàn hơn" meta="Từ lao động, sức khỏe đến giáo dục." />
        <StatCard icon={LineChartIcon} label="Dữ liệu đáng tin cậy" value="Mock rõ ràng" meta="Sẵn sàng cho giai đoạn nghiên cứu." tone="purple" />
      </div>
    </PageShell>
  );
}
