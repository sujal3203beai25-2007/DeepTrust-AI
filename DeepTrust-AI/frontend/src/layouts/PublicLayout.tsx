import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Cpu, Sparkles, ExternalLink, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/translations';

export const PublicLayout: React.FC = () => {
  const { user, language, setLanguage } = useAuth();
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020914] text-[#f3fbff] flex flex-col font-sans selection:bg-[#00d9f5]/30 selection:text-[#33edff]">
      {/* Top Cybersecurity Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-36 bg-[#00d9f5]/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#020914]/85 border-b border-[#16425c]/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#00d9f5]/20 to-[#061526] border border-[#00d9f5]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,217,245,0.3)] group-hover:shadow-[0_0_25px_rgba(0,217,245,0.6)] transition-all">
              <Shield className="w-6 h-6 text-[#00d9f5] transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 rounded-xl border border-[#00d9f5] animate-ping opacity-20 pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-xl font-bold tracking-wider text-white">DEEP<span className="text-[#00d9f5]">TRUST</span></span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#00d9f5]/15 text-[#33edff] border border-[#00d9f5]/40 font-semibold">AI</span>
              </div>
              <p className="text-[10px] text-[#9bb8c9] font-mono tracking-tight hidden sm:block">FORENSIC AUTHENTICITY ENGINE</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#9bb8c9]">
            <a href="#overview" className="hover:text-[#00d9f5] transition-colors">Overview</a>
            <a href="#capabilities" className="hover:text-[#00d9f5] transition-colors">Forensic Suite</a>
            <a href="#how-it-works" className="hover:text-[#00d9f5] transition-colors">How It Works</a>
            <Link to="/transparency" className="hover:text-[#00d9f5] transition-colors flex items-center gap-1">
              <span>Model Transparency</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#17d9aa] animate-pulse" />
            </Link>
            <Link to="/demo-lab" className="hover:text-[#00d9f5] transition-colors flex items-center gap-1">
              <Cpu className="w-4 h-4 text-[#00d9f5]" />
              <span className="text-[#33edff]">Live Demo Lab</span>
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative flex items-center gap-1 bg-[#061526] border border-[#16425c] rounded-lg px-2.5 py-1.5 text-xs text-[#9bb8c9]">
              <Globe className="w-3.5 h-3.5 text-[#00d9f5]" />
              <select
                aria-label="Language Selector"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-[#f3fbff] focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-[#091b2d]">English</option>
                <option value="hi" className="bg-[#091b2d]">हिन्दी</option>
                <option value="pa" className="bg-[#091b2d]">ਪੰਜਾਬੀ</option>
              </select>
            </div>

            {/* Login / Dashboard CTA */}
            {user ? (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-[#00d9f5] hover:text-[#33edff] px-3.5 py-2 transition-colors flex items-center gap-1.5"
              >
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-[#f3fbff] hover:text-[#00d9f5] px-3.5 py-2 transition-colors hidden sm:inline-block"
              >
                Sign In
              </Link>
            )}
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="relative group px-5 py-2.5 rounded-xl text-sm font-semibold text-[#020914] bg-[#00d9f5] hover:bg-[#33edff] transition-all duration-300 shadow-[0_0_20px_rgba(0,217,245,0.4)] hover:shadow-[0_0_30px_rgba(0,217,245,0.8)] overflow-hidden flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#020914] fill-current" />
              <span>{user ? "Open Dashboard" : t.getStarted}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#020914] border-t border-[#16425c]/80 pt-16 pb-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#16425c]/50">
            {/* Col 1 */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00d9f5]/20 border border-[#00d9f5] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#00d9f5]" />
                </div>
                <span className="font-heading text-lg font-bold text-white tracking-wider">
                  DEEP<span className="text-[#00d9f5]">TRUST</span> AI
                </span>
              </div>
              <p className="text-xs text-[#9bb8c9] leading-relaxed">
                Empowering individuals, enterprises, and judicial bodies with explainable AI forensics to counter synthetic deepfakes, voice cloning extortion, and digital social engineering fraud.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#00d9f5]">
                <span className="w-2 h-2 rounded-full bg-[#17d9aa] animate-ping" />
                <span>All 4 Forensic Pipelines Operational</span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#33edff] mb-4 font-semibold">Forensic Suite</h4>
              <ul className="space-y-2.5 text-xs text-[#9bb8c9]">
                <li><Link to="/scan" className="hover:text-[#00d9f5] transition-colors">Acoustic Deepfake Speech Detector</Link></li>
                <li><Link to="/scan" className="hover:text-[#00d9f5] transition-colors">Error Level Analysis (ELA) Image Vision</Link></li>
                <li><Link to="/scan" className="hover:text-[#00d9f5] transition-colors">Temporal Face Forensics Video Engine</Link></li>
                <li><Link to="/scan" className="hover:text-[#00d9f5] transition-colors">ScamShield NLP Message Analyzer</Link></li>
                <li><Link to="/dual-risk" className="hover:text-[#00d9f5] transition-colors text-[#33edff] font-medium">Dual-Risk Voice Note Audit</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#33edff] mb-4 font-semibold">Intelligence & Research</h4>
              <ul className="space-y-2.5 text-xs text-[#9bb8c9]">
                <li><Link to="/demo-lab" className="hover:text-[#00d9f5] transition-colors">Live Hackathon Demonstration Lab</Link></li>
                <li><Link to="/transparency" className="hover:text-[#00d9f5] transition-colors">Empirical Benchmark Metrics & Confusion Matrices</Link></li>
                <li><Link to="/awareness" className="hover:text-[#00d9f5] transition-colors">Cybersecurity Scam Awareness & Quizzes</Link></li>
                <li><Link to="/evidence-vault" className="hover:text-[#00d9f5] transition-colors">Tamper-Proof Evidence Vault</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#33edff] mb-4 font-semibold">Emergency Helpline</h4>
              <p className="text-xs text-[#9bb8c9] leading-relaxed mb-3">
                If you suspect active extortion or banking compromise, report immediately:
              </p>
              <div className="p-3 rounded-lg bg-[#061526] border border-[#16425c] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9bb8c9]">India Cybercrime:</span>
                  <span className="font-mono text-[#00d9f5] font-bold">1930</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9bb8c9]">US FTC Fraud:</span>
                  <span className="font-mono text-[#00d9f5] font-bold">1-877-FTC-HELP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9bb8c9]/70">
            <p>© 2026 DeepTrust AI. Built with precision for competitive university hackathon excellence.</p>
            <div className="flex items-center gap-6">
              <span>Detect the Fake. Protect the Real.</span>
              <span className="text-[#00d9f5] font-mono">v1.0.0-PROD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
