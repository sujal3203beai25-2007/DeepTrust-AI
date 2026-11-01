import React, { useState, useEffect } from 'react';
import {
  Eye,
  CheckCircle2,
  AlertCircle,
  Cpu,
  BarChart2,
  Layers,
  Sparkles,
  Info,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { ModelMetric } from '../types';

export const ModelTransparencyPage: React.FC = () => {
  const [models, setModels] = useState<ModelMetric[]>([]);
  const [statement, setStatement] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getModelMetrics();
      setModels(data.models);
      setStatement(data.transparency_statement);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17d9aa]/15 border border-[#17d9aa]/40 text-[#17d9aa] text-xs font-mono font-semibold">
          <Eye className="w-3.5 h-3.5" />
          <span>EMPIRICAL BENCHMARK METRICS</span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-white">
          Model Transparency & Evaluation
        </h1>
        <p className="text-xs text-[#9bb8c9] max-w-xl mx-auto">
          Scientific integrity is our highest priority. We report verified evaluation metrics, confusion matrices, and documented limitations across standard academic benchmarks.
        </p>
      </div>

      {/* Model Cards */}
      <div className="space-y-8">
        {models.map((m) => (
          <div
            key={m.model_id}
            className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#16425c] shadow-2xl space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#16425c]">
              <div>
                <span className="text-[10px] font-mono text-[#00d9f5] uppercase font-bold">
                  {m.domain}
                </span>
                <h3 className="font-heading text-xl font-bold text-white mt-0.5">
                  {m.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#061526] border border-[#16425c] text-[#33edff]">
                  {m.version}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#061526] border border-[#16425c] text-[#9bb8c9]">
                  {m.license}
                </span>
              </div>
            </div>

            {/* Benchmark & Methodology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] space-y-1">
                <span className="text-[10px] font-mono text-[#00d9f5] uppercase block font-bold">Evaluation Benchmark</span>
                <p className="text-white font-medium">{m.evaluation_dataset}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] space-y-1">
                <span className="text-[10px] font-mono text-[#00d9f5] uppercase block font-bold">Training Methodology</span>
                <p className="text-[#9bb8c9] leading-relaxed">{m.methodology}</p>
              </div>
            </div>

            {/* Performance Metrics Table */}
            <div>
              <div className="text-xs font-mono text-[#9bb8c9] mb-3 uppercase tracking-wider">
                EMPIRICAL PERFORMANCE MEASUREMENTS
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#020914] border border-[#16425c]">
                  <span className="text-[10px] font-mono text-[#9bb8c9] block">Accuracy</span>
                  <span className="font-mono text-base font-bold text-[#17d9aa]">{m.metrics.accuracy}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#020914] border border-[#16425c]">
                  <span className="text-[10px] font-mono text-[#9bb8c9] block">Precision</span>
                  <span className="font-mono text-base font-bold text-white">{m.metrics.precision}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#020914] border border-[#16425c]">
                  <span className="text-[10px] font-mono text-[#9bb8c9] block">Recall</span>
                  <span className="font-mono text-base font-bold text-white">{m.metrics.recall}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#020914] border border-[#16425c]">
                  <span className="text-[10px] font-mono text-[#9bb8c9] block">F1-Score</span>
                  <span className="font-mono text-base font-bold text-[#33edff]">{m.metrics.f1_score}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#020914] border border-[#16425c]">
                  <span className="text-[10px] font-mono text-[#9bb8c9] block">False Positives</span>
                  <span className="font-mono text-base font-bold text-[#ffb84d]">{m.metrics.false_positive_rate}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#020914] border border-[#16425c]">
                  <span className="text-[10px] font-mono text-[#9bb8c9] block">EER</span>
                  <span className="font-mono text-base font-bold text-[#00d9f5]">{m.metrics.equal_error_rate_eer ?? 'N/A'}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#020914] border border-[#16425c]">
                  <span className="text-[10px] font-mono text-[#9bb8c9] block">Avg Latency</span>
                  <span className="font-mono text-base font-bold text-[#17d9aa]">{m.metrics.average_inference_latency_ms} ms</span>
                </div>
              </div>
            </div>

            {/* Confusion Matrix Table */}
            <div className="p-4 rounded-xl bg-[#020914] border border-[#16425c] space-y-3">
              <span className="text-[10px] font-mono text-[#00d9f5] uppercase font-bold block">
                Benchmark Confusion Matrix (Hold-Out Evaluation)
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-center">
                <div className="p-2.5 rounded-lg bg-[#061526] border border-[#17d9aa]/30">
                  <span className="text-[10px] text-[#9bb8c9] block">True Positive (Manipulated correctly identified)</span>
                  <span className="text-white font-bold text-sm">{m.confusion_matrix.true_positive}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#061526] border border-[#ffb84d]/30">
                  <span className="text-[10px] text-[#9bb8c9] block">False Positive (Authentic flagged as manipulated)</span>
                  <span className="text-[#ffb84d] font-bold text-sm">{m.confusion_matrix.false_positive}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#061526] border border-[#ff4969]/30">
                  <span className="text-[10px] text-[#9bb8c9] block">False Negative (Manipulated missed)</span>
                  <span className="text-[#ff4969] font-bold text-sm">{m.confusion_matrix.false_negative}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#061526] border border-[#17d9aa]/30">
                  <span className="text-[10px] text-[#9bb8c9] block">True Negative (Authentic correctly verified)</span>
                  <span className="text-[#17d9aa] font-bold text-sm">{m.confusion_matrix.true_negative}</span>
                </div>
              </div>
            </div>

            {/* Documented Limitations */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#ffb84d] uppercase font-bold block">
                Documented Model Limitations & Failure Modes
              </span>
              <ul className="space-y-1 text-xs text-[#9bb8c9]">
                {m.known_limitations.map((lim, lIdx) => (
                  <li key={lIdx} className="flex items-start gap-1.5">
                    <span className="text-[#ffb84d]">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Transparency Statement */}
      <div className="p-6 rounded-2xl bg-[#061526] border border-[#16425c] text-xs text-[#9bb8c9] leading-relaxed">
        <span className="text-white font-bold block mb-1">Ethical AI & Real-World Generalization Notice:</span>
        {statement ||
          'All metrics reported represent empirical benchmark evaluations. Unfamiliar in-the-wild audio codecs and extreme social media lossy recompression can introduce variance.'}
      </div>
    </div>
  );
};
