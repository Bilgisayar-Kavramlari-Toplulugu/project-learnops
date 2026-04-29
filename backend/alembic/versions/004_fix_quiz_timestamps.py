"""fix(db): add missing updated_at to quizzes and created_at/updated_at to questions

Revision ID: 004_fix_quiz_timestamps
Revises: 003_add_is_active_to_questions
Create Date: 2026-04-17 00:00:00.000000

- quizzes tablosunda updated_at kolonu eksikti (BaseModel'den geliyor).
- questions tablosunda created_at ve updated_at kolonları eksikti.
  Mevcut satırlar için now() değeri atanır.
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "004_fix_quiz_timestamps"
down_revision = "003_add_is_active_to_questions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # quizzes: updated_at eksik
    op.add_column(
        "quizzes",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # questions: created_at ve updated_at eksik
    op.add_column(
        "questions",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.add_column(
        "questions",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("questions", "updated_at")
    op.drop_column("questions", "created_at")
    op.drop_column("quizzes", "updated_at")
