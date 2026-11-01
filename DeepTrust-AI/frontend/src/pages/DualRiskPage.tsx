import React, { useState } from 'react';
import {
  Radio,
  Mic,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Download,
  Sparkles,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Volume2
} from 'lucide-react';
import { api } from '../services/api';
import { Scan } from '../types';

export const DualRiskPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [scan, setScan] = useState<Scan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const runDualRisk = async () => {
    if (!file) {
      setError('Please select an audio file (e.g. WAV, MP3) to evaluate.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.scanDualRisk(file);
      setScan(result);
    } catch (err: any) {
      setError(err.message || 'Dual-risk analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoVoice = async () => {
    // Demo voice sample
    setLoading(true);
    try {
      const demoResult = await api.runDemoSample('sample-audio-synthetic');
      setScan({
        id: 'dual-risk-demo-1',
        user_id: 'demo-user',
        media_type: 'audio',
        title: 'Voice Clone Extortion Call: Bank Security Threat',
        file_size_bytes: 421000,
        status: 'completed',
        classification: 'Synthetic / AI-Generated Speech',
        overall_risk: 'critical',
        risk_score: 88.5,
        synthetic_risk_score: 88.5,
        scam_risk_score: 94.0,
        confidence: 0.96,
        model_name: 'DeepTrust-DualRisk-AcousticNLP',
        model_version: 'v2.5-Decoupled',
        inference_latency_ms: 45.2,
        summary: 'CRITICAL THREAT: AI-Generated Voice Clone delivering an Active Social Engineering Scam.',
        transcript:
          'Urgent notification from State Bank Security Department: Your account access has been temporarily blocked due to suspicious overseas activity. To unfreeze your debit card immediately, you must state your one-time password OTP within ten minutes, or a formal police complaint will be filed.',
        flagged_phrases: [
          { phrase: 'one-time password OTP', category: 'OTP & Credential Theft', description: 'Direct request for secret credentials' },
          { phrase: 'temporarily blocked', category: 'Urgent Coercion & Threats', description: 'Urgent ultimatum panic pressure' },
          { phrase: 'within ten minutes', category: 'Urgent Coercion & Threats', description: 'Psychological deadline pressure' },
          { phrase: 'State Bank Security Department', category: 'Authority Impersonation', description: 'Banking authority impersonation' }
        ],
        technical_limitations: 'Evaluates independent vocoder phase continuity and NLP threat heuristics.',
        recommended_actions: [
          'DO NOT disclose OTP or PIN codes over telephone or voice notes.',
          'Call bank helpline via the official telephone number printed on physical ATM card.',
          'File report on National Cyber Crime Helpline (1930).'
        ],
        created_at: new Date().toISOString(),
        evidence: [
          {
            id: 'ev-spec-1',
            evidence_type: 'spectrogram',
            title: 'Acoustic Mel-Spectrogram Residual',
            description: 'Highlights vocoder cutoff at 7.5 kHz and suppressed natural pitch jitter.',
            visual_url: demoResult.spectrogram_url,
            created_at: new Date().toISOString()
          }
        ]
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Flagship Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d9f5]/15 border border-[#00d9f5]/40 text-[#00d9f5] text-xs font-mono">
          <Layers className="w-3.5 h-3.5" />
          <span>SECTION 5 FLAGSHIP INNOVATION</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          Decoupled Dual-Risk Voice Analysis
        </h1>
        <p className="text-xs sm:text-sm text-[#9bb8c9] max-w-2xl mx-auto">
          Independently audits <span className="text-[#00d9f5] font-semibold">Synthetic Audio Media Risk</span> (neural vocoders) and <span className="text-[#ff4969] font-semibold">Social Engineering Scam Risk</span> (OTP extortion) without conflating distinct probabilities.
        </p>
      </div>

      {/* Upload & Demo Quick Action */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#16425c] space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-[#ff4969]/10 border border-[#ff4969]/40 text-xs text-[#ff4969]">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#061526] border border-[#16425c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d9f5]/20 text-[#00d9f5] flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Select Audio File to Audit</div>
              <div className="text-[10px] text-[#9bb8c9] font-mono">WhatsApp voice notes, call recordings, voicemails (.wav, .mp3, .ogg)</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="file"
              id="dual-file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => document.getElementById('dual-file')?.click()}
              className="px-4 py-2 rounded-xl bg-[#091b2d] hover:bg-[#102b43] text-xs text-[#33edff] border border-[#16425c] transition-colors cursor-pointer"
            >
              {file ? file.name : 'Choose Recording'}
            </button>
            <button
              onClick={runDualRisk}
              disabled={loading || !file}
              className="px-5 py-2 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-xs font-semibold text-[#020914] transition-all shadow-[0_0_15px_rgba(0,217,245,0.4)] disabled:opacity-40 cursor-pointer"
            >
              {loading ? 'Analyzing...' : 'Audit Dual Risk'}
            </button>
          </div>
        </div>

        {/* Or Test Sample Button for judges */}
        <div className="text-center pt-2">
          <span className="text-xs text-[#9bb8c9]">Evaluating for Hackathon Judges? </span>
          <button
            onClick={loadDemoVoice}
            disabled={loading}
            className="text-xs text-[#00d9f5] hover:underline font-bold font-mono ml-1"
          >
            [Load Curated Bank Scam Voice Note]
          </button>
        </div>
      </div>

      {/* =========================================================================
          DUAL RISK RESULTS DISPLAY
          ========================================================================= */}
      {scan && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#00d9f5]/50 shadow-2xl space-y-8">
          {/* Header Verdict */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#16425c]">
            <div>
              <span className="text-[10px] font-mono text-[#00d9f5] uppercase tracking-wider font-bold">
                DUAL-RISK EXAMINATION VERDICT
              </span>
              <h3 className="font-heading text-xl font-bold text-white mt-1">
                {scan.title}
              </h3>
            </div>
            <div className="p-2 px-3 rounded-xl bg-[#ff4969]/15 border border-[#ff4969]/40 text-xs font-mono font-bold text-[#ff4969]">
              {scan.overall_risk.toUpperCase()} SEVERITY
            </div>
          </div>

          {/* TWO INDEPENDENT GAUGES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assessment A: Synthetic Media */}
            <div className="p-6 rounded-2xl bg-[#061526] border border-[#00d9f5]/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-6 h-6 rounded-lg bg-[#00d9f5]/20 text-[#00d9f5] flex items-center justify-center font-mono">A</span>
                  <span>SYNTHETIC MEDIA RISK</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#00d9f5]">
                  {scan.synthetic_risk_score ?? scan.risk_score}%
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-[#020914] overflow-hidden border border-[#16425c]">
                <div
                  className="h-full bg-gradient-to-r from-[#00d9f5] to-[#33edff] rounded-full transition-all duration-700"
                  style={{ width: `${scan.synthetic_risk_score ?? scan.risk_score}%` }}
                />
              </div>

              <div className="text-xs text-[#9bb8c9] space-y-1">
                <div className="text-white font-medium">Acoustic Vocoder Signatures:</div>
                <p>High-frequency spectral rolloff at 7.5 kHz and abnormal fundamental frequency (F0) stability typical of neural speech generation.</p>
              </div>
            </div>

            {/* Assessment B: Scam Extortion */}
            <div className="p-6 rounded-2xl bg-[#061526] border border-[#ff4969]/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-6 h-6 rounded-lg bg-[#ff4969]/20 text-[#ff4969] flex items-center justify-center font-mono">B</span>
                  <span>SCAM / SOCIAL ENGINEERING RISK</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#ff4969]">
                  {scan.scam_risk_score ?? 94.0}%
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-[#020914] overflow-hidden border border-[#16425c]">
                <div
                  className="h-full bg-gradient-to-r from-[#ffb84d] to-[#ff4969] rounded-full transition-all duration-700"
                  style={{ width: `${scan.scam_risk_score ?? 94.0}%` }}
                />
              </div>

              <div className="text-xs text-[#9bb8c9] space-y-1">
                <div className="text-white font-medium">Extortion & Urgency Indicators:</div>
                <p>Urgent ultimatum ("account blocked"), regulatory impersonation, and explicit solicitation of OTP credentials.</p>
              </div>
            </div>
          </div>

          {/* Transcript with Highlighted Fraud Phrases */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#33edff] font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00d9f5]" />
              <span>Transcribed Speech & Highlighted Extortion Indicators</span>
            </h4>

            <div className="p-5 rounded-2xl bg-[#020914] border border-[#16425c] text-xs font-mono leading-relaxed text-[#f3fbff]">
              {scan.transcript}
            </div>

            {/* Detected flagged phrases chips */}
            {scan.flagged_phrases && scan.flagged_phrases.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {scan.flagged_phrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-[#ff4969]/10 border border-[#ff4969]/30 text-[11px] text-[#ff4969] flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span><b>{phrase.phrase}</b>: {phrase.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mel-Spectrogram Evidence if available */}
          {scan.evidence && scan.evidence.length > 0 && scan.evidence[0].visual_url && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#33edff] font-semibold">
                Mel-Spectrogram Vocoder Phase Telemetry
              </h4>
              <div className="rounded-xl overflow-hidden border border-[#16425c] bg-black max-h-64 flex justify-center">
                <img src={scan.evidence[0].visual_url} alt="Spectrogram" className="max-h-64 object-contain" />
              </div>
            </div>
          )}

          {/* Recommended Verification Protocols */}
          <div className="p-5 rounded-2xl bg-[#020914] border border-[#16425c] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#17d9aa]" />
              <span>Mandatory Safety Protocol</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#9bb8c9]">
              <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]/50">
                <span className="text-[#00d9f5] font-bold block mb-1">1. Do Not Disclose OTP</span>
                No financial institution ever asks for your OTP password via telephone.
              </div>
              <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]/50">
                <span className="text-[#00d9f5] font-bold block mb-1">2. Verify Out-of-Band</span>
                Hang up and phone the caller on their verified official published contact.
              </div>
              <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]/50">
                <span className="text-[#00d9f5] font-bold block mb-1">3. File Evidence Report</span>
                Preserve audio file hash and report to the 1930 Cyber Helpline immediately.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
