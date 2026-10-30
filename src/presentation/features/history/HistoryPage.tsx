import { useMemo, useState } from 'react';
import { BarChart3, FileText, Mic2, RefreshCw, Search, Zap } from 'lucide-react';
import { Button, Card, CardTitle, PageHeader, PageShell, Pill, StatCard } from '@/presentation/components';
import { SessionDetails } from './SessionDetails';
import { useSessionHistory } from './hooks/useSessionHistory';

export function HistoryPage() {
  const { sessions, selectedId, selectedSession, events, isLoading, error, setSelectedId, refresh } = useSessionHistory();
  const [query, setQuery] = useState('');
  const [decision, setDecision] = useState('ALL');
  const isDemo = selectedSession?.mode === 'DEMO';
  const allowedDecisions = isDemo
    ? ['ALL', 'EMIT', 'REVISE', 'WITHDRAW', ...(events.some((event) => event.captionDecision === 'WAIT') ? ['WAIT'] : [])]
    : ['ALL', 'EMIT'];
  const selectedDecision = allowedDecisions.includes(decision) ? decision : 'ALL';
  const filtered = useMemo(() => events.filter((event) => {
    const matchesQuery = `${event.action} ${event.message}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (selectedDecision === 'ALL' || event.captionDecision === selectedDecision || event.decision === selectedDecision);
  }), [selectedDecision, events, query]);
  const emitted = events.filter((event) => event.captionDecision === 'EMIT' || (!event.captionDecision && event.decision === 'SPEAK')).length;
  const revised = events.filter((event) => event.captionDecision === 'REVISE').length;
  const withdrawn = events.filter((event) => event.captionDecision === 'WITHDRAW').length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Lịch sử dự đoán"
        title="Lịch sử phiên Backend"
        description="Xem các phiên và caption events đã được lưu bền vững bởi CausalStream Backend."
        action={<Button icon={RefreshCw} variant="secondary" onClick={refresh}>Làm mới</Button>}
      />
      {error ? <div className="notice warning">{error}</div> : null}
      <Card className="filter-bar">
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={sessions.length === 0}>
          {sessions.length === 0 ? <option>Chưa có phiên Backend</option> : null}
          {sessions.map((session) => <option key={session.id} value={session.id}>{session.id} · {session.status}</option>)}
        </select>
        <label className="search-box">
          <Search size={18} />
          <input placeholder="Tìm nội dung sự kiện..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select value={selectedDecision} onChange={(event) => setDecision(event.target.value)}>
          <option value="ALL">Quyết định: Tất cả</option>
          <option value="EMIT">EMIT</option>
          {isDemo ? <option value="REVISE">REVISE</option> : null}
          {isDemo ? <option value="WITHDRAW">WITHDRAW</option> : null}
          {isDemo && allowedDecisions.includes('WAIT') ? <option value="WAIT">WAIT</option> : null}
        </select>
      </Card>
      <div className="history-layout">
        <div>
          <div className="summary-grid history-summary">
            <StatCard icon={BarChart3} label="Sự kiện trong phiên" value={String(events.length)} meta="Dữ liệu từ API" />
            <StatCard icon={Mic2} label="Caption đã tạo" value={String(emitted)} meta="Sự kiện EMIT" tone="green" />
            {isDemo ? <StatCard icon={Zap} label="Caption đã sửa" value={String(revised)} meta="Sự kiện REVISE" tone="purple" /> : null}
            {isDemo ? <StatCard icon={Zap} label="Caption đã thu hồi" value={String(withdrawn)} meta="Sự kiện WITHDRAW" tone="purple" /> : null}
          </div>
          <Card className="table-card">
            <CardTitle icon={FileText} title={isLoading ? 'Đang tải lịch sử...' : 'Caption events đã lưu'} />
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Phiên</th><th>Thời gian</th><th>Sự kiện</th><th>Trạng thái caption</th><th>Nội dung</th><th>Nguồn</th></tr></thead>
                <tbody>
                  {filtered.map((event, index) => (
                    <tr key={event.id}>
                      <td>{index + 1}</td>
                      <td className="linkish">{event.sessionId.slice(0, 8)}</td>
                      <td>{event.timestamp}</td>
                      <td>{event.action}</td>
                      <td><Pill tone={event.captionDecision === 'WITHDRAW' ? 'amber' : event.captionDecision === 'REVISE' ? 'blue' : event.captionDecision === 'WAIT' ? 'gray' : 'green'}>{event.captionDecision ?? event.decision}</Pill></td>
                      <td>{event.message}</td>
                      <td>{event.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!isLoading && filtered.length === 0 ? <div className="table-empty">Không có sự kiện phù hợp trong phiên này.</div> : null}
            </div>
          </Card>
        </div>
        <SessionDetails session={selectedSession} events={events} />
      </div>
    </PageShell>
  );
}
