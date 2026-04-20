import asyncio
import uuid
import os
import sys
import json

# Add backend directory to sys.path to import app modules
sys.path.append(os.getcwd())

from datetime import datetime, timezone, timedelta
from sqlalchemy import text
from app.database import engine

async def seed_full_manual_data():
    async with engine.begin() as conn:
        print("Tam kapsamlı test datası oluşturuluyor...")
        
        user_id = "cad9537b-ec42-48ab-a0c9-b44cc3ec411d"
        course_id = str(uuid.uuid4())
        quiz_id = str(uuid.uuid4())
        question_id = str(uuid.uuid4())
        attempt_id = str(uuid.uuid4())
        answer_id = str(uuid.uuid4())
        
        # 1. Kurs
        await conn.execute(text(
            "INSERT INTO courses (id, slug, title, is_published) VALUES (:id, :slug, :title, true)"
        ), {"id": course_id, "slug": f"full-course-{uuid.uuid4().hex[:4]}", "title": "Gelişmiş Test Kursu"})

        # 2. Quiz
        await conn.execute(text(
            "INSERT INTO quizzes (id, course_id, pass_threshold, duration_seconds) VALUES (:id, :c_id, 0.70, 1200)"
        ), {"id": quiz_id, "c_id": course_id})
        
        # 3. Question
        options = [{"index": 0, "text": "Python"}, {"index": 1, "text": "Java"}]
        await conn.execute(text(
            "INSERT INTO questions (id, quiz_id, text, options, correct_index, order_index) VALUES (:id, :q_id, :text, :opts, :correct, :order)"
        ), {
            "id": question_id, "q_id": quiz_id, "text": "Hangi dil daha popüler?", 
            "opts": json.dumps(options), "correct": 0, "order": 1
        })

        # 4. Attempt
        started = datetime.now(timezone.utc) - timedelta(minutes=5)
        submitted = datetime.now(timezone.utc)
        await conn.execute(text(
            """INSERT INTO quiz_attempts 
               (id, user_id, quiz_id, started_at, submitted_at, score, total_questions, passed, time_spent_secs) 
               VALUES (:id, :u_id, :q_id, :s_at, :sub_at, 1, 1, true, 300)"""
        ), {
            "id": attempt_id, "u_id": user_id, "q_id": quiz_id, 
            "s_at": started, "sub_at": submitted
        })
        
        # 5. Answer
        await conn.execute(text(
            "INSERT INTO quiz_attempt_answers (id, attempt_id, question_id, selected_index, is_correct) VALUES (:id, :a_id, :q_id, 0, true)"
        ), {"id": answer_id, "a_id": attempt_id, "q_id": question_id})

        print(f"\n--- TAM KAPSAMLI VERİ OLUŞTURULDU ---")
        print(f"YENİ Attempt ID: {attempt_id}")
        print(f"YENİ Quiz ID: {quiz_id}")
        print(f"Lütfen Swagger'da bu ID'yi (f054 olanı değil, bunu) deneyin.")

if __name__ == "__main__":
    asyncio.run(seed_full_manual_data())
