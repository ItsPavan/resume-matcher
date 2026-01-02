# Resume Matcher & Optimizer

A powerful local-first application that scores your resume against a Job Description (JD) and generates customized improvements using **AI Agents**.

Built with **React**, **FastAPI**, **LangChain**, and **NVIDIA Nemotron** (via Ollama).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React_Vite-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)
![AI](https://img.shields.io/badge/AI-LangChain_Running_Nemotron-orange.svg)

## 🚀 Features

- **📄 Document Parsing**: extracts text from PDF and DOCX resumes.
- **🎯 Smart Scoring**: Analyzes your resume against a specific JD to calculate a 0-100 match score.
- **🔍 Gap Analysis**: Identifies exact skills and keywords missing from your profile.
- **✨ AI Optimization**: Generates a preview of a "Customized Resume" tailored to the job.
- **🔒 Privacy First**: Runs entirely locally using Ollama (no data leaves your machine).

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Vanilla CSS (Glassmorphism UI)
- **Backend**: Python, FastAPI, Uvicorn
- **AI Orchestration**: LangChain
- **LLM**: `nemotron-3-nano:30b-cloud` running on [Ollama](https://ollama.ai/)

## 📋 Prerequisites

1.  **Node.js** (v16+)
2.  **Python** (v3.9+)
3.  **Ollama**: Installed and running locally.
    - Pull the model: `ollama pull nemotron-3-nano:30b-cloud`
    - Ensure it's listening on `http://localhost:11434`

## ⚡ Quick Start

### 1. Backend Setup
Navigate to the `backend` folder:
```bash
cd backend
python -m venv .venv
# Activate venv: .venv\Scripts\activate (Windows) or source .venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend Setup
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
The App will launch at `http://localhost:5173`.

## 💡 Usage

1.  Open the web app.
2.  **Upload** your Resume (PDF/DOCX).
3.  **Paste** the Job Description text.
4.  Click **"Analyze Match"**.
5.  View your score, missing skills, and the AI-generated improved resume content!

## 🏗️ Architecture

- **`frontend/`**: React SPA (Single Page Application).
- **`backend/`**:
    - `main.py`: Entry point and API endpoints.
    - `services/parser.py`: Handles file extraction (pypdf, python-docx).
    - `services/llm_agent.py`: LangChain logic connecting to Ollama.
    - `services/prompts.py`: System prompts for the AI.

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📜 License
[MIT](https://choosealicense.com/licenses/mit/)
