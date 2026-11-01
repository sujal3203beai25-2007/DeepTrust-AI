import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  ScanLine,
  Cpu,
  History,
  FileText,
  GitCompare,
  Archive,
  Bot,
  GraduationCap,
  Eye,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/translations';

export const AppLayout: React.FC = () => {
  const { user, logout, language, setLanguage } = useAuth();
  const { t } = useTranslation(language);
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationSections: Array<{
    title: string;
    items: Array<{
      label: string;
      path: string;
      icon: any;
      highlight?: boolean;
      badge?: string;
      pulse?: boolean;
    }>;
  }> = [
    {
      title: 'MAIN',
      items: [
        { label: t.dashboard, path: '/dashboard', icon: LayoutDashboard },
        { label: t.scanMedia, path: '/scan', icon: ScanLine },
        { label: 'Dual-Risk Voice', path: '/dual-risk', icon: Radio, highlight: true },
        { label: t.liveDemoLab, path: '/demo-lab', icon: Cpu, badge: 'JUDGES' },
      ],
    },
    {
      title: 'ANALYSIS',
      items: [
        { label: t.scanHistory, path: '/history', icon: History },
        { label: t.reports, path: '/reports', icon: FileText },
        { label: t.compareVerify, path: '/compare', icon: GitCompare },
        { label: t.evidenceVault, path: '/evidence-vault', icon: Archive },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { label: t.verificationAssistant, path: '/assistant', icon: Bot, pulse: true },
        { label: t.awarenessCenter, path: '/awareness', icon: GraduationCap },
        { label: t.modelTransparency, path: '/transparency', icon: Eye },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: t.profile, path: '/profile', icon: UserIcon },
        { label: t.settings, path: '/settings', icon: Settings },
      ],
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const notifications = [
    { id: 1, title: 'Real-time Audio Model Synchronized', time: '2m ago', type: 'info' },
    { id: 2, title: 'High-Risk Scam Flagged in Scan #7C993', time: '18m ago', type: 'warning' },
    { id: 3, title: 'Forensic PDF Certificate Generated', time: '1h ago', type: 'success' },
  ];

  return (
    <div className="min-h-screen bg-[#020914] text-[#f3fbff] flex overflow-x-hidden font-sans">
      {/* Ambient Cyber Grid Overlay */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />

      {/* MOBILE DRAWER BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* LEFT PERSISTENT SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 flex flex-col bg-[#061526]/95 border-r border-[#16425c] backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#16425c]">
          <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-[#00d9f5]/20 to-[#020914] border border-[#00d9f5]/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,217,245,0.4)]">
              <Shield className="w-5 h-5 text-[#00d9f5]" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="font-heading font-bold text-base tracking-wider text-white">
                  DEEP<span className="text-[#00d9f5]">TRUST</span>
                </div>
                <div className="text-[9px] font-mono text-[#00d9f5] tracking-widest uppercase">AI CYBERSEC</div>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Sidebar"
            className="hidden md:flex p-1.5 rounded-lg text-[#9bb8c9] hover:text-[#00d9f5] hover:bg-[#102b43] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close Sidebar"
            className="md:hidden p-1.5 text-[#9bb8c9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationSections.map((sec) => (
            <div key={sec.title}>
              {!collapsed && (
                <div className="px-3 mb-2 text-[10px] font-mono font-semibold tracking-wider text-[#9bb8c9]/60 uppercase">
                  {sec.title}
                </div>
              )}
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-[#00d9f5]/15 text-[#33edff] border-l-2 border-[#00d9f5] shadow-[0_0_15px_rgba(0,217,245,0.25)] font-semibold'
                          : 'text-[#9bb8c9] hover:text-[#f3fbff] hover:bg-[#091b2d]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-[#00d9f5]'
                            : item.highlight
                            ? 'text-[#33edff]'
                            : 'text-[#9bb8c9] group-hover:text-[#00d9f5]'
                        }`}
                      />
                      {!collapsed && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00d9f5]/20 text-[#00d9f5] border border-[#00d9f5]/40 font-bold">
                          {item.badge}
                        </span>
                      )}
                      {!collapsed && item.pulse && (
                        <span className="w-2 h-2 rounded-full bg-[#00d9f5] animate-ping" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-[#16425c]">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#ff4969] hover:bg-[#ff4969]/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>{t.logout}</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-30 h-20 bg-[#020914]/90 backdrop-blur-xl border-b border-[#16425c] flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open Navigation Drawer"
              className="md:hidden p-2 rounded-lg bg-[#061526] border border-[#16425c] text-[#9bb8c9]"
            >
              <Menu className="w-5 h-5 text-[#00d9f5]" />
            </button>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#9bb8c9]">
              <Link to="/dashboard" className="hover:text-[#00d9f5]">DEEPTRUST</Link>
              <span>/</span>
              <span className="text-[#00d9f5] uppercase font-semibold">
                {location.pathname.replace('/', '') || 'DASHBOARD'}
              </span>
            </div>
          </div>

          {/* Center Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md mx-4 hidden md:block"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9bb8c9]" />
              <input
                type="text"
                placeholder="Search scans, file hashes (SHA-256), or threat indicators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] placeholder-[#9bb8c9]/60 focus:outline-none transition-colors shadow-inner"
              />
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Multilingual Selector */}
            <div className="flex items-center gap-1.5 bg-[#061526] border border-[#16425c] rounded-xl px-2.5 py-1.5 text-xs text-[#9bb8c9]">
              <Globe className="w-3.5 h-3.5 text-[#00d9f5]" />
              <select
                aria-label="Change Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-[#f3fbff] focus:outline-none cursor-pointer text-xs"
              >
                <option value="en" className="bg-[#091b2d]">EN</option>
                <option value="hi" className="bg-[#091b2d]">हिन्दी</option>
                <option value="pa" className="bg-[#091b2d]">ਪੰਜਾਬੀ</option>
              </select>
            </div>

            {/* Notifications Flyout */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Open notifications"
                className="relative p-2 rounded-xl bg-[#061526] border border-[#16425c] text-[#9bb8c9] hover:text-[#00d9f5] transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00d9f5] animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl border border-[#00d9f5]/30 p-4 shadow-2xl z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-[#16425c]">
                    <span className="font-heading text-xs font-bold text-white tracking-wider">FORENSIC NOTIFICATIONS</span>
                    <span className="text-[10px] font-mono text-[#00d9f5]">LIVE FEED</span>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-[#061526]/80 border border-[#16425c]/50 text-xs">
                        <div className="flex items-center justify-between text-[#9bb8c9] text-[10px] mb-1">
                          <span>{n.time}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00d9f5]" />
                        </div>
                        <p className="text-[#f3fbff] font-medium leading-snug">{n.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl bg-[#061526] border border-[#16425c] hover:border-[#00d9f5]/50 transition-colors"
            >
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Avatar"
                className="w-7 h-7 rounded-lg object-cover border border-[#00d9f5]"
              />
              <span className="text-xs font-medium text-[#f3fbff] hidden lg:inline max-w-[120px] truncate">
                {user?.full_name || 'Alexander Vance'}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
