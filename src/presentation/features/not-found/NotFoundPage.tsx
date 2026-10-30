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

export function NotFoundPage() {
  return (
    <PageShell>
      <Card className="empty-state">
        <Search size={48} />
        <h1>Không tìm thấy trang</h1>
        <p>Route này chưa tồn tại trong CausalStream.</p>
        <Link to="/" className="btn primary">Quay lại trang chủ</Link>
      </Card>
    </PageShell>
  );
}
