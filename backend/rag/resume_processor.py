import json
from groq import Groq
from google import genai
from utils.config import GROQ_API_KEY, GEMINI_API_KEY
from db.vector_store import get_index

client = Groq(api_key=GROQ_API_KEY)
embedding_client = genai.Client(api_key=GEMINI_API_KEY)

def parse_resume(resume_text: str) -> dict:
    prompt = f"""
    Extract the following from this resume and return ONLY valid JSON:
    {{
        "name": "string",
        "email": "string",
        "phone": "string",
        "total_experience_years": 0,
        "skills": ["skill1", "skill2"],
        "education": [
            {{
                "degree": "string",
                "institution": "string",
                "year": "string"
            }}
        ],
        "work_history": [
            {{
                "title": "string",
                "company": "string",
                "duration": "string",
                "responsibilities": ["resp1"]
            }}
        ],
        "certifications": ["cert1"]
    }}
    
    Resume: {resume_text}
    
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

def embed_resume(resume_text: str, candidate_id: str):
    result = embedding_client.models.embed_content(
        model="models/gemini-embedding-001",
        contents=resume_text
    )
    index = get_index()
    index.upsert(vectors=[{
        "id": f"candidate_{candidate_id}",
        "values": result.embeddings[0].values,
        "metadata": {"type": "resume", "candidate_id": candidate_id}
    }])
    return result.embeddings[0].values