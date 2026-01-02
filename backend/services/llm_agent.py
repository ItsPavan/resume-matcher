from langchain_community.llms import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from services import prompts
import os

from langchain_community.chat_models import ChatOllama
from langchain.chains import LLMChain
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List
from services import prompts
import json

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
FAST_MODEL = "llama3.2" # Fast, good for classification/scoring
SMART_MODEL = "nemotron-3-nano:30b-cloud" # Detailed, good for creative writing

class MatchAnalysis(BaseModel):
    score: int = Field(description="Match score between 0 and 100")
    missing_skills: List[str] = Field(description="List of critical skills missing from the resume")
    matching_skills: List[str] = Field(description="List of matching skills found")
    suggestions: List[str] = Field(description="Concrete suggestions for improvement")

parser = PydanticOutputParser(pydantic_object=MatchAnalysis)

async def get_llm(model_name=FAST_MODEL):
    return ChatOllama(
        base_url=OLLAMA_BASE_URL,
        model=model_name,
        temperature=0.2
    )

async def analyze_match(resume_text: str, job_description: str):
    print(f"DEBUG: Starting analysis with {FAST_MODEL}...")
    llm = await get_llm(FAST_MODEL)
    
    # We need to ensure the prompt expects the format instructions
    format_instructions = parser.get_format_instructions()
    
    chain = LLMChain(llm=llm, prompt=prompts.SCORING_PROMPT)
    
    print("DEBUG: Invoking LLM chain...")
    result = await chain.arun(
        resume=resume_text, 
        jd=job_description,
        format_instructions=format_instructions
    )
    
    try:
        # Attempt to parse the JSON output
        clean_json = result.replace("```json", "").replace("```", "").strip()
        parsed_result = json.loads(clean_json)
        parsed_result["customized_resume"] = "Click 'Customize' to generate optimized version."
        return parsed_result
    except Exception as e:
        print(f"Error parsing LLM output: {result}")
        return {
            "score": 0,
            "missing_skills": ["Error parsing AI response"],
            "matching_skills": [],
            "suggestions": [f"Raw Output: {result[:500]}..."],
            "customized_resume": ""
        }

async def customize_resume(resume_text: str, job_description: str) -> str:
    print(f"DEBUG: Starting customization with {SMART_MODEL}...")
    llm = await get_llm(SMART_MODEL)
    chain = LLMChain(llm=llm, prompt=prompts.REWRITE_PROMPT)
    result = await chain.arun(resume=resume_text, jd=job_description)
    return result.strip()

