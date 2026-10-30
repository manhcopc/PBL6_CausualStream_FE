import { Database, RefreshCw } from 'lucide-react';
import { Button, Card, CardTitle, Pill } from './ui';

export function ServiceTable() {
  const rows = ['API Server', 'AI Inference Engine', 'GPU Service', 'Memory Manager', 'Camera Connector', 'Analytics Worker'];
  return (
    <Card className="table-card">
      <CardTitle icon={Database} title="Danh sách dịch vụ hệ thống" />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Dịch vụ</th><th>Trạng thái</th><th>Uptime</th><th>Phiên bản</th><th>Hành động</th></tr></thead>
          <tbody>{rows.map((row, index) => (
            <tr key={row}><td>{row}</td><td><Pill tone={index === 2 ? 'amber' : 'green'}>{index === 2 ? 'Tải cao' : 'Đang chạy'}</Pill></td><td>12 ngày {index + 3} giờ</td><td>v1.{index}.0</td><td><Button icon={RefreshCw} variant="secondary">Khởi động lại</Button></td></tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  );
}
