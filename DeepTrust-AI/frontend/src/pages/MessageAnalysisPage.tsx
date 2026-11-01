import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Globe,
  Download,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Lock,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Scan } from '../types';

export const MessageAnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('id');

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScan();
  }, [scanId]);

  const loadScan = async () => {
    setLoading(true);
    try {
      if (scanId) {
        const s = await api.getScan(scanId);
        setScan(s);
      } else {
        const all = await api.getScans();
        const msgScan = all.find((s) => s.media_type === 'message' || s.media_type === 'url');
        if (msgScan) setScan(msgScan);
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
            NLP SCAM & PHISHING THREAT DEFENSE
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Message & Phishing URL Inspection
          </h1>
          <p className="text-xs text-[#9bb8c9] mt-1 font-mono">
            Analyzes psychological coercion, lookalike brand spoofing, and OTP credential harvesting.
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
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#16425c] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#16425c]">
              <div>
                <span className="text-xs font-mono text-[#9bb8c9] uppercase">SUBJECT AUDIT</span>
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

            {/* Analyzed Text Content Box */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#33edff] uppercase font-bold">
                Payload Transcript / Content
              </span>
              <div className="p-4 rounded-xl bg-[#020914] border border-[#16425c] text-xs font-mono leading-relaxed text-[#f3fbff]">
                {scan.transcript || scan.title}
              </div>
            </div>

            {/* Flagged Threat Chips */}
            {scan.flagged_phrases && scan.flagged_phrases.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#ff4969] uppercase font-bold">
                  Identified Threat Indicators ({scan.flagged_phrases.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {scan.flagged_phrases.map((fp, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#ff4969]/10 border border-[#ff4969]/30 text-xs text-[#ff4969] flex items-center gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        <b>"{fp.phrase}"</b>: {fp.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] text-[#9bb8c9] uppercase block">Risk Score</span>
                <span className="text-xl font-bold text-white mt-1">{scan.risk_score}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] text-[#9bb8c9] uppercase block">NLP Confidence</span>
                <span className="text-xl font-bold text-[#00d9f5] mt-1">{Math.round(scan.confidence * 100)}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] text-[#9bb8c9] uppercase block">Inference Latency</span>
                <span className="text-xl font-bold text-[#17d9aa] mt-1">{scan.inference_latency_ms} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] text-[#9bb8c9] uppercase block">NLP Model</span>
                <span className="text-xs text-white truncate block mt-2">{scan.model_name}</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recommended Safety Action</h4>
              <ul className="text-xs text-[#9bb8c9] space-y-1">
                {scan.recommended_actions?.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#00d9f5]">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center text-[#9bb8c9]">
          {loading ? 'Retrieving message analysis...' : 'No message scan found. Analyze text in the Universal Scan Center.'}
        </div>
      )}
    </div>
  );
};
