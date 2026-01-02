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
MODEL_NAME = "nemotron-3-nano:30b-cloud"  

class MatchAnalysis(BaseModel):
    score: int = Field(description="Match score between 0 and 100")
    missing_skills: List[str] = Field(description="List of critical skills missing from the resume")
    matching_skills: List[str] = Field(description="List of matching skills found")
    suggestions: List[str] = Field(description="Concrete suggestions for improvement")

parser = PydanticOutputParser(pydantic_object=MatchAnalysis)

async def get_llm():
    return ChatOllama(
        base_url=OLLAMA_BASE_URL,
        model=MODEL_NAME,
        temperature=0.2
    )

async def analyze_match(resume_text: str, job_description: str):
    llm = await get_llm()
    
    # We need to ensure the prompt expects the format instructions
    format_instructions = parser.get_format_instructions()
    
    chain = LLMChain(llm=llm, prompt=prompts.SCORING_PROMPT)
    
    # Run the chain
    # Note: Depending on the specific Nemotron version, it might need more steering for JSON
    # But we will try the standard LangChain invoke first.
    result = await chain.arun(
        resume=resume_text, 
        jd=job_description,
        format_instructions=format_instructions
    )
    
    try:
        # Attempt to parse the JSON output
        # Sometimes LLMs add markdown code blocks around JSON, so we clean it
        clean_json = result.replace("```json", "").replace("```", "").strip()
        parsed_result = json.loads(clean_json)
        
        # Add the 'customized_resume' placeholder or generate it in a second pass
        parsed_result["customized_resume"] = "Resume customization feature coming in next step..."
        
        return parsed_result
    except Exception as e:
        print(f"Error parsing LLM output: {result}")
        # Fallback if JSON parsing fails
        return {
            "score": 0,
            "missing_skills": ["Error parsing AI response"],
            "matching_skills": [],
            "suggestions": [f"Raw Output: {result[:500]}..."],
            "customized_resume": ""
        }

