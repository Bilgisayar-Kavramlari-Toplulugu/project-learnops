"""feat(db): add display_order and missing updated_at columns (#BE-13)

Revision ID: 002_add_display_order
Revises: 001_initial
Create Date: 2026-04-08 12:00:00.000000

- Adds display_order INTEGER NULL column to courses table.
  Used by seed_content.py to write meta.json recommended_order.
  Course List API (BE-14) orders by display_order ASC NULLS LAST.
- Adds updated_at TIMESTAMPTZ column to courses and sections tables.
  BaseModel defines updated_at but 001_initial omitted it for these tables.
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
    op.add_column(
        "courses",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.add_column(
        "sections",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("sections", "updated_at")
    op.drop_column("courses", "updated_at")
    op.drop_column("courses", "display_order")
