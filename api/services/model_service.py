import os
import json
import joblib
import numpy as np
from scipy.sparse import hstack, csr_matrix

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
FINAL_DIR = os.path.join(BASE_DIR, 'final_model')
MODEL_PATH = os.path.join(FINAL_DIR, 'skill_model.joblib')
TFIDF_PATH = os.path.join(FINAL_DIR, 'tfidf_skills.pkl')
CANDIDATE_PATH = os.path.join(FINAL_DIR, 'candidate_skills.json')
CATEGORIES_PATH = os.path.join(FINAL_DIR, 'categories.json')

_model = None
_tfidf = None
_candidate_skills = None
_categories = None
_cat_to_idx = None
_lower_to_cat = None


def skill_tokenizer(text):
    return [s.strip() for s in str(text).split(',') if s.strip()]


def load_artifacts():
    global _model, _tfidf, _candidate_skills, _categories, _cat_to_idx, _lower_to_cat
    if _model is not None:
        return
    import __main__
    if not hasattr(__main__, 'skill_tokenizer'):
        __main__.skill_tokenizer = skill_tokenizer
    _model = joblib.load(MODEL_PATH)
    _tfidf = joblib.load(TFIDF_PATH)
    with open(CANDIDATE_PATH, 'r', encoding='utf-8') as f:
        _candidate_skills = json.load(f)
    with open(CATEGORIES_PATH, 'r', encoding='utf-8') as f:
        _categories = json.load(f)
    _cat_to_idx = {c: i for i, c in enumerate(_categories)}
    _lower_to_cat = {c.lower(): c for c in _categories}


def predict_skills(user_skills, target_job, top_n=15):
    """Prediksi skill yang dibutuhkan + rekomendasi skill yang harus dipelajari (multi-label ML)."""
    load_artifacts()
    cat = _lower_to_cat.get(str(target_job).strip().lower())
    if cat is None:
        return None

    ctx = ', '.join(s.strip().lower() for s in user_skills)
    x_ctx = _tfidf.transform([ctx])

    n_cat = len(_categories)
    onehot = np.zeros((1, n_cat))
    onehot[0, _cat_to_idx[cat]] = 1.0
    X = hstack([x_ctx, csr_matrix(onehot)]).tocsr()

    probs = _model.predict_proba(X)[0]
    top_idx = np.argsort(-probs)[:top_n]
    required = [
        {'skill': _candidate_skills[j], 'prob': round(float(probs[j]), 4)}
        for j in top_idx
    ]

    user_norm = set(s.strip().lower() for s in user_skills)
    matched, gap = [], []
    for r in required:
        is_match = any(r['skill'] in u or u in r['skill'] for u in user_norm)
        if is_match:
            matched.append(r)
        else:
            gap.append(r)

    gap_score = len(gap) / len(required) * 100 if required else 0
    recommended = [dict(g, priority_rank=i + 1) for i, g in enumerate(gap)]

    return {
        'target_job': cat,
        'benchmark_count': len(required),
        'required': required,
        'matched': matched,
        'gap': gap,
        'recommended': recommended,
        'gap_score': round(gap_score, 1),
        'match_score': round(100 - gap_score, 1),
    }
