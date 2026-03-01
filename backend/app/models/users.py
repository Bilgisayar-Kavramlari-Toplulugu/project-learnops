"""User, OAuth account, and deleted account models (MVP v1.2 compliant)"""
from sqlalchemy import String, ForeignKey, Text, DateTime, BigInteger, Identity
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text
from .base import BaseModel, Base
import uuid
from datetime import datetime
from typing import Optional


class User(BaseModel):
    """User profile model (OAuth-only, no password storage)
    
    Fields:
    - email: Unique email for login (from OAuth provider)
    - display_name: User's display name (e.g., "Ali Veli")
    - bio: Optional user bio
    - avatar_type: 'initials' (default) or 'system_1'..'system_10'
      Frontend generates initials from display_name or displays SVG avatar
      NO external URLs to comply with KVKK data minimization
    - last_login_at: Timestamp of last login (for activity tracking)
    """
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    avatar_type: Mapped[str] = mapped_column(String(20), nullable=False, default='initials')
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    oauth_accounts: Mapped[list] = relationship(
        "OAuthAccount", back_populates="user", cascade="all, delete-orphan"
    )
    enrollments: Mapped[list] = relationship(
        "Enrollment", back_populates="user", cascade="all, delete-orphan"
    )
    progress: Mapped[list] = relationship(
        "UserProgress", back_populates="user", cascade="all, delete-orphan"
    )
    quiz_attempts: Mapped[list] = relationship(
        "QuizAttempt", back_populates="user", cascade="all, delete-orphan"
    )


class OAuthAccount(BaseModel):
    """OAuth provider account linkage (MVP v1.2: NO access_token storage)
    
    Security model from MVP spec:
    - provider_user_id: OAuth provider's unique user ID (sub, id, etc.) — PLAIN TEXT (public in provider)
    - provider_email: Email from OAuth provider — PLAIN TEXT (public in provider)
    - refresh_token_encrypted: AES-256 encrypted IF provider supplies it
      Google: supplies (offline_access scope) | LinkedIn: supplies | GitHub: DOES NOT supply
    - NO access_token: Each session fetches fresh access token from provider
    
    Constraint: UNIQUE(provider, provider_user_id) — one account per provider per user
    """
    __tablename__ = "oauth_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    provider: Mapped[str] = mapped_column(String(30), nullable=False)
    # provider: 'google' | 'linkedin' | 'github' (validated by CHECK constraint)
    provider_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_email: Mapped[str] = mapped_column(String(255), nullable=False)
    refresh_token_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    linked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="oauth_accounts")


class DeletedAccount(Base):
    """Audit log for hard-deleted accounts (MVP v1.2)"""
    __tablename__ = "deleted_accounts"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    deleted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    deletion_reason: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, server_default=text("'user_request'"))