from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid

from utils.config import FRONTEND_URL
from db.supabase_client import get_client
from utils.pdf_parser import extract_text_from_pdf
from rag.jd_processor import extract_jd_requirements, embed_jd
from rag.resume_processor import parse_resume, embed_resume
from rag.matcher import deep_match
from agents.hiring_agent import run_hiring_pipeline
from tools.bias_detector import detect_bias
from tools.skill_gap_analyzer import analyze_skill_gap
from utils.cache import get_cached, set_cached

app = FastAPI(title="AI Hiring Pipeline", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──────────────────────────────────────────────

class JobCreate(BaseModel):
    title: str
    description: str

# ── Health Check ─────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "AI Hiring Pipeline is running 🚀"}

# ── Jobs ─────────────────────────────────────────────────

@app.post("/jobs/create")
async def create_job(job: JobCreate):
    try:
        supabase = get_client()
        job_id = str(uuid.uuid4())
        
        cached = get_cached("jd_requirements", job.description)
        if cached:
            requirements = cached
        else:
            requirements = extract_jd_requirements(job.description)
            set_cached("jd_requirements", job.description, requirements)
        
        response = supabase.table("jobs").insert({
            "id": job_id,
            "title": job.title,
            "description": job.description,
            "requirements": requirements
        }).execute()
        
        embed_jd(job.description, job_id)
        
        return {
            "job_id": job_id,
            "title": job.title,
            "requirements": requirements,
            "message": "Job created and indexed successfully"
        }
    except Exception as e:
        import traceback
        print("❌ ERROR IN CREATE JOB:")
        print(traceback.format_exc())
        raise

@app.post("/jobs/{job_id}/apply")
async def apply_to_job(job_id: str, resume: UploadFile = File(...)):
    supabase = get_client()
    
    # Verify job exists
    job_response = supabase.table("jobs").select("*").eq("id", job_id).execute()
    if not job_response.data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_response.data[0]
    jd_requirements = job.get("requirements", {})
    
    # Parse resume
    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes, resume.filename)
    
    # Check cache
    cached = get_cached("resume_parse", resume_text)
    if cached:
        parsed_data = cached
    else:
        parsed_data = parse_resume(resume_text)
        set_cached("resume_parse", resume_text, parsed_data)
    
    candidate_id = str(uuid.uuid4())
    
    # Match against JD
    match_result = deep_match(parsed_data, jd_requirements, job_id)
    
    # Save candidate to Supabase
    supabase.table("candidates").insert({
        "id": candidate_id,
        "job_id": job_id,
        "name": parsed_data.get("name", "Unknown"),
        "email": parsed_data.get("email", ""),
        "phone": parsed_data.get("phone", ""),
        "resume_text": resume_text,
        "parsed_data": parsed_data,
        "match_score": match_result.get("overall_score", 0),
        "match_explanation": match_result,
        "status": "pending"
    }).execute()
    
    # Embed resume into Pinecone
    embed_resume(resume_text, candidate_id)
    
    return {
        "candidate_id": candidate_id,
        "name": parsed_data.get("name"),
        "match_score": match_result.get("overall_score"),
        "recommendation": match_result.get("recommendation"),
        "message": "Application submitted successfully"
    }

@app.post("/jobs/{job_id}/process")
async def process_job_pipeline(job_id: str):
    supabase = get_client()
    
    job_response = supabase.table("jobs").select("*").eq("id", job_id).execute()
    if not job_response.data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_title = job_response.data[0].get("title", "Unknown Role")
    result = run_hiring_pipeline(job_id, job_title)
    
    return result

@app.get("/jobs/{job_id}/candidates")
async def get_candidates(job_id: str):
    supabase = get_client()
    
    response = supabase.table("candidates")\
        .select("id, name, email, match_score, status, created_at, match_explanation")\
        .eq("job_id", job_id)\
        .order("match_score", desc=True)\
        .execute()
    
    return {"job_id": job_id, "candidates": response.data}

@app.post("/jobs/{job_id}/analyze-bias")
async def analyze_job_bias(job_id: str):
    supabase = get_client()
    
    job_response = supabase.table("jobs").select("*").eq("id", job_id).execute()
    if not job_response.data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    jd_text = job_response.data[0].get("description", "")
    
    cached = get_cached("bias_analysis", jd_text)
    if cached:
        return cached
    
    result = detect_bias(jd_text)
    set_cached("bias_analysis", jd_text, result)
    
    return result

@app.get("/candidates/{candidate_id}/skill-gap")
async def get_skill_gap(candidate_id: str):
    supabase = get_client()
    
    candidate_response = supabase.table("candidates")\
        .select("*, jobs(requirements)")\
        .eq("id", candidate_id)\
        .execute()
    
    if not candidate_response.data:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate = candidate_response.data[0]
    parsed_data = candidate.get("parsed_data", {})
    jd_requirements = candidate.get("jobs", {}).get("requirements", {})
    match_explanation = candidate.get("match_explanation", {})
    
    # Merge match explanation into parsed_data for the analyzer
    parsed_data["match_explanation"] = match_explanation
    
    result = analyze_skill_gap(parsed_data, jd_requirements)
    return result

@app.get("/dashboard/stats")
async def get_dashboard_stats():
    supabase = get_client()
    
    jobs_response = supabase.table("jobs").select("id, title, created_at").execute()
    candidates_response = supabase.table("candidates")\
        .select("id, status, match_score, job_id")\
        .execute()
    
    candidates = candidates_response.data
    
    status_counts = {"pending": 0, "shortlisted": 0, "rejected": 0, "review": 0}
    for c in candidates:
        status = c.get("status", "pending")
        status_counts[status] = status_counts.get(status, 0) + 1
    
    scores = [c.get("match_score", 0) for c in candidates if c.get("match_score")]
    avg_score = round(sum(scores) / len(scores)) if scores else 0
    
    return {
        "total_jobs": len(jobs_response.data),
        "total_candidates": len(candidates),
        "status_breakdown": status_counts,
        "average_match_score": avg_score,
        "recent_jobs": jobs_response.data[-5:]
    }
