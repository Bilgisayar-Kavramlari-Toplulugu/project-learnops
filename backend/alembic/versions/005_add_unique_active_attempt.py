"""fix(db): add unique partial index to prevent concurrent active attempts

Revision ID: 005_add_unique_active_attempt
Revises: 004_fix_quiz_timestamps
Create Date: 2026-04-18 00:00:00.000000

Bulgu #1 (Race Condition) düzeltmesi:
SELECT → INSERT arasındaki zaman diliminde iki eş zamanlı istek
aynı kullanıcı için iki aktif attempt oluşturabiliyordu.
DB seviyesinde partial unique index ile bu açık kapatılır.
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "005_add_unique_active_attempt"
down_revision = "004_fix_quiz_timestamps"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # submitted_at IS NULL olan satırlar için (user_id, quiz_id) benzersizliği.
    # Bir kullanıcının aynı quiz'de yalnızca bir aktif attempt'i olabilir.
    op.create_index(
        "uq_active_attempt",
        "quiz_attempts",
        ["user_id", "quiz_id"],
        unique=True,
        postgresql_where=sa.text("submitted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_active_attempt", table_name="quiz_attempts")
