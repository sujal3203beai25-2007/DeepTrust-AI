from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.database import get_db
from app.models.models import User, Report, Scan
from app.schemas.schemas import ReportOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=list[ReportOut])
async def list_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Report).where(Report.user_id == current_user.id).options(
        selectinload(Report.scan).selectinload(Scan.evidence)
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{scan_id}/download")
async def download_report_pdf(
    scan_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Report).where(Report.scan_id == scan_id))
    report = result.scalars().first()
    if not report or not report.pdf_path:
        raise HTTPException(status_code=404, detail="Forensic PDF report not found.")
        
    p = Path(report.pdf_path)
    if not p.exists():
        raise HTTPException(status_code=404, detail="PDF file does not exist on disk.")

    return FileResponse(
        path=str(p),
        filename=f"DeepTrust_Forensic_Report_{report.report_uuid}.pdf",
        media_type="application/pdf"
    )
