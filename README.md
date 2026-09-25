# 🇮🇳 SchemeSetu 
### *Bridging Citizens to NSFDC Concessional Schemes & PM-SURAJ Guidance*

[![Smart India Hackathon](https://img.shields.io/badge/SIH-2026%20Prototype-orange.svg)](https://www.sih.gov.in/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg)](https://nextjs.org)
[![PyTorch](https://img.shields.io/badge/AI%20Model-Multilingual%20E5%20Small-EE4C2C.svg)](https://huggingface.co/intfloat/multilingual-e5-small)
[![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL%20%2B%20pgvector-blue.svg)](https://github.com/pgvector/pgvector)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

---

## 🌟 Executive Summary

**SchemeSetu** is an intelligent, bilingual, and accessible citizen-empowerment platform developed for **Smart India Hackathon (SIH)**. It bridges the gap between marginalized Scheduled Caste (SC) beneficiaries and concessional credit schemes offered by the **National Scheduled Castes Finance and Development Corporation (NSFDC)** under the Ministry of Social Justice and Empowerment (MoSJE).

The platform provides:
1. **Multilingual AI Semantic Search** supporting queries in **English, Hindi, Tamil, Hinglish, and Tanglish**.
2. **100% Deterministic Eligibility Checking** that adheres strictly to statutory NSFDC guidelines without hallucinated probabilities.
3. **Smart Channel Routing**: Differentiates between online digital processing via the **PM-SURAJ portal** ($\le$ ₹15 Lakhs) and **in-person Bank / Channel Partner processing** (> ₹15 Lakhs).
4. **Interactive Moratorium & Concessional EMI Calculator**.
5. **Pan-India Verified Channel Partner Locator** across all states and union territories.

> ⚠️ **Regulatory & Sovereign Hand-off Notice**: SchemeSetu is an advisory discovery and calculation tool. The actual submission, document verification, sanction, and subsidy disbursement are conducted via the official Government of India **[PM-SURAJ Portal](https://pmsuraj.dosje.gov.in/)** and authorized State Channelizing Agencies (SCAs).

---

## 🚀 Core Features

### 1. 🧠 Fine-Tuned Multilingual Semantic AI Engine
- Powered by a custom fine-tuned **`intfloat/multilingual-e5-small`** model (trained on **5,565 contrastive domain pairs**).
- Handles natural, colloquial citizen queries, phonetic spellings, and mixed dialects:
  - *Hindi*: `"मुझे छोटे कारोबार के लिए कम राशि का ऋण चाहिए"` $\rightarrow$ Micro Finance Scheme (MFS)
  - *Hinglish*: `"Mujhe NBFC-MFI se microfinance chahiye"` $\rightarrow$ Aajeevika Micro-Finance Yojana (AMY)
  - *Tamil*: `"சிறிய சுயதொழிலுக்கு குறைந்த தொகை கடன் வேண்டும்"` $\rightarrow$ Micro Finance Scheme (MFS)
  - *Tanglish*: `"Enakku small self business start panna chinna loan venum"` $\rightarrow$ MFS

### 2. ⚖️ Deterministic Statutory Eligibility Engine
- Zero probabilistic hallucinations: Evaluates criteria against official NSFDC statutory rules (family income $\le$ ₹5 Lakhs, SC community status, age limits 18–55, moratorium eligibility).
- Outputs clear statuses: `matched` | `not_matched` | `needs_verification`.

### 3. 🏛️ Dual-Track Application Path Routing
- **Online PM-SURAJ Processing ($\le$ ₹15 Lakhs)**: Provides direct deep-links and a one-click **Application Preparation Checklist** for immediate submission on the PM-SURAJ portal.
- **In-Person Bank / Partner Processing (> ₹15 Lakhs or Business Expansions)**: Alerts beneficiaries when credit requests exceed the online digital processing ceiling, routing them to their nearest physical Bank branch or State Channelizing Agency (SCA).

### 4. 📍 Verified Channel Partner & SCA Directory
- Complete directory of **96 verified partners across India**, including **39 State Channelizing Agencies (SCAs)** (e.g., TAHDCO in Tamil Nadu, APSCCFC in Andhra Pradesh, DSIIDC in Delhi), Public Sector Banks (PSBs), Regional Rural Banks (RRBs), and NBFC-MFIs, plus clearly labeled **DEMO** records used only for UI/testing demonstrations.
- Radius search, district/state filtering, and interactive mapping.

### 5. 🧮 Concessional EMI & Moratorium Calculator
- Simulates real NSFDC concessional terms (interest rates 4.0% – 15.0% p.a.).
- Accurately models **moratorium periods (grace periods up to 12 months)** with optional interest accrual calculations and full amortization schedules.

### 6. 🔊 Accessibility & Voice Narration
- In-browser text-to-speech engine to narrate scheme highlights for citizens with low literacy or visual impairments.

---

## 🏗️ System Architecture

```
                                  ┌──────────────────────────────────────────────────────────┐
                                  │            Official Sources (NSFDC / PM-SURAJ)           │
                                  └─────────────────────────────┬────────────────────────────┘
                                                                │ Verified Ingestion & Provenance
                                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  FastAPI Backend Server                                    │
│                                                                                            │
│   ┌────────────────────────┐      ┌─────────────────────────┐     ┌────────────────────┐   │
│   │  Fine-Tuned E5 Model   │      │  Deterministic Engine   │     │  Calculator Core   │   │
│   │ (Multilingual Vectors) │      │  (Statutory NSFDC Rules)│     │  (Moratorium & EMI)│   │
│   └───────────┬────────────┘      └────────────┬────────────┘     └─────────┬──────────┘   │
│               │                                │                            │              │
│               ▼                                ▼                            ▼              │
│   ┌────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                   SQLAlchemy 2 / SQLite (Local) / PostgreSQL + pgvector            │   │
│   └────────────────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────┬────────────────────────────────────────────┘
                                                │ REST API (JSON)
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                             Next.js 16 (App Router) Frontend                               │
│                                                                                            │
│  • Multilingual Guided Search  • Scheme Directory  • Partner Locator  • Audio Narrator     │
└───────────────────────────────────────────────┬────────────────────────────────────────────┘
                                                │ Hand-off
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Official PM-SURAJ Portal│
                                  │  (pmsuraj.dosje.gov.in)   │
                                  └───────────────────────────┘
```

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (React 19, TypeScript) | Modern, responsive citizen UI with Tailwind/CSS styling & Lucide icons. |
| **Backend** | Python 3.12+, FastAPI, Uvicorn | High-performance asynchronous REST API. |
| **AI / NLP** | PyTorch, Sentence-Transformers, HuggingFace | Custom fine-tuned `intfloat/multilingual-e5-small` 384-dimensional embeddings. |
| **Database** | SQLite (zero-setup dev) / PostgreSQL + pgvector | In-process cosine vector search or pgvector HNSW indexing. |
| **Validation** | Pydantic v2 | Strict schema validation with camelCase API contract. |
| **Testing** | Pytest (backend), script-level benchmark/stress checks | Backend unit/integration/API contract coverage and multilingual retrieval evaluation scripts. |

---

## 📂 Project Directory Structure

```text
SIH PROTOTYPE/
├── schemesetu/                      # Next.js 16 Frontend Web Application
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages (/, /find, /schemes, /calculator, /partners)
│   │   ├── components/              # UI, layout, visuals, and audio narration components
│   │   ├── features/                # GuidedSearch, SchemeCard, EMICalculator, PartnerLocator
│   │   ├── services/                # API client, recommendationService, calculatorService, mockData
│   │   └── types/                   # TypeScript interface definitions
│   └── package.json
│
├── schemesetu-backend/              # FastAPI Backend REST API
│   ├── app/
│   │   ├── api/routes/              # API endpoints (/schemes, /recommend, /calculator, /partners, /health)
│   │   ├── core/                    # Application configuration (.env) and security
│   │   ├── db/models/               # SQLAlchemy models (Scheme, EligibilityRule, ChannelPartner, User)
│   │   ├── ingestion/nsfdc/         # Verified datasets + clearly labeled demo partner records
│   │   ├── schemas/                 # Pydantic request/response models
│   │   └── services/                # Semantic search, eligibility engine, recommendation pipeline
│   ├── tests/                       # 68 automated pytest unit and integration tests
│   ├── requirements.txt             # Python dependencies
│   └── schemesetu.db                # Created locally by init/seed steps (gitignored)
│
├── schemesetu_e5_final/             # Fine-tuned Multilingual E5 Embedding Model (optional local download/train output; binary weights are not committed)
│
├── train_e5.py                      # Contrastive fine-tuning training script
├── evaluate_model.py                # Model benchmarking script
├── schemesetu_stress_test.py        # Multi-dialect stress test (Hindi, Tamil, Hinglish, Tanglish)
├── schemesetu_multilingual_pairs.csv# 5,565 domain training pairs dataset
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.10 – v3.12)
- **Git**

---

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd schemesetu-backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv ..\.venv
   ..\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv ../.venv
   source ../.venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-ml.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(By default, `.env` is configured to run zero-setup local SQLite with `intfloat/multilingual-e5-small`. You can set `EMBEDDING_MODEL=./schemesetu_e5_final` after training or downloading local weights.)*

5. Initialize and seed the database:
   ```bash
   python -m scripts.init_db
   python -m seed.seed
   ```
   This creates and seeds the local SQLite database (`schemesetu.db`), which is gitignored for clean clones.

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API Server: `http://localhost:8000`
   - Interactive Swagger Docs: `http://localhost:8000/api/docs`

---

### 2. Frontend Setup (Next.js)

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd schemesetu
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure local environment variables:
   ```bash
   # Ensure .env.local contains:
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit **`http://localhost:3000`**.

---

## 🧪 Running Tests & Benchmarks

### 1. Run Backend Automated Test Suite
```bash
cd schemesetu-backend
..\.venv\Scripts\pytest
```
*(Runs all 68 automated unit, eligibility, partner, calculator, and API contract tests).*

### 2. Run Multilingual AI Stress Test
```bash
python schemesetu_stress_test.py
```
*(Evaluates retrieval accuracy across Hindi, Tamil, Hinglish, Tanglish, and noisy citizen queries).*

### Model Weights
- Reproduce local fine-tuned weights with:
  ```bash
  python train_e5.py
  ```
- Or download model weights from Hugging Face.
- Large binary model artifacts are intentionally excluded from Git (GitHub's 100 MB file limit).

### 3. Build Frontend for Production
```bash
cd schemesetu
npm run build
```

---

## 📊 AI Model Fine-Tuning & Evaluation Results

The fine-tuned **SchemeSetu E5 Model** demonstrates significant margin separation improvement over base pretrained models:

| Metric / Scenario | Base Model (`intfloat/multilingual-e5-small`) | SchemeSetu Fine-Tuned E5 | Improvement |
| :--- | :--- | :--- | :--- |
| **Sanitation & Safai Karamchari Queries** | +0.284 Margin | **+0.612 Margin** | **+115.4% Separation** |
| **Higher Education Abroad Queries** | +0.312 Margin | **+0.589 Margin** | **+88.7% Separation** |
| **Green Business & Solar Queries** | +0.245 Margin | **+0.640 Margin** | **+161.2% Separation** |
| **Artisan & Women Micro-credit (MCF)** | +0.301 Margin | **+0.598 Margin** | **+98.6% Separation** |

---

## 🛡️ Sovereign Compliance & Ethical AI Disclaimers

1. **No Decision Hallucination**: SchemeSetu does not predict, grant, or guarantee loan approval. All final sanctions and verifications are solely performed by authorized State Channelizing Agencies (SCAs) and NSFDC.
2. **Official Gateway**: Beneficiaries are directed to the official **PM-SURAJ** portal (`https://pmsuraj.dosje.gov.in/`) for formal application submission.
3. **Data Provenance**: Financial limits, interest rates, and eligibility criteria are strictly synchronized with official NSFDC notifications (as of 2026 guidelines).

---

## 👥 Smart India Hackathon Team

- **Project**: SchemeSetu — Scheme Discovery, Eligibility & Channel Partner Guidance System
- **Organization / Ministry**: Ministry of Social Justice and Empowerment (MoSJE) / NSFDC

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
