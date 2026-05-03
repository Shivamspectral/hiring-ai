# ✦ TalentLens

> A production-grade AI-powered recruitment system that automates resume screening, candidate ranking, bias detection, and skill gap analysis — built for scale.

---

## 🎯 What It Does

Traditional hiring is slow, biased, and manual. This system replaces the grunt work with an intelligent pipeline:

- **Drop a job description** → AI extracts requirements instantly
- **Upload resumes** → AI parses, embeds, and scores each candidate
- **Run the pipeline** → candidates are auto-shortlisted or rejected with reasoning
- **Detect bias** → AI flags exclusionary language in your JD and rewrites it
- **Skill gap analysis** → personalized learning roadmap for every candidate

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🧠 **RAG-based Matching** | Resumes and JDs are embedded into Pinecone vector DB for semantic similarity search |
| 📊 **Deep Candidate Scoring** | Multi-dimensional scoring: skills, experience, education, confidence |
| 🤖 **Autonomous Agent** | AI agent ranks, shortlists, rejects, and generates interview questions automatically |
| ⚖️ **Bias Detector** | Detects gendered, age-biased, and exclusionary language with inclusive rewrites |
| 📈 **Skill Gap Analyzer** | Identifies missing skills and generates a personalized weekly learning plan |
| ⚡ **Smart Caching** | All AI responses cached in Supabase to avoid redundant API calls |

---

## 🛠️ Tech Stack

**Backend**
- `FastAPI` — REST API framework
- `Groq (LLaMA 3.3 70B)` — LLM for all AI reasoning tasks
- `Google Gemini Embeddings` — semantic vector embeddings
- `Pinecone` — vector database for RAG
- `Supabase` — PostgreSQL database + caching layer
- `PyMuPDF` — PDF resume parsing

**Frontend**
- `React + Vite` — fast, modern frontend
- `React Router` — client-side routing
- `Axios` — API communication
- Custom gold & white design system

---

## 📁 Project Structure

```
ai-hiring-pipeline/
├── backend/
│   ├── main.py                  # FastAPI app + all endpoints
│   ├── rag/
│   │   ├── jd_processor.py      # JD extraction + embedding
│   │   ├── resume_processor.py  # Resume parsing + embedding
│   │   └── matcher.py           # RAG-based deep matching
│   ├── agents/
│   │   ├── hiring_agent.py      # Autonomous hiring agent
│   │   └── prompts.py           # Email + agent prompt templates
│   ├── tools/
│   │   ├── bias_detector.py     # JD bias analysis tool
│   │   └── skill_gap_analyzer.py# Skill gap + learning path tool
│   ├── db/
│   │   ├── supabase_client.py   # Supabase connection
│   │   └── vector_store.py      # Pinecone connection
│   └── utils/
│       ├── config.py            # Environment variables
│       ├── pdf_parser.py        # PDF text extraction
│       └── cache.py             # AI response caching
└── frontend/
    └── src/
        ├── pages/               # Dashboard, PostJob, Candidates, etc.
        ├── components/          # Navbar
        └── services/api.js      # API service layer
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Accounts on: [Groq](https://console.groq.com), [Supabase](https://supabase.com), [Pinecone](https://pinecone.io), [Google AI Studio](https://aistudio.google.com)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/ai-hiring-pipeline.git
cd ai-hiring-pipeline
```

### 2. Backend setup
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `/backend`:
```env
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=hiring-pipeline
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:5173
```

Run the Supabase SQL setup:
```sql
create table if not exists jobs (
  id uuid default gen_random_uuid() primary key,
  title text, description text, requirements jsonb,
  created_at timestamp default now()
);

create table if not exists candidates (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id),
  name text, email text, phone text,
  resume_text text, parsed_data jsonb,
  match_score integer, match_explanation jsonb,
  status text default 'pending',
  created_at timestamp default now()
);

create table if not exists ai_cache (
  id uuid default gen_random_uuid() primary key,
  cache_key text unique not null,
  namespace text, result jsonb,
  created_at timestamp default now()
);
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/jobs/create` | Create a job and embed JD into Pinecone |
| `POST` | `/jobs/{id}/apply` | Upload resume PDF, parse and match to JD |
| `POST` | `/jobs/{id}/process` | Run full AI hiring pipeline |
| `GET` | `/jobs/{id}/candidates` | Get all candidates ranked by score |
| `POST` | `/jobs/{id}/analyze-bias` | Detect bias in job description |
| `GET` | `/candidates/{id}/skill-gap` | Get skill gap analysis for a candidate |
| `GET` | `/dashboard/stats` | Get overall hiring statistics |

Full interactive docs available at `http://localhost:8000/docs`

---

## 🧠 How the AI Pipeline Works

```
Job Description
      ↓
  LLM extracts structured requirements (role, skills, experience)
      ↓
  JD embedded → stored in Pinecone
      ↓
Resume Upload (PDF)
      ↓
  LLM parses resume → structured candidate profile
      ↓
  Skill graph matching + semantic RAG retrieval
      ↓
  LLM deep evaluation → overall score (0-100)
      ↓
Run Pipeline
      ↓
  Score ≥ 75 → Shortlisted + interview questions generated
  Score 40-74 → Flagged for manual review
  Score < 40  → Rejected + feedback email
```

---

## 🏗️ Built With Purpose

This project was built as a AI Alta Builder fellowship project demonstrating:
- **Agentic AI design** — autonomous decision-making without human-in-the-loop
- **RAG architecture** — retrieval-augmented generation for accurate matching
- **Production patterns** — caching, error handling, modular code structure
- **Ethical AI** — bias detection built into the hiring workflow

---

## 📄 License

MIT License — feel free to use, modify, and build on this.

---

🌐 **Live Demo:** https://hiring-ai-delta.vercel.app


<div align="center">
  <sub>Built with ✦ by Shivam</sub>
</div>
