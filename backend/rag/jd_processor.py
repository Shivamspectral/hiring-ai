import json
from groq import Groq
from google import genai
from utils.config import GROQ_API_KEY, GEMINI_API_KEY
from db.vector_store import get_index

client = Groq(api_key=GROQ_API_KEY)
embedding_client = genai.Client(api_key=GEMINI_API_KEY)

def extract_jd_requirements(jd_text: str) -> dict:
    prompt = f"""
    Extract the following from this job description and return ONLY valid JSON:
    {{
        "role_title": "string",
        "required_skills": ["skill1", "skill2"],
        "preferred_skills": ["skill1", "skill2"],
        "min_experience_years": 0,
        "education_requirement": "string",
        "key_responsibilities": ["resp1", "resp2"]
    }}
    
    Job Description: {jd_text}
    
    Return ONLY valid JSON, no extra text.
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

def embed_jd(jd_text: str, jd_id: str):
    result = embedding_client.models.embed_content(
        model="models/gemini-embedding-001",
        contents=jd_text
    )
    index = get_index()
    index.upsert(vectors=[{
        "id": f"jd_{jd_id}",
        "values": result.embeddings[0].values,
        "metadata": {"type": "jd", "jd_id": jd_id, "text": jd_text[:1000]}
    }])
    return result.embeddings[0].values