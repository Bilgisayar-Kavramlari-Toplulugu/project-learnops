from pydantic import BaseModel, EmailStr
from enum import Enum


class OAuthProvider(str, Enum):
    google = "google"
    github = "github"
    linkedin = "linkedin"


class MergeAccountRequest(BaseModel):
    """Hesap birleştirme onayı için kullanıcıdan gelen request"""
    merge_token: str  # Geçici token - birleştirme işlemini doğrulamak için
    provider: OAuthProvider


class MergeAccountResponse(BaseModel):
    """Birleştirme sonucu"""
    message: str
    email: str
    providers: list[str]  # Artık bağlı olan tüm provider'lar


class AccountConflictResponse(BaseModel):
    """Email çakışması durumunda frontend'e dönen response"""
    conflict: bool = True
    message: str
    email: str
    existing_providers: list[str]  # Mevcut hesapta hangi provider'lar var
    new_provider: OAuthProvider
    merge_token: str  # Frontend bu token'ı onay sırasında geri gönderecek