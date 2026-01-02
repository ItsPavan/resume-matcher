from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services import parser, llm_agent
import uvicorn
import os

app = FastAPI(title="Resume-JD Matcher API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Resume Matcher API is running"}

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        # 1. Parse Resume
        resume_text = await parser.extract_text(resume)
        
        # 2. Analyze with LLM
        analysis = await llm_agent.analyze_match(resume_text, job_description)
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
