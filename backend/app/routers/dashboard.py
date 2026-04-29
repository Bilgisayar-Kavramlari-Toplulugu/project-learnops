from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user_id
from app.schemas.dashboard import DashboardSummarySchema
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummarySchema)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Kimliği doğrulanmış kullanıcı için dashboard özetini alır.
    """
    # Testlerin patlamaması ve MyPy'ın geçmesi için str -> UUID dönüşümü şarttır
    return await DashboardService.get_summary(db, UUID(current_user_id))
