from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User
from app.schemas.progress import SectionProgressResponse
from app.services import progress_service

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.post(
    "/sections/{section_id_str}/complete",
    response_model=SectionProgressResponse,
    status_code=status.HTTP_200_OK,
)
async def complete_section(
    section_id_str: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await progress_service.mark_section_complete(
        db=db, user_id=current_user.id, section_id_str=section_id_str
    )
