from fastapi import FastAPI

app = FastAPI(title="LearnOps API")

@app.get("/")
async def root():
    return {"message": "LearnOps API is running"}