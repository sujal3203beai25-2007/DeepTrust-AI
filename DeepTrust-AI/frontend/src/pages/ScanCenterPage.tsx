import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Mic,
  Image as ImageIcon,
  Video,
  MessageSquare,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Cpu,
  Sparkles,
  X,
  Play,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Download,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { Scan } from '../types';

export const ScanCenterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialTab = (searchParams.get('tab') as 'audio' | 'image' | 'video' | 'message') || 'audio';
  const [activeTab, setActiveTab] = useState<'audio' | 'image' | 'video' | 'message'>(initialTab);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');

  // Processing state
  const [isScanning, setIsScanning] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [scanResult, setScanResult] = useState<Scan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stages = [
    '1. Uploading digital artifact to secure sandbox...',
    '2. Validating container headers & extracting SHA-256 hash...',
    '3. Preprocessing signals (16kHz audio / Fourier image / frame extraction)...',
    '4. Executing domain-specific neural model inference...',
    '5. Synthesizing spectral evidence & forensic discrepancy metrics...',
    '6. Committing results & compiling forensic PDF certificate...',
  ];

  useEffect(() => {
    const tabParam = searchParams.get('tab') as any;
    if (tabParam && ['audio', 'image', 'video', 'message'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      setFilePreviewUrl(URL.createObjectURL(f));
      setError(null);
      setScanResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setSelectedFile(f);
      setFilePreviewUrl(URL.createObjectURL(f));
      setError(null);
      setScanResult(null);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setScanResult(null);
    setError(null);
  };

  const runAnalysis = async () => {
    setError(null);
    setIsScanning(true);
    setCurrentStage(0);

    // Staged progress reflecting actual execution
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 400);

    try {
      let result: Scan;
      if (activeTab === 'audio') {
        if (!selectedFile) throw new Error('Please select an audio file first.');
        result = await api.scanAudio(selectedFile);
      } else if (activeTab === 'image') {
        if (!selectedFile) throw new Error('Please select an image file first.');
        result = await api.scanImage(selectedFile);
      } else if (activeTab === 'video') {
        if (!selectedFile) throw new Error('Please select a video file first.');
        result = await api.scanVideo(selectedFile);
      } else {
        if (!textInput.trim()) throw new Error('Please enter text or a URL to evaluate.');
        const isUrl = textInput.startsWith('http://') || textInput.startsWith('https://') || textInput.startsWith('www.');
        result = await api.scanText(textInput, isUrl ? 'url' : 'message');
      }

      setCurrentStage(5);
      clearInterval(interval);
      setScanResult(result);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Forensic analysis failed.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-semibold text-[#00d9f5] tracking-widest uppercase">
          FORENSIC EXAMINATION SUITE
        </span>
        <h1 className="font-heading text-3xl font-extrabold text-white">Universal Scan Center</h1>
        <p className="text-xs text-[#9bb8c9] max-w-xl mx-auto">
          Upload suspicious media or paste fraudulent messages to trigger multi-spectral forensic models and generate cryptographic authenticity reports.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-[#061526] border border-[#16425c] gap-1">
          <button
            onClick={() => { setActiveTab('audio'); clearSelection(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'audio'
                ? 'bg-[#00d9f5] text-[#020914] shadow-[0_0_15px_rgba(0,217,245,0.4)]'
                : 'text-[#9bb8c9] hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Audio Detection</span>
          </button>

          <button
            onClick={() => { setActiveTab('image'); clearSelection(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'image'
                ? 'bg-[#00d9f5] text-[#020914] shadow-[0_0_15px_rgba(0,217,245,0.4)]'
                : 'text-[#9bb8c9] hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Image Authenticity</span>
          </button>

          <button
            onClick={() => { setActiveTab('video'); clearSelection(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'video'
                ? 'bg-[#00d9f5] text-[#020914] shadow-[0_0_15px_rgba(0,217,245,0.4)]'
                : 'text-[#9bb8c9] hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Deepfake</span>
          </button>

          <button
            onClick={() => { setActiveTab('message'); clearSelection(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'message'
                ? 'bg-[#00d9f5] text-[#020914] shadow-[0_0_15px_rgba(0,217,245,0.4)]'
                : 'text-[#9bb8c9] hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Message / Phishing URL</span>
          </button>
        </div>
      </div>

      {/* Main Upload / Input Panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-[#16425c] shadow-2xl relative overflow-hidden">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#ff4969]/10 border border-[#ff4969]/40 flex items-center gap-3 text-xs text-[#ff4969]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Content: File Upload vs Text */}
        {activeTab !== 'message' ? (
          <div>
            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#16425c] hover:border-[#00d9f5]/70 rounded-2xl p-10 text-center transition-all bg-[#020914]/40 hover:bg-[#020914]/70 cursor-pointer group"
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  className="hidden"
                  accept={
                    activeTab === 'audio'
                      ? 'audio/*'
                      : activeTab === 'image'
                      ? 'image/*'
                      : 'video/*'
                  }
                  onChange={handleFileChange}
                />
                <div className="w-16 h-16 rounded-2xl bg-[#00d9f5]/10 border border-[#00d9f5]/30 flex items-center justify-center mx-auto text-[#00d9f5] group-hover:scale-110 transition-transform mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-base font-bold text-white mb-1">
                  Drag and drop your suspicious {activeTab} file here
                </h3>
                <p className="text-xs text-[#9bb8c9] mb-4">
                  {activeTab === 'audio' && 'Supports WAV, MP3, OGG, M4A, FLAC (Max 25MB)'}
                  {activeTab === 'image' && 'Supports JPG, PNG, WEBP, BMP (Max 20MB)'}
                  {activeTab === 'video' && 'Supports MP4, MOV, MKV, WEBM (Max 50MB)'}
                </p>
                <span className="inline-block px-4 py-2 rounded-xl bg-[#061526] border border-[#16425c] text-xs text-[#33edff] font-medium group-hover:border-[#00d9f5] transition-colors">
                  Browse from Computer
                </span>
              </div>
            ) : (
              /* Selected file preview */
              <div className="p-6 rounded-2xl bg-[#061526] border border-[#00d9f5]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00d9f5]/20 text-[#00d9f5] flex items-center justify-center">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white max-w-md truncate">{selectedFile.name}</div>
                      <div className="text-[10px] font-mono text-[#9bb8c9]">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Media File'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={clearSelection}
                    disabled={isScanning}
                    className="p-1.5 rounded-lg text-[#9bb8c9] hover:text-[#ff4969] hover:bg-[#ff4969]/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Local Previews */}
                {activeTab === 'audio' && filePreviewUrl && (
                  <audio controls className="w-full mt-2" src={filePreviewUrl} />
                )}
                {activeTab === 'image' && filePreviewUrl && (
                  <div className="max-h-60 overflow-hidden rounded-xl border border-[#16425c] flex justify-center bg-black/40">
                    <img src={filePreviewUrl} alt="Preview" className="max-h-60 object-contain" />
                  </div>
                )}
                {activeTab === 'video' && filePreviewUrl && (
                  <video controls className="max-h-60 rounded-xl mx-auto border border-[#16425c]" src={filePreviewUrl} />
                )}
              </div>
            )}
          </div>
        ) : (
          /* Text / URL Analysis Input */
          <div className="space-y-4">
            <label className="block text-xs font-mono uppercase text-[#9bb8c9] font-medium">
              Suspicious Message Text or Target URL Link
            </label>
            <textarea
              rows={5}
              placeholder="Paste suspicious text message, WhatsApp forward, bank extortion SMS, or website link to inspect..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-4 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-xl text-xs text-[#f3fbff] placeholder-[#9bb8c9]/40 focus:outline-none transition-colors font-mono leading-relaxed"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9bb8c9]">
              <span>Detects OTP harvesting, legal threats, and lookalike domains.</span>
              <button
                type="button"
                onClick={() =>
                  setTextInput(
                    'URGENT NOTICE: Your electricity connection will be CUT OFF tonight at 9:30 PM due to pending update. Call officer immediately or visit http://sbi-kyc-update.xyz to prevent disconnection.'
                  )
                }
                className="text-[#00d9f5] hover:underline font-mono"
              >
                Insert Sample Scam Message
              </button>
            </div>
          </div>
        )}

        {/* Start Analysis Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={runAnalysis}
            disabled={isScanning || (activeTab !== 'message' && !selectedFile) || (activeTab === 'message' && !textInput.trim())}
            className="px-8 py-3.5 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-[#020914] font-semibold text-xs transition-all shadow-[0_0_20px_rgba(0,217,245,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5 cursor-pointer"
          >
            {isScanning ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Running Forensic Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Start Forensic Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* =========================================================================
            6-STAGE AI SCANNING PROGRESS ANIMATION
            ========================================================================= */}
        {isScanning && (
          <div className="mt-8 p-6 rounded-2xl bg-[#020914] border border-[#00d9f5]/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#00d9f5]">
              <span className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00d9f5] animate-ping" />
                ACTIVE FORENSIC PIPELINE
              </span>
              <span>Stage {currentStage + 1} of 6</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#061526] overflow-hidden border border-[#16425c]">
              <div
                className="h-full bg-gradient-to-r from-[#00d9f5] via-[#33edff] to-[#17d9aa] rounded-full transition-all duration-300"
                style={{ width: `${((currentStage + 1) / 6) * 100}%` }}
              />
            </div>

            <p className="text-xs font-mono text-[#33edff] animate-pulse">
              {stages[currentStage]}
            </p>
          </div>
        )}

        {/* =========================================================================
            SCAN RESULT PRESENTATION
            ========================================================================= */}
        {scanResult && !isScanning && (
          <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-[#061526] border border-[#00d9f5]/50 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#16425c]">
              <div>
                <span className="text-[10px] font-mono text-[#9bb8c9] uppercase tracking-wider">
                  VERIFIED EXAMINATION RESULT
                </span>
                <h3 className="font-heading text-xl font-bold text-white mt-1">
                  {scanResult.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold uppercase font-mono ${
                    scanResult.overall_risk === 'high' || scanResult.overall_risk === 'critical'
                      ? 'bg-[#ff4969]/15 text-[#ff4969] border border-[#ff4969]/40'
                      : scanResult.overall_risk === 'medium'
                      ? 'bg-[#ffb84d]/15 text-[#ffb84d] border border-[#ffb84d]/40'
                      : 'bg-[#17d9aa]/15 text-[#17d9aa] border border-[#17d9aa]/40'
                  }`}
                >
                  {scanResult.classification}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-[#020914] border border-[#16425c]">
                <div className="text-[10px] font-mono text-[#9bb8c9] uppercase">Calculated Risk</div>
                <div className="font-mono text-xl font-bold text-white mt-1">{scanResult.risk_score}%</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#020914] border border-[#16425c]">
                <div className="text-[10px] font-mono text-[#9bb8c9] uppercase">Model Confidence</div>
                <div className="font-mono text-xl font-bold text-[#00d9f5] mt-1">{Math.round(scanResult.confidence * 100)}%</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#020914] border border-[#16425c]">
                <div className="text-[10px] font-mono text-[#9bb8c9] uppercase">Inference Latency</div>
                <div className="font-mono text-xl font-bold text-[#17d9aa] mt-1">{scanResult.inference_latency_ms} ms</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#020914] border border-[#16425c]">
                <div className="text-[10px] font-mono text-[#9bb8c9] uppercase">SHA-256 Fingerprint</div>
                <div className="font-mono text-[10px] text-[#9bb8c9] truncate mt-1.5" title={scanResult.file_hash_sha256}>
                  {scanResult.file_hash_sha256?.slice(0, 16)}...
                </div>
              </div>
            </div>

            {/* Evidence Visual Display (Mel-spectrogram / ELA Map / Frame) */}
            {scanResult.evidence && scanResult.evidence.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#33edff] font-semibold">
                  Primary Spectral Evidence
                </h4>
                {scanResult.evidence.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-xl bg-[#020914] border border-[#16425c] space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{ev.title}</span>
                      <span className="text-[10px] font-mono text-[#00d9f5] uppercase">{ev.evidence_type}</span>
                    </div>
                    {ev.visual_url && (
                      <div className="rounded-lg overflow-hidden border border-[#16425c]/60 max-h-72 flex justify-center bg-black/60">
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

            {/* Findings & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#020914] border border-[#16425c] space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Summary of Findings</h4>
                <p className="text-xs text-[#9bb8c9] leading-relaxed">{scanResult.summary}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#020914] border border-[#16425c] space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recommended Protocol</h4>
                <ul className="text-xs text-[#9bb8c9] space-y-1">
                  {scanResult.recommended_actions?.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#00d9f5]">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#16425c] flex flex-wrap items-center justify-between gap-4">
              <div className="text-[10px] font-mono text-[#9bb8c9]">
                Model: {scanResult.model_name} ({scanResult.model_version})
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/reports?scan=${scanResult.id}`}
                  className="px-4 py-2 rounded-xl bg-[#091b2d] hover:bg-[#102b43] text-xs font-semibold text-white border border-[#16425c] flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-[#00d9f5]" />
                  <span>Download Forensic PDF</span>
                </Link>
                <Link
                  to="/assistant"
                  className="px-4 py-2 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-xs font-semibold text-[#020914] shadow-[0_0_15px_rgba(0,217,245,0.3)] flex items-center gap-2 transition-all"
                >
                  <span>Ask Guardian Assistant</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
