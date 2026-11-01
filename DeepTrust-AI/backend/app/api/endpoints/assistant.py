from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.database import get_db
from app.models.models import User, Scan
from app.schemas.schemas import AssistantRequest, AssistantResponse
from app.api.deps import get_current_user

router = APIRouter()

# Structured knowledge base for DeepTrust Guardian
KNOWLEDGE_BASE = {
    "otp": {
        "reply": (
            "CRITICAL WARNING: NEVER DISCLOSE YOUR OTP OR PIN.\n\n"
            "Official banking institutions, tax authorities, and logistics carriers will NEVER call or message asking for your One-Time Password (OTP), CVV, or login PIN.\n\n"
            "Action Checklist:\n"
            "1. Do not share any code or click any link in the message.\n"
            "2. Hang up immediately or block the sender number.\n"
            "3. If you already disclosed an OTP, immediately contact your bank emergency hotline to freeze your debit/credit cards and digital banking access.\n"
            "4. File a complaint on the Cybercrime Portal (Helpline 1930 in India or ic3.gov in the US)."
        ),
        "actions": ["Freeze Bank Cards", "Report on Cybercrime Helpline 1930", "Block Sender Contact"]
    },
    "voice_clone": {
        "reply": (
            "HOW AI VOICE CLONING (DEEPFAKE AUDIO) WORKS:\n\n"
            "Modern generative neural vocoders (such as HiFi-GAN, VITS, and ElevenLabs) can synthesize human speech using as little as 3 to 10 seconds of clear target voice harvested from social media videos or voicemails.\n\n"
            "Forensic Detection Signs:\n"
            "- Suppressed pitch micro-jitter: Neural speech often lacks natural human vocal cord micro-tremors.\n"
            "- Abrupt high-frequency spectral rolloff: Typical cutoffs occur at 7.5 kHz to 8 kHz due to model downsampling.\n"
            "- Artificial phase smoothness: Absence of organic breath pauses and room reverberation.\n\n"
            "Protection Protocols:\n"
            "1. Establish a private family emergency passphrase.\n"
            "2. Hang up and phone the caller back on their verified, saved number.\n"
            "3. Run the audio recording through DeepTrust AI Dual-Risk Analysis."
        ),
        "actions": ["Run Dual-Risk Voice Audit", "How to Verify Out-of-Band", "What does Model Score Mean?"]
    },
    "score_meaning": {
        "reply": (
            "HOW TO INTERPRET DEEPTRUST AI SCORES:\n\n"
            "- 0% - 35% (Low Risk): Acoustic and compression characteristics match authentic, unaltered human recordings. Natural sensor noise.\n"
            "- 36% - 69% (Suspicious / Medium): Notable anomalies detected (e.g. lossy cellular compression artifacts, suppressed pitch variance). Proceed with caution.\n"
            "- 70% - 100% (High / Critical Threat): Multiple strong vocoder artifacts, Error Level Analysis (ELA) splicing residuals, or overt financial extortion patterns.\n\n"
            "Note: Model scores are probabilistic forensic assessments. Always pair them with out-of-band communication verification."
        ),
        "actions": ["Review Forensic Mel-Spectrogram", "Inspect Technical Limitations", "Download PDF Certificate"]
    },
    "report_scam": {
        "reply": (
            "HOW TO REPORT A DIGITAL SCAM OR EXTORTION ATTEMPT:\n\n"
            "1. India: Immediately dial the National Cyber Crime Helpline at 1930 or submit an incident report at cybercrime.gov.in.\n"
            "2. United States: Report to the Federal Trade Commission at reportfraud.ftc.gov or FBI Internet Crime Complaint Center (IC3) at ic3.gov.\n"
            "3. United Kingdom: Report to Action Fraud at 0300 123 2040.\n"
            "4. Preserve Digital Evidence: Retain original unmodified audio files, message screenshots, and download your official DeepTrust Forensic PDF Certificate as technical documentation."
        ),
        "actions": ["Call 1930 Helpline", "Download Forensic Evidence Certificate", "Preserve Call Records"]
    },
    "spectrogram": {
        "reply": (
            "EXPLAINING THE ACOUSTIC MEL-SPECTROGRAM:\n\n"
            "A Mel-Spectrogram is a visual representation of the spectrum of frequencies in a sound signal as they vary through time, converted to the perceptual Mel scale.\n\n"
            "What our forensic models look for:\n"
            "- High-Frequency Cutoff: Neural vocoders typically cut off sharply above 7.5 kHz to 8 kHz.\n"
            "- Formant Continuity: Human vocal tracts produce smooth transition formants (F1-F4) which neural upsamplers often blur or fragment.\n"
            "- Harmonic Consistency: Pitch harmonics in genuine speech maintain organic spacing reflecting vocal cord vibration."
        ),
        "actions": ["Is this voice note suspicious?", "What should I do if someone asks for money?", "How to report a cyber scam?"]
    },
    "ela": {
        "reply": (
            "EXPLAINING ERROR LEVEL ANALYSIS (ELA):\n\n"
            "Error Level Analysis (ELA) identifies digital image tampering by measuring the error rate difference when an image is resaved at a known JPEG compression quality.\n\n"
            "- In an authentic photograph, all parts of the image compress at a uniform error level.\n"
            "- In spliced or AI-generated images, inserted or altered regions show significantly higher or lower error brightness compared to the rest of the image."
        ),
        "actions": ["Inspect Image Authenticity", "Check Model Transparency", "Download PDF Certificate"]
    }
}

@router.post("/chat", response_model=AssistantResponse)
async def chat_with_guardian(
    req: AssistantRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query_text = req.message.lower().strip()
    scan_context_info = None
    scan_obj = None

    # If scan_id is provided, retrieve scan details to incorporate real telemetry
    if req.scan_id and req.scan_id not in ("undefined", "null", ""):
        result = await db.execute(select(Scan).where(Scan.id == req.scan_id))
        scan_obj = result.scalars().first()
        if scan_obj:
            scan_context_info = (
                f"Referencing Scan '{scan_obj.title}' (Verdict: {scan_obj.classification}, "
                f"Calculated Risk: {scan_obj.risk_score}%, Model: {scan_obj.model_name})"
            )

    lang = req.language or "en"
    
    # Check if user specifically asks about the attached scan
    if scan_obj and any(k in query_text for k in ["this scan", "my scan", "why did", "flagged", "result", "verdict", "score"]):
        reply_body = (
            f"Here is my forensic breakdown for your scan: '{scan_obj.title}':\n\n"
            f"- Classification: {scan_obj.classification}\n"
            f"- Calculated Risk Score: {scan_obj.risk_score}%\n"
            f"- Model Calibration Confidence: {round(scan_obj.confidence * 100, 1)}%\n"
            f"- Engine: {scan_obj.model_name} ({scan_obj.model_version})\n\n"
            f"Summary of Forensic Findings:\n{scan_obj.summary or 'Multi-spectral examination conducted on digital payload.'}\n\n"
        )
        if scan_obj.synthetic_risk_score is not None:
            reply_body += (
                f"Dual-Risk Telemetry:\n"
                f"- Synthetic Voice Risk: {scan_obj.synthetic_risk_score}%\n"
                f"- Scam Language Risk: {scan_obj.scam_risk_score}%\n\n"
            )
        if scan_obj.recommended_actions:
            reply_body += "Recommended Protocols:\n" + "\n".join(f"- {act}" for act in scan_obj.recommended_actions)
        
        matched_reply = reply_body
        matched_actions = ["How to report a cyber scam?", "What does the model score mean?", "How to verify out-of-band"]
    
    # Intent recognition
    elif any(k in query_text for k in ["otp", "pin", "password", "cvv", "bank account", "urgent", "unfreeze", "block"]):
        matched = KNOWLEDGE_BASE["otp"]
        matched_reply = matched["reply"]
        matched_actions = matched["actions"]
    elif any(k in query_text for k in ["voice note", "clon", "audio", "fake voice", "speech", "vocoder", "sound real"]):
        matched = KNOWLEDGE_BASE["voice_clone"]
        matched_reply = matched["reply"]
        matched_actions = matched["actions"]
    elif any(k in query_text for k in ["score", "percentage", "confidence", "mean", "interpret", "what does"]):
        matched = KNOWLEDGE_BASE["score_meaning"]
        matched_reply = matched["reply"]
        matched_actions = matched["actions"]
    elif any(k in query_text for k in ["report", "cybercrime", "police", "helpline", "complaint", "scammed", "1930"]):
        matched = KNOWLEDGE_BASE["report_scam"]
        matched_reply = matched["reply"]
        matched_actions = matched["actions"]
    elif any(k in query_text for k in ["spectrogram", "mel", "frequency", "spectral", "audio visual"]):
        matched = KNOWLEDGE_BASE["spectrogram"]
        matched_reply = matched["reply"]
        matched_actions = matched["actions"]
    elif any(k in query_text for k in ["ela", "error level", "image", "splicing", "photoshop"]):
        matched = KNOWLEDGE_BASE["ela"]
        matched_reply = matched["reply"]
        matched_actions = matched["actions"]
    else:
        # Contextual general assistant response
        user_name = current_user.full_name if current_user else "Investigator"
        reply_body = (
            f"Hello {user_name}! I am DeepTrust Guardian, your digital authenticity and scam defense assistant.\n\n"
        )
        if scan_context_info:
            reply_body += f"I have your scan context loaded: {scan_context_info}.\n\n"
        reply_body += (
            "I can assist you with:\n"
            "- Explaining acoustic Mel-spectrogram and vocoder phase anomalies.\n"
            "- Evaluating whether a message or voice note contains social engineering fraud patterns.\n"
            "- Step-by-step guidance on out-of-band authentication.\n"
            "- Emergency reporting procedures for active cyber extortion.\n\n"
            "Select an action prompt below or describe the suspicious communication you encountered."
        )
        matched_reply = reply_body
        matched_actions = [
            "Is this voice note suspicious?",
            "What should I do if someone asks for money?",
            "What does the model score mean?",
            "How can I report a cyber scam?"
        ]

    # Multilingual prefix
    greeting = ""
    if lang == "hi":
        greeting = "नमस्ते! DeepTrust Guardian आपकी साइबर सुरक्षा के लिए तत्पर है।\n\n"
    elif lang == "pa":
        greeting = "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! DeepTrust Guardian ਤੁਹਾਡੀ ਸੁਰੱਖਿਆ ਲਈ ਹਾਜ਼ਰ ਹੈ।\n\n"

    final_reply = greeting + matched_reply

    return AssistantResponse(
        reply=final_reply,
        suggested_actions=matched_actions,
        context_used=scan_context_info
    )
