import json
from groq import Groq
from utils.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def analyze_skill_gap(candidate_data: dict, jd_requirements: dict) -> dict:
    explanation = candidate_data.get("match_explanation") or {}
    missing_skills = explanation.get("missing_skills", [])
    partial_skills = explanation.get("partial_skills", [])
    if not missing_skills:
        candidate_skills = [s.lower() for s in candidate_data.get("skills", [])]
        required_skills = jd_requirements.get("required_skills", [])
        missing_skills = [s for s in required_skills if s.lower() not in candidate_skills]
    if not missing_skills and not partial_skills:
        return {
            "gap_count": 0,
            "gaps": [],
            "priority_skills": [],
            "estimated_total_weeks": 0,
            "learning_path_summary": "No significant skill gaps found."
        }
    prompt = f"""
    You are a technical career coach. A candidate is missing these skills for a job role.

    Job Role: {jd_requirements.get("role_title", "Software Engineer")}
    Missing Skills: {missing_skills}
    Partial Skills: {partial_skills}
    Current Skills: {candidate_data.get("skills", [])}
    Experience: {candidate_data.get("total_experience_years", 0)} years

    Return ONLY valid JSON:
    {{
        "gap_count": <total>,
        "gaps": [
            {{
                "skill": "skill name",
                "gap_type": "<MISSING|PARTIAL>",
                "priority": "<HIGH|MEDIUM|LOW>",
                "estimated_weeks": <integer>,
                "free_resources": ["resource with URL"],
                "paid_resources": ["course name"],
                "why_important": "one sentence"
            }}
        ],
        "priority_skills": ["top 3 skills to learn first"],
        "estimated_total_weeks": <integer>,
        "learning_path_summary": "2-3 sentence personalized advice"
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
    return json.loads(text.strip())