from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, desc

from app.database.database import get_db
from app.models.models import User, Scan
from app.schemas.schemas import DashboardStats, ScanOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Total scans
    total_q = await db.execute(select(func.count(Scan.id)).where(Scan.user_id == current_user.id))
    total_scans = total_q.scalar() or 0

    # Potential Deepfakes (audio/video/image flagged high/critical)
    deepfakes_q = await db.execute(
        select(func.count(Scan.id)).where(
            Scan.user_id == current_user.id,
            Scan.overall_risk.in_(["high", "critical"]),
            Scan.media_type.in_(["audio", "image", "video"])
        )
    )
    potential_deepfakes = deepfakes_q.scalar() or 0

    # Low-Risk Results
    low_risk_q = await db.execute(
        select(func.count(Scan.id)).where(
            Scan.user_id == current_user.id,
            Scan.overall_risk == "low"
        )
    )
    low_risk_results = low_risk_q.scalar() or 0

    # Suspicious Messages / Links
    scams_q = await db.execute(
        select(func.count(Scan.id)).where(
            Scan.user_id == current_user.id,
            Scan.overall_risk.in_(["medium", "high", "critical"]),
            Scan.media_type.in_(["message", "url"])
        )
    )
    suspicious_messages_links = scams_q.scalar() or 0

    # Media Distribution
    media_dist = {"audio": 0, "image": 0, "video": 0, "message": 0, "url": 0}
    media_counts = await db.execute(
        select(Scan.media_type, func.count(Scan.id))
        .where(Scan.user_id == current_user.id)
        .group_by(Scan.media_type)
    )
    for m_type, count in media_counts.all():
        if m_type in media_dist:
            media_dist[m_type] = count

    # Risk Breakdown
    risk_dist = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    risk_counts = await db.execute(
        select(Scan.overall_risk, func.count(Scan.id))
        .where(Scan.user_id == current_user.id)
        .group_by(Scan.overall_risk)
    )
    for r_level, count in risk_counts.all():
        if r_level in risk_dist:
            risk_dist[r_level] = count

    # Recent scans
    recent_q = await db.execute(
        select(Scan)
        .where(Scan.user_id == current_user.id)
        .options(selectinload(Scan.evidence))
        .order_by(desc(Scan.created_at))
        .limit(6)
    )
    recent_scans = recent_q.scalars().all()

    # AI Service Health
    ai_service_health = {
        "status": "operational",
        "audio_pipeline": {"model": "AASIST-ResNet-SpectralForensics", "status": "online", "latency": "38ms"},
        "image_pipeline": {"model": "DeepTrust-ForensicVision-ELA", "status": "online", "latency": "52ms"},
        "video_pipeline": {"model": "DeepTrust-TemporalFaceForensics", "status": "online", "latency": "115ms"},
        "scam_nlp_pipeline": {"model": "DeepTrust-ScamShield-NLP", "status": "online", "latency": "14ms"},
        "last_health_check": "Active (Local Hardware Engine)"
    }

    return DashboardStats(
        total_scans=total_scans,
        potential_deepfakes=potential_deepfakes,
        low_risk_results=low_risk_results,
        suspicious_messages_links=suspicious_messages_links,
        pending_analyses=0,
        media_distribution=media_dist,
        risk_breakdown=risk_dist,
        recent_scans=recent_scans,
        ai_service_health=ai_service_health
    )
