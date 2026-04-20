import asyncio
import uuid
import os
import sys

# Add backend directory to sys.path to import app modules
sys.path.append(os.getcwd())

from app.database import engine
from app.services import quiz_service
from app.schemas.quizzes import QuizAttemptDetail
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

# Known IDs from previous seed
ATTEMPT_ID = uuid.UUID("113c8df9-94c6-4309-a4b6-27409b69b39b")
USER_ID = uuid.UUID("cad9537b-ec42-48ab-a0c9-b44cc3ec411d")

async def test_debug():
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with AsyncSessionLocal() as db:
        print(f"Debugger: Fetching attempt {ATTEMPT_ID} for user {USER_ID}...")
        try:
            attempt = await quiz_service.get_quiz_attempt_by_id(db, ATTEMPT_ID, USER_ID)
            print("Debugger: DB fetch success. Attempting Pydantic validation...")
            
            # This is where 500 (validation error) usually happens
            data = QuizAttemptDetail.model_validate(attempt)
            print("Debugger: SUCCESS! Data is valid according to schema.")
            # print(data.model_dump_json(indent=2))
        except Exception as e:
            print("\n!!! DEBUGGER CAUGHT ERROR !!!")
            print(f"Error Type: {type(e).__name__}")
            print(f"Error Message: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_debug())
