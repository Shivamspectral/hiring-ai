import json
from groq import Groq
from utils.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def detect_bias(jd_text: str) -> dict:
    prompt = f"""
    You are an expert in inclusive hiring practices. Analyze this job description for biased,
    exclusionary, or gendered language.
    
    Job Description:
    {jd_text}
    
    Return ONLY valid JSON:
    {{
        "bias_score": <0-100>,
        "bias_level": "<LOW|MEDIUM|HIGH>",
        "gendered_terms": ["term1"],
        "exclusionary_phrases": ["phrase1"],
        "age_biased_terms": ["term1"],
        "cultural_bias_terms": ["term1"],
        "suggestions": [
            {{
                "original": "original phrase",
                "replacement": "inclusive replacement",
                "reason": "why this change helps"
            }}
        ],
        "improved_jd": "full rewritten JD with all biased language replaced",
        "summary": "2-3 sentence summary of findings"
    }}
    
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