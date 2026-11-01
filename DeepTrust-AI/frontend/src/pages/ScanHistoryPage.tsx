import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  FileCheck2,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Scan } from '../types';

export const ScanHistoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaFilter, setMediaFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>(initialSearch);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadScans();
  }, [mediaFilter, riskFilter]);

  const loadScans = async () => {
    setLoading(true);
    try {
      const data = await api.getScans({
        media_type: mediaFilter === 'all' ? undefined : mediaFilter,
        overall_risk: riskFilter === 'all' ? undefined : riskFilter,
        search: search || undefined,
      });
      setScans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadScans();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scan and its forensic evidence?')) return;
    try {
      await api.deleteScan(id);
      setScans(scans.filter((s) => s.id !== id));
      setSelectedIds(selectedIds.filter((sId) => sId !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected scans?`)) return;
    try {
      await api.bulkDelete(selectedIds);
      setScans(scans.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === scans.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(scans.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sId) => sId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#16425c]/50">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Forensic Scan History
          </h1>
          <p className="text-xs text-[#9bb8c9] mt-1 font-mono">
            Persistent database records of all media examinations, SHA-256 signatures, and generated reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-2 rounded-xl bg-[#ff4969]/15 hover:bg-[#ff4969]/25 text-xs text-[#ff4969] border border-[#ff4969]/40 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={loadScans}
            aria-label="Refresh Scan History"
            className="p-2.5 rounded-xl bg-[#061526] border border-[#16425c] hover:border-[#00d9f5]/50 text-[#9bb8c9] hover:text-[#00d9f5] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00d9f5]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-[#16425c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9bb8c9]" />
            <input
              type="text"
              placeholder="Search by title or SHA-256 fingerprint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] placeholder-[#9bb8c9]/50 focus:outline-none"
            />
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Media Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#9bb8c9]">
            <Filter className="w-3.5 h-3.5 text-[#00d9f5]" />
            <select
              aria-label="Filter by Media Type"
              value={mediaFilter}
              onChange={(e) => setMediaFilter(e.target.value)}
              className="bg-[#061526] border border-[#16425c] rounded-xl px-2.5 py-1.5 text-xs text-[#f3fbff] focus:outline-none cursor-pointer"
            >
              <option value="all">All Media</option>
              <option value="audio">Audio</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="message">Message</option>
              <option value="url">URL</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#9bb8c9]">
            <select
              aria-label="Filter by Risk Severity"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-[#061526] border border-[#16425c] rounded-xl px-2.5 py-1.5 text-xs text-[#f3fbff] focus:outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Threat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scans Table */}
      <div className="glass-panel rounded-2xl border border-[#16425c] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#16425c] bg-[#061526]/80 text-[10px] font-mono text-[#9bb8c9] uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all scans"
                    checked={scans.length > 0 && selectedIds.length === scans.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#16425c] text-[#00d9f5] focus:ring-[#00d9f5] bg-[#020914]"
                  />
                </th>
                <th className="p-4">Specimen Title</th>
                <th className="p-4">Media</th>
                <th className="p-4">Verdict Classification</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Model Engine</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16425c]/40 font-mono">
              {scans.length > 0 ? (
                scans.map((s) => {
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-[#061526]/60 transition-colors ${
                        isSelected ? 'bg-[#00d9f5]/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          aria-label={`Select scan ${s.title}`}
                          checked={isSelected}
                          onChange={() => toggleSelectOne(s.id)}
                          className="rounded border-[#16425c] text-[#00d9f5] focus:ring-[#00d9f5] bg-[#020914]"
                        />
                      </td>
                      <td className="p-4 max-w-[220px] truncate text-[#f3fbff] font-medium font-sans">
                        <span title={s.title}>{s.title}</span>
                      </td>
                      <td className="p-4 uppercase text-[10px] text-[#00d9f5]">
                        {s.media_type}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            s.overall_risk === 'high' || s.overall_risk === 'critical'
                              ? 'bg-[#ff4969]/15 text-[#ff4969] border border-[#ff4969]/30'
                              : s.overall_risk === 'medium'
                              ? 'bg-[#ffb84d]/15 text-[#ffb84d] border border-[#ffb84d]/30'
                              : 'bg-[#17d9aa]/15 text-[#17d9aa] border border-[#17d9aa]/30'
                          }`}
                        >
                          {s.classification}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white">
                        {s.risk_score}%
                      </td>
                      <td className="p-4 text-[10px] text-[#9bb8c9] max-w-[140px] truncate" title={s.model_name}>
                        {s.model_name}
                      </td>
                      <td className="p-4 text-[10px] text-[#9bb8c9]">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/reports?scan=${s.id}`}
                            className="p-1.5 rounded-lg bg-[#061526] hover:bg-[#102b43] text-[#33edff] border border-[#16425c] transition-colors"
                            title="View Forensic Report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <a
                            href={`/api/v1/reports/${s.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-[#061526] hover:bg-[#102b43] text-[#00d9f5] border border-[#16425c] transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 rounded-lg bg-[#061526] hover:bg-[#ff4969]/20 text-[#ff4969] border border-[#16425c] transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#9bb8c9]">
                    {loading ? 'Retrieving database records...' : 'No scans matched your query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
