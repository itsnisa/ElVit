from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os

from .services.model_service import load_artifacts, predict_skills
from .services.data_service import load_jobs_data, build_job_category_skills, get_available_categories
from .services.cv_service import extract_text_from_pdf, extract_skills_from_text
from .schemas import (
    GapDetectRequest, GapDetectResponse, SkillItem,
    RecommendRequest, RecommendResponse, RecommendItem,
    HealthResponse, CVParseResponse
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_artifacts()
    df = load_jobs_data()
    app.state.job_category_skills = build_job_category_skills(df)
    app.state.available_categories = get_available_categories(app.state.job_category_skills)
    yield


app = FastAPI(
    title="Skill Gap Detection API",
    description="Deteksi kesenjangan kompetensi profesional IT berbasis model multi-label skill prediction",
    version="2.0.0",
    lifespan=lifespan
)

# ── CORS (allow browser requests from any origin, e.g. Vite dev server) ──────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static HTML pages (celah-*.html) served at root level ────────────────────
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@app.get("/celah-cv", include_in_schema=False)
@app.get("/celah-cv.html", include_in_schema=False)
def serve_celah_cv():
    path = os.path.join(_ROOT, "celah-cv.html")
    if os.path.exists(path):
        return FileResponse(path, media_type="text/html")
    raise HTTPException(status_code=404, detail="celah-cv.html not found")

@app.get("/celah-mockup", include_in_schema=False)
@app.get("/celah-mockup-minimal.html", include_in_schema=False)
def serve_celah_mockup():
    path = os.path.join(_ROOT, "celah-mockup-minimal.html")
    if os.path.exists(path):
        return FileResponse(path, media_type="text/html")
    raise HTTPException(status_code=404, detail="celah-mockup-minimal.html not found")


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health():
    return HealthResponse(
        status="ok",
        model_loaded=True,
        categories_available=len(app.state.available_categories)
    )


@app.get("/job-categories", tags=["Information"])
def list_categories():
    return {
        "count": len(app.state.available_categories),
        "categories": app.state.available_categories
    }


@app.post("/detect-gap", response_model=GapDetectResponse, tags=["Skill Gap"])
def detect_gap(req: GapDetectRequest):
    result = predict_skills(req.skills, req.target_job, req.top_n)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Job category '{req.target_job}' not found. Available: {app.state.available_categories}"
        )
    return GapDetectResponse(
        target_job=result['target_job'],
        benchmark_count=result['benchmark_count'],
        matched=[SkillItem(**m) for m in result['matched']],
        gap=[SkillItem(**g) for g in result['gap']],
        gap_score=result['gap_score'],
        match_score=result['match_score'],
    )


@app.post("/recommend", response_model=RecommendResponse, tags=["Skill Gap"])
def recommend(req: RecommendRequest):
    result = predict_skills(req.skills, req.target_job, req.top_n)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Job category '{req.target_job}' not found. Available: {app.state.available_categories}"
        )
    return RecommendResponse(
        target_job=result['target_job'],
        gap_score=result['gap_score'],
        match_score=result['match_score'],
        recommendations=[RecommendItem(**r) for r in result['recommended']],
    )


@app.post("/parse-cv", response_model=CVParseResponse, tags=["CV Scanner"])
async def parse_cv(file: UploadFile = File(...)):
    """Upload a PDF CV and get detected skills via NLP pipeline."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported. Please upload a .pdf file."
        )

    content_type = file.content_type or ""
    if content_type and "pdf" not in content_type.lower():
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type '{content_type}'. Expected application/pdf."
        )

    try:
        file_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to read uploaded file: {exc}")

    if len(file_bytes) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")

    try:
        raw_text = extract_text_from_pdf(file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    # Collect all known skills across every job category
    all_known_skills: list = []
    for cat_skills in app.state.job_category_skills.values():
        all_known_skills.extend(cat_skills.keys())

    result = extract_skills_from_text(raw_text, all_known_skills)

    return CVParseResponse(**result)
