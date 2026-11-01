import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Mic,
  Activity,
  Download,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { Scan } from '../types';

export const AudioAnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('id');

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudioScan();
  }, [scanId]);

  const loadAudioScan = async () => {
    setLoading(true);
    try {
      if (scanId) {
        const s = await api.getScan(scanId);
        setScan(s);
      } else {
        const all = await api.getScans({ media_type: 'audio' });
        if (all.length > 0) setScan(all[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#16425c]/50">
        <div>
          <span className="text-[10px] font-mono text-[#00d9f5] uppercase font-bold tracking-widest">
            ACOUSTIC DEEPFAKE FORENSICS
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Audio Voice Authenticity Audit
          </h1>
          <p className="text-xs text-[#9bb8c9] mt-1 font-mono">
            Evaluates neural vocoder phase continuity, pitch micro-jitter, and high-frequency spectral rolloff.
          </p>
        </div>

        {scan && (
          <a
            href={`/api/v1/reports/${scan.id}/download`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-xs font-semibold text-[#020914] flex items-center gap-2 shadow-[0_0_15px_rgba(0,217,245,0.4)]"
          >
            <Download className="w-4 h-4" />
            <span>Download Forensic PDF</span>
          </a>
        )}
      </div>

      {scan ? (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          <div
            className={`glass-panel rounded-3xl p-6 sm:p-8 border ${
              scan.overall_risk === 'high' || scan.overall_risk === 'critical'
                ? 'border-[#ff4969]/50 shadow-[0_0_30px_rgba(255,73,105,0.15)]'
                : 'border-[#17d9aa]/50 shadow-[0_0_30px_rgba(23,217,170,0.15)]'
            } space-y-6`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#16425c]">
              <div>
                <span className="text-xs font-mono text-[#9bb8c9] uppercase">EXAMINATION SUBJECT</span>
                <h3 className="font-heading text-xl font-bold text-white mt-1">{scan.title}</h3>
              </div>
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase ${
                  scan.overall_risk === 'high' || scan.overall_risk === 'critical'
                    ? 'bg-[#ff4969]/15 text-[#ff4969] border border-[#ff4969]/40'
                    : 'bg-[#17d9aa]/15 text-[#17d9aa] border border-[#17d9aa]/40'
                }`}
              >
                {scan.classification}
              </span>
            </div>

            {/* Score & Telemetry Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] font-mono text-[#9bb8c9] uppercase block">Synthetic Risk</span>
                <span className="font-mono text-2xl font-bold text-white mt-1">{scan.risk_score}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] font-mono text-[#9bb8c9] uppercase block">Calibration Confidence</span>
                <span className="font-mono text-2xl font-bold text-[#00d9f5] mt-1">{Math.round(scan.confidence * 100)}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] font-mono text-[#9bb8c9] uppercase block">Inference Latency</span>
                <span className="font-mono text-2xl font-bold text-[#17d9aa] mt-1">{scan.inference_latency_ms} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] font-mono text-[#9bb8c9] uppercase block">Acoustic Model</span>
                <span className="font-mono text-xs text-white truncate block mt-2" title={scan.model_name}>
                  {scan.model_name}
                </span>
              </div>
            </div>

            {/* Mel-Spectrogram Evidence */}
            {scan.evidence && scan.evidence.length > 0 && scan.evidence[0].visual_url && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#33edff] font-bold">
                  <span>HIGH-RESOLUTION ACOUSTIC MEL-SPECTROGRAM</span>
                  <span className="text-[#9bb8c9]">128 FILTERBANKS • 16kHz MONO</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-[#16425c] bg-[#020914] max-h-80 flex justify-center shadow-inner">
                  <img src={scan.evidence[0].visual_url} alt="Spectrogram" className="max-h-80 object-contain" />
                </div>
              </div>
            )}

            {/* Audio Player */}
            {scan.file_url && (
              <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] space-y-2">
                <span className="text-xs font-mono text-[#00d9f5] font-bold block">Specimen Audio Playback</span>
                <audio controls src={scan.file_url} className="w-full" />
              </div>
            )}

            {/* Findings & Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Detected Acoustic Anomalies</h4>
                <p className="text-xs text-[#9bb8c9] leading-relaxed">{scan.summary}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] space-y-2">
                <h4 className="text-xs font-bold text-[#ffb84d] uppercase tracking-wider">Codec Limitations</h4>
                <p className="text-xs text-[#9bb8c9] leading-relaxed">
                  {scan.technical_limitations ||
                    'Lossy compression on cellular networks can alter vocoder artifact visibility. Background noise may lower certainty.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center text-[#9bb8c9]">
          {loading ? 'Loading acoustic scan data...' : 'No audio scan found. Please upload a recording in the Universal Scan Center.'}
        </div>
      )}
    </div>
  );
};
