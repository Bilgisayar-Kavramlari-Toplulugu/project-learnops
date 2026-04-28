"""feat(db): remove server_default from quizzes.duration_seconds (#BE-21)

Revision ID: 007_rm_duration_default
Revises: 006_add_uq_attempt_question
Create Date: 2026-04-27 00:00:00.000000

Değişiklik:
- quizzes.duration_seconds kolonundan server_default=1200 kaldırılır.
  Değer artık seed_quiz.py tarafından quiz.json'dan açıkça yazılır;
  DB varsayılanına düşülmez.
  (beginner: 1500s, intermediate: 2000s, advanced: 2500s)

Not — questions.is_active:
  Bu kolonun migration'ı bu dosyada değil, 003_add_is_active_to_questions.py
  (develop) içindedir. quizzes.py modelindeki server_default=sql_text('true')
  değişikliği yalnızca ORM tutarlılığı için yapılmıştır; şema değişikliği
  gerektirmez (kolon DB'de zaten mevcuttur).

Downgrade:
- server_default=1200 geri eklenir.
  Mevcut satırlarda değer zaten açıkça yazılı olduğundan veri kaybı olmaz.
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "007_rm_duration_default"
down_revision = "006_add_uq_attempt_question"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Üretilen DDL (poetry run alembic upgrade 007_rm_duration_default --sql):
    #   ALTER TABLE quizzes ALTER COLUMN duration_seconds DROP DEFAULT;
    # server_default=None → DROP DEFAULT (sentinel False = "değiştirme" anlamı taşır)
    op.alter_column(
        "quizzes",
        "duration_seconds",
        existing_type=sa.Integer(),
        existing_nullable=False,
        existing_server_default=sa.text("1200"),  # mevcut durumu beyan et
        server_default=None,  # None = DROP DEFAULT
    )


def downgrade() -> None:
    # upgrade() sonrası duration_seconds'ta server_default yoktur;
    # existing_server_default=None bu durumu beyan eder.
    op.alter_column(
        "quizzes",
        "duration_seconds",
        existing_type=sa.Integer(),
        existing_nullable=False,
        existing_server_default=None,  # upgrade() sonrası durum
        server_default=sa.text("1200"),  # geri ekle
    )
