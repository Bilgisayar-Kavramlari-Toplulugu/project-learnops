from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str  # user id
    type: str  # "access" veya "refresh"


class RefreshRequest(BaseModel):
    refresh_token: str


class OAuthProvider(str, Enum):
    google = "google"
    github = "github"
    linkedin = "linkedin"


class ConflictCheckRequest(BaseModel):
    email: EmailStr
    provider: OAuthProvider
    provider_user_id: str
    provider_email: str


class MergeAccountRequest(BaseModel):
    merge_token: str  # Geçici token - birleştirme işlemini doğrulamak için


class MergeAccountResponse(BaseModel):
    message: str
    email: str
    providers: list[str]  # Artık bağlı olan tüm provider'lar


class UserMeResponse(BaseModel):
    id: str
    email: str
    display_name: str
    avatar_type: str
    role: str = "user"


class AccountConflictResponse(BaseModel):
    """Email çakışması durumunda frontend'e dönen response"""

    conflict: bool = True
    message: str
    email: str
    existing_providers: list[str]  # Mevcut hesapta hangi provider'lar var
    new_provider: OAuthProvider
    merge_token: str  # Frontend bu token'ı onay sırasında geri gönderecek


class OAuthAccountResponse(BaseModel):
    """Tek bir OAuth hesap bağlantısı"""

    id: str
    provider: str
    provider_email: str
    linked_at: datetime


class OAuthAccountListResponse(BaseModel):
    """Kullanıcının bağlı OAuth hesaplarının listesi"""

    accounts: list[OAuthAccountResponse]
