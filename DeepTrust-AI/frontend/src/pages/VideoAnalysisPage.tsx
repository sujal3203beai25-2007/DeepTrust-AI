import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Video,
  Download,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
  Clock,
  Film
} from 'lucide-react';
import { api } from '../services/api';
import { Scan } from '../types';

export const VideoAnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('id');

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideoScan();
  }, [scanId]);

  const loadVideoScan = async () => {
    setLoading(true);
    try {
      if (scanId) {
        const s = await api.getScan(scanId);
        setScan(s);
      } else {
        const all = await api.getScans({ media_type: 'video' });
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
            SPATIO-TEMPORAL VIDEO FORENSICS
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Video Deepfake & Face Swap Audit
          </h1>
          <p className="text-xs text-[#9bb8c9] mt-1 font-mono">
            Inter-frame optical jitter, face landmark stability, and temporal continuity analysis.
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
                <span className="text-xs font-mono text-[#9bb8c9] uppercase">VIDEO SPECIMEN</span>
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

            {/* Video Player */}
            {scan.file_url && (
              <div className="rounded-2xl overflow-hidden border border-[#16425c] bg-black max-h-80 flex justify-center">
                <video controls src={scan.file_url} className="max-h-80 w-full" />
              </div>
            )}

            {/* Keyframe Timeline Gallery */}
            {scan.evidence && scan.evidence.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#33edff] font-bold">
                  <span className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#00d9f5]" />
                    <span>ANALYZED KEYFRAME TIMELINE & FACE BOUNDARY EXTRACTIONS</span>
                  </span>
                  <span className="text-[#9bb8c9]">SAMPLED UNIFORMLY</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {scan.evidence.map((ev) => (
                    <div key={ev.id} className="p-2.5 rounded-xl bg-[#061526] border border-[#16425c] space-y-1.5">
                      {ev.visual_url && (
                        <div className="rounded-lg overflow-hidden border border-[#16425c]/60 max-h-36 bg-black flex justify-center">
                          <img src={ev.visual_url} alt={ev.title} className="max-h-36 object-contain" />
                        </div>
                      )}
                      <div className="text-[10px] font-mono text-white truncate">{ev.title}</div>
                      <div className="text-[9px] font-mono text-[#00d9f5]">{ev.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Temporal Analysis Findings</h4>
              <p className="text-xs text-[#9bb8c9] leading-relaxed">{scan.summary}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center text-[#9bb8c9]">
          {loading ? 'Retrieving video scan...' : 'No video scan found. Upload a video file in the Universal Scan Center.'}
        </div>
      )}
    </div>
  );
};
