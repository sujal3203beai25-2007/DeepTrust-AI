import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  Mic,
  Image as ImageIcon,
  Video,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  Code2
} from 'lucide-react';
import { api } from '../services/api';
import { DemoSample } from '../types';

export const LiveDemoLabPage: React.FC = () => {
  const [samples, setSamples] = useState<DemoSample[]>([]);
  const [selectedSample, setSelectedSample] = useState<DemoSample | null>(null);
  const [running, setRunning] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [runResult, setRunResult] = useState<any>(null);
  const [loadingSamples, setLoadingSamples] = useState(true);

  const stages = [
    'Normalizing feature spectrum and calculating MD5/SHA256...',
    'Loading neural weights into local inference context...',
    'Performing acoustic vocoder / ELA residual matrix analysis...',
    'Evaluating confidence boundary against empirical benchmark weights...',
    'Completed. Cross-referencing against ground-truth dataset label.'
  ];

  useEffect(() => {
    loadDemoSamples();
  }, []);

  const loadDemoSamples = async () => {
    setLoadingSamples(true);
    try {
      const data = await api.getDemoSamples();
      setSamples(data);
      if (data.length > 0) {
        setSelectedSample(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSamples(false);
    }
  };

  const executeSample = async () => {
    if (!selectedSample) return;
    setRunning(true);
    setRunResult(null);
    setActiveStage(0);

    const timer = setInterval(() => {
      setActiveStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 350);

    try {
      const res = await api.runDemoSample(selectedSample.id);
      setActiveStage(4);
      clearInterval(timer);
      setRunResult(res);
    } catch (e) {
      clearInterval(timer);
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'audio': return <Mic className="w-4 h-4 text-[#00d9f5]" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-[#17d9aa]" />;
      case 'video': return <Video className="w-4 h-4 text-[#ffb84d]" />;
      default: return <MessageSquare className="w-4 h-4 text-[#ff4969]" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d9f5]/15 border border-[#00d9f5]/40 text-[#00d9f5] text-xs font-mono font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          <span>HACKATHON JURY BENCHMARK LAB</span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-white">
          Interactive Live Demonstration Lab
        </h1>
        <p className="text-xs text-[#9bb8c9] max-w-xl mx-auto">
          Test our real neural models against verified ground-truth test media. Inspect step-by-step preprocessing, vocoder spectral analysis, and empirical inference results in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Sample Selection Grid */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#9bb8c9] px-1 pb-1">
            <span>CURATED TEST SUITE ({samples.length} SAMPLES)</span>
            <span>GROUND TRUTH</span>
          </div>

          <div className="space-y-2.5">
            {samples.map((s) => {
              const isSelected = selectedSample?.id === s.id;
              const isSynthetic = s.ground_truth_label === 'SYNTHETIC' || s.ground_truth_label === 'MANIPULATED' || s.ground_truth_label === 'SCAM' || s.ground_truth_label === 'PHISHING';
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSample(s);
                    setRunResult(null);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                    isSelected
                      ? 'bg-[#061526] border-[#00d9f5] shadow-[0_0_20px_rgba(0,217,245,0.2)]'
                      : 'bg-[#091b2d]/60 border-[#16425c] hover:border-[#00d9f5]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#020914] border border-[#16425c] flex items-center justify-center shrink-0">
                      {getCategoryIcon(s.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate group-hover:text-[#00d9f5] transition-colors">
                        {s.title}
                      </div>
                      <div className="text-[10px] text-[#9bb8c9] font-mono truncate">
                        {s.description}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                      isSynthetic
                        ? 'bg-[#ff4969]/15 text-[#ff4969] border border-[#ff4969]/30'
                        : 'bg-[#17d9aa]/15 text-[#17d9aa] border border-[#17d9aa]/30'
                    }`}
                  >
                    {s.ground_truth_label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Execution Workspace */}
        <div className="lg:col-span-7 space-y-6">
          {selectedSample && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#00d9f5]/40 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#16425c]">
                <div>
                  <span className="text-[10px] font-mono text-[#00d9f5] uppercase tracking-wider">
                    SELECTED TEST SPECIMEN
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white mt-1">
                    {selectedSample.title}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#9bb8c9]">GROUND TRUTH:</div>
                  <div className="text-xs font-mono font-bold text-white">{selectedSample.ground_truth}</div>
                </div>
              </div>

              {/* Media Preview Box */}
              <div className="p-4 rounded-2xl bg-[#020914] border border-[#16425c] space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#9bb8c9] flex items-center justify-between">
                  <span>Specimen Payload</span>
                  <span className="text-[#00d9f5]">Category: {selectedSample.category}</span>
                </div>
                <p className="text-xs text-[#f3fbff] font-mono leading-relaxed">
                  "{selectedSample.sample_preview}"
                </p>
              </div>

              {/* Action Trigger */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#9bb8c9]">Ready to run live neural inference?</span>
                <button
                  onClick={executeSample}
                  disabled={running}
                  className="px-6 py-3 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-xs font-semibold text-[#020914] transition-all shadow-[0_0_20px_rgba(0,217,245,0.4)] disabled:opacity-40 cursor-pointer flex items-center gap-2"
                >
                  {running ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>Executing Inference...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Run Live Inference</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Progress Stages */}
              {running && (
                <div className="p-4 rounded-xl bg-[#020914] border border-[#00d9f5]/50 space-y-2">
                  <div className="text-[10px] font-mono text-[#00d9f5] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00d9f5] animate-ping" />
                    <span>INFERENCE PIPELINE ACTIVE — STAGE {activeStage + 1} OF 5</span>
                  </div>
                  <p className="text-xs font-mono text-[#33edff] animate-pulse">
                    {stages[activeStage]}
                  </p>
                </div>
              )}

              {/* Results Comparison: Ground Truth vs Model Prediction */}
              {runResult && (
                <div className="p-6 rounded-2xl bg-[#061526] border border-[#00d9f5]/60 shadow-xl space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-[#00d9f5] uppercase font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#17d9aa]" />
                      <span>INFERENCE COMPLETE</span>
                    </div>
                    <span className="text-xs font-mono text-[#9bb8c9]">
                      Latency: {runResult.results.inference_latency_ms} ms
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-[#020914] border border-[#16425c]">
                      <div className="text-[10px] font-mono text-[#9bb8c9] uppercase">Dataset Ground Truth</div>
                      <div className="text-xs font-mono font-bold text-white mt-1">
                        {runResult.ground_truth_label}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#020914] border border-[#00d9f5]/40">
                      <div className="text-[10px] font-mono text-[#9bb8c9] uppercase">Model Verdict</div>
                      <div className="text-xs font-mono font-bold text-[#00d9f5] mt-1">
                        {runResult.results.classification} ({runResult.results.risk_score}%)
                      </div>
                    </div>
                  </div>

                  {/* Evidence Visual Preview if Audio/Image */}
                  {runResult.spectrogram_url && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-[#9bb8c9] uppercase">Mel-Spectrogram Residual Map</div>
                      <div className="rounded-xl overflow-hidden border border-[#16425c] bg-black max-h-48 flex justify-center">
                        <img src={runResult.spectrogram_url} alt="Spectrogram" className="max-h-48 object-contain" />
                      </div>
                    </div>
                  )}

                  {runResult.ela_url && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-[#9bb8c9] uppercase">Error Level Analysis (ELA) Map</div>
                      <div className="rounded-xl overflow-hidden border border-[#16425c] bg-black max-h-48 flex justify-center">
                        <img src={runResult.ela_url} alt="ELA Map" className="max-h-48 object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  SPECIAL FEATURE: "BEHIND THE AI" ENGINEERING PANEL
                  ========================================================================= */}
              <div className="p-5 rounded-2xl bg-[#020914] border border-[#16425c] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Code2 className="w-4 h-4 text-[#00d9f5]" />
                  <span>Behind the AI — Engineering Deep Dive</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono text-[#9bb8c9]">
                  <div className="p-2.5 rounded-lg bg-[#061526] border border-[#16425c]/50">
                    <span className="text-[#00d9f5] font-bold block mb-1">Preprocessing:</span>
                    {selectedSample.behind_the_ai.preprocessing}
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#061526] border border-[#16425c]/50">
                    <span className="text-[#33edff] font-bold block mb-1">Architecture:</span>
                    {selectedSample.behind_the_ai.model_architecture}
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#061526] border border-[#16425c]/50">
                    <span className="text-[#17d9aa] font-bold block mb-1">Feature Focus:</span>
                    {selectedSample.behind_the_ai.feature_focus}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
