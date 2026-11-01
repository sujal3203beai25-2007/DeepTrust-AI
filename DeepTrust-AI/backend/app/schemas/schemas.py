from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    preferred_language: Optional[str] = "en"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    password: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOut(UserBase):
    id: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    delivery_status: str # "sent" | "development_captured"
    dev_reset_url: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=16)
    new_password: str = Field(..., min_length=8)

class MessageResponse(BaseModel):
    message: str

# Evidence Schemas
class EvidenceOut(BaseModel):
    id: str
    evidence_type: str
    title: str
    description: Optional[str] = None
    visual_url: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Scan Schemas
class ScanCreateText(BaseModel):
    content: str = Field(..., min_length=5, description="Suspicious message or URL to analyze")
    media_type: str = Field("message", description="message or url")
    title: Optional[str] = None

class ScanOut(BaseModel):
    id: str
    user_id: str
    media_type: str
    title: str
    file_url: Optional[str] = None
    original_filename: Optional[str] = None
    file_size_bytes: int
    file_hash_sha256: Optional[str] = None
    status: str
    classification: str
    overall_risk: str
    risk_score: float
    confidence: float
    model_name: str
    model_version: str
    inference_latency_ms: float
    summary: Optional[str] = None
    forensic_details: Optional[Dict[str, Any]] = None
    technical_limitations: Optional[str] = None
    recommended_actions: Optional[List[str]] = None
    synthetic_risk_score: Optional[float] = None
    scam_risk_score: Optional[float] = None
    transcript: Optional[str] = None
    flagged_phrases: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    evidence: List[EvidenceOut] = []

    class Config:
        from_attributes = True

# Dashboard Stats Schemas
class DashboardStats(BaseModel):
    total_scans: int
    potential_deepfakes: int
    low_risk_results: int
    suspicious_messages_links: int
    pending_analyses: int
    media_distribution: Dict[str, int]
    risk_breakdown: Dict[str, int]
    recent_scans: List[ScanOut]
    ai_service_health: Dict[str, Any]

# Assistant Chat
class AssistantMessage(BaseModel):
    role: str # user, assistant, system
    content: str

class AssistantRequest(BaseModel):
    message: str
    scan_id: Optional[str] = None
    history: Optional[List[AssistantMessage]] = []
    language: Optional[str] = "en"

class AssistantResponse(BaseModel):
    reply: str
    suggested_actions: List[str]
    context_used: Optional[str] = None

# Report Schemas
class ReportOut(BaseModel):
    id: str
    scan_id: str
    report_uuid: str
    pdf_url: Optional[str] = None
    created_at: datetime
    scan: Optional[ScanOut] = None

    class Config:
        from_attributes = True
