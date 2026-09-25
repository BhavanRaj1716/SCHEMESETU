"""
SchemeSetu Latency Profiler & Benchmark
Measures latency breakdown for every single stage of the AI and search pipeline.
"""
import time
import statistics
import urllib.request
import json
import numpy as np

print("=" * 65)
print("  SchemeSetu Pipeline Latency & Performance Benchmark")
print("=" * 65)

# --- 1. Load Components ---
print("\n[Stage 0] Initializing and warming up Backend Services...")
t0 = time.perf_counter()
from app.db.database import SessionLocal
from app.services.embedding_service import get_embedding_service
from app.services.recommendation_service import RecommendationService, normalize_text
from app.services.semantic_search import SemanticSearch
from app.schemas.recommend import RecommendRequest

db = SessionLocal()
embedder = get_embedding_service()
rec_service = RecommendationService(db, embedder)
searcher = SemanticSearch(db)

# Warmup run
_ = embedder.embed_one("Warmup query for torch")
init_time_ms = (time.perf_counter() - t0) * 1000
print(f"  Initialized in {init_time_ms:.2f} ms")

# --- 2. Test Queries ---
test_queries = [
    "I need a loan to purchase mechanized sewer cleaning equipment for sanitation workers",
    "SC student wanting to pursue MS in computer science at recognized university abroad",
    "Woman artisan needing micro loan up to 50000 rupees to buy handloom and sewing machines",
    "Government subsidy and loan to set up rooftop solar panels and battery operated e-rickshaw"
]

N_ROUNDS = 50

# --- Benchmark Stage 1: Text Normalization ---
norm_times = []
for _ in range(N_ROUNDS):
    for q in test_queries:
        t_start = time.perf_counter()
        _ = normalize_text(q)
        norm_times.append((time.perf_counter() - t_start) * 1000)

# --- Benchmark Stage 2: MiniLM Embedding Inference ---
embed_times = []
for _ in range(N_ROUNDS):
    for q in test_queries:
        t_start = time.perf_counter()
        vec = embedder.embed_one(q)
        embed_times.append((time.perf_counter() - t_start) * 1000)

# --- Benchmark Stage 3: In-Memory Vector Cosine Retrieval ---
sample_vec = embedder.embed_one(test_queries[0])
search_times = []
for _ in range(N_ROUNDS):
    t_start = time.perf_counter()
    candidates = searcher.search(sample_vec, top_k=5, min_similarity=0.05)
    search_times.append((time.perf_counter() - t_start) * 1000)

# --- Benchmark Stage 4: Full In-Process Recommendation Pipeline ---
req = RecommendRequest(
    purpose="I need a loan to purchase mechanized sewer cleaning equipment for sanitation workers",
    beneficiary_category="SC",
    annual_income=150000,
    age=28,
    loan_required=200000,
    project_cost=250000
)
pipeline_times = []
for _ in range(N_ROUNDS):
    t_start = time.perf_counter()
    res = rec_service.recommend(req)
    pipeline_times.append((time.perf_counter() - t_start) * 1000)

# --- Benchmark Stage 5: Live HTTP API Latency (via localhost:8000) ---
http_times = []
api_available = False
try:
    http_payload = json.dumps({
        "purpose": "I need a loan to purchase mechanized sewer cleaning equipment",
        "beneficiaryCategory": "SC",
        "annualIncome": 150000,
        "age": 28,
        "loanRequired": 200000,
        "projectCost": 250000
    }).encode("utf-8")
    
    for _ in range(20):
        t_start = time.perf_counter()
        req_obj = urllib.request.Request(
            "http://127.0.0.1:8000/api/schemes/recommend",
            data=http_payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req_obj, timeout=2) as response:
            _ = response.read()
        http_times.append((time.perf_counter() - t_start) * 1000)
    api_available = True
except Exception as e:
    api_err = str(e)

# --- Print Breakdown Results ---
def stats(arr):
    return {
        "mean": statistics.mean(arr),
        "median": statistics.median(arr),
        "p95": np.percentile(arr, 95),
        "min": min(arr),
        "max": max(arr)
    }

s_norm = stats(norm_times)
s_emb = stats(embed_times)
s_search = stats(search_times)
s_pipe = stats(pipeline_times)

print("\n" + "=" * 65)
print("  STAGE-BY-STAGE LATENCY BREAKDOWN (Over 200 Runs)")
print("=" * 65)
print(f"1. Text Preprocessing & Cleaning : {s_norm['mean']*1000:.1f} µs (Mean) | Min: {s_norm['min']*1000:.1f} µs")
print(f"2. MiniLM Transformer Inference  : {s_emb['mean']:.2f} ms (Mean) | Median: {s_emb['median']:.2f} ms | P95: {s_emb['p95']:.2f} ms")
print(f"3. Vector Cosine Search (Top-5)  : {s_search['mean']:.2f} ms (Mean) | Median: {s_search['median']:.2f} ms | P95: {s_search['p95']:.2f} ms")
print(f"4. Rule Engine + Financial Fit   : {(s_pipe['mean'] - s_emb['mean'] - s_search['mean']):.2f} ms (Mean)")
print("-" * 65)
print(f"[TOTAL] Full Python Pipeline (Local) : {s_pipe['mean']:.2f} ms (Mean) | Median: {s_pipe['median']:.2f} ms | P95: {s_pipe['p95']:.2f} ms")

if api_available:
    s_http = stats(http_times)
    print(f"[HTTP]  Live API (Network Over HTTP)  : {s_http['mean']:.2f} ms (Mean) | Median: {s_http['median']:.2f} ms | P95: {s_http['p95']:.2f} ms")
else:
    print(f"[HTTP]  Live HTTP API: Backend server not currently running on :8000 ({api_err})")

print("=" * 65)
