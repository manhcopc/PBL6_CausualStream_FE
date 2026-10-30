import { Gauge } from 'lucide-react';
import { Card, CardTitle, InfoRows } from '@/presentation/components';
import type { LiveMetrics } from './hooks/useLiveSession';

const milliseconds = (value: number | null): string => value === null ? 'Chưa có' : `${Math.round(value)} ms`;

export function LiveMetricsPanel({ metrics }: { metrics: LiveMetrics }) {
  return (
    <Card>
      <CardTitle icon={Gauge} title="Chất lượng luồng LIVE" />
      <InfoRows rows={[
        ['Frame đã xác nhận', String(metrics.acknowledgedFrames)],
        ['Frame bỏ qua khi quá tải', String(metrics.droppedFrames)],
        ['Frame đang chờ', String(metrics.queueDepth)],
        ['Số lần kết nối lại', String(metrics.reconnects)],
        ['Chờ trong FE', milliseconds(metrics.queueWaitMs)],
        ['Khứ hồi FE–AI qua BE', milliseconds(metrics.roundTripMs)],
        ['Suy luận AI', milliseconds(metrics.inferenceMs)],
        ['Phần còn lại ước tính', milliseconds(metrics.otherMs)],
        ['Caption chậm so với nguồn', milliseconds(metrics.captionLagMs)],
      ]} />
      <small>“Phần còn lại” gồm truyền mạng, gateway và xử lý AI ngoài bước suy luận; đây không phải số đo riêng của mạng.</small>
    </Card>
  );
}
