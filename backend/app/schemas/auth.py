from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str  # user id
    type: str  # "access" veya "refresh"


class RefreshRequest(BaseModel):
    refresh_token: str
