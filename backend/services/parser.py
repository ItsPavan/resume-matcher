from fastapi import UploadFile
import io
from pypdf import PdfReader
from docx import Document

async def extract_text(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()
    
    text = ""
    
    if filename.endswith('.pdf'):
        pdf_file = io.BytesIO(content)
        reader = PdfReader(pdf_file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
            
    elif filename.endswith('.docx'):
        docx_file = io.BytesIO(content)
        doc = Document(docx_file)
        for para in doc.paragraphs:
            text += para.text + "\n"
            
    else:
        # Fallback for text files
        text = content.decode('utf-8', errors='ignore')
        
    return text.strip()
