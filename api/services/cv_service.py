"""
cv_service.py
=============
Handles CV (PDF) parsing and NLP-based skill extraction.

Pipeline:
  1. PyMuPDF  → extract raw text from PDF bytes
  2. spaCy    → tokenise, lemmatise, extract noun-chunks
  3. Multi-layer matching against the job-dataset skill list:
       a. Exact match
       b. Substring / token containment
       c. Noun-chunk heuristic fallback
"""

import re
import io
import logging
from typing import List, Dict, Tuple

logger = logging.getLogger(__name__)

# ── Optional heavy imports (graceful fallback if not installed yet) ───────────
try:
    import fitz  # PyMuPDF
    _FITZ_OK = True
except ImportError:
    _FITZ_OK = False
    logger.warning("PyMuPDF (fitz) not installed – PDF extraction unavailable.")

try:
    import spacy
    _SPACY_MODEL = None  # loaded lazily
    _SPACY_OK = True
except ImportError:
    _SPACY_OK = False
    logger.warning("spaCy not installed – NLP extraction disabled.")


# ── spaCy lazy loader ─────────────────────────────────────────────────────────
def _get_nlp():
    global _SPACY_MODEL
    if not _SPACY_OK:
        return None
    if _SPACY_MODEL is None:
        try:
            _SPACY_MODEL = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning(
                "spaCy model 'en_core_web_sm' not found. "
                "Run: python -m spacy download en_core_web_sm"
            )
    return _SPACY_MODEL


# ── Text cleaning helpers ─────────────────────────────────────────────────────
_NOISE = re.compile(r"[^\w\s\.\+\#\/\-]")
_WHITESPACE = re.compile(r"\s+")

def _clean(text: str) -> str:
    text = _NOISE.sub(" ", text)
    return _WHITESPACE.sub(" ", text).strip()


def _tokenise(text: str) -> List[str]:
    """Split on common CV delimiters and return lowercase tokens."""
    tokens = re.split(r"[\n,;|•·▪▸►\t]+", text)
    result = []
    for t in tokens:
        t = t.strip().lower()
        if 2 <= len(t) <= 60:
            result.append(t)
    return result


# ── PDF extraction ────────────────────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Return concatenated plain text from all pages of a PDF."""
    if not _FITZ_OK:
        raise RuntimeError("PyMuPDF is not installed. Run: pip install PyMuPDF")

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages_text = []
        for page in doc:
            pages_text.append(page.get_text("text"))
        doc.close()
        return "\n".join(pages_text)
    except Exception as exc:
        raise ValueError(f"Could not parse PDF: {exc}") from exc


# ── Skill extraction ──────────────────────────────────────────────────────────
def _build_known_index(known_skills: List[str]) -> Dict[str, str]:
    """Build a normalised lowercase → original mapping for fast lookup."""
    index: Dict[str, str] = {}
    for skill in known_skills:
        norm = skill.strip().lower()
        index[norm] = skill
    return index


def _exact_and_substring_match(
    tokens: List[str],
    known_index: Dict[str, str],
) -> Tuple[List[str], set]:
    """Layer 1 & 2: exact match + substring containment."""
    found: Dict[str, str] = {}  # norm → original
    matched_knowns: set = set()

    for token in tokens:
        # exact
        if token in known_index:
            found[token] = known_index[token]
            matched_knowns.add(token)
            continue

        # substring: token contained in a known skill or vice versa
        for known_norm, known_orig in known_index.items():
            if known_norm in matched_knowns:
                continue
            if (
                (len(token) >= 3 and token in known_norm)
                or (len(known_norm) >= 3 and known_norm in token)
            ):
                found[known_norm] = known_orig
                matched_knowns.add(known_norm)
                break

    return list(found.values()), matched_knowns


def _spacy_noun_chunk_match(
    text: str,
    known_index: Dict[str, str],
    already_found: set,
) -> List[str]:
    """Layer 3: extract noun-chunks via spaCy and match against known skills."""
    nlp = _get_nlp()
    if nlp is None:
        return []

    extra: Dict[str, str] = {}
    doc = nlp(text[:50_000])  # cap for performance

    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.strip().lower()
        chunk_text = re.sub(r"\s+", " ", chunk_text)

        if chunk_text in known_index and chunk_text not in already_found:
            extra[chunk_text] = known_index[chunk_text]
            continue

        # partial overlap with known skills (for multi-word phrases)
        for known_norm, known_orig in known_index.items():
            if known_norm in already_found or known_norm in extra:
                continue
            if len(known_norm.split()) > 1:
                if known_norm in chunk_text or chunk_text in known_norm:
                    extra[known_norm] = known_orig
                    break

    return list(extra.values())


def extract_skills_from_text(
    text: str,
    known_skills: List[str],
    max_skills: int = 60,
) -> Dict:
    """
    Main NLP pipeline.

    Returns:
        {
          "detected_skills": [...],       # cleaned list ready for /detect-gap
          "skill_count": N,
          "raw_text_preview": "...",      # first 500 chars for UI preview
          "extraction_notes": "..."       # info about pipeline used
        }
    """
    if not text or not text.strip():
        return {
            "detected_skills": [],
            "skill_count": 0,
            "raw_text_preview": "",
            "extraction_notes": "No text extracted from PDF.",
        }

    cleaned_text = _clean(text)
    known_index = _build_known_index(known_skills)
    tokens = _tokenise(cleaned_text)

    # Layer 1 + 2: exact & substring
    skills_l1, matched_set = _exact_and_substring_match(tokens, known_index)

    # Layer 3: spaCy noun chunks (additive)
    skills_l3 = _spacy_noun_chunk_match(cleaned_text, known_index, matched_set)

    # Merge, deduplicate, cap
    all_skills_norm: Dict[str, str] = {}
    for s in skills_l1 + skills_l3:
        norm = s.strip().lower()
        all_skills_norm[norm] = s

    final_skills = list(all_skills_norm.values())[:max_skills]

    notes = "Keyword matching"
    if _SPACY_OK and _get_nlp() is not None:
        notes = "Keyword matching + spaCy NLP (en_core_web_sm)"
    elif not _SPACY_OK:
        notes = "Keyword matching only (spaCy not installed)"

    return {
        "detected_skills": final_skills,
        "skill_count": len(final_skills),
        "raw_text_preview": cleaned_text[:500],
        "extraction_notes": notes,
    }
