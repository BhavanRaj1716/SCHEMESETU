# SchemeSetu Backend — Frontend Integration Guide

This backend is pre-configured and pre-seeded for local development.

---

## 1. Starting the Backend in 2 Minutes

### Windows:
```powershell
# 1. Create and activate a virtual environment
py -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Install base dependencies
pip install -r requirements.txt

# 3. Start the server (port 8000)
uvicorn app.main:app --reload --port 8000
```

### macOS / Linux:
```bash
# 1. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install base dependencies
pip install -r requirements.txt

# 3. Start the server (port 8000)
uvicorn app.main:app --reload --port 8000
```

> **Note:** The SQLite database (`schemesetu.db`) is already included and pre-seeded with verified NSFDC schemes and channel partners. You do **not** need to install PostgreSQL or Docker for development.

---

## 2. Connecting Your React / Next.js Frontend

1. **Base URL**: Set your frontend API base URL environment variable to:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   # or for Vite React:
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. **CORS**: Already pre-configured for:
   - `http://localhost:3000` (Next.js / CRA)
   - `http://localhost:5173` (Vite)
   - `http://127.0.0.1:3000` / `http://127.0.0.1:5173`
   *(If your frontend runs on a different port, just add it to `FRONTEND_URL` in `.env`)*

3. **Interactive API Documentation**:
   - Open [http://localhost:8000/api/docs](http://localhost:8000/api/docs) to explore all interactive Swagger endpoints and try payloads.

4. **Authentication in Dev Mode**:
   - The backend runs with `AUTH_MODE=dev`.
   - Any bearer token in the format `Bearer dev:<username>` (e.g. `Bearer dev:priya`) is accepted as an authenticated user for testing profile and saved-schemes screens. No Firebase setup is needed for local development.

---

## 3. Ready-to-Use TypeScript Types & Client

See [`docs/NEXTJS_INTEGRATION.md`](docs/NEXTJS_INTEGRATION.md) for copy-pasteable TypeScript interfaces and fetch client methods (`RecommendRequest`, `RecommendResponse`, `SchemeSummary`, etc.).

Full API contracts, example payloads, and error formats are documented in [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).
