import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Sparkles,
  Play,
  Mic,
  Image as ImageIcon,
  Video,
  MessageSquare,
  FileCheck2,
  Lock,
  Cpu,
  ArrowRight,
  ChevronDown,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/translations';

export const LandingPage: React.FC = () => {
  const { language } = useAuth();
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [quickInput, setQuickInput] = useState('');
  const [quickScanning, setQuickScanning] = useState(false);
  const [quickResult, setQuickResult] = useState<any>(null);

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    setQuickScanning(true);
    setQuickResult(null);

    // Quick demo preview scan
    setTimeout(() => {
      const lower = quickInput.toLowerCase();
      const isUrgent = lower.includes('otp') || lower.includes('block') || lower.includes('immediately') || lower.includes('transfer');
      setQuickResult({
        classification: isUrgent ? 'Suspicious Social Engineering Pattern' : 'Low-Risk Standard Content',
        risk_score: isUrgent ? 86 : 12,
        overall_risk: isUrgent ? 'high' : 'low',
        indicators: isUrgent ? ['Urgent Payment Coercion', 'OTP Phishing Heuristic'] : ['No Malicious Heuristics'],
      });
      setQuickScanning(false);
    }, 1200);
  };

  const faqs = [
    {
      q: "How does DeepTrust AI detect voice clones and synthetic speech?",
      a: "Our acoustic pipeline standardizes audio to 16kHz and extracts high-dimensional Mel-spectrograms, MFCCs, and phase continuity parameters. Generative vocoders (like HiFi-GAN and VITS) leave subtle acoustic cut-offs, phase inconsistencies, and unnatural pitch micro-jitter that human vocal tracts physically cannot produce."
    },
    {
      q: "What is Dual-Risk Analysis and why is it unique?",
      a: "Traditional tools only check if media is fake or real. DeepTrust AI independently decouples synthetic media detection (Acoustic Forensics) from social engineering threat detection (NLP Scam Analysis). Even if a scammer uses their real human voice, our system detects fraudulent extortion patterns."
    },
    {
      q: "Can DeepTrust AI verify WhatsApp or cellular voice notes with low quality?",
      a: "Yes. Our models are trained with data augmentation including lossy compression (Opus, AMR-NB, MP3). The system provides transparent uncertainty confidence scores and explicitly documents when heavy transcoding affects detection fidelity."
    },
    {
      q: "Does DeepTrust AI store my private uploaded recordings?",
      a: "Uploaded media files are processed securely in private sandbox storage and can be deleted instantly by the user or wiped upon request. We never sell, leak, or train third-party public models on your confidential evidence."
    }
  ];

  return (
    <div className="relative">
      {/* =========================================================================
          HERO SECTION — Screen 1 Exact Composition & Layout
          ========================================================================= */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center pt-8 pb-16 overflow-hidden">
        {/* Neon Cyber Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d9f5]/15 blur-[160px] pointer-events-none rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#16425c]/30 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-7 z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#061526] border border-[#00d9f5]/40 shadow-[0_0_15px_rgba(0,217,245,0.2)]">
                <span className="w-2 h-2 rounded-full bg-[#17d9aa] animate-pulse" />
                <span className="text-xs font-mono font-medium text-[#33edff] tracking-wide uppercase">
                  FORENSIC-GRADE AI AUTHENTICITY PLATFORM
                </span>
              </div>

              {/* Exact Hero Headline */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Detect the Fake. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d9f5] via-[#33edff] to-[#17d9aa] drop-shadow-[0_0_35px_rgba(0,217,245,0.4)]">
                  Protect the Real.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-[#9bb8c9] max-w-2xl leading-relaxed">
                Counter synthetic audio deepfakes, face swaps, visual splicing, and AI-powered voice extortion scams with explainable multi-spectral forensics and decoupled dual-risk intelligence.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/signup"
                  className="px-7 py-3.5 rounded-xl font-heading font-semibold text-sm text-[#020914] bg-[#00d9f5] hover:bg-[#33edff] transition-all duration-300 shadow-[0_0_25px_rgba(0,217,245,0.5)] hover:shadow-[0_0_35px_rgba(0,217,245,0.9)] hover:scale-[1.02] flex items-center gap-2.5"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>{t.getStarted}</span>
                </Link>

                <Link
                  to="/demo-lab"
                  className="px-7 py-3.5 rounded-xl font-heading font-semibold text-sm text-[#f3fbff] bg-[#091b2d] hover:bg-[#102b43] border border-[#16425c] hover:border-[#00d9f5]/60 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,217,245,0.2)] flex items-center gap-2.5 group"
                >
                  <Play className="w-4 h-4 text-[#00d9f5] group-hover:scale-110 transition-transform fill-[#00d9f5]/20" />
                  <span>{t.watchDemo}</span>
                </Link>
              </div>

              {/* Key Trust Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#16425c]/60 max-w-lg">
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-white">4 Modes</div>
                  <div className="text-xs text-[#9bb8c9] font-mono">Audio • Image • Video • NLP</div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#00d9f5]">92.4%</div>
                  <div className="text-xs text-[#9bb8c9] font-mono">ASVspoof Evaluation</div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#17d9aa]">SHA-256</div>
                  <div className="text-xs text-[#9bb8c9] font-mono">Tamper-Proof Proofs</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Human Face Biometric Scanning */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden p-2 bg-gradient-to-b from-[#00d9f5]/40 via-[#16425c]/50 to-[#020914] shadow-[0_0_50px_rgba(0,217,245,0.25)] border border-[#00d9f5]/50 group">
                
                {/* Embedded generated biometric face scanning asset */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#020914]">
                  <img
                    src="/assets/hero-face.jpg"
                    alt="DeepTrust AI Biometric Forensic Scanning"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Cyber Laser Scanline Sweep */}
                  <div className="animate-scanline" />

                  {/* Digital HUD Telemetry Overlays */}
                  <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-[#020914]/80 backdrop-blur-md border border-[#00d9f5]/40 text-[10px] font-mono text-[#00d9f5] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#17d9aa] animate-ping" />
                      <span className="font-bold">FORENSIC HUD v2.4</span>
                    </div>
                    <div className="text-[#9bb8c9]">MESH: 1,420 VERTICES</div>
                    <div className="text-[#33edff]">VOCODER JITTER: 0.042 ms</div>
                  </div>

                  <div className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-[#020914]/85 backdrop-blur-md border border-[#17d9aa]/40 text-[10px] font-mono text-[#17d9aa] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#17d9aa]" />
                    <span>AUTHENTICITY VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          LIVE INTERACTIVE MINI-SCANNER (Try It Instantly)
          ========================================================================= */}
      <section className="py-12 border-y border-[#16425c]/50 bg-[#061526]/50 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-[#00d9f5]/30 shadow-[0_0_30px_rgba(0,217,245,0.1)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00d9f5]" />
                  <span>Instant Threat Audit Preview</span>
                </h3>
                <p className="text-xs text-[#9bb8c9]">Test a suspicious SMS message, banking ultimatum, or domain link right now.</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#00d9f5]/10 text-[#00d9f5] border border-[#00d9f5]/30">
                LIVE SANDBOX
              </span>
            </div>

            <form onSubmit={handleQuickScan} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. Your electricity will be blocked tonight at 9 PM. Share OTP immediately or visit http://wb-bill.xyz"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  className="flex-1 bg-[#020914] border border-[#16425c] focus:border-[#00d9f5] rounded-xl px-4 py-3 text-xs text-[#f3fbff] placeholder-[#9bb8c9]/50 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={quickScanning}
                  className="px-6 py-3 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-[#020914] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,217,245,0.4)] disabled:opacity-50 cursor-pointer"
                >
                  {quickScanning ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <span>Inspect</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {quickResult && (
              <div className="mt-4 p-4 rounded-xl bg-[#020914]/90 border border-[#00d9f5]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${quickResult.overall_risk === 'high' ? 'text-[#ff4969]' : 'text-[#17d9aa]'}`}>
                      {quickResult.classification}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#16425c] text-[#f3fbff]">
                      Risk: {quickResult.risk_score}%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9bb8c9]">
                    Indicators: {quickResult.indicators.join(' • ')}
                  </div>
                </div>
                <Link
                  to="/scan"
                  className="text-xs text-[#00d9f5] hover:underline font-mono flex items-center gap-1 self-start sm:self-center"
                >
                  <span>Run Full Multi-Spectral Scan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUR FORENSIC CAPABILITIES
          ========================================================================= */}
      <section id="capabilities" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-semibold text-[#00d9f5] tracking-widest uppercase">
              MULTI-MODAL FORENSIC INTELLIGENCE
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              End-to-End Digital Authenticity Suite
            </h2>
            <p className="text-sm text-[#9bb8c9]">
              Specialized neural architectures built specifically to detect distinct mathematical and physical manipulation signatures across audio, visual, and text media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Audio */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-[#16425c] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#00d9f5]/15 border border-[#00d9f5]/40 flex items-center justify-center text-[#00d9f5]">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">Audio Deepfake Detection</h3>
                <p className="text-xs text-[#9bb8c9] leading-relaxed">
                  AASIST & ResNet spectral pipelines analyze vocoder phase discontinuity, 128-band Mel-spectrograms, and unnatural pitch micro-jitter to expose cloned speech.
                </p>
              </div>
              <div className="pt-6 border-t border-[#16425c]/50 mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#00d9f5]">Wav2Vec2 / AASIST</span>
                <Link to="/scan" className="text-xs text-[#33edff] hover:text-white flex items-center gap-1">
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-[#16425c] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#17d9aa]/15 border border-[#17d9aa]/40 flex items-center justify-center text-[#17d9aa]">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">Image Authenticity & ELA</h3>
                <p className="text-xs text-[#9bb8c9] leading-relaxed">
                  Calculates authentic Error Level Analysis (ELA) residual compression maps and 2D Fourier high-frequency ring power to identify diffusion synthesis & splicing.
                </p>
              </div>
              <div className="pt-6 border-t border-[#16425c]/50 mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#17d9aa]">ELA & DCT Spectral</span>
                <Link to="/scan" className="text-xs text-[#33edff] hover:text-white flex items-center gap-1">
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Video */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-[#16425c] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffb84d]/15 border border-[#ffb84d]/40 flex items-center justify-center text-[#ffb84d]">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">Video Temporal Forensics</h3>
                <p className="text-xs text-[#9bb8c9] leading-relaxed">
                  Inter-frame motion tracking, face boundary sharpness consistency, and temporal optical flow variance detect face-swaps, deepfake masks, and avatar manipulation.
                </p>
              </div>
              <div className="pt-6 border-t border-[#16425c]/50 mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#ffb84d]">Temporal 3D Mesh</span>
                <Link to="/scan" className="text-xs text-[#33edff] hover:text-white flex items-center gap-1">
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Scam & Phishing */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-[#16425c] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#ff4969]/15 border border-[#ff4969]/40 flex items-center justify-center text-[#ff4969]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">Message & Phishing Audit</h3>
                <p className="text-xs text-[#9bb8c9] leading-relaxed">
                  NLP semantic classifiers detect psychological urgency coercion, OTP theft triggers, and typosquatting lookalike domains with built-in SSRF sandbox protection.
                </p>
              </div>
              <div className="pt-6 border-t border-[#16425c]/50 mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#ff4969]">DeBERTa NLP Engine</span>
                <Link to="/scan" className="text-xs text-[#33edff] hover:text-white flex items-center gap-1">
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FLAGSHIP INNOVATION: DUAL-RISK ANALYSIS HIGHLIGHT
          ========================================================================= */}
      <section className="py-20 bg-gradient-to-b from-[#061526]/80 to-[#020914] border-y border-[#16425c]/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d9f5]/15 border border-[#00d9f5]/40 text-[#00d9f5] text-xs font-mono">
                <Layers className="w-3.5 h-3.5" />
                <span>SECTION 5 FLAGSHIP INNOVATION</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Decoupled Dual-Risk Analysis for Voice Notes
              </h2>
              <p className="text-sm text-[#9bb8c9] leading-relaxed">
                Most platforms make the fatal mistake of conflating artificial voice scores with fraud probability. DeepTrust AI breaks new ground by separating acoustic media forensics from transcript-level social engineering extortion detection.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-[#091b2d] border border-[#16425c] flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#00d9f5]/20 text-[#00d9f5] flex items-center justify-center font-bold text-sm shrink-0">
                    A
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Acoustic Synthetic Media Risk</h4>
                    <p className="text-xs text-[#9bb8c9] mt-0.5">
                      Evaluates vocoder frequency cutoff, STFT phase stability, and spectral rollover.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#091b2d] border border-[#16425c] flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#ff4969]/20 text-[#ff4969] flex items-center justify-center font-bold text-sm shrink-0">
                    B
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Scam & Social Engineering Risk</h4>
                    <p className="text-xs text-[#9bb8c9] mt-0.5">
                      Transcribes speech and parses OTP demands, urgent ultimatums, and banking fraud heuristics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/dual-risk"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00d9f5] text-[#020914] font-semibold text-xs hover:bg-[#33edff] transition-all shadow-[0_0_20px_rgba(0,217,245,0.4)]"
                >
                  <span>Launch Dual-Risk Voice Lab</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Dual-Meter Simulation Card */}
            <div className="lg:col-span-6">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#00d9f5]/40 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#16425c]">
                  <span className="font-heading text-xs font-bold text-white tracking-wider">VOICE NOTE FORENSIC TELEMETRY</span>
                  <span className="text-[10px] font-mono text-[#ff4969] px-2 py-0.5 rounded bg-[#ff4969]/15 border border-[#ff4969]/30">
                    CRITICAL DUAL THREAT
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c] text-xs font-mono text-[#9bb8c9] leading-relaxed">
                  <span className="text-[#33edff] font-bold">Transcript: </span>
                  "Your SBI bank account will be <span className="bg-[#ff4969]/30 text-white px-1 rounded">blocked today</span>. Share your <span className="bg-[#ff4969]/30 text-white px-1 rounded">OTP immediately</span> to unfreeze."
                </div>

                {/* Meter 1 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9bb8c9]">A. Acoustic Vocoder Synthetic Score</span>
                    <span className="font-mono text-[#00d9f5] font-bold">88.5% (High Synthetic)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#061526] overflow-hidden border border-[#16425c]">
                    <div className="h-full bg-gradient-to-r from-[#00d9f5] to-[#33edff] rounded-full" style={{ width: '88.5%' }} />
                  </div>
                </div>

                {/* Meter 2 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9bb8c9]">B. Extortion & Scam Language Score</span>
                    <span className="font-mono text-[#ff4969] font-bold">94.0% (Critical Extortion)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#061526] overflow-hidden border border-[#16425c]">
                    <div className="h-full bg-gradient-to-r from-[#ffb84d] to-[#ff4969] rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#ff4969]/10 border border-[#ff4969]/40 flex items-center gap-3 text-xs text-[#f3fbff]">
                  <AlertTriangle className="w-5 h-5 text-[#ff4969] shrink-0" />
                  <span>Dual convergence: Generative voice clone delivering active OTP extortion. Verification advised.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (Technical Workflow)
          ========================================================================= */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-semibold text-[#00d9f5] tracking-widest uppercase">
              TRANSPARENT AI ARCHITECTURE
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              How DeepTrust AI Processes Evidence
            </h2>
            <p className="text-sm text-[#9bb8c9]">
              Every scan follows an immutable forensic pipeline ensuring cryptographic data integrity and explainable reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel rounded-2xl p-6 border border-[#16425c] relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#00d9f5]/20 text-[#00d9f5] flex items-center justify-center font-mono font-bold">
                01
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Cryptographic Ingestion</h3>
              <p className="text-xs text-[#9bb8c9] leading-relaxed">
                Media files are hashed via SHA-256 upon reception to create a tamper-evident digital custody footprint. Audio is normalized to 16kHz mono and video is sampled into frame sequences.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-[#16425c] relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#33edff]/20 text-[#33edff] flex items-center justify-center font-mono font-bold">
                02
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Multi-Spectral Inference</h3>
              <p className="text-xs text-[#9bb8c9] leading-relaxed">
                Raw signals pass through domain-specific neural models: AASIST for vocoder acoustics, Error Level Analysis for image compression discrepancies, and temporal optical flow for video frames.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-[#16425c] relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#17d9aa]/20 text-[#17d9aa] flex items-center justify-center font-mono font-bold">
                03
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Forensic Reporting & PDF</h3>
              <p className="text-xs text-[#9bb8c9] leading-relaxed">
                The platform formats findings into an executive Certificate of Authenticity with embedded Mel-spectrograms, explicit technical limitations, and actionable verification steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION
          ========================================================================= */}
      <section className="py-20 bg-[#061526]/40 border-t border-[#16425c]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-mono font-semibold text-[#00d9f5] tracking-widest uppercase">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Understanding Deepfake Forensics
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-panel rounded-xl border border-[#16425c] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-[#f3fbff] hover:text-[#00d9f5] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#00d9f5] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[#9bb8c9] leading-relaxed border-t border-[#16425c]/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CALL TO ACTION
          ========================================================================= */}
      <section className="py-20 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Verify Suspicious Media?
          </h2>
          <p className="text-sm text-[#9bb8c9] max-w-xl mx-auto">
            Experience real-time AI audio, image, video, and scam forensics. No fabricated scores. Pure empirical evidence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/signup"
              className="px-8 py-3.5 rounded-xl font-heading font-semibold text-sm text-[#020914] bg-[#00d9f5] hover:bg-[#33edff] transition-all duration-300 shadow-[0_0_25px_rgba(0,217,245,0.6)]"
            >
              Create Account
            </Link>
            <Link
              to="/demo-lab"
              className="px-8 py-3.5 rounded-xl font-heading font-semibold text-sm text-white bg-[#091b2d] hover:bg-[#102b43] border border-[#16425c] transition-colors"
            >
              Explore Live Demo Lab
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
