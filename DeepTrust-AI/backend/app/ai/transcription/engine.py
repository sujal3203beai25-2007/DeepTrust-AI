import os
from pathlib import Path
from typing import Dict, Any, List
from app.ai.audio.detector import analyze_audio_file
from app.ai.text.detector import analyze_text_message

def transcribe_audio(file_path: str) -> str:
    """Transcribe actual audio content. Never infer speech from a filename.

    Requires optional faster-whisper and downloads a model on first use.
    Raises RuntimeError rather than fabricating words if ASR is unavailable.
    """
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError("Speech recognition unavailable: install faster-whisper to enable Dual-Risk transcription") from exc
    global _WHISPER_MODEL
    if _WHISPER_MODEL is None:
        _WHISPER_MODEL = WhisperModel("tiny", device="cpu", compute_type="int8")
    segments, _info = _WHISPER_MODEL.transcribe(str(file_path), beam_size=3, vad_filter=True)
    return " ".join(segment.text.strip() for segment in segments).strip()


_WHISPER_MODEL = None

def run_dual_risk_analysis(file_path: str, output_dir: Path) -> Dict[str, Any]:
    """
    Performs the revolutionary Dual-Risk Assessment:
    1. Evaluates Acoustic Synthetic Media Risk (AI voice clone detection).
    2. Transcribes speech to text.
    3. Evaluates Scam / Social Engineering Risk (Psychological coercion, OTP theft, authority impersonation).
    4. Keeps both risk assessments independent and un-conflated.
    """
    # 1. Acoustic Model
    audio_results = analyze_audio_file(file_path, output_dir)
    synthetic_risk = audio_results["risk_score"]
    
    # 2. Transcription
    transcription_error = None
    try:
        transcript = transcribe_audio(file_path)
    except Exception as exc:
        transcript = ""
        transcription_error = str(exc)

    # Never invent a scam score when speech recognition fails or detects no words.
    text_results = analyze_text_message(transcript) if transcript else {"risk_score": None, "flagged_phrases": [], "detected_indicators": []}
    scam_risk = text_results["risk_score"]
    
    # Determine composite threat classification without mathematically conflating independent probabilities
    if scam_risk is None:
        composite_summary = "PARTIAL ANALYSIS: Audio forensic indicators only; speech transcription/scam assessment unavailable."
        overall_risk = "high" if synthetic_risk >= 50.0 else "unknown"
    elif synthetic_risk >= 50.0 and scam_risk >= 50.0:
        composite_summary = "CRITICAL THREAT: AI-Generated Voice Clone delivering an Active Social Engineering Scam."
        overall_risk = "critical"
    elif synthetic_risk >= 50.0:
        composite_summary = "HIGH SYNTHETIC RISK: Voice cloner detected, but message contains minimal overt fraud patterns."
        overall_risk = "high"
    elif scam_risk >= 50.0:
        composite_summary = "HIGH FRAUD RISK: Natural human speech containing explicit financial scam & OTP extortion patterns."
        overall_risk = "high"
    else:
        composite_summary = "LOW RISK: Authentic voice acoustics with standard non-threatening communication."
        overall_risk = "low"

    return {
        **audio_results,
        "overall_risk": overall_risk,
        "synthetic_risk_score": synthetic_risk,
        "scam_risk_score": scam_risk,
        "transcript": transcript,
        "transcription_error": transcription_error,
        "flagged_phrases": text_results["flagged_phrases"],
        "detected_indicators": text_results["detected_indicators"],
        "summary": composite_summary,
        "recommended_actions": [
            "DO NOT share any OTP, passwords, or initiate financial transfers.",
            "Verify caller through independent official channels.",
            "Report fraudulent attempts to cybercrime authorities immediately."
        ]
    }
