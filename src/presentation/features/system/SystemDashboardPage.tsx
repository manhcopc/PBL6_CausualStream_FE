import { BarChart3, Box, Clock3, Database, RefreshCw, Sparkles, Users } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { resourceData } from '@/adapters/mock/causalStreamMockData';
import { Button, ChartCard, PageHeader, PageShell, Pill, StatCard } from '@/presentation/components';
import { useBackendOverview } from '@/presentation/hooks/useBackendOverview';

export function SystemDashboardPage() {
  const { system, model, error, isLoading, updatedAt, refresh } = useBackendOverview();
  const backendOnline = system?.backend.status === 'ONLINE';
  const aiOnline = system?.aiService.status === 'ONLINE';
  const updatedLabel = updatedAt ? updatedAt.toLocaleTimeString('vi-VN') : '--:--:--';

  return (
    <PageShell>
      <PageHeader
        title="Hệ thống"
        description="Trạng thái vận hành được đọc trực tiếp từ CausalStream Backend và AI Service."
        action={<div className="control-row"><Pill tone="blue"><Clock3 size={16} /> Cập nhật {updatedLabel}</Pill><Button icon={RefreshCw} onClick={refresh} disabled={isLoading}>Làm mới</Button></div>}
      />
      {error ? <div className="notice warning">{error}</div> : null}
      <div className="summary-grid system-cards">
        <StatCard icon={Database} label="API Server" value={backendOnline ? 'ONLINE' : 'OFFLINE'} meta="GET /api/v1/system/status" tone={backendOnline ? 'green' : 'red'} />
        <StatCard icon={Sparkles} label="AI Service" value={aiOnline ? 'ONLINE' : 'OFFLINE'} meta={model?.provider ?? 'Chưa kết nối'} tone={aiOnline ? 'green' : 'red'} />
        <StatCard icon={Users} label="Phiên đang hoạt động" value={String(system?.activeSessions ?? 0)} meta="Đếm từ database" tone="blue" />
        <StatCard icon={Box} label="Model hiện hành" value={model?.modelVersion ?? 'N/A'} meta={model?.realModelReady ? 'LIVE sẵn sàng' : 'Chỉ hỗ trợ DEMO'} tone={model?.realModelReady ? 'green' : 'amber'} />
      </div>
      <div className="notice"><strong>Biểu đồ minh họa:</strong> backend hiện chưa cung cấp time-series CPU, RAM, latency và session throughput.</div>
      <div className="system-grid">
        <ChartCard title="Sử dụng tài nguyên hệ thống (demo)" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
              <XAxis dataKey="time" /><YAxis /><Tooltip /><Legend />
              <Line dataKey="CPU" stroke="#1478f2" strokeWidth={3} />
              <Line dataKey="RAM" stroke="#10b981" strokeWidth={3} />
              <Line dataKey="GPU" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Thời gian phản hồi (demo)" icon={Clock3}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
              <XAxis dataKey="time" /><YAxis /><Tooltip />
              <Line dataKey="response" stroke="#1478f2" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </PageShell>
  );
}
