"""feat(db): create 11 core tables MVP v1.2 compliant schema with UUID PKs (#BE-02)

Revision ID: 001_initial
Revises: 
Create Date: 2026-02-27 10:00:00.000000

Creates initial database schema compliant with LearnOps MVP v1.2 specification.

Schema includes:
- 4 user tables: users, oauth_accounts, deleted_accounts (hard-delete audit log)
- 4 course tables: courses, sections, enrollments, user_progress (section-based progress)
- 5 quiz tables: quizzes, questions, quiz_attempts, quiz_attempt_answers
- All tables use UUID primary keys with gen_random_uuid()
- Proper foreign key constraints with CASCADE delete
- Critical constraint: section_id_str UNIQUE (preserves user progress across file renames)
- OAuth security: NO access_token stored, refresh_token AES-256 encrypted
- Quiz security: correct_index NEVER sent before submit
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ============================================================================
    # 1. USERS TABLE — Base user profile
    # ============================================================================
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('display_name', sa.String(100), nullable=False),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('avatar_type', sa.String(20), nullable=False, server_default=sa.text("'initials'")),
        # avatar_type: 'initials' (default) | 'system_1' ... 'system_10'
        # Frontend generates initials from display_name OR displays /avatars/avatar_{n}.svg
        # NO external URL storage—KVKK data minimization principle
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email', name='uq_users_email'),
    )
    op.create_index('idx_users_email', 'users', ['email'])

    # ============================================================================
    # 2. OAUTH_ACCOUNTS TABLE — OAuth provider linkage (no access_token)
    # ============================================================================
    op.create_table(
        'oauth_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('provider', sa.String(30), nullable=False),
        # provider: 'google' | 'linkedin' | 'github'
        sa.Column('provider_user_id', sa.String(255), nullable=False),
        # provider_user_id: OAuth provider's unique user ID (sub, id, etc.)
        sa.Column('provider_email', sa.String(255), nullable=False),
        # provider_email: Email from OAuth provider (part of public info)
        sa.Column('refresh_token_encrypted', sa.Text(), nullable=True),
        # refresh_token_encrypted: AES-256 encrypted IF provider supplies it
        # Google: supplies (offline_access scope) | LinkedIn: supplies | GitHub: DOES NOT supply
        sa.Column('linked_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        # CRITICAL: No duplicate OAuth linkage per provider
        sa.UniqueConstraint('provider', 'provider_user_id', name='uq_oauth_provider_user'),
        # CRITICAL: Only valid providers allowed
        sa.CheckConstraint("provider IN ('google', 'linkedin', 'github')", name='chk_provider'),
    )
    op.create_index('idx_oauth_user_id', 'oauth_accounts', ['user_id'])
    op.create_index('idx_oauth_provider', 'oauth_accounts', ['provider', 'provider_user_id'])

    # ============================================================================
    # 3. DELETED_ACCOUNTS TABLE — Audit Log (Hard Delete)
    # ============================================================================
    op.create_table(
        'deleted_accounts',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('deletion_reason', sa.String(50), nullable=True, server_default=sa.text("'user_request'")),
        sa.PrimaryKeyConstraint('id'),
    )

    # ============================================================================
    # 4. COURSES TABLE — Course definitions (includes duration for card display)
    # ============================================================================
    op.create_table(
        'courses',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(100), nullable=True),
        # category: 'programlama' | 'web' | 'veri' | etc. (used for filtering on FR-07)
        sa.Column('difficulty', sa.String(20), nullable=True),
        # difficulty: 'beginner' | 'intermediate' | 'advanced' (filtering on FR-07)
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        # duration_minutes: Seeded from meta.json. Displayed on course card (FR-08)
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug', name='uq_courses_slug'),
    )
    op.create_index('idx_courses_slug', 'courses', ['slug'])
    op.create_index('idx_courses_category', 'courses', ['category'])

    # ============================================================================
    # 5. SECTIONS TABLE — Course sections with fixed ID for progress tracking
    # ============================================================================
    op.create_table(
        'sections',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('section_id_str', sa.String(100), nullable=False),
        # section_id_str: Unique identifier from MDX frontmatter (e.g. "python-001-giris")
        # CRITICAL: This ID is PERMANENT. If file renamed, ID never changes.
        # Used by user_progress to link section completion across schema evolution.
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False),
        # order_index: Display order within course (1, 2, 3, ...)
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        # CRITICAL CONSTRAINT: section_id_str must be globally unique
        # Allows linking user_progress even if file moves between courses (should not happen, but safe)
        sa.UniqueConstraint('section_id_str', name='uq_sections_section_id_str'),
        # CRITICAL CONSTRAINT: course_id + order_index uniqueness
        # Prevents duplicate section ordering within a course
        sa.UniqueConstraint('course_id', 'order_index', name='uq_sections_course_order'),
    )
    op.create_index('idx_sections_course', 'sections', ['course_id'])

    # ============================================================================
    # 6. ENROLLMENTS TABLE — User course registrations with progress & completion
    # ============================================================================
    op.create_table(
        'enrollments',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('enrolled_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        # enrolled_at: When user first enrolled (for timeline/history)
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        # completed_at: Set when ALL sections marked completed (no partial completion)
        # Requirement FR-13: Kurs "tamamlandı" = tüm section'lar tamamlandı
        sa.Column('progress_percent', sa.Numeric(5, 2), nullable=False, server_default=sa.text('0.00')),
        # progress_percent: (completed_sections / total_sections) * 100
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        # CRITICAL: One enrollment per user per course
        sa.UniqueConstraint('user_id', 'course_id', name='uq_enrollments_user_course'),
    )

    # ============================================================================
    # 7. USER_PROGRESS TABLE — Per-section completion tracking
    # ============================================================================
    op.create_table(
        'user_progress',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('section_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default=sa.false()),
        # completed: TRUE when user marks section done (dashboard query: count TRUE sections)
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        # completed_at: Timestamp when section was completed
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['section_id'], ['sections.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        # CRITICAL: One progress entry per user per section
        sa.UniqueConstraint('user_id', 'section_id', name='uq_progress_user_section'),
    )
    op.create_index('idx_progress_user_section', 'user_progress', ['user_id', 'section_id'])

    # ============================================================================
    # 8. QUIZZES TABLE — One quiz per course with configurable pass threshold & duration
    # ============================================================================
    op.create_table(
        'quizzes',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pass_threshold', sa.Numeric(3, 2), nullable=False, server_default=sa.text('0.70')),
        # pass_threshold: Decimal 0.00-1.00 (e.g., 0.70 = %70 pass required)
        # Requirement FR-17: %70 geçme notu varsayılan
        sa.Column('duration_seconds', sa.Integer(), nullable=False, server_default=sa.text('1200')),
        # duration_seconds: Quiz time limit in seconds (1200 = 20 minutes default)
        # Requirement FR-15: Backend verifies submitted_at - started_at <= duration_seconds + 30s tolerance
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        # CRITICAL: One quiz per course (1:1 relationship)
        sa.UniqueConstraint('course_id', name='uq_quizzes_course_id'),
    )

    # ============================================================================
    # 9. QUESTIONS TABLE — Quiz questions with correct answer and explanation
    # ============================================================================
    op.create_table(
        'questions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('quiz_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('options', postgresql.JSONB(astext_type=sa.String()), nullable=False),
        # options: JSON array [{"index": 0, "text": "Answer A"}, {"index": 1, "text": "Answer B"}, ...]
        sa.Column('correct_index', sa.Integer(), nullable=False),
        # correct_index: Index of correct answer (0-based). NEVER sent to client before submit.
        # Requirement NF-05: Quiz correct_index client'a gönderilmez (submit öncesi)
        sa.Column('explanation', sa.Text(), nullable=True),
        # explanation: Why this answer is correct. Shown on result review page (FR-18)
        sa.Column('order_index', sa.Integer(), nullable=False),
        # order_index: Sequence within quiz (for randomization or fixed order)
        sa.ForeignKeyConstraint(['quiz_id'], ['quizzes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_questions_quiz', 'questions', ['quiz_id'])

    # ============================================================================
    # 10. QUIZ_ATTEMPTS TABLE — User quiz attempts with timing & scoring
    # ============================================================================
    op.create_table(
        'quiz_attempts',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('quiz_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        # started_at: Quiz start timestamp (used for duration validation)
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        # submitted_at: When user submitted (NULL until submit). Used for time_spent calculation.
        # Security: Backend checks submitted_at - started_at <= duration_seconds + 30s (tolerance)
        sa.Column('score', sa.Integer(), nullable=True),
        # score: Number of correct answers (NULL until submitted)
        sa.Column('total_questions', sa.Integer(), nullable=True),
        # total_questions: Total questions in quiz (for percentage calculation)
        sa.Column('passed', sa.Boolean(), nullable=True),
        # passed: TRUE if (score / total_questions) >= pass_threshold, FALSE otherwise
        sa.Column('time_spent_secs', sa.Integer(), nullable=True),
        # time_spent_secs: submitted_at - started_at in seconds (shown on result card)
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['quiz_id'], ['quizzes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_attempts_user_quiz', 'quiz_attempts', ['user_id', 'quiz_id'])

    # ============================================================================
    # 11. QUIZ_ATTEMPT_ANSWERS TABLE — Individual question answers in an attempt
    # ============================================================================
    op.create_table(
        'quiz_attempt_answers',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('attempt_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('selected_index', sa.Integer(), nullable=True),
        # selected_index: Index of selected answer (0-based), NULL = unanswered (time limit reached)
        # Requirement: Support unanswered questions when time limit expires before answer submission
        sa.Column('is_correct', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.ForeignKeyConstraint(['attempt_id'], ['quiz_attempts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_answers_attempt', 'quiz_attempt_answers', ['attempt_id'])


def downgrade() -> None:
    """Drop all tables in reverse order of creation (bottom-up to respect FK constraints)"""
    op.drop_table('quiz_attempt_answers')
    op.drop_table('quiz_attempts')
    op.drop_table('questions')
    op.drop_table('quizzes')
    op.drop_table('user_progress')
    op.drop_table('enrollments')
    op.drop_table('sections')
    op.drop_table('courses')
    op.drop_table('deleted_accounts')
    op.drop_table('oauth_accounts')
    op.drop_table('users')
