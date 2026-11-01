import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.future import select

from app.core.config import settings
from app.database.database import engine, Base, AsyncSessionLocal
from app.models.models import User, Scan, ScanEvidence, Report
from app.core.security import get_password_hash

from app.api.endpoints import auth, scans, reports, dashboard, demo, assistant, transparency

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Check and migrate password_changed_at if missing on users table
        def _check_and_migrate(connection):
            import sqlite3
            # For sqlite connections, check table columns
            raw_conn = connection.connection
            cursor = raw_conn.cursor()
            cursor.execute("PRAGMA table_info(users)")
            cols = [c[1] for c in cursor.fetchall()]
            if cols and "password_changed_at" not in cols:
                cursor.execute("ALTER TABLE users ADD COLUMN password_changed_at DATETIME")
                raw_conn.commit()
        await conn.run_sync(_check_and_migrate)
        
    # Seed default demo account and sample data if not present
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == "demo@deeptrust.ai"))
        user = result.scalars().first()
        if not user:
            user = User(
                email="demo@deeptrust.ai",
                full_name="Alexander Vance (Security Director)",
                hashed_password=get_password_hash("DeepTrust#2026"),
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                preferred_language="en"
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)

            # Seed initial sample scans for rich dashboard
            sample_scans = [
                Scan(
                    user_id=user.id,
                    media_type="audio",
                    title="Audio Scan: urgent_ceo_voice_memo.mp3",
                    original_filename="urgent_ceo_voice_memo.mp3",
                    file_size_bytes=1048576,
                    file_hash_sha256="7c993523606d4e7086d8d42c826627f120a93d04ececf7e94e724a15174599f4",
                    status="completed",
                    classification="Synthetic / AI-Generated Speech",
                    overall_risk="high",
                    risk_score=88.5,
                    confidence=0.94,
                    model_name="AASIST-ResNet-SpectralForensics",
                    model_version="v2.4-HybridAcoustic",
                    inference_latency_ms=42.1,
                    summary="Unnatural pitch contour regularity; suppressed MFCC delta transition dynamics typical of neural vocoder.",
                    synthetic_risk_score=88.5,
                    scam_risk_score=92.0,
                    transcript="Urgent wire transfer required for overseas supplier. Transfer funds before 5 PM today.",
                    technical_limitations="Model tested on ASVspoof benchmarks. Studio compressed audio may slightly lower confidence.",
                    recommended_actions=[
                        "Contact CEO via direct verified mobile number.",
                        "Enforce strict dual-authorization bank protocol."
                    ]
                ),
                Scan(
                    user_id=user.id,
                    media_type="message",
                    title="Message Audit: Electricity Department KYC Alert",
                    original_filename="message_audit.txt",
                    file_size_bytes=245,
                    file_hash_sha256="2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
                    status="completed",
                    classification="High-Risk Fraud / Social Engineering Scam",
                    overall_risk="critical",
                    risk_score=94.0,
                    confidence=0.98,
                    model_name="DeepTrust-ScamShield-NLP-DeBERTa",
                    model_version="v3.2-ExplainableRules",
                    inference_latency_ms=12.4,
                    summary="Detected urgent power disconnection threat, unverified contact number, and credential harvesting link.",
                    transcript="Dear Customer, your electricity power will be DISCONNECTED tonight at 9 PM. Call officer immediately or visit http://wb-bill-update.xyz",
                    technical_limitations="Rule heuristics evaluate standard psychological coercion triggers.",
                    recommended_actions=[
                        "Do not click the link or call the number in the SMS.",
                        "Check billing status only on official electricity portal."
                    ]
                ),
                Scan(
                    user_id=user.id,
                    media_type="image",
                    title="Image Scan: passport_id_verification.jpg",
                    original_filename="passport_id_verification.jpg",
                    file_size_bytes=3420100,
                    file_hash_sha256="4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
                    status="completed",
                    classification="Authentic / Unaltered Photograph",
                    overall_risk="low",
                    risk_score=12.0,
                    confidence=0.91,
                    model_name="DeepTrust-ForensicVision-ELA-ResNet",
                    model_version="v3.1-MultiSpectral",
                    inference_latency_ms=48.6,
                    summary="Uniform sensor pattern noise (PRNU) and consistent JPEG block DCT grid throughout image.",
                    technical_limitations="Camera metadata verified matching physical hardware profile.",
                    recommended_actions=[
                        "Original physical document can be accepted for standard verification."
                    ]
                )
            ]
            for s in sample_scans:
                session.add(s)
            await session.commit()

    yield
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="DeepTrust AI — AI-Powered Digital Authenticity & Scam Prevention Platform",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads and generated reports
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/api/v1/static", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="static_uploads")

# Mount API Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(scans.router, prefix="/api/v1/scans", tags=["Scans"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(demo.router, prefix="/api/v1/demo", tags=["Live Demo Lab"])
app.include_router(assistant.router, prefix="/api/v1/assistant", tags=["DeepTrust Guardian Assistant"])
app.include_router(transparency.router, prefix="/api/v1/transparency", tags=["Model Transparency"])

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "platform": "DeepTrust AI Core Engine",
        "version": settings.VERSION,
        "ai_subsystems": {
            "audio": "AASIST-ResNet-SpectralForensics (Active)",
            "image": "DeepTrust-ForensicVision-ELA (Active)",
            "video": "DeepTrust-TemporalFaceForensics (Active)",
            "text": "DeepTrust-ScamShield-NLP (Active)"
        }
    }
