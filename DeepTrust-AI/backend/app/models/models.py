import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    preferred_language = Column(String(10), default="en") # en, hi, pa
    is_active = Column(Boolean, default=True)
    password_changed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    media_type = Column(String(32), nullable=False) # audio, image, video, message, url
    title = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=True)
    file_url = Column(String(512), nullable=True)
    original_filename = Column(String(255), nullable=True)
    file_size_bytes = Column(Integer, default=0)
    file_hash_sha256 = Column(String(64), nullable=True, index=True)
    status = Column(String(32), default="completed") # pending, processing, completed, failed
    
    # AI Results
    classification = Column(String(64), nullable=False) # Genuine, Synthetic / Manipulated, Suspicious Scam, Safe
    overall_risk = Column(String(32), nullable=False) # low, medium, high, critical
    risk_score = Column(Float, nullable=False) # 0.0 - 100.0
    confidence = Column(Float, nullable=False) # 0.0 - 1.0
    
    # Model Metadata
    model_name = Column(String(128), nullable=False)
    model_version = Column(String(64), nullable=False)
    inference_latency_ms = Column(Float, default=0.0)
    
    # Detailed forensic data & dual-risk data
    summary = Column(Text, nullable=True)
    forensic_details = Column(JSON, nullable=True)
    technical_limitations = Column(Text, nullable=True)
    recommended_actions = Column(JSON, nullable=True)
    
    # Dual-risk specific (for voice notes)
    synthetic_risk_score = Column(Float, nullable=True)
    scam_risk_score = Column(Float, nullable=True)
    transcript = Column(Text, nullable=True)
    flagged_phrases = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scans")
    evidence = relationship("ScanEvidence", back_populates="scan", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="scan", uselist=False, cascade="all, delete-orphan")

class ScanEvidence(Base):
    __tablename__ = "scan_evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False, index=True)
    evidence_type = Column(String(64), nullable=False) # spectrogram, waveform, ela_heatmap, frame_sample, text_snippet
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    visual_path = Column(String(512), nullable=True)
    visual_url = Column(String(512), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="evidence")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id"), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    report_uuid = Column(String(64), unique=True, nullable=False, default=lambda: f"DTR-{uuid.uuid4().hex[:10].upper()}")
    pdf_path = Column(String(512), nullable=True)
    pdf_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="report")
    user = relationship("User", back_populates="reports")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(128), nullable=False)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(64), nullable=False, index=True) # SHA-256 hash, NEVER stored in plaintext
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reset_tokens")
