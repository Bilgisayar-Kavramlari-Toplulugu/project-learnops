"""feat(db): remove server_default from quizzes.duration_seconds (#BE-21)

Revision ID: 007_rm_duration_default
Revises: 006_add_uq_attempt_question
Create Date: 2026-04-27 00:00:00.000000

Değişiklik:
- quizzes.duration_seconds kolonundan server_default=1200 kaldırılır.
  Değer artık seed_quiz.py tarafından quiz.json'dan açıkça yazılır;
  DB varsayılanına düşülmez.
  (beginner: 1500s, intermediate: 2000s, advanced: 2500s)

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
    # server_default=1200 kaldır — ALTER TABLE quizzes ALTER COLUMN duration_seconds DROP DEFAULT
    op.alter_column(
        "quizzes",
        "duration_seconds",
        existing_type=sa.Integer(),
        existing_nullable=False,
        server_default=None,  # DROP DEFAULT
    )


def downgrade() -> None:
    # Geri alınırsa server_default=1200'ü yeniden ekle.
    op.alter_column(
        "quizzes",
        "duration_seconds",
        existing_type=sa.Integer(),
        existing_nullable=False,
        server_default=sa.text("1200"),
    )
