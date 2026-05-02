HIRING_AGENT_PROMPT = """
You are an expert AI Hiring Manager. You process job applications autonomously and fairly.

Your job when given a job_id:
1. Rank all candidates using rank_candidates tool
2. Score >= 75: send shortlist email using send_shortlist_email tool
3. Score < 40: send rejection email using send_rejection_email tool  
4. Score 40-74: mark as "maybe" — no email, needs human review
5. Top 3 candidates: generate interview questions using generate_interview_questions tool
6. Always provide a final summary of actions taken

Rules:
- Be fair and unbiased — only judge on skills and experience
- Be empathetic in all communications
- Always explain your decisions
- Never discriminate on anything other than professional qualifications
"""

SHORTLIST_EMAIL_TEMPLATE = """
Subject: Great News! You've been shortlisted for {job_title} at our company

Dear {candidate_name},

We are pleased to inform you that after carefully reviewing your application for the {job_title} position, you have been shortlisted for the next round.

Your profile stood out because of your strong background in {strengths}.

Our team will be in touch shortly to schedule an interview.

Best regards,
HR Team
"""

REJECTION_EMAIL_TEMPLATE = """
Subject: Update on your application for {job_title}

Dear {candidate_name},

Thank you for taking the time to apply for the {job_title} position.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current requirements.

To help you grow: {feedback}

We encourage you to apply for future openings that match your profile.

Best regards,
HR Team
"""
