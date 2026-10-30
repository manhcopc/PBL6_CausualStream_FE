import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BarChart3, Box, Clock3, FileText, RefreshCw } from 'lucide-react';
import { Button, Card, CardTitle, InfoRows, PageHeader, PageShell, Pill, StatCard } from '@/presentation/components';
import { useBackendOverview } from '@/presentation/hooks/useBackendOverview';
import { useModelActivity } from './useModelActivity';

const formatMs = (value: number | null | undefined): string => value == null ? 'Chưa có' : `${value} ms`;
const formatDate = (value: string | null | undefined): string => value
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : 'Chưa có phiên';

export function ModelComparisonPage() {
  const { model, system, error: overviewError, isLoading: overviewLoading, refresh } = useBackendOverview();
  const [revision, setRevision] = useState(0);
  const { activity, isLoading: activityLoading, error: activityError } = useModelActivity(model?.modelVersion, revision);
  const isMock = model?.providerType === 'MOCK';

  const refreshAll = () => {
    refresh();
    setRevision((value) => value + 1);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Mô hình đang chạy"
        title="Mô hình đang chạy"
        description="Thông tin model hiện được Backend kết nối và kết quả xử lý từ các phiên đã lưu."
        action={<Button icon={RefreshCw} variant="secondary" onClick={refreshAll} disabled={overviewLoading || activityLoading}>Làm mới</Button>}
      />
      {overviewError ? <div className="notice warning">{overviewError}</div> : null}
      {activityError ? <div className="notice warning">{activityError}</div> : null}

      <Card className="model-overview-card">
        <CardTitle icon={Box} title={model?.modelName ?? 'Chưa kết nối Model API'} action={model
          ? <Pill tone={model.realModelReady ? 'green' : 'amber'}>{model.realModelReady ? 'Sẵn sàng LIVE' : 'Chưa sẵn sàng LIVE'}</Pill>
          : null} />
        <InfoRows rows={[
          ['Phiên bản', model?.modelVersion ?? 'Chưa có'],
          ['Provider', model ? `${model.provider} (${model.providerType})` : 'Chưa có'],
          ['Chế độ hỗ trợ', model?.supportedModes.join(', ') || 'Chưa có'],
          ['AI Service', system?.aiService.status ?? 'Không xác định'],
          ['Phiên LIVE gần nhất', formatDate(activity?.lastSessionAt)],
        ]} />
      </Card>

      <div className="summary-grid model-activity-grid">
        <StatCard icon={Activity} label="Phiên LIVE khảo sát" value={activityLoading ? '...' : activity ? String(activity.sessionCount) : 'Chưa có'} meta="Tối đa 5 phiên của model này" />
        <StatCard icon={FileText} label="Caption đã lưu" value={activityLoading ? '...' : activity ? String(activity.captionCount) : 'Chưa có'} meta="Trong các phiên khảo sát" tone="green" />
        <StatCard icon={Clock3} label="Suy luận P50" value={activityLoading ? '...' : formatMs(activity?.p50InferenceMs)} meta="Thời gian AI xử lý caption" tone="blue" />
        <StatCard icon={BarChart3} label="Suy luận P95" value={activityLoading ? '...' : formatMs(activity?.p95InferenceMs)} meta="Thời gian AI xử lý caption" tone="purple" />
      </div>

      <Card className="model-sample-card">
        <CardTitle icon={FileText} title="Phạm vi số liệu" />
        <p>Số liệu được tính từ tối đa 5 phiên LIVE gần nhất của model hiện hành trong 50 phiên mới nhất mà Backend trả về. P50 và P95 dùng {activity?.inferenceSamples ?? 0} caption có thời gian suy luận; đây không phải độ trễ mạng hoặc độ tin cậy của quyết định.</p>
        {isMock ? <p className="notice warning">Provider hiện là mock. Caption và thời gian suy luận không đại diện cho model thật.</p> : null}
        <Link to="/history" className="text-link">Xem lịch sử phiên</Link>
      </Card>
    </PageShell>
  );
}
