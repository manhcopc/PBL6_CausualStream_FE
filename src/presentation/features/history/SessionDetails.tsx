import { Database } from 'lucide-react';
import type { AnalysisSession, PredictionEvent } from '@/domain/entities/analysis';
import { Card, CardTitle, InfoRows, Pill, Timeline } from '@/presentation/components';

interface SessionDetailsProps {
  session: AnalysisSession | null;
  events: PredictionEvent[];
}

const formatDateTime = (value: string | null): string =>
  value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value)) : 'Chưa kết thúc';

export function SessionDetails({ session, events }: SessionDetailsProps) {
  if (!session) {
    return <Card className="session-panel"><p>Chưa có phiên nào từ Backend.</p></Card>;
  }

  return (
    <Card className="session-panel">
      <CardTitle icon={Database} title="Chi tiết phiên" action={<Pill tone={session.status === 'ACTIVE' ? 'green' : 'gray'}>{session.status}</Pill>} />
      <InfoRows rows={[
        ['Mã phiên', session.id],
        ['Bắt đầu', formatDateTime(session.startedAt)],
        ['Kết thúc', formatDateTime(session.endedAt)],
        ['Nguồn / Mode', `${session.source} / ${session.mode}`],
        ['Model Version', session.modelVersion],
        ['Demo Cursor', String(session.cursor)],
        ['Sự kiện đã lưu', String(events.length)],
      ]} />
      {events.length ? <Timeline events={events} activeId={events[events.length - 1]?.id} /> : null}
    </Card>
  );
}
