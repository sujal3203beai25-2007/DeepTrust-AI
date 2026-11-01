import React, { useState } from 'react';
import {
  GitCompare,
  Mic,
  Image as ImageIcon,
  ArrowRight,
  UploadCloud,
  FileCheck2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

export const CompareVerifyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'audio'>('image');

  // Image Slider state
  const [sliderPos, setSliderPos] = useState(50);
  const [imgA, setImgA] = useState<string>('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600');
  const [imgB, setImgB] = useState<string>('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600');

  // Audio State
  const [audioAUrl, setAudioAUrl] = useState<string | null>(null);
  const [audioBUrl, setAudioBUrl] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      if (target === 'A') setImgA(url);
      else setImgB(url);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      if (target === 'A') setAudioAUrl(url);
      else setAudioBUrl(url);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-semibold text-[#00d9f5] tracking-widest uppercase">
          FORENSIC COMPARISON WORKSPACE
        </span>
        <h1 className="font-heading text-3xl font-extrabold text-white">
          Compare & Verify
        </h1>
        <p className="text-xs text-[#9bb8c9] max-w-xl mx-auto">
          Execute side-by-side differential examinations between suspected manipulated media and baseline authentic references.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-[#061526] border border-[#16425c] gap-1">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'image'
                ? 'bg-[#00d9f5] text-[#020914] shadow-[0_0_15px_rgba(0,217,245,0.4)]'
                : 'text-[#9bb8c9] hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Image Visual Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'audio'
                ? 'bg-[#00d9f5] text-[#020914] shadow-[0_0_15px_rgba(0,217,245,0.4)]'
                : 'text-[#9bb8c9] hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Audio Spectral Comparison</span>
          </button>
        </div>
      </div>

      {/* Image Comparison with Interactive Slider */}
      {activeTab === 'image' ? (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#16425c] shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#16425c]">
            <span className="font-heading text-xs font-bold text-white tracking-wider">
              INTERACTIVE PERCEPTUAL SLIDER
            </span>
            <span className="text-xs font-mono text-[#00d9f5]">Drag handle horizontally to inspect diff</span>
          </div>

          {/* Interactive Split View Slider */}
          <div className="relative w-full max-w-2xl mx-auto h-80 rounded-2xl overflow-hidden border-2 border-[#16425c] select-none bg-black">
            {/* Image B (Underneath) */}
            <img
              src={imgB}
              alt="Image B Reference"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute bottom-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-[#17d9aa] border border-[#17d9aa]/40">
              SPECIMEN B (MODIFIED / PROVENANCE)
            </div>

            {/* Image A (Clipped on top) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={imgA}
                alt="Image A Original"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: '100%', minWidth: '600px' }}
              />
              <div className="absolute bottom-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-[#00d9f5] border border-[#00d9f5]/40">
                SPECIMEN A (ORIGINAL REFERENCE)
              </div>
            </div>

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#00d9f5] shadow-[0_0_10px_#00d9f5] pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#00d9f5] text-[#020914] flex items-center justify-center shadow-lg font-bold text-xs">
                ↔
              </div>
            </div>

            {/* Range Input for dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Image comparison split position slider"
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
            />
          </div>

          {/* File Upload Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#16425c]">
            <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] space-y-2">
              <div className="text-xs font-bold text-white">Specimen A (Left / Original)</div>
              <input
                type="file"
                id="img-a-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'A')}
              />
              <button
                onClick={() => document.getElementById('img-a-upload')?.click()}
                className="w-full py-2 rounded-lg bg-[#020914] hover:bg-[#102b43] text-xs font-mono text-[#00d9f5] border border-[#16425c] transition-colors cursor-pointer"
              >
                Upload Specimen A
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] space-y-2">
              <div className="text-xs font-bold text-white">Specimen B (Right / Suspect)</div>
              <input
                type="file"
                id="img-b-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'B')}
              />
              <button
                onClick={() => document.getElementById('img-b-upload')?.click()}
                className="w-full py-2 rounded-lg bg-[#020914] hover:bg-[#102b43] text-xs font-mono text-[#17d9aa] border border-[#16425c] transition-colors cursor-pointer"
              >
                Upload Specimen B
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Audio Comparison */
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#16425c] shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#16425c]">
            <span className="font-heading text-xs font-bold text-white tracking-wider">
              DUAL ACOUSTIC PLAYBACK & SPECTRAL DIFFERENCE
            </span>
            <span className="text-xs font-mono text-[#00d9f5]">A/B Speaker Similarity Assessment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audio A */}
            <div className="p-5 rounded-2xl bg-[#061526] border border-[#00d9f5]/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white">REFERENCE AUDIO A</span>
                <span className="text-[10px] font-mono text-[#00d9f5] px-2 py-0.5 rounded bg-[#00d9f5]/15">
                  AUTHENTIC SAMPLE
                </span>
              </div>
              {audioAUrl ? (
                <audio controls src={audioAUrl} className="w-full" />
              ) : (
                <div className="h-20 rounded-xl bg-[#020914] border border-[#16425c] flex items-center justify-center text-xs text-[#9bb8c9]">
                  No audio loaded for Specimen A
                </div>
              )}
              <input
                type="file"
                id="aud-a-upload"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleAudioUpload(e, 'A')}
              />
              <button
                onClick={() => document.getElementById('aud-a-upload')?.click()}
                className="w-full py-2 rounded-lg bg-[#020914] hover:bg-[#102b43] text-xs font-mono text-[#00d9f5] border border-[#16425c] transition-colors cursor-pointer"
              >
                Load Audio A
              </button>
            </div>

            {/* Audio B */}
            <div className="p-5 rounded-2xl bg-[#061526] border border-[#ff4969]/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white">SUSPICIOUS AUDIO B</span>
                <span className="text-[10px] font-mono text-[#ff4969] px-2 py-0.5 rounded bg-[#ff4969]/15">
                  SUSPECT VOICE CLONE
                </span>
              </div>
              {audioBUrl ? (
                <audio controls src={audioBUrl} className="w-full" />
              ) : (
                <div className="h-20 rounded-xl bg-[#020914] border border-[#16425c] flex items-center justify-center text-xs text-[#9bb8c9]">
                  No audio loaded for Specimen B
                </div>
              )}
              <input
                type="file"
                id="aud-b-upload"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleAudioUpload(e, 'B')}
              />
              <button
                onClick={() => document.getElementById('aud-b-upload')?.click()}
                className="w-full py-2 rounded-lg bg-[#020914] hover:bg-[#102b43] text-xs font-mono text-[#ff4969] border border-[#16425c] transition-colors cursor-pointer"
              >
                Load Audio B
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#020914] border border-[#16425c] text-xs text-[#9bb8c9] leading-relaxed">
            <span className="text-white font-bold">Scientific Notice: </span>
            Perceptual or acoustic similarity assesses spectral distance metrics (Cosine MFCC distance) but does not independently establish statutory personal identity without authenticated biometric enrollment profiles.
          </div>
        </div>
      )}
    </div>
  );
};
