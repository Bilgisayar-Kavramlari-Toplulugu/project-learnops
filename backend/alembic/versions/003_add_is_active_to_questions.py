"""feat(db): add is_active column to questions table

Revision ID: 003_add_is_active_to_questions
Revises: 002_add_display_order
Create Date: 2026-04-10 00:00:00.000000

- Adds is_active BOOLEAN NOT NULL DEFAULT TRUE column to questions table.
  Per master plan K-2 rule: faulty questions are set to is_active=false
  and a replacement question is added. Quiz start endpoint should filter
  by is_active=true.
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "003_add_is_active_to_questions"
down_revision = "002_add_display_order"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "questions",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
    )


def downgrade() -> None:
    op.drop_column("questions", "is_active")
