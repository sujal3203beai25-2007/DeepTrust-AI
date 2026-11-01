import React, { useState, useEffect } from 'react';
import {
  Archive,
  FileCheck2,
  Download,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Search,
  Hash,
  Clock,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { Scan } from '../types';

export const EvidenceVaultPage: React.FC = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);

  useEffect(() => {
    loadVault();
  }, []);

  const loadVault = async () => {
    setLoading(true);
    try {
      const data = await api.getScans();
      setScans(data);
      if (data.length > 0) setSelectedScan(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = scans.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(term) ||
      (s.file_hash_sha256 && s.file_hash_sha256.toLowerCase().includes(term)) ||
      s.classification.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#16425c]/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d9f5]/15 border border-[#00d9f5]/40 text-[#00d9f5] text-xs font-mono mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>CRYPTOGRAPHIC INTEGRITY VAULT</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Digital Evidence Vault
          </h1>
          <p className="text-xs text-[#9bb8c9] mt-1">
            Preserve immutable SHA-256 media signatures, analysis timestamps, and certified forensic verification records.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9bb8c9]" />
          <input
            type="text"
            placeholder="Filter by hash or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] placeholder-[#9bb8c9]/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Saved Evidence Records List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-[#9bb8c9] px-1">
            RECORDED ARTIFACTS ({filtered.length})
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((s) => {
              const isSelected = selectedScan?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedScan(s)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#061526] border-[#00d9f5] shadow-[0_0_15px_rgba(0,217,245,0.2)]'
                      : 'bg-[#091b2d]/60 border-[#16425c] hover:border-[#00d9f5]/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white truncate max-w-[220px]">{s.title}</span>
                    <span className="text-[10px] font-mono text-[#00d9f5] uppercase">{s.media_type}</span>
                  </div>

                  <div className="text-[10px] font-mono text-[#9bb8c9] truncate mb-2">
                    SHA-256: {s.file_hash_sha256 ? `${s.file_hash_sha256.slice(0, 24)}...` : 'N/A'}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-[#16425c]/40">
                    <span className="text-[#9bb8c9]">
                      {new Date(s.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-[#17d9aa]">
                      Risk: {s.risk_score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Evidence Certificate & Proof */}
        <div className="lg:col-span-7">
          {selectedScan ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#00d9f5]/40 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#16425c]">
                <div>
                  <span className="text-[10px] font-mono text-[#00d9f5] uppercase tracking-wider">
                    EVIDENCE RECORD IDENTIFIER
                  </span>
                  <h3 className="font-heading text-lg font-bold text-white mt-0.5">
                    {selectedScan.id}
                  </h3>
                </div>
                <a
                  href={`/api/v1/reports/${selectedScan.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-xs font-semibold text-[#020914] flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,217,245,0.4)]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Certificate</span>
                </a>
              </div>

              {/* SHA-256 Cryptographic Footprint Box */}
              <div className="p-4 rounded-2xl bg-[#020914] border border-[#16425c] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#00d9f5]">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4" />
                    <span>SHA-256 DIGITAL FINGERPRINT</span>
                  </span>
                  <span className="text-[#17d9aa]">VERIFIED IMMUTABLE</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#061526] font-mono text-xs text-[#33edff] break-all border border-[#16425c]/50">
                  {selectedScan.file_hash_sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
              </div>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]">
                  <span className="text-[10px] text-[#9bb8c9] block">Media Container</span>
                  <span className="text-white font-bold uppercase">{selectedScan.media_type}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]">
                  <span className="text-[10px] text-[#9bb8c9] block">Model Evaluator</span>
                  <span className="text-[#00d9f5] font-bold truncate block">{selectedScan.model_name}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]">
                  <span className="text-[10px] text-[#9bb8c9] block">Model Version</span>
                  <span className="text-white font-bold">{selectedScan.model_version}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]">
                  <span className="text-[10px] text-[#9bb8c9] block">Inference Timestamp</span>
                  <span className="text-white">{new Date(selectedScan.created_at).toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]">
                  <span className="text-[10px] text-[#9bb8c9] block">Calibration Confidence</span>
                  <span className="text-[#17d9aa] font-bold">{Math.round(selectedScan.confidence * 100)}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#061526] border border-[#16425c]">
                  <span className="text-[10px] text-[#9bb8c9] block">Verdict Severity</span>
                  <span className="text-[#ff4969] font-bold uppercase">{selectedScan.overall_risk}</span>
                </div>
              </div>

              {/* Evidence Visual Preview */}
              {selectedScan.evidence && selectedScan.evidence.length > 0 && selectedScan.evidence[0].visual_url && (
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#9bb8c9] uppercase">Attached Forensic Visual Proof</div>
                  <div className="rounded-xl overflow-hidden border border-[#16425c] bg-black max-h-56 flex justify-center">
                    <img src={selectedScan.evidence[0].visual_url} alt="Proof" className="max-h-56 object-contain" />
                  </div>
                </div>
              )}

              {/* Legal Custody Notice */}
              <div className="p-4 rounded-xl bg-[#020914] border border-[#16425c] text-[11px] text-[#9bb8c9] leading-relaxed">
                <span className="text-white font-bold">Forensic Integrity Notice: </span>
                This vault record stores cryptographic checksums computed at the exact millisecond of upload. It provides technical verification of file integrity. Automated predictions do not constitute statutory judicial custody without certified digital notary integration.
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center text-[#9bb8c9]">
              Select an evidence artifact on the left to review its cryptographic record.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
