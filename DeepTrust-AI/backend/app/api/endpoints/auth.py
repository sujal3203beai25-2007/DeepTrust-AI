import uuid
import secrets
import hashlib
import smtplib
from datetime import datetime, timedelta
from typing import Optional, Any, List, Dict
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update

from app.database.database import get_db
from app.models.models import User, AuditLog, PasswordResetToken
from app.schemas.schemas import (
    UserCreate,
    UserLogin,
    UserOut,
    TokenResponse,
    UserUpdate,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    MessageResponse
)
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter()

# Rate-limiting memory tracker: email -> list of UTC timestamps
_reset_rate_limit: Dict[str, List[datetime]] = {}

# Local development test email capture storage
_dev_email_inbox: List[Dict[str, Any]] = []


def _check_rate_limit(email: str) -> None:
    now = datetime.utcnow()
    timestamps = _reset_rate_limit.get(email, [])
    # Keep timestamps within the last 15 minutes
    valid_ts = [ts for ts in timestamps if (now - ts) < timedelta(minutes=15)]
    _reset_rate_limit[email] = valid_ts

    if valid_ts:
        # Check if last request was under 60 seconds ago
        last_req = valid_ts[-1]
        seconds_since_last = (now - last_req).total_seconds()
        if seconds_since_last < 60:
            remaining = int(60 - seconds_since_last)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting another password reset link."
            )
        # Check max 5 requests per 15 minutes
        if len(valid_ts) >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many password reset requests. Please try again after 15 minutes."
            )

    valid_ts.append(now)
    _reset_rate_limit[email] = valid_ts


def _send_or_capture_email(to_email: str, reset_token: str) -> Dict[str, Any]:
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "DeepTrust AI — Password Reset Authorization"
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = to_email

            text_content = (
                f"Hello,\n\n"
                f"We received a request to reset your password for your DeepTrust AI account ({to_email}).\n"
                f"Please open the following link to reset your password:\n\n"
                f"{reset_url}\n\n"
                f"This single-use cryptographic token expires in 15 minutes.\n"
                f"If you did not request this, you may safely ignore this email.\n\n"
                f"— DeepTrust AI Forensic Security"
            )

            html_content = f"""
            <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #020914; color: #f3fbff; padding: 36px; border-radius: 14px; max-width: 520px; margin: auto; border: 1px solid #16425c;">
                <div style="margin-bottom: 20px;">
                    <span style="font-size: 20px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">DEEP<span style="color: #00d9f5;">TRUST</span> AI</span>
                </div>
                <h2 style="color: #ffffff; margin-top: 0; font-size: 18px;">Password Reset Authorization</h2>
                <p style="color: #9bb8c9; font-size: 13px; line-height: 1.6;">
                    A password reset was requested for your forensic workstation account (<strong style="color: #f3fbff;">{to_email}</strong>).
                </p>
                <div style="margin: 28px 0;">
                    <a href="{reset_url}" style="background-color: #00d9f5; color: #020914; padding: 12px 26px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #9bb8c9; font-size: 11px; line-height: 1.5;">
                    Security Note: This link expires in 15 minutes and can only be used once. If you did not initiate this request, your credentials remain secure.
                </p>
            </div>
            """

            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)

            return {"delivery_status": "sent", "dev_reset_url": None}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Email delivery service error: Unable to dispatch email via configured SMTP ({str(e)}). Please try again or check SMTP configuration."
            )
    else:
        # Development / Test capture mechanism when external SMTP is unconfigured
        dev_entry = {
            "email": to_email,
            "reset_url": reset_url,
            "dispatched_at": datetime.utcnow().isoformat(),
            "expires_in_minutes": 15
        }
        _dev_email_inbox.append(dev_entry)
        if len(_dev_email_inbox) > 50:
            _dev_email_inbox.pop(0)

        return {"delivery_status": "development_captured", "dev_reset_url": reset_url}


@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    clean_name = user_in.full_name.strip()

    if not clean_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name cannot be blank."
        )

    if len(user_in.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )

    # Check duplicate email
    existing = await db.execute(select(User).where(User.email == clean_email))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in instead."
        )

    user_id = str(uuid.uuid4())
    now = datetime.utcnow()
    user = User(
        id=user_id,
        email=clean_email,
        full_name=clean_name,
        hashed_password=get_password_hash(user_in.password),
        preferred_language=user_in.preferred_language or "en",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        is_active=True,
        password_changed_at=now,
        created_at=now,
        updated_at=now
    )
    db.add(user)
    await db.flush()

    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action="USER_REGISTRATION",
        details={"email": user.email, "name": user.full_name}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id, password_changed_at=user.password_changed_at)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    clean_email = credentials.email.strip().lower()
    result = await db.execute(select(User).where(User.email == clean_email))
    user = result.scalars().first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please check your credentials and try again."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact support."
        )

    # Audit log
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action="USER_LOGIN_SUCCESS",
        details={"email": user.email}
    )
    db.add(audit)
    await db.commit()

    token = create_access_token(user.id, password_changed_at=user.password_changed_at)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    clean_email = req.email.strip().lower()

    # Apply rate limiting
    _check_rate_limit(clean_email)

    # Lookup user
    result = await db.execute(select(User).where(User.email == clean_email))
    user = result.scalars().first()

    # Generic security response to prevent account enumeration
    standard_message = "If an account with that email address exists, a password reset link has been dispatched."

    if not user or not user.is_active:
        # User not found: return standard message without dev URL
        return ForgotPasswordResponse(
            message=standard_message,
            delivery_status="sent",
            dev_reset_url=None
        )

    # Invalidate any existing unused reset tokens for this user
    await db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id, PasswordResetToken.is_used == False)
        .values(is_used=True)
    )

    # Generate secure, random, single-use reset token
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    reset_token_record = PasswordResetToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        is_used=False
    )
    db.add(reset_token_record)

    # Audit log (do not log raw token or hash in plain audit logs)
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action="PASSWORD_RESET_REQUESTED",
        details={"email": user.email}
    )
    db.add(audit)
    await db.commit()

    # Deliver or capture email
    delivery = _send_or_capture_email(user.email, raw_token)

    return ForgotPasswordResponse(
        message=standard_message,
        delivery_status=delivery["delivery_status"],
        dev_reset_url=delivery["dev_reset_url"]
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    if len(req.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long."
        )

    raw_token = req.token.strip()
    token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()

    result = await db.execute(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash))
    token_record = result.scalars().first()

    if not token_record or token_record.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link is invalid or has already been used. Please request a new one."
        )

    if token_record.expires_at < datetime.utcnow():
        token_record.is_used = True
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link has expired. Please request a new one."
        )

    # Fetch user
    user_result = await db.execute(select(User).where(User.id == token_record.user_id))
    user = user_result.scalars().first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account associated with this reset link was not found."
        )

    # Invalidate token and update user password
    now = datetime.utcnow()
    token_record.is_used = True
    user.hashed_password = get_password_hash(req.new_password)
    user.password_changed_at = now
    user.updated_at = now

    # Invalidate all remaining tokens for this user
    await db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id)
        .values(is_used=True)
    )

    # Audit log
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action="PASSWORD_RESET_SUCCESS",
        details={"email": user.email}
    )
    db.add(audit)
    await db.commit()

    return MessageResponse(
        message="Password updated successfully. You can now log in with your new password."
    )


@router.get("/dev-inbox", tags=["Development"])
async def get_dev_inbox():
    """Retrieve recent captured development emails for local testing when SMTP is not configured."""
    return {"emails": _dev_email_inbox}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.put("/profile", response_model=UserOut)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if update_data.full_name:
        clean_name = update_data.full_name.strip()
        if clean_name:
            current_user.full_name = clean_name
    if update_data.preferred_language:
        current_user.preferred_language = update_data.preferred_language
    if update_data.password:
        if len(update_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long."
            )
        current_user.hashed_password = get_password_hash(update_data.password)
        current_user.password_changed_at = datetime.utcnow()
    if update_data.avatar_url:
        current_user.avatar_url = update_data.avatar_url

    current_user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        action="USER_LOGOUT",
        details={"email": current_user.email}
    )
    db.add(audit)
    await db.commit()
    return {"message": "Logged out successfully"}
