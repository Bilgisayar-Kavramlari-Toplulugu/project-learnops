from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.schemas.dashboard import DashboardSummarySchema
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummarySchema)
def get_dashboard_summary(
    db: Session = Depends(get_db), current_user: str = Depends(get_current_user)
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
    return DashboardService.get_summary(db, current_user)
