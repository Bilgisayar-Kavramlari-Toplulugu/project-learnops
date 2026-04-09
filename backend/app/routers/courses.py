from fastapi import APIRouter

router = APIRouter()


@router.get("/courses")
async def list_courses():
    """
    Public test endpoint.
    Statik course listesi döner.
    """
    return {
        "courses": [
            {
                "slug": "python-baslangic",
                "title": "Python Başlangıç",
                "description": "Python diline giriş, temel sözdizimi ve ilk uygulamalar.",
                "category": "programlama",
                "difficulty": "beginner",
                "duration_minutes": 120,
                "is_published": True,
            },
            {
                "slug": "fastapi-ile-web-api",
                "title": "FastAPI ile Web API Geliştirme",
                "description": "FastAPI kullanarak modern ve hızlı REST API'ler geliştirin.",
                "category": "web",
                "difficulty": "intermediate",
                "duration_minutes": 180,
                "is_published": True,
            },
            {
                "slug": "sqlalchemy-async",
                "title": "SQLAlchemy Async Kullanımı",
                "description": "AsyncSession, modeller ve ilişkiler ile veritabanı işlemleri.",
                "category": "backend",
                "difficulty": "intermediate",
                "duration_minutes": 150,
                "is_published": True,
            },
            {
                "slug": "ileri-seviye-python",
                "title": "İleri Seviye Python",
                "description": "Decorator, generator, context manager ve ileri Python konuları.",
                "category": "programlama",
                "difficulty": "advanced",
                "duration_minutes": 200,
                "is_published": True,
            },
        ]
    }