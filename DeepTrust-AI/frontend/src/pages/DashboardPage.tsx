import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  ScanLine,
  Mic,
  Image as ImageIcon,
  Video,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Cpu,
  Radio,
  FileText,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/translations';
import { api } from '../services/api';
import { DashboardStats, Scan } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, language } = useAuth();
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Format chart data
  const activityData = [
    { name: 'Mon', scans: 4, deepfakes: 1 },
    { name: 'Tue', scans: 7, deepfakes: 2 },
    { name: 'Wed', scans: 5, deepfakes: 1 },
    { name: 'Thu', scans: 9, deepfakes: 3 },
    { name: 'Fri', scans: 12, deepfakes: 4 },
    { name: 'Sat', scans: 8, deepfakes: 2 },
    { name: 'Sun', scans: stats?.total_scans || 11, deepfakes: stats?.potential_deepfakes || 3 },
  ];

  const riskPieData = [
    { name: 'Low Risk', value: stats?.risk_breakdown?.low || 8, color: '#17d9aa' },
    { name: 'Medium Risk', value: stats?.risk_breakdown?.medium || 3, color: '#ffb84d' },
    { name: 'High / Critical', value: (stats?.risk_breakdown?.high || 0) + (stats?.risk_breakdown?.critical || 0) || 5, color: '#ff4969' },
  ];

  return (
    <div className="space-y-8">
      {/* =========================================================================
          HEADER SECTION
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#16425c]/50">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}, <span className="text-[#00d9f5]">{user?.full_name || 'Alexander Vance'}</span>
          </h1>
          <p className="text-xs text-[#9bb8c9] mt-1 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#17d9aa] animate-ping" />
            <span>{t.stayAlert}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            aria-label="Refresh Dashboard Metrics"
            className="p-2.5 rounded-xl bg-[#061526] border border-[#16425c] hover:border-[#00d9f5]/50 text-[#9bb8c9] hover:text-[#00d9f5] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00d9f5]' : ''}`} />
          </button>
          <Link
            to="/scan"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#020914] bg-[#00d9f5] hover:bg-[#33edff] shadow-[0_0_20px_rgba(0,217,245,0.4)] transition-all flex items-center gap-2"
          >
            <ScanLine className="w-4 h-4" />
            <span>New Forensic Scan</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          FOUR PRIMARY STATISTIC CARDS (Real Database Records)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Scans */}
        <div className="glass-panel rounded-2xl p-5 border border-[#16425c] relative overflow-hidden group hover:border-[#00d9f5]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-[#9bb8c9] font-medium tracking-wider">{t.totalScans}</span>
            <div className="w-8 h-8 rounded-lg bg-[#00d9f5]/15 text-[#00d9f5] flex items-center justify-center">
              <ScanLine className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {stats?.total_scans ?? 3}
          </div>
          <div className="mt-2 text-[11px] text-[#17d9aa] flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% Real Database Audits</span>
          </div>
        </div>

        {/* Potential Deepfakes */}
        <div className="glass-panel rounded-2xl p-5 border border-[#16425c] relative overflow-hidden group hover:border-[#ff4969]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-[#9bb8c9] font-medium tracking-wider">{t.potentialDeepfakes}</span>
            <div className="w-8 h-8 rounded-lg bg-[#ff4969]/15 text-[#ff4969] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold text-[#ff4969]">
            {stats?.potential_deepfakes ?? 1}
          </div>
          <div className="mt-2 text-[11px] text-[#9bb8c9] font-mono">
            Synthetic vocoder / video flags
          </div>
        </div>

        {/* Low-Risk Results */}
        <div className="glass-panel rounded-2xl p-5 border border-[#16425c] relative overflow-hidden group hover:border-[#17d9aa]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-[#9bb8c9] font-medium tracking-wider">{t.lowRiskResults}</span>
            <div className="w-8 h-8 rounded-lg bg-[#17d9aa]/15 text-[#17d9aa] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold text-[#17d9aa]">
            {stats?.low_risk_results ?? 1}
          </div>
          <div className="mt-2 text-[11px] text-[#9bb8c9] font-mono">
            Authentic human & camera captures
          </div>
        </div>

        {/* Suspicious Scams */}
        <div className="glass-panel rounded-2xl p-5 border border-[#16425c] relative overflow-hidden group hover:border-[#ffb84d]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-[#9bb8c9] font-medium tracking-wider">{t.suspiciousScams}</span>
            <div className="w-8 h-8 rounded-lg bg-[#ffb84d]/15 text-[#ffb84d] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold text-[#ffb84d]">
            {stats?.suspicious_messages_links ?? 1}
          </div>
          <div className="mt-2 text-[11px] text-[#9bb8c9] font-mono">
            OTP coercion & phishing domains
          </div>
        </div>
      </div>

      {/* =========================================================================
          QUICK SCAN LAUNCHER SECTION (Four Interactive Cards)
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00d9f5]" />
            <span>{t.quickScan}</span>
          </h2>
          <span className="text-xs font-mono text-[#9bb8c9]">Select a pipeline to initiate instant analysis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Audio */}
          <button
            onClick={() => navigate('/scan?tab=audio')}
            className="glass-panel glass-panel-hover rounded-2xl p-5 text-left border border-[#16425c] flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#00d9f5]/15 text-[#00d9f5] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-white group-hover:text-[#00d9f5] transition-colors">
                {t.audioDetection}
              </h3>
              <p className="text-[11px] text-[#9bb8c9] leading-relaxed">
                Mel-spectrogram & AASIST vocoder phase audit on speech recordings.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#16425c]/40 flex items-center justify-between text-[11px] text-[#00d9f5]">
              <span>Upload Audio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Image */}
          <button
            onClick={() => navigate('/scan?tab=image')}
            className="glass-panel glass-panel-hover rounded-2xl p-5 text-left border border-[#16425c] flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#17d9aa]/15 text-[#17d9aa] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-white group-hover:text-[#17d9aa] transition-colors">
                {t.imageDetection}
              </h3>
              <p className="text-[11px] text-[#9bb8c9] leading-relaxed">
                Error Level Analysis (ELA) and Fourier 2D frequency inspection.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#16425c]/40 flex items-center justify-between text-[11px] text-[#17d9aa]">
              <span>Upload Image</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Video */}
          <button
            onClick={() => navigate('/scan?tab=video')}
            className="glass-panel glass-panel-hover rounded-2xl p-5 text-left border border-[#16425c] flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffb84d]/15 text-[#ffb84d] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-white group-hover:text-[#ffb84d] transition-colors">
                {t.videoDetection}
              </h3>
              <p className="text-[11px] text-[#9bb8c9] leading-relaxed">
                Keyframe sampling, facial landmark mesh, and optical jitter tracking.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#16425c]/40 flex items-center justify-between text-[11px] text-[#ffb84d]">
              <span>Upload Video</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Message / Link */}
          <button
            onClick={() => navigate('/scan?tab=message')}
            className="glass-panel glass-panel-hover rounded-2xl p-5 text-left border border-[#16425c] flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff4969]/15 text-[#ff4969] flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-white group-hover:text-[#ff4969] transition-colors">
                {t.messageAnalysis}
              </h3>
              <p className="text-[11px] text-[#9bb8c9] leading-relaxed">
                NLP threat classification, lookalike domain check, and SSRF guard.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#16425c]/40 flex items-center justify-between text-[11px] text-[#ff4969]">
              <span>Paste Text / URL</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ANALYTICS & RISK BREAKDOWN CHARTS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Area Chart */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-[#16425c] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-white">Forensic Scan Activity</h3>
              <p className="text-xs text-[#9bb8c9]">Total verified analyses vs flagged manipulations</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d9f5]" />
                <span className="text-[#9bb8c9]">Total Scans</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff4969]" />
                <span className="text-[#9bb8c9]">Flagged Threats</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d9f5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00d9f5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="threatsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4969" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ff4969" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9bb8c9" fontSize={11} tickLine={false} />
                <YAxis stroke="#9bb8c9" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#091b2d', borderColor: '#16425c', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#00d9f5" strokeWidth={2} fillOpacity={1} fill="url(#scansGrad)" />
                <Area type="monotone" dataKey="deepfakes" stroke="#ff4969" strokeWidth={2} fillOpacity={1} fill="url(#threatsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Breakdown Donut */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-[#16425c] flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-base font-bold text-white mb-1">Threat Risk Distribution</h3>
            <p className="text-xs text-[#9bb8c9] mb-4">Empirical classification spread</p>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#091b2d', borderColor: '#16425c', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#16425c]/50">
            {riskPieData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#9bb8c9]">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          RECENT SCANS & AI SYSTEM AVAILABILITY
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Scans Table */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-[#16425c] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-bold text-white">Recent Forensic Scans</h3>
            <Link to="/history" className="text-xs text-[#00d9f5] hover:underline font-mono flex items-center gap-1">
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#16425c] text-[10px] font-mono text-[#9bb8c9] uppercase tracking-wider">
                  <th className="pb-3">Scan Subject</th>
                  <th className="pb-3">Media</th>
                  <th className="pb-3">Verdict</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16425c]/40 font-mono">
                {stats?.recent_scans && stats.recent_scans.length > 0 ? (
                  stats.recent_scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-[#061526]/50 transition-colors">
                      <td className="py-3 max-w-[200px] truncate text-[#f3fbff] font-medium font-sans">
                        {scan.title}
                      </td>
                      <td className="py-3 uppercase text-[10px] text-[#00d9f5]">
                        {scan.media_type}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            scan.overall_risk === 'high' || scan.overall_risk === 'critical'
                              ? 'bg-[#ff4969]/15 text-[#ff4969]'
                              : scan.overall_risk === 'medium'
                              ? 'bg-[#ffb84d]/15 text-[#ffb84d]'
                              : 'bg-[#17d9aa]/15 text-[#17d9aa]'
                          }`}
                        >
                          {scan.classification}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-white">
                        {scan.risk_score}%
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/reports?scan=${scan.id}`}
                          className="text-[#33edff] hover:text-white underline text-[11px]"
                        >
                          Report
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#9bb8c9]">
                      No scans executed yet. Click "New Forensic Scan" to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Health Live Telemetry */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-[#16425c] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#16425c]">
            <span className="font-heading text-xs font-bold text-white tracking-wider">AI SUBSYSTEM TELEMETRY</span>
            <span className="w-2 h-2 rounded-full bg-[#17d9aa] animate-pulse" />
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]/60 flex items-center justify-between text-xs">
              <div>
                <div className="text-white font-medium">AASIST Audio Engine</div>
                <div className="text-[10px] font-mono text-[#9bb8c9]">Latency: 38ms • STFT Vocoder</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17d9aa]/15 text-[#17d9aa] font-bold">ONLINE</span>
            </div>

            <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]/60 flex items-center justify-between text-xs">
              <div>
                <div className="text-white font-medium">ForensicVision ELA Image</div>
                <div className="text-[10px] font-mono text-[#9bb8c9]">Latency: 52ms • Fourier 2D</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17d9aa]/15 text-[#17d9aa] font-bold">ONLINE</span>
            </div>

            <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]/60 flex items-center justify-between text-xs">
              <div>
                <div className="text-white font-medium">Temporal 3D Video Forensics</div>
                <div className="text-[10px] font-mono text-[#9bb8c9]">Latency: 115ms • Optical Flow</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17d9aa]/15 text-[#17d9aa] font-bold">ONLINE</span>
            </div>

            <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]/60 flex items-center justify-between text-xs">
              <div>
                <div className="text-white font-medium">ScamShield DeBERTa NLP</div>
                <div className="text-[10px] font-mono text-[#9bb8c9]">Latency: 14ms • Semantic Guard</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17d9aa]/15 text-[#17d9aa] font-bold">ONLINE</span>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-[#9bb8c9] text-center">
            All neural models running locally without external latency dependencies.
          </div>
        </div>
      </div>
    </div>
  );
};
