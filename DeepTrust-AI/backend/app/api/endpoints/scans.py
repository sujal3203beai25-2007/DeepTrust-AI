import os
import hashlib
import uuid
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc

from app.database.database import get_db
from app.models.models import User, Scan, ScanEvidence, Report, AuditLog
from app.schemas.schemas import ScanOut, ScanCreateText
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter()

def compute_sha256(file_path: str) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

@router.post("/audio", response_model=ScanOut)
async def scan_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Validate extension
    ext = Path(file.filename).suffix.lower()
    if ext not in [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]:
        raise HTTPException(status_code=400, detail=f"Unsupported audio format: {ext}")

    saved_filename = f"audio_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = settings.UPLOAD_DIR / saved_filename
    
    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)
        
    file_hash = compute_sha256(str(dest_path))
    file_size = len(content)

    # Run Real AI Detection
    from app.ai.audio.detector import analyze_audio_file
    from app.services.pdf_generator import generate_forensic_pdf
    results = analyze_audio_file(str(dest_path), settings.UPLOAD_DIR)

    scan = Scan(
        user_id=current_user.id,
        media_type="audio",
        title=f"Audio Scan: {file.filename}",
        file_path=str(dest_path),
        file_url=f"/api/v1/static/{saved_filename}",
        original_filename=file.filename,
        file_size_bytes=file_size,
        file_hash_sha256=file_hash,
        status="completed",
        classification=results["classification"],
        overall_risk=results["overall_risk"],
        risk_score=results["risk_score"],
        confidence=results["confidence"],
        model_name=results["model_name"],
        model_version=results["model_version"],
        inference_latency_ms=results["inference_latency_ms"],
        summary="; ".join(results["anomalies"]),
        forensic_details=results,
        technical_limitations=results["technical_limitations"],
        recommended_actions=results["recommended_actions"]
    )
    db.add(scan)
    await db.flush()

    # Evidence: Mel-Spectrogram
    spec_evidence = ScanEvidence(
        scan_id=scan.id,
        evidence_type="spectrogram",
        title="High-Resolution Mel-Spectrogram",
        description="Acoustic frequency distribution visual highlighting vocoder phase and cutoff signatures.",
        visual_path=str(settings.UPLOAD_DIR / results["spectrogram_filename"]),
        visual_url=f"/api/v1/static/{results['spectrogram_filename']}",
        metadata_json=results["forensic_metrics"]
    )
    db.add(spec_evidence)

    # Generate PDF report automatically
    pdf_filename = f"report_{scan.id}.pdf"
    pdf_path = settings.REPORTS_DIR / pdf_filename
    generate_forensic_pdf(
        scan_data={
            "id": scan.id,
            "media_type": "audio",
            "file_hash_sha256": file_hash,
            "classification": results["classification"],
            "overall_risk": results["overall_risk"],
            "risk_score": results["risk_score"],
            "confidence": results["confidence"],
            "model_name": results["model_name"],
            "model_version": results["model_version"],
            "summary": scan.summary,
            "technical_limitations": results["technical_limitations"],
            "recommended_actions": results["recommended_actions"]
        },
        output_pdf_path=pdf_path,
        evidence_image_path=str(settings.UPLOAD_DIR / results["spectrogram_filename"])
    )

    report = Report(
        scan_id=scan.id,
        user_id=current_user.id,
        pdf_path=str(pdf_path),
        pdf_url=f"/api/v1/reports/{scan.id}/download"
    )
    db.add(report)

    await db.commit()
    
    # Reload with evidence
    result = await db.execute(
        select(Scan).where(Scan.id == scan.id).options(selectinload(Scan.evidence))
    )
    return result.scalars().first()

@router.post("/dual-risk", response_model=ScanOut)
async def scan_dual_risk(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Dedicated endpoint for the Flagship Dual-Risk Voice Message analysis:
    Assesses Synthetic Audio Risk AND Transcript Scam Risk independently.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]:
        raise HTTPException(status_code=400, detail=f"Unsupported audio format: {ext}")

    saved_filename = f"voice_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = settings.UPLOAD_DIR / saved_filename
    
    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)
        
    file_hash = compute_sha256(str(dest_path))
    from app.ai.transcription.engine import run_dual_risk_analysis
    from app.services.pdf_generator import generate_forensic_pdf
    results = run_dual_risk_analysis(str(dest_path), settings.UPLOAD_DIR)

    scan = Scan(
        user_id=current_user.id,
        media_type="audio",
        title=f"Dual-Risk Voice Audit: {file.filename}",
        file_path=str(dest_path),
        file_url=f"/api/v1/static/{saved_filename}",
        original_filename=file.filename,
        file_size_bytes=file_size,
        file_hash_sha256=file_hash,
        status="completed",
        classification=results["classification"],
        overall_risk=results["overall_risk"],
        risk_score=max(results["synthetic_risk_score"], results["scam_risk_score"]),
        confidence=results["confidence"],
        model_name="DeepTrust-DualRisk-AcousticNLP",
        model_version="v2.5-Decoupled",
        inference_latency_ms=results["inference_latency_ms"],
        summary=results["summary"],
        forensic_details=results,
        technical_limitations=results["technical_limitations"],
        recommended_actions=results["recommended_actions"],
        synthetic_risk_score=results["synthetic_risk_score"],
        scam_risk_score=results["scam_risk_score"],
        transcript=results["transcript"],
        flagged_phrases=results["flagged_phrases"]
    )
    db.add(scan)
    await db.flush()

    # Evidence: Spectrogram
    spec_evidence = ScanEvidence(
        scan_id=scan.id,
        evidence_type="spectrogram",
        title="Voice Note Mel-Spectrogram",
        description="Acoustic analysis verifying vocoder artifacts in voice note.",
        visual_path=str(settings.UPLOAD_DIR / results["spectrogram_filename"]),
        visual_url=f"/api/v1/static/{results['spectrogram_filename']}",
        metadata_json={"synthetic_risk": results["synthetic_risk_score"], "scam_risk": results["scam_risk_score"]}
    )
    db.add(spec_evidence)

    # Generate PDF
    pdf_filename = f"report_{scan.id}.pdf"
    pdf_path = settings.REPORTS_DIR / pdf_filename
    generate_forensic_pdf(
        scan_data={
            "id": scan.id,
            "media_type": "audio",
            "file_hash_sha256": file_hash,
            "classification": results["classification"],
            "overall_risk": results["overall_risk"],
            "risk_score": scan.risk_score,
            "confidence": results["confidence"],
            "model_name": scan.model_name,
            "model_version": scan.model_version,
            "summary": scan.summary,
            "technical_limitations": results["technical_limitations"],
            "recommended_actions": results["recommended_actions"]
        },
        output_pdf_path=pdf_path,
        evidence_image_path=str(settings.UPLOAD_DIR / results["spectrogram_filename"])
    )

    report = Report(
        scan_id=scan.id,
        user_id=current_user.id,
        pdf_path=str(pdf_path),
        pdf_url=f"/api/v1/reports/{scan.id}/download"
    )
    db.add(report)

    await db.commit()
    result = await db.execute(
        select(Scan).where(Scan.id == scan.id).options(selectinload(Scan.evidence))
    )
    return result.scalars().first()

@router.post("/image", response_model=ScanOut)
async def scan_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ext = Path(file.filename).suffix.lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
        raise HTTPException(status_code=400, detail=f"Unsupported image format: {ext}")

    saved_filename = f"img_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = settings.UPLOAD_DIR / saved_filename
    
    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)
        
    file_hash = compute_sha256(str(dest_path))
    file_size = len(content)

    from app.ai.image.detector import analyze_image_file
    from app.services.pdf_generator import generate_forensic_pdf
    results = analyze_image_file(str(dest_path), settings.UPLOAD_DIR)

    scan = Scan(
        user_id=current_user.id,
        media_type="image",
        title=f"Image Scan: {file.filename}",
        file_path=str(dest_path),
        file_url=f"/api/v1/static/{saved_filename}",
        original_filename=file.filename,
        file_size_bytes=file_size,
        file_hash_sha256=file_hash,
        status="completed",
        classification=results["classification"],
        overall_risk=results["overall_risk"],
        risk_score=results["risk_score"],
        confidence=results["confidence"],
        model_name=results["model_name"],
        model_version=results["model_version"],
        inference_latency_ms=results["inference_latency_ms"],
        summary="; ".join(results["anomalies"]),
        forensic_details=results,
        technical_limitations=results["technical_limitations"],
        recommended_actions=results["recommended_actions"]
    )
    db.add(scan)
    await db.flush()

    # Evidence: ELA map
    ela_evidence = ScanEvidence(
        scan_id=scan.id,
        evidence_type="ela_heatmap",
        title="Error Level Analysis (ELA) Compression Residual",
        description="Visualizes digital tampering by highlighting localized variance in JPEG compression error rates.",
        visual_path=str(settings.UPLOAD_DIR / results["ela_filename"]),
        visual_url=f"/api/v1/static/{results['ela_filename']}",
        metadata_json=results["forensic_metrics"]
    )
    db.add(ela_evidence)

    # PDF Report
    pdf_filename = f"report_{scan.id}.pdf"
    pdf_path = settings.REPORTS_DIR / pdf_filename
    generate_forensic_pdf(
        scan_data={
            "id": scan.id,
            "media_type": "image",
            "file_hash_sha256": file_hash,
            "classification": results["classification"],
            "overall_risk": results["overall_risk"],
            "risk_score": results["risk_score"],
            "confidence": results["confidence"],
            "model_name": results["model_name"],
            "model_version": results["model_version"],
            "summary": scan.summary,
            "technical_limitations": results["technical_limitations"],
            "recommended_actions": results["recommended_actions"]
        },
        output_pdf_path=pdf_path,
        evidence_image_path=str(settings.UPLOAD_DIR / results["ela_filename"])
    )

    report = Report(
        scan_id=scan.id,
        user_id=current_user.id,
        pdf_path=str(pdf_path),
        pdf_url=f"/api/v1/reports/{scan.id}/download"
    )
    db.add(report)

    await db.commit()
    result = await db.execute(
        select(Scan).where(Scan.id == scan.id).options(selectinload(Scan.evidence))
    )
    return result.scalars().first()

@router.post("/video", response_model=ScanOut)
async def scan_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ext = Path(file.filename).suffix.lower()
    if ext not in [".mp4", ".mov", ".avi", ".mkv", ".webm"]:
        raise HTTPException(status_code=400, detail=f"Unsupported video format: {ext}")

    saved_filename = f"video_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = settings.UPLOAD_DIR / saved_filename
    
    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)
        
    file_hash = compute_sha256(str(dest_path))
    file_size = len(content)

    from app.ai.video.detector import analyze_video_file
    from app.services.pdf_generator import generate_forensic_pdf
    results = analyze_video_file(str(dest_path), settings.UPLOAD_DIR)

    scan = Scan(
        user_id=current_user.id,
        media_type="video",
        title=f"Video Deepfake Scan: {file.filename}",
        file_path=str(dest_path),
        file_url=f"/api/v1/static/{saved_filename}",
        original_filename=file.filename,
        file_size_bytes=file_size,
        file_hash_sha256=file_hash,
        status="completed",
        classification=results["classification"],
        overall_risk=results["overall_risk"],
        risk_score=results["risk_score"],
        confidence=results["confidence"],
        model_name=results["model_name"],
        model_version=results["model_version"],
        inference_latency_ms=results["inference_latency_ms"],
        summary="; ".join(results["anomalies"]),
        forensic_details=results,
        technical_limitations=results["technical_limitations"],
        recommended_actions=results["recommended_actions"]
    )
    db.add(scan)
    await db.flush()

    # Evidence: Analyzed keyframes
    primary_frame = None
    for frame in results["analyzed_frames"][:4]:
        v_path = settings.UPLOAD_DIR / frame["filename"]
        if not primary_frame:
            primary_frame = str(v_path)
        frame_ev = ScanEvidence(
            scan_id=scan.id,
            evidence_type="frame_sample",
            title=f"Sampled Keyframe at {frame['timestamp']}s",
            description=f"Facial boundary and motion tracking assessment (Suspicion: {frame['suspicion_score']}%)",
            visual_path=str(v_path),
            visual_url=f"/api/v1/static/{frame['filename']}",
            metadata_json=frame
        )
        db.add(frame_ev)

    # PDF Report
    pdf_filename = f"report_{scan.id}.pdf"
    pdf_path = settings.REPORTS_DIR / pdf_filename
    generate_forensic_pdf(
        scan_data={
            "id": scan.id,
            "media_type": "video",
            "file_hash_sha256": file_hash,
            "classification": results["classification"],
            "overall_risk": results["overall_risk"],
            "risk_score": results["risk_score"],
            "confidence": results["confidence"],
            "model_name": results["model_name"],
            "model_version": results["model_version"],
            "summary": scan.summary,
            "technical_limitations": results["technical_limitations"],
            "recommended_actions": results["recommended_actions"]
        },
        output_pdf_path=pdf_path,
        evidence_image_path=primary_frame
    )

    report = Report(
        scan_id=scan.id,
        user_id=current_user.id,
        pdf_path=str(pdf_path),
        pdf_url=f"/api/v1/reports/{scan.id}/download"
    )
    db.add(report)

    await db.commit()
    result = await db.execute(
        select(Scan).where(Scan.id == scan.id).options(selectinload(Scan.evidence))
    )
    return result.scalars().first()

@router.post("/text", response_model=ScanOut)
async def scan_text(
    payload: ScanCreateText,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    text_content = payload.content.strip()
    is_url = payload.media_type == "url" or text_content.startswith(("http://", "https://", "www."))

    from app.ai.text.detector import analyze_text_message, analyze_url_target
    from app.services.pdf_generator import generate_forensic_pdf

    if is_url:
        results = analyze_url_target(text_content)
        media_type = "url"
        title = payload.title or f"URL Phishing Audit: {results.get('hostname', 'link')[:30]}"
    else:
        results = analyze_text_message(text_content)
        media_type = "message"
        title = payload.title or f"Message Audit: {text_content[:35]}..."

    text_hash = hashlib.sha256(text_content.encode("utf-8")).hexdigest()

    scan = Scan(
        user_id=current_user.id,
        media_type=media_type,
        title=title,
        file_path=None,
        file_url=None,
        original_filename=f"{media_type}_audit.txt",
        file_size_bytes=len(text_content),
        file_hash_sha256=text_hash,
        status="completed",
        classification=results["classification"],
        overall_risk=results["overall_risk"],
        risk_score=results["risk_score"],
        confidence=results["confidence"],
        model_name=results["model_name"],
        model_version=results["model_version"],
        inference_latency_ms=results["inference_latency_ms"],
        summary=results["summary"],
        forensic_details=results,
        technical_limitations=results["technical_limitations"],
        recommended_actions=results["recommended_actions"],
        transcript=text_content if media_type == "message" else None,
        flagged_phrases=results.get("flagged_phrases", [])
    )
    db.add(scan)
    await db.flush()

    # Evidence: Text snippet
    evidence = ScanEvidence(
        scan_id=scan.id,
        evidence_type="text_snippet",
        title="Detected Threat Indicators",
        description=f"Identified {len(results.get('detected_indicators', []))} scam signals.",
        visual_path=None,
        visual_url=None,
        metadata_json={"indicators": results.get("detected_indicators", [])}
    )
    db.add(evidence)

    # PDF Report
    pdf_filename = f"report_{scan.id}.pdf"
    pdf_path = settings.REPORTS_DIR / pdf_filename
    generate_forensic_pdf(
        scan_data={
            "id": scan.id,
            "media_type": media_type,
            "file_hash_sha256": text_hash,
            "classification": results["classification"],
            "overall_risk": results["overall_risk"],
            "risk_score": results["risk_score"],
            "confidence": results["confidence"],
            "model_name": results["model_name"],
            "model_version": results["model_version"],
            "summary": scan.summary,
            "technical_limitations": results["technical_limitations"],
            "recommended_actions": results["recommended_actions"]
        },
        output_pdf_path=pdf_path
    )

    report = Report(
        scan_id=scan.id,
        user_id=current_user.id,
        pdf_path=str(pdf_path),
        pdf_url=f"/api/v1/reports/{scan.id}/download"
    )
    db.add(report)

    await db.commit()
    result = await db.execute(
        select(Scan).where(Scan.id == scan.id).options(selectinload(Scan.evidence))
    )
    return result.scalars().first()

@router.get("/", response_model=List[ScanOut])
async def list_scans(
    media_type: Optional[str] = Query(None),
    overall_risk: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Scan).where(Scan.user_id == current_user.id).options(selectinload(Scan.evidence))
    
    if media_type:
        query = query.where(Scan.media_type == media_type)
    if overall_risk:
        query = query.where(Scan.overall_risk == overall_risk)
    if search:
        query = query.where(Scan.title.ilike(f"%{search}%"))

    query = query.order_by(desc(Scan.created_at)).limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{scan_id}", response_model=ScanOut)
async def get_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Scan).where(Scan.id == scan_id).options(selectinload(Scan.evidence))
    result = await db.execute(query)
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")
    return scan

@router.delete("/{scan_id}")
async def delete_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Scan).where(Scan.id == scan_id, Scan.user_id == current_user.id))
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")
        
    await db.delete(scan)
    await db.commit()
    return {"message": "Scan and associated evidence deleted successfully."}

@router.post("/bulk-delete")
async def bulk_delete_scans(
    scan_ids: List[str],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    for s_id in scan_ids:
        result = await db.execute(select(Scan).where(Scan.id == s_id, Scan.user_id == current_user.id))
        scan = result.scalars().first()
        if scan:
            await db.delete(scan)
    await db.commit()
    return {"message": f"Successfully deleted {len(scan_ids)} scans."}
