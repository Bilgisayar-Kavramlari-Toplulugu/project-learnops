import logging
import random
from datetime import datetime, timezone
from decimal import Decimal
from typing import Sequence
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.exceptions.access_denied import AccessDeniedError
from app.exceptions.not_found import EntityNotFoundError
from app.exceptions.validation import ValidationError
from app.models.courses import Enrollment
from app.models.quizzes import Question, Quiz, QuizAttempt, QuizAttemptAnswer
from app.schemas.quizzes import SubmitAnswerItem

logger = logging.getLogger(__name__)


async def create_quiz_attempt(
    db: AsyncSession,
    quiz_id: UUID,
    user_id: UUID,
) -> tuple[QuizAttempt, list[Question], Quiz]:
    """
    Kullanıcı için yeni bir quiz denemesi oluşturur.
    Soruları rastgele sıralar.
    """
    # 1. Quiz'i sorularıyla birlikte getir
    query = select(Quiz).options(selectinload(Quiz.questions)).where(Quiz.id == quiz_id)
    quiz = await db.scalar(query)

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz bulunamadı"
        )

    # 1.1. Enrollment kontrolü
    enrollment_check = await db.scalar(
        select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_id == quiz.course_id,
        )
    )
    if not enrollment_check:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu quiz için kursa kayıtlı değilsiniz",
        )

    # 1.2. Eş zamanlı açık attempt kontrolü (fast-fail; DB index de korur)
    existing = await db.scalar(
        select(QuizAttempt).where(
            QuizAttempt.user_id == user_id,
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.submitted_at.is_(None),
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Zaten aktif bir attempt mevcut",
        )

    # 2. Sadece aktif soruları al — attempt oluşturmadan önce (Bulgu #2, #3)
    active_questions = [q for q in quiz.questions if q.is_active]

    if not active_questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu quizde aktif soru bulunmuyor",
        )

    # 3. Yeni bir Attempt oluştur — total_questions snapshot olarak kaydedilir
    started_at = datetime.now(timezone.utc)
    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz_id,
        started_at=started_at,
        total_questions=len(active_questions),
    )
    db.add(attempt)

    try:
        await db.flush()  # attempt.id oluşması + unique index kontrolü için
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Zaten aktif bir attempt mevcut",
        )

    # 4. Soruları rastgele sırala — thread-safe Random instance ile
    rng = random.Random()
    rng.shuffle(active_questions)

    logger.info(
        "Quiz attempt oluşturuldu: user_id=%s quiz_id=%s attempt_id=%s questions=%d",
        user_id,
        quiz_id,
        attempt.id,
        len(active_questions),
    )

    return attempt, active_questions, quiz


async def submit_quiz_attempt(
    db: AsyncSession,
    attempt_id: UUID,
    user_id: UUID,
    submitted_answers: list[SubmitAnswerItem],
) -> dict:
    """
    Quiz denemesini değerlendirir ve sonuçları kaydeder.

    İş kuralları:
    - FR-15: submitted_at - started_at > duration_seconds + 30 → 422
    - FR-16: Cevapsız sorular (selected_index=None) yanlış sayılır
    - NF-05: correct_index YALNIZCA bu response'ta açılır

    NOT: Submit sırasında enrollment kontrolü kasten yapılmamaktadır.
    Kullanıcı attempt'i başlatırken kursa kayıtlıydı (create_quiz_attempt doğrular);
    başlatılmış bir denemenin yarıda kalmasını önlemek için kullanıcı sonradan
    kurstan çıkarılsa bile aktif attempt'ini tamamlayabilmelidir.
    """
    # 1. Attempt'i quiz ile birlikte getir; row-level lock ile concurrent submit'i kapat
    query = (
        select(QuizAttempt)
        .options(selectinload(QuizAttempt.quiz))
        .where(QuizAttempt.id == attempt_id)
        .with_for_update()
    )
    attempt = await db.scalar(query)

    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attempt bulunamadı"
        )

    # 2. Sahiplik kontrolü — 404 dönerek attempt varlığını sızdırmıyoruz
    if attempt.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt bulunamadı",
        )

    # 3. Zaten submit edilmiş mi?
    if attempt.submitted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu attempt zaten tamamlandı",
        )

    # 4. Süre kontrolü (FR-15): submitted_at - started_at > duration_seconds + 30 → ret
    now = datetime.now(timezone.utc)
    time_elapsed = (now - attempt.started_at).total_seconds()
    if time_elapsed > attempt.quiz.duration_seconds + 30:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Süre aşıldı. Submission reddedildi.",
        )

    # 5. Aktif soruları getir — yalnızca attempt başlamadan önce oluşturulmuş
    # sorular dahil edilir. Question.created_at <= attempt.started_at filtresi
    # sayesinde sonradan eklenen sorular doğal olarak dışarıda kalır.
    questions_result = await db.execute(
        select(Question)
        .where(
            Question.quiz_id == attempt.quiz_id,
            Question.is_active.is_(True),
            Question.created_at <= attempt.started_at,
        )
        .order_by(Question.order_index)
    )
    questions = list(questions_result.scalars().all())

    # NOTE — Deaktivasyon politikası (bilinçli tasarım kararı):
    # Attempt başladıktan sonra deaktive edilen sorular is_active filtresiyle dışarıda
    # kalır ve skor paydası düşer (örn. 4 sorudan 1'i deaktive edilirse skor X/3 olur).
    # Bu davranış bilinçlidir: hatalı bir soru kaldırıldığında kullanıcıyı korumak için
    # paydayı güncel aktif soru sayısına göre hesaplarız.

    # 6. İstemci girdisi doğrulaması
    # a. Duplicate question_id kontrolü
    submitted_qids = [str(a.question_id) for a in submitted_answers]
    if len(submitted_qids) != len(set(submitted_qids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aynı soru için birden fazla cevap gönderildi",
        )

    # b. Geçerli soru haritası (quiz'e ait aktif sorular)
    question_map: dict[str, Question] = {str(q.id): q for q in questions}

    for answer in submitted_answers:
        qid = str(answer.question_id)
        # c. Pasifleştirilen veya bu quize ait olmayan sorular sessizce atlanır.
        # Submit anında pasifleştirilmişse hata fırlatmak yerine cevabı görmezden
        # geliriz — skor paydası zaten düşmüş olur. Tamamen yabancı bir
        # question_id ise questions döngüsünde işlenmez; skora etkisi olmaz.
        if qid not in question_map:
            continue
        # d. selected_index sınır kontrolü
        if answer.selected_index is not None:
            q = question_map[qid]
            if answer.selected_index < 0 or answer.selected_index >= len(q.options):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Geçersiz seçenek",
                )

    # 7. Cevap haritası: question_id → selected_index
    answer_map: dict[str, int | None] = {
        str(a.question_id): a.selected_index for a in submitted_answers
    }

    # 8. Her soru için değerlendirme yap ve QuizAttemptAnswer kayıtları oluştur
    answer_records: list[QuizAttemptAnswer] = []
    answer_results: list[dict] = []
    correct_count = 0

    for question in questions:
        selected_index = answer_map.get(str(question.id))  # None → cevapsız
        is_correct = (
            selected_index is not None and selected_index == question.correct_index
        )
        if is_correct:
            correct_count += 1

        answer_records.append(
            QuizAttemptAnswer(
                attempt_id=attempt.id,
                question_id=question.id,
                selected_index=selected_index,
                is_correct=is_correct,
            )
        )
        answer_results.append(
            {
                "question_id": question.id,
                "selected_index": selected_index,
                "correct_index": question.correct_index,  # NF-05: submit sonrası açılır
                "is_correct": is_correct,
                "explanation": question.explanation,
            }
        )

    db.add_all(answer_records)

    # 9. Skor ve geçme durumu hesapla
    # actual_total: fiilen değerlendirilen soru sayısı.
    # Deaktivasyon durumunda snapshot_total > actual_total olabilir; bu durumda
    # actual_total'ı esas alarak hem DB hem de response tutarlı kalır.
    # Yeni eklenen sorular ise 5.1'deki kırpma ile zaten dışarıda bırakıldı.
    actual_total = len(answer_results)

    time_spent_secs = int((now - attempt.started_at).total_seconds())
    passed = (
        Decimal(correct_count) / Decimal(actual_total)
        >= Decimal(str(attempt.quiz.pass_threshold))
        if actual_total > 0
        else False
    )

    # 10. Attempt'i güncelle.
    # total_questions: fiili değerlendirme sayısı DB'ye yazılır;
    # response ile tutarlı olur.
    attempt.submitted_at = now
    attempt.score = correct_count
    attempt.total_questions = actual_total
    attempt.passed = passed
    attempt.time_spent_secs = time_spent_secs

    logger.info(
        "Quiz attempt tamamlandı: user_id=%s attempt_id=%s score=%d/%d passed=%s",
        user_id,
        attempt_id,
        correct_count,
        actual_total,
        passed,
    )

    return {
        "attempt_id": attempt.id,
        "score": correct_count,
        "total_questions": actual_total,
        "passed": passed,
        "time_spent_secs": time_spent_secs,
        "answers": answer_results,
    }


async def get_quiz_attempt_by_id(
    db: AsyncSession, attempt_id: UUID, user_id: UUID
) -> QuizAttempt:
    """Gets a detailed quiz attempt."""
    stmt = (
        select(QuizAttempt)
        .options(
            selectinload(QuizAttempt.answers).selectinload(QuizAttemptAnswer.question)
        )
        .where(QuizAttempt.id == attempt_id)
    )
    result = await db.execute(stmt)
    attempt = result.scalar_one_or_none()

    if not attempt:
        raise EntityNotFoundError("Quiz attempt not found")

    if attempt.user_id != user_id:
        raise AccessDeniedError("You do not have access to this quiz attempt")

    if attempt.submitted_at is None:
        raise ValidationError("Quiz attempt is not completed yet")

    return attempt


async def get_quiz_attempts_by_quiz_id(
    db: AsyncSession, quiz_id: UUID, user_id: UUID, limit: int = 20
) -> Sequence[QuizAttempt]:
    """Gets all completed quiz attempts for a user on a specific quiz."""
    # TODO: Add cursor-based pagination when attempt counts grow significantly
    stmt = (
        select(QuizAttempt)
        .where(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.user_id == user_id,
            QuizAttempt.submitted_at.is_not(None),
        )
        .order_by(QuizAttempt.started_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
