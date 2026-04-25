"""fix(db): add unique constraint uq_attempt_question on quiz_attempt_answers

Revision ID: 006_add_uq_attempt_question
Revises: 005_add_unique_active_attempt
Create Date: 2026-04-21 00:00:00.000000

Code Review #1 (Critical) düzeltmesi:
`QuizAttemptAnswer` modeline `UniqueConstraint("attempt_id", "question_id",
name="uq_attempt_question")` eklenmiş ancak karşılık gelen migration eksikti.
Mevcut DB'lerde bu constraint hiç oluşmuyordu. `db.add_all(answer_records)`
herhangi bir nedenle aynı soruya iki kez yazarsa DB sessizce kabul ederdi.
Bu migration, son güvenlik ağı olan DB seviyesindeki tekilliği tesis eder.
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "006_add_uq_attempt_question"
down_revision = "005_add_unique_active_attempt"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_unique_constraint(
        "uq_attempt_question",
        "quiz_attempt_answers",
        ["attempt_id", "question_id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_attempt_question",
        "quiz_attempt_answers",
        type_="unique",
    )
