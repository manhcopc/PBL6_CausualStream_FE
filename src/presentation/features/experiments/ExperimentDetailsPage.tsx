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

export function ExperimentDetailsPage() {
  const { id } = useParams();
  const model = models.find((item) => item.experimentId === id);
  if (!model) {
    return (
      <PageShell>
        <Card className="empty-state">
          <Search size={48} />
          <h1>Không tìm thấy thí nghiệm</h1>
          <p>Mã thí nghiệm không tồn tại trong dữ liệu demo.</p>
          <Link to="/models" className="btn primary">Quay lại danh sách mô hình</Link>
        </Card>
      </PageShell>
    );
  }
  const confusionLabels = ['take', 'put', 'open', 'close', 'cut', 'mix', 'pour', 'wash', 'pick', 'place'];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Chi tiết thí nghiệm"
        title="Chi tiết thí nghiệm"
        description="Thông tin chi tiết, kết quả đánh giá và phân tích của mô hình."
        action={<div className="control-row"><Button icon={Share2} variant="secondary">Chia sẻ</Button><Link className="btn secondary" to="/models"><BarChart3 size={18} /> So sánh</Link><Button icon={Play}>Chạy lại thí nghiệm</Button></div>}
      />
      <Card className="experiment-hero">
        <div className="icon-disc blue"><Wand2 size={36} /></div>
        <div>
          <h2>{model.name} Early Recognition Benchmark</h2>
          <div className="tag-row"><Pill tone="blue">{model.dataset}</Pill><Pill tone="gray">Run ID: {model.experimentId}</Pill><Pill tone="green">Hoàn tất - Mock</Pill></div>
        </div>
        <p>Đánh giá khả năng nhận biết hành động sớm trên tập dữ liệu {model.dataset}.</p>
      </Card>
      <div className="summary-grid">
        <StatCard icon={Gauge} label="Accuracy" value={`${model.accuracy}%`} meta="+1.6% so với lần chạy trước" />
        <StatCard icon={BarChart3} label="Macro F1" value={`${model.macroF1}%`} meta="+2.1% so với lần chạy trước" />
        <StatCard icon={Shield} label="ECE / Calibration" value={String(model.ece)} meta="Thấp hơn là tốt hơn" tone="green" />
        <StatCard icon={Zap} label="Latency" value={`${model.latency} ms`} meta="-42 ms" />
      </div>
      <div className="experiment-grid">
        <Card>
          <CardTitle icon={Settings} title="Cấu hình thí nghiệm" />
          <InfoRows rows={[
            ['Bộ mã hóa hình ảnh', 'DINOv2 ViT-S/14'],
            ['Mô hình thời gian', model.architecture],
            ['Tốc độ khung hình', '2 FPS'],
            ['Ngưỡng độ tin cậy', '0.60'],
            ['Chính sách dự đoán', 'Threshold + Temporal Stability'],
            ['Độ dài chuỗi', '32 frames (4s)'],
          ]} />
        </Card>
        <ChartCard title="Độ chính xác sớm theo tỉ lệ quan sát thời gian" icon={LineChartIcon}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="GRU" stroke="#1478f2" strokeWidth={3} />
              <Line dataKey="Transformer" stroke="#10b981" strokeWidth={3} />
              <Line dataKey="Mamba" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardTitle icon={Calendar} title="Ma trận nhầm lẫn" action={<select><option>Top 10 lớp</option></select>} />
          <div className="matrix">
            {confusionLabels.map((row, rowIndex) => (
              <div key={row}>
                <span>{row}</span>
                {confusionLabels.map((col, colIndex) => (
                  <i key={col} style={{ opacity: rowIndex === colIndex ? 0.95 : 0.15 + ((rowIndex + colIndex) % 5) * 0.08 }} />
                ))}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle icon={FileText} title="Nhật ký huấn luyện" />
          <InfoRows rows={[
            ['14:32:01', 'Bắt đầu thí nghiệm...'],
            ['14:32:15', 'Đã tải 89,236 video'],
            ['15:12:08', 'Đang đánh giá trên validation...'],
            ['15:28:17', 'Thí nghiệm kết thúc thành công!'],
          ]} />
        </Card>
        <ChartCard title="Biểu đồ loss/accuracy" icon={FileText}>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={trainingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
              <XAxis dataKey="epoch" />
              <YAxis />
              <Tooltip />
              <Area dataKey="trainAcc" stroke="#10b981" fill="#d1fae5" />
              <Area dataKey="valAcc" stroke="#1478f2" fill="#dbeafe" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card tone="mint">
          <CardTitle icon={Info} title="Kết luận" />
          <div className="notice success"><CheckCircle2 /> Thí nghiệm hoàn tất thành công. Mô hình hoạt động ổn định với dữ liệu mock.</div>
          <p>Không diễn giải các chỉ số này như kết quả nghiên cứu đã kiểm chứng; đây là dữ liệu mẫu để demo giao diện.</p>
        </Card>
      </div>
    </PageShell>
  );
}
