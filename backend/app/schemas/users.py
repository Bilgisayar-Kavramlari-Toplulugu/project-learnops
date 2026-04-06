from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class UserProfileResponse(BaseModel):
    id: str
    email: str
    display_name: str
    bio: Optional[str]
    avatar_type: str


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_type: Optional[str] = None

    @field_validator("display_name")
    @classmethod
    def display_name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("display_name cannot be empty")
        return v

    @field_validator("avatar_type")
    @classmethod
    def avatar_type_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        valid = {"initials"} | {f"system_{i}" for i in range(1, 11)}
        if v not in valid:
            raise ValueError(f"avatar_type must be one of: {sorted(valid)}")
        return v


class OAuthAccountResponse(BaseModel):
    """Tek bir OAuth hesap bağlantısı"""

    id: str
    provider: str
    provider_email: str
    linked_at: datetime


class OAuthAccountListResponse(BaseModel):
    """Kullanıcının bağlı OAuth hesaplarının listesi"""

    accounts: list[OAuthAccountResponse]
