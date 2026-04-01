import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

# Add the app module to sys.path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# Import models for autogenerate support
from app.models.base import Base

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

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode with async support.

    In this scenario we need to create an async Engine
    and associate a connection with the context.

    """
    # Get database URL from environment or config
    db_url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")

    config_section = config.get_section(config.config_ini_section)
    config_section["sqlalchemy.url"] = db_url

    # When called from main.py lifespan (run_sync), there is already a
    # running event loop.  If the connection was injected by run_sync we
    # can run migrations synchronously; otherwise fall back to asyncio.run.
    connectable = config.attributes.get("connection", None)
    if connectable is not None:
        # Called from main.py lifespan via conn.run_sync — run synchronously
        context.configure(connection=connectable, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
        return

    connectable = create_async_engine(
        db_url,
        poolclass=pool.NullPool,
    )

    asyncio.run(run_async_migrations(connectable))


async def run_async_migrations(connectable):
    async with connectable.begin() as connection:
        await connection.run_sync(
            lambda conn: context.configure(
                connection=conn,
                target_metadata=target_metadata,
            )
        )
        await connection.run_sync(lambda conn: context.run_migrations())

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
