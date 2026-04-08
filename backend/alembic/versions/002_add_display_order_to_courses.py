"""feat(db): add display_order column to courses table (#BE-13)

Revision ID: 002_add_display_order
Revises: 001_initial
Create Date: 2026-04-08 12:00:00.000000

Adds display_order INTEGER NULL column to courses table.
Used by seed_content.py to write meta.json recommended_order.
Course List API (BE-14) orders by display_order ASC NULLS LAST.
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "002_add_display_order"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("courses", sa.Column("display_order", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("courses", "display_order")
