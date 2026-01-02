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
    2. Provide a match score from 0 to 100.
    3. List missing critical skills.
    4. List matching skills found.
    5. Provide 3 concrete suggestions to improve the resume for this specific role.
    
    {format_instructions}
    
    Structure your response purely as valid JSON.
    """
)

REWRITE_PROMPT = PromptTemplate(
    input_variables=["resume", "jd", "feedback"],
    template="""
    You are an expert Resume Writer.
    
    Job Description:
    {jd}
    
    Original Resume:
    {resume}
    
    Feedback/Focus Areas:
    {feedback}
    
    Task:
    Rewrite the Professional Summary and Key Skills sections of the resume to better align with the Job Description, incorporating the feedback. Keep the tone professional and impactful.
    """
)
