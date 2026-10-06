# SkillBridge — Academia-Industry Collaboration Platform

> **Hackathon:** CRAFTVERSE — A National Level Hackathon (PCCOER)  
> **Domain:** AI-ML & Agentic AI  
> **Team:** Team Dominator (JSPM's Rajarshi Shahu College of Engineering, Pune)  
> **Team Members:** Yuvraj Kadam, Nimisha Joshi, Khushi Patil, Dhruv Patil  

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/khushipatil5906-netizen/SkillBridge)

---

## 🌟 Overview
SkillBridge solves the critical disconnect between Indian engineering education and corporate hiring by providing a unified, multi-role platform powered by **sovereign local Machine Learning** and an **autonomous Agentic AI Co-Pilot**.

Unlike traditional toy projects or cluttered portals, SkillBridge uses a single-screen, soft-card UI with dynamic multi-role persona switching for **Students**, **Recruiters**, **Colleges (HODs)**, and **Regulators/Admins**.

---

## 🧠 The AI-ML & Agentic AI Engines

### 1. Objective Skill Verifier (ML Model 1)
- **Problem Solved:** Self-reported resume inflation and unverified claims.
- **Model Architecture:** Multi-signal Ridge regression calibrating proctored test scores, AST code complexity, and project proof-of-work into a standardized verified competency score (0-100).
- **Latency:** < 2ms (local in-memory execution).

### 2. Explainable Semantic Job Matcher (ML Model 2)
- **Problem Solved:** Random algorithmic filtering without feedback.
- **Model Architecture:** Semantic vector overlap and weighted skill intersection that calculates exact match percentages, highlights missing skills, and explains why a candidate matched.

### 3. Skill Demand Trend Forecaster (ML Model 3)
- **Problem Solved:** Reactive syllabi that take 3 years to catch up with industry.
- **Model Architecture:** Polynomial trend regression forecasting 6-month hiring demand curves across emerging tech (FastAPI, Docker, Agentic AI) vs college syllabi.

### 4. SkillBridge Co-Pilot (Agentic AI)
- **Capabilities:** Autonomous action plan generation for students, candidate shortlisting for recruiters, and automated curriculum gap auditing for college HODs.

---

## 📁 Clean Directory Organization

```text
v1/
├── .gsd/                   # Get Shit Done roadmap & milestone tracking
│   ├── ROADMAP.md
│   └── STATE.md
├── server/                 # Python 3.12 FastAPI backend & ML engine
│   ├── app/
│   │   ├── ml/             # 3 Local ML Models
│   │   ├── agents/         # Autonomous Placement Agent
│   │   ├── data/           # Seed data (Pune colleges & live vacancies)
│   │   ├── routes/         # Clean REST endpoints for 4 roles
│   │   └── main.py         # App entrypoint
│   ├── requirements.txt
│   └── run_server.py
├── client/                 # React 18 + Vite + Tailwind CSS frontend
│   ├── public/             # Favicon, robots.txt, sitemap.xml, llms.txt
│   ├── src/
│   │   ├── components/     # Cards, TopNav, LeftRail, Modals
│   │   ├── services/       # Resilient API client with fallback
│   │   ├── types/          # Strict TypeScript interfaces
│   │   ├── App.tsx         # Unified dashboard matching reference UI
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🚀 Running the Project

### Option A: 🐳 Docker & Docker Compose (Recommended for Any System)

Run the entire platform (Frontend + FastAPI ML Backend + Nginx Reverse Proxy) on any OS (Windows, macOS, Linux) with zero host dependencies:

#### 1. Multi-Container Orchestration (Docker Compose):
```bash
# Build and start all services in the background
docker compose up -d --build

# View container status and logs
docker compose ps
docker compose logs -f
```

#### 2. All-in-One Single Container (Alternative):
```bash
# Build the unified image
docker build -t skillbridge:latest .

# Run the container
docker run -d --name skillbridge -p 5173:80 -p 8000:8000 skillbridge:latest
```

#### 🌐 Accessing SkillBridge on Different Systems:
- **Local Machine**: Open `http://localhost:5173` in your browser.
- **Different System / Mobile on Same Network**:
  1. Find your host IP (e.g. `ipconfig` on Windows or `ifconfig` / `ip a` on Linux/Mac, e.g., `192.168.1.15`).
  2. Open `http://<YOUR-IP>:5173` on the other device or laptop.
  3. Interactive API & Swagger Docs: `http://<YOUR-IP>:8000/docs` (or `http://<YOUR-IP>:5173/docs`).

---

### Option B: 💻 Manual Local Development (Without Docker)

#### 1. Backend (FastAPI ML Engine)
```bash
# Navigate to server directory and start
python server/run_server.py
# Running on http://127.0.0.1:8000 (Swagger docs at /docs)
```

#### 2. Frontend (React + Vite)
```bash
# Navigate to client directory
cd client
npm install
npm run dev
# Running on http://localhost:5173
```
