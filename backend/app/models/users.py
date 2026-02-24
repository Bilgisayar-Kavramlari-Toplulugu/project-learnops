from sqlalchemy import String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
import uuid

class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str] = mapped_column(String, nullable=True)
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)

    # İlişkiler
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")

class OAuthAccount(BaseModel):
    __tablename__ = "oauth_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    provider: Mapped[str] = mapped_column(String, nullable=False) # google, github, linkedin
    provider_account_id: Mapped[str] = mapped_column(String, nullable=False) # sub id
    access_token: Mapped[str] = mapped_column(Text, nullable=False)
    refresh_token_encrypted: Mapped[str] = mapped_column(Text, nullable=True)
    
    user = relationship("User", back_populates="oauth_accounts")

class DeletedAccount(BaseModel):
    __tablename__ = "deleted_accounts"
    
    # Audit log için sadece ID ve silinme sebebi tutulur, KVKK gereği kişisel veri tutulmaz.
    original_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    deletion_reason: Mapped[str] = mapped_column(String, nullable=True)