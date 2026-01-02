from langchain.prompts import PromptTemplate

SCORING_PROMPT = PromptTemplate(
    input_variables=["resume", "jd"],
    template="""
    You are an expert Technical Recruiter and Career Coach.
    
    Job Description:
    {jd}
    
    Candidate Resume:
    {resume}
    
    Task:
    1. Analyze the resume against the job description.
    Output Format (JSON):
    {{
        "score": <number>,
        "missing_skills": [<list of strings>],
        "matching_skills": [<list of strings>],
        "suggestions": [<list of strings>]
    }}
    
    {format_instructions}
    
    Structure your response purely as valid JSON.
    """
)

REWRITE_PROMPT = PromptTemplate(
    
    Original Resume:
    {resume}
    
    Feedback/Focus Areas:
    {feedback}
    
    Task:
    Rewrite the Professional Summary and Key Skills sections of the resume to better align with the Job Description, incorporating the feedback. Keep the tone professional and impactful.
    """
)
