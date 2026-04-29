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
    # Use IF NOT EXISTS so this migration is safe to run even when a previous
    # job execution committed the DDL but crashed before writing alembic_version.
    op.execute("ALTER TABLE courses ADD COLUMN IF NOT EXISTS display_order INTEGER")
    op.execute(
        "ALTER TABLE courses ADD COLUMN IF NOT EXISTS "
        "updated_at TIMESTAMPTZ NOT NULL DEFAULT now()"
    )
    op.execute(
        "ALTER TABLE sections ADD COLUMN IF NOT EXISTS "
        "updated_at TIMESTAMPTZ NOT NULL DEFAULT now()"
    )


def downgrade() -> None:
    op.drop_column("sections", "updated_at")
    op.drop_column("courses", "updated_at")
    op.drop_column("courses", "display_order")
