"""feat(db): add content column to sections table

Revision ID: 008_add_section_content
Revises: 007_rm_duration_default
Create Date: 2026-05-01 00:00:00.000000

- Adds content TEXT NULL column to sections table.
  Stores raw MDX body (after frontmatter) seeded from content/ directory.
  Allows frontend to fetch section content from the API without needing
  the content/ directory mounted or baked into the image.
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "008_add_section_content"
down_revision = "007_rm_duration_default"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use raw SQL for idempotency — consistent with migrations 002-006 pattern.
    op.execute("ALTER TABLE sections ADD COLUMN IF NOT EXISTS content TEXT")


def downgrade() -> None:
    op.drop_column("sections", "content")
