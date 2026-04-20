"""add_timestamps_to_quiz_and_question

Revision ID: 4d69efbfe45b
Revises: 003_add_is_active_to_questions
Create Date: 2026-04-20 15:15:16.323350

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "004_add_timestamps_to_quiz_and_question"
down_revision: Union[str, Sequence[str], None] = "003_add_is_active_to_questions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "questions",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.add_column(
        "questions",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.add_column(
        "quizzes",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column("quizzes", "updated_at")
    op.drop_column("questions", "updated_at")
    op.drop_column("questions", "created_at")
