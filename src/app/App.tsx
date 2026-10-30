import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/presentation/layout/AppLayout';

const HomePage = lazy(() => import('@/presentation/features/home/HomePage').then((module) => ({ default: module.HomePage })));
const LiveAnalysisPage = lazy(() => import('@/presentation/features/live/LiveAnalysisPage').then((module) => ({ default: module.LiveAnalysisPage })));
const VideoAnalysisPage = lazy(() => import('@/presentation/features/video/VideoAnalysisPage').then((module) => ({ default: module.VideoAnalysisPage })));
const HistoryPage = lazy(() => import('@/presentation/features/history/HistoryPage').then((module) => ({ default: module.HistoryPage })));
const ModelComparisonPage = lazy(() => import('@/presentation/features/models/ModelComparisonPage').then((module) => ({ default: module.ModelComparisonPage })));
const SystemDashboardPage = lazy(() => import('@/presentation/features/system/SystemDashboardPage').then((module) => ({ default: module.SystemDashboardPage })));
const SettingsPage = lazy(() => import('@/presentation/features/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const AssistivePages = lazy(() => import('@/presentation/features/assistive/AssistivePages'));
const NotFoundPage = lazy(() => import('@/presentation/features/not-found/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

export default function App() {
  return (
    <Suspense fallback={<div className="route-loading">Đang tải giao diện...</div>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/live" element={<LiveAnalysisPage />} />
          <Route path="/video-analysis" element={<VideoAnalysisPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/models" element={<ModelComparisonPage />} />
          <Route path="/experiments/:id" element={<Navigate to="/models" replace />} />
          <Route path="/system" element={<SystemDashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/assistive" element={<AssistivePages page="main" />} />
          <Route path="/assistive/history" element={<AssistivePages page="history" />} />
          <Route path="/assistive/settings" element={<AssistivePages page="settings" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
