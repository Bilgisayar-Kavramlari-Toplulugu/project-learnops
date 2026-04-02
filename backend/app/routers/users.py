"""User profile endpoints (OAuth account management)"""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.services.oauth_service import unlink_oauth_account

router = APIRouter(prefix="/users", tags=["users"])
logger = logging.getLogger(__name__)


@router.delete(
    "/me/accounts/{account_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unlink an OAuth account",
    responses={
        400: {"description": "Son OAuth hesabı silinemez"},
        404: {"description": "OAuth hesabı bulunamadı"},
    },
)
async def delete_oauth_account(
    account_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Kullanıcının bağlı OAuth hesaplarından birini kaldırır.

    - En az 1 OAuth bağlantısı kalmalıdır (son hesap silinemez → 400).
    - Hesap mevcut kullanıcıya ait olmalıdır (IDOR koruması → 404).
    """
    try:
        await unlink_oauth_account(db, account_id, current_user_id)
        await db.commit()
    except ValueError as e:
        await db.rollback()
        error_code = str(e)
        if error_code == "not_found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="OAuth hesabı bulunamadı",
            )
        elif error_code == "last_account":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="En az bir OAuth hesabı bağlı kalmalıdır",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
