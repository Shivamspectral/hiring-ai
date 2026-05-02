import json
from groq import Groq
from google import genai
from utils.config import GROQ_API_KEY, GEMINI_API_KEY
from db.vector_store import get_index

client = Groq(api_key=GROQ_API_KEY)
embedding_client = genai.Client(api_key=GEMINI_API_KEY)

SKILL_GRAPH = {
    "react": ["javascript", "html", "css", "frontend"],
    "angular": ["javascript", "typescript", "frontend"],
    "vue": ["javascript", "frontend"],
    "node": ["javascript", "backend"],
    "express": ["node", "javascript", "backend"],
    "django": ["python", "backend"],
    "fastapi": ["python", "backend"],
    "flask": ["python", "backend"],
    "pytorch": ["python", "machine learning", "deep learning"],
    "tensorflow": ["python", "machine learning", "deep learning"],
    "kubernetes": ["docker", "devops", "cloud"],
    "aws": ["cloud", "devops"],
    "gcp": ["cloud", "devops"],
    "azure": ["cloud", "devops"],
    "docker": ["devops", "containerization"],
    "postgresql": ["sql", "database"],
    "mongodb": ["nosql", "database"],
    "redis": ["database", "caching"],
}

def get_related_skills(skill: str) -> list:
    skill_lower = skill.lower()
    related = SKILL_GRAPH.get(skill_lower, [])
    for key, values in SKILL_GRAPH.items():
        if skill_lower in values and key not in related:
            related.append(key)
    return related

def calculate_skill_match(candidate_skills: list, required_skills: list) -> dict:
    candidate_skills_lower = [s.lower() for s in candidate_skills]
    matched, partial, missing = [], [], []
    for req_skill in required_skills:
        req_lower = req_skill.lower()
        if req_lower in candidate_skills_lower:
            matched.append(req_skill)
        else:
            related = get_related_skills(req_lower)
            if any(r in candidate_skills_lower for r in related):
                partial.append(req_skill)
            else:
                missing.append(req_skill)
    total = len(required_skills)
    if total == 0:
        return {"score": 100, "matched": [], "partial": [], "missing": []}
    score = ((len(matched) * 1.0 + len(partial) * 0.5) / total) * 100
    return {"score": round(score), "matched": matched, "partial": partial, "missing": missing}

def deep_match(resume_data: dict, jd_requirements: dict, jd_id: str) -> dict:
    skill_match = calculate_skill_match(
        resume_data.get("skills", []),
        jd_requirements.get("required_skills", [])
    )
    index = get_index()
    resume_skills_text = " ".join(resume_data.get("skills", []))
    query_embedding = embedding_client.models.embed_content(
        model="models/gemini-embedding-001",
        contents=resume_skills_text
    )
    results = index.query(
        vector=query_embedding.embeddings[0].values,
        top_k=3,
        filter={"type": "jd", "jd_id": jd_id},
        include_metadata=True
    )
    retrieved_context = ""
    if results["matches"]:
        retrieved_context = " ".join([m["metadata"].get("text", "") for m in results["matches"]])

    prompt = f"""
    You are an expert technical recruiter. Evaluate this candidate deeply.
    
    JOB REQUIREMENTS:
    {json.dumps(jd_requirements, indent=2)}
    
    RETRIEVED CONTEXT FROM JD:
    {retrieved_context}
    
    CANDIDATE PROFILE:
    Name: {resume_data.get('name')}
    Experience: {resume_data.get('total_experience_years')} years
    Skills: {resume_data.get('skills')}
    Education: {resume_data.get('education')}
    Work History: {resume_data.get('work_history')}
    
    SKILL MATCH ANALYSIS:
    - Matched Skills: {skill_match['matched']}
    - Partial Match: {skill_match['partial']}
    - Missing Skills: {skill_match['missing']}
    - Skill Score: {skill_match['score']}/100
    
    Provide evaluation as ONLY valid JSON:
    {{
        "overall_score": <0-100>,
        "skills_score": <0-100>,
        "experience_score": <0-100>,
        "education_score": <0-100>,
        "confidence_score": <0-100>,
        "recommendation": "<STRONG_YES|YES|MAYBE|NO>",
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "risk_factors": ["risk1"],
        "personalized_summary": "2-3 sentence summary for HR",
        "matched_skills": {skill_match['matched']},
        "missing_skills": {skill_match['missing']},
        "partial_skills": {skill_match['partial']}
    }}
    
    Return ONLY valid JSON.
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    result = json.loads(text.strip())
    result["skills_breakdown"] = skill_match
    return result