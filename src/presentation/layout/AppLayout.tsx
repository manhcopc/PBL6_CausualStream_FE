import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Bell, Box, Camera, ChevronDown, Clock3, Home, Menu, Settings, SlidersHorizontal, Video } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Trang chủ', icon: Home },
  { path: '/live', label: 'Phân tích trực tiếp', icon: Camera },
  { path: '/video-analysis', label: 'Phân tích video', icon: Video },
  { path: '/history', label: 'Lịch sử', icon: Clock3 },
  { path: '/models', label: 'Mô hình đang chạy', icon: Box },
  { path: '/system', label: 'Hệ thống', icon: Settings },
  { path: '/settings', label: 'Cài đặt', icon: SlidersHorizontal },
] as const;

export function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-shell"><Outlet /></main>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="CausalStream home"><span className="brand-mark">∞</span><span>CausalStream</span></Link>
      <button className="icon-button mobile-menu" onClick={() => setOpen((value) => !value)} aria-label="Mở menu"><Menu size={20} /></button>
      <nav className={`nav-list ${open ? 'is-open' : ''}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="nav-link"
            data-label={item.label}
            aria-label={item.label}
            onClick={() => setOpen(false)}
          >
            <item.icon size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="profile-cluster"><button className="icon-button" aria-label="Thông báo"><Bell size={22} /><span className="notification-dot" /></button><div className="avatar">NM</div><strong>Nguyễn Minh</strong><ChevronDown size={18} /></div>
    </header>
  );
}
