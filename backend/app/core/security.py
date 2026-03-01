from cryptography.fernet import Fernet
from app.config import settings

def encrypt_token(token: str) -> str:
    """Encrypt sensitive tokens using Fernet (for refresh tokens)"""
    if not settings.TOKEN_ENCRYPTION_KEY:
        raise ValueError("TOKEN_ENCRYPTION_KEY not configured")
    
    fernet = Fernet(settings.TOKEN_ENCRYPTION_KEY.encode())
    encrypted = fernet.encrypt(token.encode())
    return encrypted.decode()
