from logging.config import fileConfig
import os
import sys
from pathlib import Path

# Add the app module to sys.path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Import models for autogenerate support
from app.models.base import Base
from app.models.users import User, OAuthAccount, DeletedAccount
from app.models.courses import Course, Section, Enrollment, UserProgress
from app.models.quizzes import Quiz, Question, QuizAttempt, QuizAttemptAnswer

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = os.getenv("DATABASE_URL", config.get_main_option("sqlalchemy.url"))
    
    # Replace asyncpg with psycopg for migration (synchronous driver)
    if url and "postgresql+asyncpg" in url:
        url = url.replace("postgresql+asyncpg", "postgresql+psycopg2", 1)
    
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Get database URL from environment or config
    db_url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
    
    # Replace asyncpg with psycopg for migration (synchronous driver)
    if db_url and "postgresql+asyncpg" in db_url:
        db_url = db_url.replace("postgresql+asyncpg", "postgresql+psycopg2", 1)
    
    configuration = {"sqlalchemy.url": db_url}
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
