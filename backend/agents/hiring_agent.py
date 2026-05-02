import json
from groq import Groq
from utils.config import GROQ_API_KEY
from db.supabase_client import get_client
from agents.prompts import HIRING_AGENT_PROMPT, SHORTLIST_EMAIL_TEMPLATE, REJECTION_EMAIL_TEMPLATE

client = Groq(api_key=GROQ_API_KEY)

def rank_candidates(job_id: str) -> list:
    supabase = get_client()
    response = supabase.table("candidates").select("*").eq("job_id", job_id).execute()
    return sorted(response.data, key=lambda x: x.get("match_score", 0), reverse=True)

def send_shortlist_email(candidate_name, candidate_email, job_title, strengths) -> str:
    email_body = SHORTLIST_EMAIL_TEMPLATE.format(
        candidate_name=candidate_name,
        job_title=job_title,
        strengths=", ".join(strengths[:3])
    )
    print(f"📧 SHORTLIST EMAIL SENT TO: {candidate_email}")
    print(email_body)
    return f"Shortlist email sent to {candidate_email}"

def send_rejection_email(candidate_name, candidate_email, job_title, missing_skills) -> str:
    feedback = f"Consider strengthening: {', '.join(missing_skills[:3])}" if missing_skills else "Keep building your experience."
    email_body = REJECTION_EMAIL_TEMPLATE.format(
        candidate_name=candidate_name,
        job_title=job_title,
        feedback=feedback
    )
    print(f"📧 REJECTION EMAIL SENT TO: {candidate_email}")
    print(email_body)
    return f"Rejection email sent to {candidate_email}"

def generate_interview_questions(job_title, candidate_skills, matched_skills, missing_skills) -> list:
    prompt = f"""
    Generate exactly 10 interview questions for a {job_title} candidate.
    Candidate's skills: {candidate_skills}
    Skills that match JD: {matched_skills}
    Skills they are missing: {missing_skills}
    Mix: 4 technical, 2 gap, 2 behavioral, 2 situational questions.
    Return ONLY a JSON array of strings like: ["question1", "question2", ...]
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

def update_candidate_status(candidate_id, status, interview_questions=None):
    supabase = get_client()
    update_data = {"status": status}
    if interview_questions:
        update_data["match_explanation"] = {"interview_questions": interview_questions}
    supabase.table("candidates").update(update_data).eq("id", candidate_id).execute()

def run_hiring_pipeline(job_id: str, job_title: str) -> dict:
    print(f"\n🤖 AI HIRING AGENT STARTED FOR JOB: {job_title}")
    actions_log = []
    candidates = rank_candidates(job_id)
    if not candidates:
        return {"status": "complete", "message": "No candidates found", "actions": []}
    actions_log.append(f"Found and ranked {len(candidates)} candidates")
    shortlisted, rejected, maybe = [], [], []
    for candidate in candidates:
        score = candidate.get("match_score", 0)
        name = candidate.get("name", "Unknown")
        email = candidate.get("email", "")
        candidate_id = candidate.get("id")
        explanation = candidate.get("match_explanation") or {}
        strengths = explanation.get("strengths", [])
        missing_skills = explanation.get("missing_skills", [])
        if score >= 75:
            send_shortlist_email(name, email, job_title, strengths)
            update_candidate_status(candidate_id, "shortlisted")
            shortlisted.append(name)
            actions_log.append(f"✅ Shortlisted {name} (Score: {score})")
        elif score < 40:
            send_rejection_email(name, email, job_title, missing_skills)
            update_candidate_status(candidate_id, "rejected")
            rejected.append(name)
            actions_log.append(f"❌ Rejected {name} (Score: {score})")
        else:
            update_candidate_status(candidate_id, "review")
            maybe.append(name)
            actions_log.append(f"🔍 Flagged for review {name} (Score: {score})")
    top_candidates = [c for c in candidates if c.get("match_score", 0) >= 75][:3]
    for candidate in top_candidates:
        name = candidate.get("name", "Unknown")
        candidate_id = candidate.get("id")
        explanation = candidate.get("match_explanation") or {}
        candidate_skills = candidate.get("parsed_data", {}).get("skills", [])
        questions = generate_interview_questions(
            job_title,
            candidate_skills,
            explanation.get("matched_skills", []),
            explanation.get("missing_skills", [])
        )
        update_candidate_status(candidate_id, "shortlisted", questions)
        actions_log.append(f"📝 Generated {len(questions)} interview questions for {name}")
    return {
        "status": "complete",
        "total_candidates": len(candidates),
        "shortlisted": len(shortlisted),
        "rejected": len(rejected),
        "needs_review": len(maybe),
        "shortlisted_names": shortlisted,
        "rejected_names": rejected,
        "review_names": maybe,
        "actions_log": actions_log
    }