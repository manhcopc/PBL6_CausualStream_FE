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

export function SettingsPage() {
  const tabs = ['Tổng quan', 'Camera', 'Âm thanh', 'Mô hình', 'Thông báo', 'Người dùng', 'Bảo mật'];
  return (
    <PageShell>
      <PageHeader
        eyebrow="Cài đặt"
        title="Cài đặt"
        description="Tùy chỉnh hệ thống theo nhu cầu của bạn để có trải nghiệm phân tích hành vi tốt nhất."
        action={<div className="settings-callout"><Settings /> Cấu hình phù hợp hôm nay cho trải nghiệm thông minh hơn ngày mai.</div>}
      />
      <div className="settings-layout">
        <Card className="settings-nav">
          {tabs.map((tab, index) => (
            <button key={tab} className={index === 0 ? 'active' : ''}>{index === 0 ? <Home /> : index === 1 ? <Video /> : index === 2 ? <Volume2 /> : index === 3 ? <Box /> : index === 4 ? <Bell /> : index === 5 ? <Users /> : <Shield />}{tab}</button>
          ))}
        </Card>
        <Card className="settings-main">
          <CardTitle icon={Settings} title="Tổng quan" />
          <div className="settings-grid">
            <SettingField icon={Camera} title="Nguồn camera" desc="Chọn thiết bị camera để phân tích." control={<select><option>Camera tích hợp (FaceTime HD)</option></select>} />
            <SettingField icon={Gauge} title="Tốc độ khung hình (FPS)" desc="Cân bằng hiệu suất và độ chính xác." control={<select><option>30 FPS (Khuyến nghị)</option></select>} />
            <SettingField icon={Box} title="Mô hình đang chạy" desc="Xem model hiện được Backend kết nối." control={<Link to="/models" className="text-link">Xem thông tin model</Link>} />
            <SettingField icon={Volume2} title="Giọng nói đầu ra" desc="Phát phản hồi bằng giọng nói khi phát hiện hành động." control={<div className="inline-control"><Toggle checked /><select><option>Tiếng Việt (Việt Nam)</option></select></div>} />
            <SettingField icon={Bell} title="Thông báo" desc="Chọn các loại thông báo hiển thị." control={<div className="stack-control"><ToggleRow label="WAIT - Đang quan sát" /><ToggleRow label="SPEAK - Đang nhắc nhở" /><ToggleRow label="UPDATE - Cập nhật trạng thái" /></div>} />
            <SettingField icon={Shield} title="Bảo mật & Quyền riêng tư" desc="Quản lý dữ liệu và quyền truy cập." control={<div className="stack-control"><CheckRow label="Lưu dữ liệu phân tích cục bộ trên thiết bị" checked /><CheckRow label="Cho phép gửi dữ liệu ẩn danh để cải thiện mô hình" checked /><CheckRow label="Tự động xóa dữ liệu cũ sau 30 ngày" /></div>} />
          </div>
          <div className="form-actions"><Button icon={RefreshCw} variant="secondary">Khôi phục mặc định</Button><Button icon={FileText}>Lưu thay đổi</Button></div>
        </Card>
        <Card className="profile-card">
          <div className="big-avatar">NM</div>
          <h2>Nguyễn Minh</h2>
          <p>nguyenminh@causalstream.com</p>
          <Pill tone="blue">Quản trị viên</Pill>
          <InfoRows rows={[['Tổ chức', 'CausalStream'], ['Tham gia', '12/06/2024'], ['Trạng thái', 'Hoạt động']]} />
          <Button icon={User} variant="secondary">Chỉnh sửa hồ sơ</Button>
          <Button icon={Lock} variant="secondary">Đổi mật khẩu</Button>
          <Button icon={LogOut} variant="danger">Đăng xuất</Button>
        </Card>
      </div>
    </PageShell>
  );
}
