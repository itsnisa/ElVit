from pydantic import BaseModel, Field
from typing import List, Optional


class GapDetectRequest(BaseModel):
    skills: List[str] = Field(..., description="Daftar skill yang dimiliki user")
    target_job: str = Field(..., description="Job category target")
    top_n: Optional[int] = Field(15, description="Jumlah top skill yang diprediksi model")


class SkillItem(BaseModel):
    skill: str
    prob: float = Field(..., description="Probabilitas model bahwa skill dibutuhkan untuk target job")


class GapDetectResponse(BaseModel):
    target_job: str
    benchmark_count: int
    matched: List[SkillItem]
    gap: List[SkillItem]
    gap_score: float
    match_score: float


class RecommendRequest(BaseModel):
    skills: List[str] = Field(..., description="Daftar skill yang dimiliki user")
    target_job: str = Field(..., description="Job category target")
    top_n: Optional[int] = Field(15, description="Jumlah top skill yang diprediksi model")


class RecommendItem(BaseModel):
    skill: str
    prob: float = Field(..., description="Probabilitas model bahwa skill dibutuhkan")
    priority_rank: int = Field(..., description="Urutan prioritas belajar (1 = paling penting)")


class RecommendResponse(BaseModel):
    target_job: str
    gap_score: float
    match_score: float
    recommendations: List[RecommendItem]


class HealthResponse(BaseModel):
    status: str = "ok"
    model_loaded: bool
    categories_available: int


class CVParseResponse(BaseModel):
    detected_skills: List[str] = Field(..., description="Daftar skill yang terdeteksi dari CV")
    skill_count: int = Field(..., description="Jumlah skill yang berhasil terdeteksi")
    raw_text_preview: str = Field("", description="Preview 500 karakter pertama teks CV")
    extraction_notes: str = Field("", description="Info pipeline yang digunakan")
