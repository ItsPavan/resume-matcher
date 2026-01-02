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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/customize")
async def customize_resume_endpoint(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        resume_text = await parser.extract_text(resume)
        customized_text = await llm_agent.customize_resume(resume_text, job_description)
        return {"original": resume_text, "customized": customized_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import FileResponse
import tempfile
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit

@app.post("/generate_pdf")
async def generate_pdf_endpoint(
    content: str = Form(...)
):
    try:
        # Create a temporary file
        fd, path = tempfile.mkstemp(suffix=".pdf")
        
        c = canvas.Canvas(path, pagesize=letter)
        width, height = letter
        margin = 50
        y = height - margin
        
        # Simple text wrapping and printing
        text_object = c.beginText(margin, y)
        text_object.setFont("Helvetica", 11)
        
        # Split lines to handle newlines from the input
        lines = content.split('\n')
        
        for line in lines:
            # Wrap long lines
            wrapped_lines = simpleSplit(line, "Helvetica", 11, width - 2*margin)
            for wrapped in wrapped_lines:
                if text_object.getY() < margin:
                    c.drawText(text_object)
                    c.showPage()
                    text_object = c.beginText(margin, height - margin)
                    text_object.setFont("Helvetica", 11)
                text_object.textLine(wrapped)
            
        c.drawText(text_object)
        c.save()
        
        return FileResponse(path, filename="customized_resume.pdf", media_type='application/pdf')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
