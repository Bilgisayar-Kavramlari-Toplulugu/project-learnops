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

    Returns:
        DashboardSummarySchema: Tamamlanan kurslar, devam eden kurslar
        ile sonraki bölüm ve son quiz dahil özet veriler.

    Gereksinimler:
        - BE-22: Dashboard Summary API
        - Performans: p95 < 500ms
        - Önbellek yok: Her istekte taze veri
    """
    return await DashboardService.get_summary(db, current_user_id)
