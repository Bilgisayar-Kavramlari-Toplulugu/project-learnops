import os
import asyncio

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import settings


def _create_local_engine():
    if settings.DATABASE_URL:
        return create_async_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=20,
        )

    db_host = os.environ.get("DB_HOST", "localhost")
    db_port = os.environ.get("DB_PORT", "5432")
    db_user = os.environ.get("DB_USER", "learnops_user_dev")
    db_password = os.environ.get("DB_PASSWORD", "")
    db_name = os.environ.get("DB_NAME", "learnops_db")

    if not db_password:
        raise RuntimeError(
            "DATABASE_URL or DB_PASSWORD must be set for local development"
        )

    connection_url = (
        f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    )
    return create_async_engine(
        connection_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=20,
    )


def _create_cloud_run_engine():
    from google.cloud.sql.connector import IPTypes, create_async_connector

    connector = None
    connector_lock = asyncio.Lock()

    async def _get_connector():
        nonlocal connector
        if connector is None:
            async with connector_lock:
                if connector is None:
                    connector = await create_async_connector()
        return connector

    async def get_connection():
        active_connector = await _get_connector()

        return await active_connector.connect_async(
            os.environ["INSTANCE_CONNECTION_NAME"],
            "asyncpg",
            user=os.environ["DB_USER"],
            db=os.environ["DB_NAME"],
            enable_iam_auth=True,
            ip_type=IPTypes.PRIVATE,
        )

    return create_async_engine(
        "postgresql+asyncpg://",
        async_creator=get_connection,
        pool_pre_ping=True,
        poolclass=NullPool,
    )


engine = _create_cloud_run_engine() if os.environ.get("K_REVISION") else _create_local_engine()

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
