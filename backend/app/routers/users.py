from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.schemas.users import DeleteAccountRequest
from app.services.jwt_service import blacklist_refresh_token_if_valid
from app.services.user_service import hard_delete_user_account

router = APIRouter(prefix="/users", tags=["users"])

DELETE_CONFIRMATION_TEXT = "HESABIMI SİL"


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    request: DeleteAccountRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    if request.confirmation != DELETE_CONFIRMATION_TEXT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Geçersiz onay metni. Lütfen '{DELETE_CONFIRMATION_TEXT}' yazın.",
        )

    deleted = await hard_delete_user_account(db, current_user)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    refresh_token = http_request.cookies.get("refresh_token")
    if refresh_token:
        blacklist_refresh_token_if_valid(refresh_token)

    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response
