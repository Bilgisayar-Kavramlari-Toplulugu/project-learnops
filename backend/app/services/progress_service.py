from datetime import datetime
from logging import getLogger
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.courses import Section, Enrollment, UserProgress

logger = getLogger(__name__)


async def mark_section_complete(
        db: AsyncSession,
        user_id: UUID,
        section_id_str: str
):
    """
    Bir bölümü tamamlanmış olarak işaretleyin ve ders ilerlemesini güncelleyin.

    **ATOMICITY:**
    - Tüm DB işlemleri tek transaction'da yapılır
    - Hata gelirse tüm değişiklikler geri alınır (rollback)
    - Kurs tamamlama durumu her zaman tutarlı kalır
    
    **IDEMPOTENCY:**
    - Aynı bölümü 2 kez tıklamak güvenlidir
    - İkinci çağrıda hiç işlem yapılmaz (already completed)
    - Frontend'teki double-click sorunları başarısız olmaz
    
    **DRY (Don't Repeat Yourself):**
    - Tamamlanan/toplam section'ları 1 aggregation query ile hesapla
    - 2 ayrı query yerine: SELECT COUNT(*) + SELECT COUNT(WHERE completed=true)
    - Daha hızlı, daha az DB bağlantı, daha güvenli

    İlerleme Formülü: (tamamlanan_bölümler / toplam_bölümler) * 100
    Tamamlama: Tüm bölümler tamamlandığında course.completed_at değerini ayarlar.
    """
    try:
        # Section ve Course bilgisini al
        section_stmt = select(Section).where(Section.section_id_str == section_id_str)
        section = (await db.execute(section_stmt)).scalar_one_or_none()
        
        if not section:
            logger.warning(f"Section not found: {section_id_str}")
            raise HTTPException(status_code=404, detail="Section bulunamadı")
        
        course_id = section.course_id

        # User bu kursa kayıtlı mı?
        enrollment_stmt = select(Enrollment).where(
            and_(
                Enrollment.user_id == user_id,
                Enrollment.course_id == course_id
            )
        )
        enrollment = (await db.execute(enrollment_stmt)).scalar_one_or_none()
        
        if not enrollment:
            logger.warning(f"User {user_id} not enrolled in course {course_id}")
            raise HTTPException(
                status_code=400, 
                detail="Kullanıcı bu kursa kayıtlı değil"
            )

        # UserProgress upsert: Yoksa yeni oluştur, varsa ve tamamlanmamışsa güncelle
        # 
        # IDEMPOTENCY DESIGN:
        # 1. İlk çağrı: UserProgress oluştur, completed=True set et
        # 2. İkinci çağrı: completed zaten True → hiç işlem yapılmıyor (safe)
        # 3. Sonuç: 100 kez çalıştır = 1 kez çalıştır (yan etki yok)
        #
        # ATOMICITY DESIGN:
        # Bu bölüm transaction içinde yapılıyor
        # Hata gelirse tüm değişiklikler rollback olur
        #
        progress_stmt = select(UserProgress).where(
            and_(
                UserProgress.user_id == user_id,
                UserProgress.section_id == section.id
            )
        )
        user_progress = (await db.execute(progress_stmt)).scalar_one_or_none()

        if not user_progress:
            # Henüz tamamlanma kaydı yok → yeni kayıt oluştur
            user_progress = UserProgress(
                user_id=user_id,
                section_id=section.id,
                completed=True,
                completed_at=datetime.utcnow()
            )
            db.add(user_progress)
            logger.info(f"New progress entry: user={user_id}, section={section_id_str}")
        
        elif not user_progress.completed:
            # Kayıt var ama tamamlanmamış → güncelle (eski bir session'dan kaldı olabilir)
            user_progress.completed = True
            user_progress.completed_at = datetime.utcnow()
            logger.info(f"Progress updated: user={user_id}, section={section_id_str}")

        # DRY PRINCIPLE: Tek query ile hesapla (N+1 problem çözüldü)
        # 
        # ❌ ESKI YÖNTEM (tekrarlanmalı):
        #    1. SELECT COUNT(*) FROM sections WHERE course_id=X
        #    2. SELECT COUNT(*) FROM user_progress WHERE user_id=Y AND completed=true
        #    → 2 query, daha yavaş, tekrarlı logic
        #
        # ✅ YENİ YÖNTEM (DRY):
        #    1 aggregation query ile tamamlanan ve toplam section sayısını al
        #    → 1 query, daha hızlı, daha az DB bağlantı
        #

        # Tek query ile tamamlanan/toplam section'ları hesapla
        # 1 aggregation query
        progress_query = select(
            func.count(Section.id).label("total"),
            func.sum(
                case(
                    (UserProgress.completed == True, 1),
                    else_=0
                )
            ).label("completed")
        ).select_from(Section).join(
            UserProgress,
            and_(
                UserProgress.section_id == Section.id,
                UserProgress.user_id == user_id
            ),
            isouter=True
        ).where(Section.course_id == course_id)

        result = (await db.execute(progress_query)).one()
        total_sections = result.total or 0
        completed_sections = result.completed or 0

        if total_sections == 0:
            logger.error(f"Course {course_id} has no sections")
            raise HTTPException(status_code=500, detail="Kurs section'ları bulunamadı")

        # Yüzde hesapla (2 decimal places)
        new_progress = round((completed_sections / total_sections) * 100, 2)
        enrollment.progress_percent = new_progress

        # Tüm section'lar tamamlandı mı? (Integer comparison → float precision yok)
        if completed_sections == total_sections and not enrollment.completed_at:
            enrollment.completed_at = datetime.utcnow()
            logger.info(f"Course completed: user={user_id}, course={course_id}, progress=100%")

        # Commit (ATOMICITY: Tüm işlemler başarılı olmuştur)
        # Eğer buraya kadar geldiysek, hiç hata yok
        # Tüm değişiklikler atomik olarak database'e yazılır
        # Eğer hata olursa except bloğu devreye girer ve rollback yapılır
        await db.commit()
        await db.refresh(enrollment)

        logger.info(
            f"Section complete: user={user_id}, section={section_id_str}, "
            f"progress={new_progress}%, course_done={enrollment.completed_at is not None}"
        )

        return {
            "course_id": enrollment.course_id,
            "section_id_str": section_id_str,
            "progress_percent": new_progress,
            "completed": user_progress.completed,
            "course_completed_at": enrollment.completed_at
        }

    except HTTPException:
        # Re-raise HTTP exceptions (404, 400, 500)
        # Bu customized hata mesajları frontend'e ulaşabilir
        raise
    except Exception as e:
        # ATOMICITY GUARANTEE: Herhangi bir hata gelirse rollback et
        # Database'in tutarlı durumda kalmasını garantile
        logger.error(f"Error marking section complete: {e}", exc_info=True)
        await db.rollback()  # Tüm değişiklikleri geri al
        raise HTTPException(
            status_code=500,
            detail="Bölüm tamamlanması sırasında hata oluştu"
        )