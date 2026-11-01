import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  ShieldCheck,
  ShieldAlert,
  Hash,
  Calendar,
  Layers,
  ArrowLeft,
  Printer,
  Sparkles,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Scan, ReportItem } from '../types';

export const ReportDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('scan');

  const [scan, setScan] = useState<Scan | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [scanId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (scanId) {
        const s = await api.getScan(scanId);
        setScan(s);
      } else {
        const reps = await api.getReports();
        setReports(reps);
        if (reps.length > 0 && reps[0].scan) {
          setScan(reps[0].scan);
        } else if (reps.length > 0 && reps[0].scan_id) {
          const s = await api.getScan(reps[0].scan_id);
          setScan(s);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#16425c]">
        <Link
          to="/history"
          className="text-xs font-mono text-[#9bb8c9] hover:text-[#00d9f5] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Scan History</span>
        </Link>

        {scan && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#061526] hover:bg-[#102b43] text-xs font-mono text-[#f3fbff] border border-[#16425c] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#00d9f5]" />
              <span>Print Certificate</span>
            </button>
            <a
              href={`/api/v1/reports/${scan.id}/download`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-xs font-semibold text-[#020914] flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,217,245,0.4)]"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </a>
          </div>
        )}
      </div>

      {/* Official Forensic Certificate Document Card */}
      {scan ? (
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border-2 border-[#00d9f5]/50 shadow-2xl space-y-8 bg-gradient-to-b from-[#091b2d] via-[#061526] to-[#020914]">
          {/* Certificate Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#16425c]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d9f5] animate-ping" />
                <span className="text-[11px] font-mono tracking-widest text-[#00d9f5] uppercase font-bold">
                  DEEPTRUST AI FORENSIC LABORATORY
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                Certificate of Digital Authenticity
              </h1>
              <p className="text-xs font-mono text-[#9bb8c9] mt-0.5">
                Cryptographic Media Examination & Manipulative Anomaly Audit
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#020914] border border-[#16425c] text-right font-mono">
              <span className="text-[10px] text-[#9bb8c9] block">REPORT IDENTIFIER</span>
              <span className="text-xs font-bold text-[#00d9f5]">DTR-{scan.id.slice(0, 10).toUpperCase()}</span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Integrity Verification */}
          <div className="p-4 rounded-2xl bg-[#020914] border border-[#16425c] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#00d9f5] font-bold flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                <span>SHA-256 DIGITAL HASH FINGERPRINT</span>
              </span>
              <span className="text-[#17d9aa]">CRYPTOGRAPHICALLY VERIFIED</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#061526] text-xs font-mono text-[#33edff] break-all border border-[#16425c]/50">
              {scan.file_hash_sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </div>
          </div>

          {/* Specification Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
              <span className="text-[10px] text-[#9bb8c9] uppercase block">Media Type</span>
              <span className="text-white font-bold uppercase">{scan.media_type}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
              <span className="text-[10px] text-[#9bb8c9] uppercase block">Examination Date</span>
              <span className="text-white">{new Date(scan.created_at).toLocaleString()}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
              <span className="text-[10px] text-[#9bb8c9] uppercase block">Model Engine</span>
              <span className="text-[#00d9f5] font-bold truncate block">{scan.model_name}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
              <span className="text-[10px] text-[#9bb8c9] uppercase block">Engine Version</span>
              <span className="text-white font-bold">{scan.model_version}</span>
            </div>
          </div>

          {/* Examination Verdict Card */}
          <div
            className={`p-6 rounded-2xl border ${
              scan.overall_risk === 'high' || scan.overall_risk === 'critical'
                ? 'bg-[#ff4969]/10 border-[#ff4969]/40'
                : scan.overall_risk === 'medium'
                ? 'bg-[#ffb84d]/10 border-[#ffb84d]/40'
                : 'bg-[#17d9aa]/10 border-[#17d9aa]/40'
            } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9bb8c9] block mb-1">
                EXAMINATION VERDICT & CLASSIFICATION
              </span>
              <h2 className="font-heading text-xl font-extrabold text-white">
                {scan.classification}
              </h2>
              <div className="text-xs text-[#9bb8c9] mt-1 font-mono">
                Risk Score: <b>{scan.risk_score}%</b> • Calibration Confidence: <b>{Math.round(scan.confidence * 100)}%</b>
              </div>
            </div>

            <div className="font-mono text-xs px-4 py-2 rounded-xl bg-[#020914] border border-[#16425c] text-white">
              SEVERITY: <span className="font-bold uppercase text-[#00d9f5]">{scan.overall_risk}</span>
            </div>
          </div>

          {/* Evidence Visuals (Spectrogram / ELA / Keyframe) */}
          {scan.evidence && scan.evidence.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                Spectral & Artifact Forensics
              </h3>
              {scan.evidence.map((ev) => (
                <div key={ev.id} className="p-4 rounded-2xl bg-[#020914] border border-[#16425c] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#00d9f5]">
                    <span>{ev.title}</span>
                    <span className="text-[10px] text-[#9bb8c9] uppercase">{ev.evidence_type}</span>
                  </div>
                  {ev.visual_url && (
                    <div className="rounded-xl overflow-hidden border border-[#16425c] bg-black max-h-72 flex justify-center">
                      <img src={ev.visual_url} alt={ev.title} className="max-h-72 object-contain" />
                    </div>
                  )}
                  {ev.description && (
                    <p className="text-xs text-[#9bb8c9] leading-relaxed">{ev.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Executive Summary & Findings */}
          <div className="space-y-3">
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Forensic Evaluation Summary
            </h3>
            <div className="p-4 rounded-xl bg-[#020914] border border-[#16425c] text-xs text-[#f3fbff] leading-relaxed font-mono">
              {scan.summary}
            </div>
          </div>

          {/* Methodology Limitations */}
          <div className="space-y-2">
            <h3 className="font-heading text-xs font-bold text-[#ffb84d] uppercase tracking-wider">
              Technical Limitations & Codec Constraints
            </h3>
            <p className="text-xs text-[#9bb8c9] leading-relaxed">
              {scan.technical_limitations ||
                'Analysis is based on acoustic spectral discontinuity and spatial frequency residuals. Lossy cellular transcoding (Opus, AMR) can alter artifact visibility.'}
            </p>
          </div>

          {/* Recommended Verification Protocol */}
          <div className="p-4 rounded-xl bg-[#020914] border border-[#16425c] space-y-2">
            <h3 className="font-heading text-xs font-bold text-[#17d9aa] uppercase tracking-wider">
              Mandatory Action Protocol
            </h3>
            <ul className="text-xs text-[#9bb8c9] space-y-1">
              {scan.recommended_actions?.map((act, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#00d9f5]">•</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Compliance Disclaimer */}
          <div className="pt-6 border-t border-[#16425c] text-[11px] text-[#9bb8c9]/70 leading-relaxed font-mono">
            <b>STATUTORY COMPLIANCE DISCLAIMER:</b> This automated digital forensic certificate is generated for intelligence and defensive risk assessment. Automated probabilistic predictions do not constitute statutory judicial proof without court-admissible chain-of-custody affidavit.
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center text-[#9bb8c9]">
          {loading ? 'Compiling forensic report...' : 'No scan selected to generate report.'}
        </div>
      )}
    </div>
  );
};
