import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Image as ImageIcon,
  Download,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck2
} from 'lucide-react';
import { api } from '../services/api';
import { Scan } from '../types';

export const ImageAnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('id');

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImageScan();
  }, [scanId]);

  const loadImageScan = async () => {
    setLoading(true);
    try {
      if (scanId) {
        const s = await api.getScan(scanId);
        setScan(s);
      } else {
        const all = await api.getScans({ media_type: 'image' });
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
            DIGITAL IMAGE FORENSICS
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Image Authenticity & Splicing Audit
          </h1>
          <p className="text-xs text-[#9bb8c9] mt-1 font-mono">
            Error Level Analysis (ELA), 2D Fourier high-frequency power inspection, and EXIF metadata extraction.
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
                <span className="text-xs font-mono text-[#9bb8c9] uppercase">SPECIMEN</span>
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

            {/* Evidence Visuals Grid: Original vs ELA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#9bb8c9] uppercase font-bold">1. Uploaded Specimen</span>
                <div className="rounded-2xl overflow-hidden border border-[#16425c] bg-black max-h-72 flex justify-center">
                  <img src={scan.file_url || '/assets/hero-face.jpg'} alt="Original" className="max-h-72 object-contain" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-[#00d9f5] uppercase font-bold">2. Error Level Analysis (ELA) Residual</span>
                <div className="rounded-2xl overflow-hidden border border-[#00d9f5]/50 bg-black max-h-72 flex justify-center shadow-[0_0_20px_rgba(0,217,245,0.15)]">
                  {scan.evidence && scan.evidence.length > 0 && scan.evidence[0].visual_url ? (
                    <img src={scan.evidence[0].visual_url} alt="ELA Residual Map" className="max-h-72 object-contain" />
                  ) : (
                    <div className="h-72 flex items-center justify-center text-xs text-[#9bb8c9] font-mono">
                      ELA Residual map processing
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Forensic Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] text-[#9bb8c9] uppercase block">Risk Score</span>
                <span className="text-xl font-bold text-white mt-1">{scan.risk_score}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] text-[#9bb8c9] uppercase block">Confidence</span>
                <span className="text-xl font-bold text-[#00d9f5] mt-1">{Math.round(scan.confidence * 100)}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] text-[#9bb8c9] uppercase block">Inference Latency</span>
                <span className="text-xl font-bold text-[#17d9aa] mt-1">{scan.inference_latency_ms} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]">
                <span className="text-[10px] text-[#9bb8c9] uppercase block">Model Engine</span>
                <span className="text-xs text-white truncate block mt-2">{scan.model_name}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Forensic Findings</h4>
              <p className="text-xs text-[#9bb8c9] leading-relaxed">{scan.summary}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center text-[#9bb8c9]">
          {loading ? 'Retrieving image scan...' : 'No image scan found. Upload an image in the Universal Scan Center.'}
        </div>
      )}
    </div>
  );
};
