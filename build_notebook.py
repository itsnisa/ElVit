"""
Script untuk membuat notebook CRISP-DM baru — Prediksi Skill (Multi-Label)
PENDEKATAN ORIGINAL — tidak mengikuti notebook MultiLabel.

Fitur utama: TF-IDF dari Description + Soft Skills + one-hot Query + engineered features
Model: 5 model sama seperti CRISP-DM asli (LR, RF, SVM, XGBoost, LightGBM) diadaptasi multi-label
"""
import json, copy, sys, uuid

sys.stdout.reconfigure(encoding='utf-8')

# Load notebook asli
with open('Skill_Gap_Detection_CRISP_DM.ipynb', 'r', encoding='utf-8') as f:
    nb_orig = json.load(f)

# ── Helpers ──────────────────────────────────────────────────────────
def md_cell(source):
    lines = source.split("\n")
    return {
        "cell_type": "markdown", "id": str(uuid.uuid4())[:8],
        "metadata": {},
        "source": [s + "\n" if i < len(lines) - 1 else s for i, s in enumerate(lines)]
    }

def code_cell(source):
    lines = source.split("\n")
    return {
        "cell_type": "code", "execution_count": None,
        "id": str(uuid.uuid4())[:8], "metadata": {}, "outputs": [],
        "source": [s + "\n" if i < len(lines) - 1 else s for i, s in enumerate(lines)]
    }

def copy_cell(idx):
    """Copy cell dari notebook original, clear outputs."""
    c = copy.deepcopy(nb_orig['cells'][idx])
    c['outputs'] = []
    if c['cell_type'] == 'code':
        c['execution_count'] = None
    c['id'] = str(uuid.uuid4())[:8]
    return c

# ═══════════════════════════════════════════════════════════════════
#  BUILD NEW NOTEBOOK
# ═══════════════════════════════════════════════════════════════════
cells = []

# ────────────────────────────────────────────────────────────────────
# CELL: Title (MODIFIED)
# ────────────────────────────────────────────────────────────────────
cells.append(md_cell("""# Deteksi Kesenjangan Kompetensi Profesional IT
## Pendekatan CRISP-DM: Skill Gap Detection & Skill Prediction (Multi-Label)

---

**Metode:** CRISP-DM (Cross-Industry Standard Process for Data Mining)  
**Standar Kompetensi:** SKKNI & SFIA  
**Sumber Data:** Kaggle — IT Skills from Jobs & NER Skill Annotation

Project ini digunakan untuk scan CV — user mengupload CV ke website, sistem mendeteksi skill yang dimiliki, lalu membandingkan dengan skill yang dibutuhkan berdasarkan job category yang dipilih. Sistem akan menampilkan gap dan merekomendasikan skill yang harus dikembangkan.

**Fokus modeling:** Prediksi skill yang dibutuhkan per job category menggunakan multi-label classification.  
**Pendekatan:** Menggunakan fitur deskripsi pekerjaan (TF-IDF Description) untuk memprediksi skill yang dibutuhkan."""))

# ────────────────────────────────────────────────────────────────────
# CELL: Import Library header + code (MODIFIED)
# ────────────────────────────────────────────────────────────────────
cells.append(md_cell("""---
## Import Library"""))

cells.append(code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from collections import Counter, defaultdict
import re
import warnings
import time

warnings.filterwarnings('ignore')

pd.set_option('display.max_columns', None)
pd.set_option('display.max_colwidth', 80)
plt.rcParams['figure.dpi'] = 120
plt.rcParams['font.family'] = 'DejaVu Sans'
sns.set_theme(style='whitegrid', palette='muted')

print("Library berhasil diimpor.")

# ML imports
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.multiclass import OneVsRestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, KFold
from sklearn.metrics import (hamming_loss, accuracy_score, precision_score,
                             recall_score, f1_score, classification_report,
                             multilabel_confusion_matrix, roc_curve, auc,
                             precision_recall_curve, average_precision_score)
from scipy.sparse import hstack, csr_matrix
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier"""))

# ────────────────────────────────────────────────────────────────────
# TAHAP 1 — BUSINESS UNDERSTANDING (MODIFIED)
# ────────────────────────────────────────────────────────────────────
cells.append(md_cell("""---
## TAHAP 1 — BUSINESS UNDERSTANDING

### 1.1 Latar Belakang Permasalahan

Industri teknologi informasi berkembang pesat, namun terdapat **kesenjangan kompetensi (*skill gap*)** yang signifikan antara keterampilan yang dimiliki profesional IT dengan kebutuhan nyata industri. Kondisi ini menyebabkan:

- Kesulitan profesional IT dalam mengidentifikasi keterampilan yang perlu ditingkatkan untuk posisi tertentu
- Ketidaksesuaian antara kompetensi yang dikuasai dengan standar yang diminta oleh industri
- Kurangnya panduan berbasis data untuk pengembangan karir di bidang IT

Penelitian ini bertujuan untuk **mendeteksi kesenjangan kompetensi profesional IT berdasarkan benchmark industri** menggunakan data lowongan kerja nyata dan anotasi NER keterampilan.

### 1.2 Tujuan Penelitian

1. **Mendeteksi** gap antara skill yang dimiliki user dengan skill yang dibutuhkan industri berdasarkan data lowongan kerja nyata
2. **Mengidentifikasi** keterampilan IT yang paling dibutuhkan industri berdasarkan data lowongan kerja nyata
3. **Membangun** model ML multi-label yang memprediksi skill yang dibutuhkan berdasarkan deskripsi pekerjaan dan job category
4. **Merekomendasikan** skill yang perlu dipelajari berdasarkan hasil prediksi model untuk masing-masing kategori pekerjaan

### 1.3 Standar Kompetensi Acuan

| Standar | Deskripsi |
|---|---|
| **SKKNI** | Standar Kompetensi Kerja Nasional Indonesia |
| **SFIA** | Skills Framework for the Information Age |

### 1.4 Pertanyaan Penelitian

- Skill apa yang paling sering menjadi gap di tiap *job category*?
- *Job category* mana yang memiliki *requirement* skill tertinggi?
- Model *machine learning multi-label* mana yang paling akurat memprediksi skill yang dibutuhkan berdasarkan deskripsi pekerjaan?"""))

# ────────────────────────────────────────────────────────────────────
# TAHAP 2 — DATA UNDERSTANDING (cells 4–12 from original, + new 13-14)
# ────────────────────────────────────────────────────────────────────
for i in range(4, 13):
    cells.append(copy_cell(i))

# Replace seniority distribution with job category distribution
cells.append(md_cell("""---
### 2.4 Eksplorasi Data Visualisasi

#### 2.4.1 Distribusi Jumlah Posting per Job Category"""))

cells.append(code_cell("""# === 2.4.1 Distribusi Jumlah Posting per Job Category ===
cat_counts = df_jobs['Query'].value_counts()
print("Distribusi Jumlah Posting per Job Category:")
for cat, cnt in cat_counts.items():
    print(f"  {cat:40s}: {cnt:4d} ({cnt/len(df_jobs)*100:.1f}%)")

fig, ax = plt.subplots(figsize=(12, 6))
colors = sns.color_palette('viridis', len(cat_counts))
bars = ax.barh(cat_counts.index[::-1], cat_counts.values[::-1], color=colors)
ax.set_xlabel('Jumlah Posting')
ax.set_title('Distribusi Posting per Job Category', fontsize=14, fontweight='bold')
for bar, val in zip(bars, cat_counts.values[::-1]):
    ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
            str(val), va='center', fontsize=8)
plt.tight_layout()
plt.savefig('images/Distribusi_Posting_per_JobCategory.png', bbox_inches='tight')
plt.show()"""))

# Keep EDA cells 15–27 (skill distributions, heatmap, NER, etc.)
for i in range(15, 28):
    cells.append(copy_cell(i))

# Summary cell (FIXED — no seniority)
cells.append(md_cell("""---
### 2.5 Ringkasan Data Understanding"""))

cells.append(code_cell("""summary = pd.DataFrame([
    {'Dataset': 'IT Skills from Jobs', 'Jumlah Baris': f"{df_jobs.shape[0]:,}",
     'Jumlah Kolom': df_jobs.shape[1], 'Missing Values': int(df_jobs.isnull().sum().sum()),
     'Fitur Utama': 'IT Skills, Soft Skills, Job Title, Description'},
    {'Dataset': 'NER Skill Annotation', 'Jumlah Baris': f"{df_ner.shape[0]:,}",
     'Jumlah Kolom': df_ner.shape[1], 'Missing Values': int(df_ner.isnull().sum().sum()),
     'Fitur Utama': 'Word, Tag (B/I-HSkill, B/I-Tech, B/I-SSkill)'}
])
print("RINGKASAN DATASET")
print("=" * 90)
print(summary.set_index('Dataset').to_string())

print("\\n\\nTEMUAN UTAMA:")
print("=" * 90)
print(f"1. Terdapat {df_jobs['Query'].nunique()} kategori pekerjaan IT dengan {len(df_jobs):,} posting")
print(f"2. Rata-rata skill per posting: {df_jobs['skill_count'].mean():.1f}")
print(f"3. Missing value tinggi pada Education ({df_jobs['Education'].eq('').sum()}) dan Experience ({df_jobs['Experience'].eq('').sum()})")
print(f"4. Dataset NER memiliki {df_ner.shape[0]:,} token dengan {df_ner[df_ner['Tag'] != 'O'].shape[0]:,} entitas skill")
print(f"5. Distribusi job category:")
for cat, cnt in df_jobs['Query'].value_counts().head(5).items():
    print(f"   - {cat:40s}: {cnt:4d} ({cnt/len(df_jobs)*100:.1f}%)")"""))

# ────────────────────────────────────────────────────────────────────
# TAHAP 3 — DATA PREPARATION (ORIGINAL APPROACH)
# ────────────────────────────────────────────────────────────────────
cells.append(md_cell("""---
## TAHAP 3 — DATA PREPARATION

### 3.1 Normalisasi dan Pembersihan"""))

cells.append(code_cell("""# === 3.1 Normalisasi dan Pembersihan ===
def normalize_skills(skill_str):
    \"\"\"Normalisasi string skill: lowercase, strip, deduplikasi, sort.\"\"\"
    if pd.isna(skill_str):
        return ''
    skills = [s.strip().lower() for s in str(skill_str).split(',')]
    skills = [s for s in skills if s]
    return ', '.join(sorted(set(skills)))

df_jobs['IT_Skills_Clean'] = df_jobs['IT Skills'].apply(normalize_skills)
df_jobs['Soft_Skills_Clean'] = df_jobs['Soft Skills'].apply(normalize_skills)

# Daftar semua skill unik dari dataset
all_skills = []
for s in df_jobs['IT_Skills_Clean']:
    all_skills.extend([x.strip() for x in s.split(',') if x.strip()])
skill_counter = Counter(all_skills)

# Industri IT skills benchmark
industry_it_skills = set(skill_counter.keys())

# Job category → skill mapping (untuk gap detection nanti)
job_category_skills = {}
for cat in df_jobs['Query'].unique():
    subset = df_jobs[df_jobs['Query'] == cat]['IT_Skills_Clean']
    cat_skills = []
    for s in subset:
        cat_skills.extend([x.strip() for x in s.split(',') if x.strip()])
    job_category_skills[cat] = dict(Counter(cat_skills))

print("=" * 60)
print("  NORMALISASI & PEMBERSIHAN")
print("=" * 60)
print(f"  Total skill unik (industri)    : {len(industry_it_skills):,}")
print(f"  Job categories                 : {len(job_category_skills)}")
print(f"  Rata-rata skill per posting    : {df_jobs['skill_count'].mean():.1f}")
print(f"  Data siap untuk multi-label    : {len(df_jobs):,} baris")"""))

# NER Skill Vocabulary (keep from original)
cells.append(md_cell("""---
### 3.2 Skill Vocabulary dari NER"""))
cells.append(copy_cell(33))  # original cell 33: NER processing

# Kandidat Skill Target
cells.append(md_cell("""---
### 3.3 Kandidat Skill Target (Multi-Label)"""))

cells.append(code_cell("""# === 3.3 Kandidat Skill Target (Multi-Label) ===
# Ambil top-N skill yang paling sering muncul sebagai label target
TOP_N_SKILLS = 150

skill_freq = Counter()
for s in df_jobs['IT_Skills_Clean']:
    for tok in s.split(','):
        tok = tok.strip()
        if tok:
            skill_freq[tok] += 1

candidate_skills = [s for s, _ in skill_freq.most_common(TOP_N_SKILLS)]

print("=" * 65)
print(f"  KANDIDAT SKILL TARGET: top-{TOP_N_SKILLS}")
print("=" * 65)
print(f"  Total skill unik: {len(skill_freq):,}")
print(f"  Kandidat label  : {TOP_N_SKILLS}")
print(f"\\n  Top-15 skill:")
for i, (s, freq) in enumerate(skill_freq.most_common(15), 1):
    print(f"    {i:2d}. {s:30s} ({freq:,} kemunculan)")

# Buat binary multi-label matrix
label_matrix = np.zeros((len(df_jobs), TOP_N_SKILLS), dtype=np.int8)
for i, row in enumerate(df_jobs['IT_Skills_Clean']):
    user_skills = set(tok.strip() for tok in row.split(',') if tok.strip())
    for j, skill in enumerate(candidate_skills):
        if skill in user_skills:
            label_matrix[i, j] = 1

avg_labels = label_matrix.sum(axis=1).mean()
print(f"\\n  Rata-rata label per instance   : {avg_labels:.1f}")
print(f"  Shape label_matrix             : {label_matrix.shape}")
print(f"  Total label positif            : {label_matrix.sum():,}")"""))

# Feature Engineering (ORIGINAL — from Description)
cells.append(md_cell("""---
### 3.4 Feature Engineering

Fitur dibangun dari **deskripsi pekerjaan** (Description), **Soft Skills**, dan metadata posting:
- **TF-IDF Description** — menangkap konteks pekerjaan dari teks deskripsi lowongan
- **TF-IDF Soft Skills** — menangkap soft skill yang diminta
- **One-hot Query** — encoding kategori pekerjaan
- **education_level** — level pendidikan yang diminta
- **soft_skill_count** — jumlah soft skill
- **skill_count** — jumlah IT skill (indikator kompleksitas)"""))

cells.append(code_cell("""# === 3.4 Feature Engineering ===

# (a) TF-IDF dari Description — fitur utama
tfidf_desc = TfidfVectorizer(max_features=300, stop_words='english',
                              ngram_range=(1, 2), min_df=3, max_df=0.95)
X_desc = tfidf_desc.fit_transform(df_jobs['Description'].fillna(''))
print(f"  TF-IDF Description  : {X_desc.shape[1]} fitur")

# (b) TF-IDF dari Soft Skills
tfidf_soft = TfidfVectorizer(max_features=50, token_pattern=r'[^,]+')
X_soft = tfidf_soft.fit_transform(df_jobs['Soft_Skills_Clean'].fillna(''))
print(f"  TF-IDF Soft Skills  : {X_soft.shape[1]} fitur")

# (c) One-hot encoding Query (job category)
categories = sorted(df_jobs['Query'].unique())
cat_to_idx = {c: i for i, c in enumerate(categories)}
N_CAT = len(categories)

def onehot(idx, size):
    v = np.zeros(size, dtype=np.float32)
    v[idx] = 1.0
    return v

X_cat = csr_matrix(np.array([onehot(cat_to_idx[q], N_CAT) for q in df_jobs['Query']]))
print(f"  One-hot Query       : {X_cat.shape[1]} fitur")

# (d) Education level encoding
def parse_education_level(edu_str):
    if pd.isna(edu_str) or str(edu_str).strip() == '':
        return 1
    edu = str(edu_str).lower()
    if any(k in edu for k in ['phd', 'doctorate', 'doctor']): return 4
    if any(k in edu for k in ['master', 'msc', 'ms ', 'mba', 'm.s']): return 3
    if any(k in edu for k in ['bachelor', 'bsc', 'bs ', 'degree', 'undergraduate']): return 2
    return 1

df_jobs['education_level'] = df_jobs['Education'].apply(parse_education_level)

# (e) Soft skill count & skill count (sudah ada dari EDA)
df_jobs['soft_skill_count'] = df_jobs['Soft Skills'].apply(
    lambda x: len([s.strip() for s in str(x).split(',') if s.strip()]) if pd.notna(x) else 0
)

# (f) Fitur numerik tambahan
extra_feats = df_jobs[['education_level', 'soft_skill_count', 'skill_count']].values
X_extra = csr_matrix(extra_feats.astype(np.float32))
print(f"  Fitur numerik       : {X_extra.shape[1]} fitur")

# Gabungkan semua fitur
X_all = hstack([X_desc, X_soft, X_cat, X_extra]).tocsr()
Y_all = label_matrix

print(f"\\n  TOTAL FITUR         : {X_all.shape[1]}")
print(f"  Total instance      : {X_all.shape[0]:,}")
print(f"  Dimensi fitur       : TF-IDF Desc({X_desc.shape[1]}) + TF-IDF Soft({X_soft.shape[1]}) + One-hot({N_CAT}) + Numerik({X_extra.shape[1]})")"""))

# Train-Test Split
cells.append(md_cell("""---
### 3.5 Train-Test Split"""))

cells.append(code_cell("""# === 3.5 Train-Test Split ===
# Stratified split berdasarkan Query (job category)
X_train, X_test, Y_train, Y_test, idx_train, idx_test = train_test_split(
    X_all, Y_all, np.arange(len(df_jobs)),
    test_size=0.20, random_state=42,
    stratify=df_jobs['Query']
)

print("=" * 65)
print("  TRAIN-TEST SPLIT")
print("=" * 65)
print(f"  Train : {X_train.shape[0]:,} sampel × {X_train.shape[1]} fitur")
print(f"  Test  : {X_test.shape[0]:,} sampel × {X_test.shape[1]} fitur")
print(f"  Label : {Y_train.shape[1]} kandidat skill (binary multi-label)")
print(f"\\n  Rata-rata label per instance:")
print(f"    Train : {Y_train.sum(axis=1).mean():.1f}")
print(f"    Test  : {Y_test.sum(axis=1).mean():.1f}")"""))

# ────────────────────────────────────────────────────────────────────
# TAHAP 4 — MODELING (5 MODEL SAMA, DIADAPTASI MULTI-LABEL)
# ────────────────────────────────────────────────────────────────────
cells.append(md_cell("""---
## TAHAP 4 — MODELING

### 4.1 Training 5 Model Multi-Label

Menggunakan **5 model yang sama** dengan CRISP-DM asli, diadaptasi untuk multi-label classification:

| No | Model | Implementasi Multi-Label |
|---|---|---|
| 1 | Logistic Regression | `OneVsRestClassifier(LogisticRegression)` |
| 2 | Random Forest | `RandomForestClassifier` (native multi-output) |
| 3 | SVM | `OneVsRestClassifier(SVC(probability=True))` |
| 4 | XGBoost | `OneVsRestClassifier(XGBClassifier)` |
| 5 | LightGBM | `OneVsRestClassifier(LGBMClassifier)` |"""))

cells.append(code_cell("""# === 4.1 Training 5 Model Multi-Label ===

models = {}
predictions = {}
probabilities = {}

print("=" * 70)
print("  MODELING MULTI-LABEL — PREDIKSI SKILL (5 MODEL)")
print("=" * 70)

# ── 1. Logistic Regression ──
t0 = time.time()
lr_model = OneVsRestClassifier(
    LogisticRegression(C=1.0, max_iter=2000, solver='liblinear'), n_jobs=-1)
lr_model.fit(X_train, Y_train)
models['Logistic Regression'] = lr_model
probabilities['Logistic Regression'] = lr_model.predict_proba(X_test)
predictions['Logistic Regression'] = lr_model.predict(X_test)
print(f"  [OK] Logistic Regression    ({time.time()-t0:.1f}s)")

# ── 2. Random Forest ──
t0 = time.time()
rf_model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
rf_model.fit(X_train, Y_train)
models['Random Forest'] = rf_model
probabilities['Random Forest'] = rf_model.predict_proba(X_test)
predictions['Random Forest'] = rf_model.predict(X_test)
print(f"  [OK] Random Forest          ({time.time()-t0:.1f}s)")

# ── 3. SVM ──
t0 = time.time()
svm_model = OneVsRestClassifier(
    SVC(kernel='linear', probability=True, C=1.0, random_state=42), n_jobs=-1)
svm_model.fit(X_train, Y_train)
models['SVM'] = svm_model
probabilities['SVM'] = svm_model.predict_proba(X_test)
predictions['SVM'] = svm_model.predict(X_test)
print(f"  [OK] SVM                    ({time.time()-t0:.1f}s)")

# ── 4. XGBoost ──
t0 = time.time()
xgb_model = OneVsRestClassifier(
    XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1,
                  use_label_encoder=False, eval_metric='logloss',
                  random_state=42, verbosity=0), n_jobs=-1)
xgb_model.fit(X_train, Y_train)
models['XGBoost'] = xgb_model
probabilities['XGBoost'] = xgb_model.predict_proba(X_test)
predictions['XGBoost'] = xgb_model.predict(X_test)
print(f"  [OK] XGBoost                ({time.time()-t0:.1f}s)")

# ── 5. LightGBM ──
t0 = time.time()
lgbm_model = OneVsRestClassifier(
    LGBMClassifier(n_estimators=100, max_depth=6, learning_rate=0.1,
                   random_state=42, verbose=-1), n_jobs=-1)
lgbm_model.fit(X_train, Y_train)
models['LightGBM'] = lgbm_model
probabilities['LightGBM'] = lgbm_model.predict_proba(X_test)
predictions['LightGBM'] = lgbm_model.predict(X_test)
print(f"  [OK] LightGBM               ({time.time()-t0:.1f}s)")

print(f"\\n  Total model terlatih: {len(models)}")"""))

# Perbandingan Performa
cells.append(md_cell("""---
### 4.2 Perbandingan Performa Model"""))

cells.append(code_cell("""# === 4.2 Perbandingan Performa 5 Model ===

def topk_precision(Y_true, scores, k):
    \"\"\"Precision@K: proporsi top-K prediksi yang benar.\"\"\"
    preds = np.argsort(-scores, axis=1)[:, :k]
    vals = [Y_true[i, pidx].sum() / k for i, pidx in enumerate(preds)]
    return float(np.mean(vals))

def topk_recall(Y_true, scores, k):
    \"\"\"Recall@K: proporsi label benar yang masuk top-K.\"\"\"
    preds = np.argsort(-scores, axis=1)[:, :k]
    vals = []
    for i, pidx in enumerate(preds):
        denom = Y_true[i].sum()
        if denom > 0:
            vals.append(Y_true[i, pidx].sum() / denom)
    return float(np.mean(vals)) if vals else 0.0

def get_proba_matrix(model_name):
    \"\"\"Dapatkan probability matrix — handle berbagai format output.\"\"\"
    p = probabilities[model_name]
    if isinstance(p, list):
        p = np.array([col[:, 1] if col.ndim == 2 else col for col in p]).T
    elif p.ndim == 3:
        p = p[:, :, 1]
    return p

# Hitung metrics untuk semua model
results = {}
KS = (5, 10, 15)

for name in models:
    proba = get_proba_matrix(name)
    pred = predictions[name]

    row = {
        'Hamming Loss': round(hamming_loss(Y_test, pred), 4),
        'Subset Accuracy': round(accuracy_score(Y_test, pred), 4) if hasattr(Y_test, 'shape') else 0,
        'Micro F1': round(f1_score(Y_test, pred, average='micro', zero_division=0), 4),
        'Macro F1': round(f1_score(Y_test, pred, average='macro', zero_division=0), 4),
    }
    for k in KS:
        p_at_k = topk_precision(Y_test, proba, k)
        r_at_k = topk_recall(Y_test, proba, k)
        f1_at_k = 2 * p_at_k * r_at_k / (p_at_k + r_at_k) if (p_at_k + r_at_k) else 0.0
        row[f'P@{k}'] = round(p_at_k, 4)
        row[f'R@{k}'] = round(r_at_k, 4)
        row[f'F1@{k}'] = round(f1_at_k, 4)

    results[name] = row

# Hitung Subset Accuracy secara manual
for name in models:
    pred = predictions[name]
    exact_match = np.all(Y_test == pred, axis=1).mean()
    results[name]['Subset Accuracy'] = round(exact_match, 4)

df_results = pd.DataFrame(results).T
print("=" * 70)
print("  PERBANDINGAN PERFORMA MODEL PADA TEST SET")
print("=" * 70)
print(df_results.to_string())

# Tentukan model terbaik berdasarkan F1@10
best_model_name = max(results.keys(), key=lambda n: results[n]['F1@10'])
best_model = models[best_model_name]
best_proba = get_proba_matrix(best_model_name)
best_pred = predictions[best_model_name]
print(f"\\nModel terbaik: {best_model_name} (F1@10: {results[best_model_name]['F1@10']:.4f})")"""))

# Plot Perbandingan
cells.append(code_cell("""# === 4.2 Plot: Perbandingan Performa 5 Model ===

fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# Plot 1: Multi-label standard metrics
metrics_std = ['Hamming Loss', 'Micro F1', 'Macro F1']
colors_std = ['#e74c3c', '#3498db', '#2ecc71']
x_pos = np.arange(len(results))
width = 0.25

ax = axes[0]
for i, (metric, color) in enumerate(zip(metrics_std, colors_std)):
    vals = [results[m][metric] for m in results]
    bars = ax.bar(x_pos + i * width, vals, width, label=metric, color=color, alpha=0.85)
    for bar, val in zip(bars, vals):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
                f'{val:.3f}', ha='center', fontsize=6, fontweight='bold')
ax.set_xticks(x_pos + width)
ax.set_xticklabels(list(results.keys()), fontsize=8, rotation=15)
ax.set_ylabel('Skor')
ax.set_title('Metrics Multi-Label Standar', fontsize=12, fontweight='bold')
ax.legend(fontsize=8)

# Plot 2: Precision/Recall/F1 @10
metrics_k = ['P@10', 'R@10', 'F1@10']
colors_k = ['#9b59b6', '#f39c12', '#e74c3c']

ax2 = axes[1]
for i, (metric, color) in enumerate(zip(metrics_k, colors_k)):
    vals = [results[m][metric] for m in results]
    bars = ax2.bar(x_pos + i * width, vals, width, label=metric, color=color, alpha=0.85)
    for bar, val in zip(bars, vals):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
                 f'{val:.3f}', ha='center', fontsize=6, fontweight='bold')
ax2.set_xticks(x_pos + width)
ax2.set_xticklabels(list(results.keys()), fontsize=8, rotation=15)
ax2.set_ylabel('Skor')
ax2.set_title('Precision / Recall / F1 @10', fontsize=12, fontweight='bold')
ax2.legend(fontsize=8)

plt.suptitle('Perbandingan Performa 5 Model Multi-Label', fontsize=14, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig('images/Perbandingan_Performa_Model.png', bbox_inches='tight')
plt.show()"""))

# Fungsi Prediksi Skill + Gap Detection
cells.append(md_cell("""---
### 4.3 Fungsi Prediksi Skill & Deteksi Gap"""))

cells.append(code_cell("""# === 4.3 Fungsi Prediksi Skill & Deteksi Gap ===

def predict_skills(description_text, target_job, user_skills=None, top_n=15):
    \"\"\"
    Prediksi skill yang dibutuhkan berdasarkan deskripsi pekerjaan.

    Parameters:
    -----------
    description_text : str
        Deskripsi pekerjaan (bisa kosong — akan menggunakan job category saja)
    target_job : str
        Nama job category target
    user_skills : list of str, optional
        Skill yang sudah dimiliki user
    top_n : int
        Jumlah top skill yang diprediksi

    Returns:
    --------
    dict: predicted skills, matched, gap, recommendations
    \"\"\"
    if target_job not in cat_to_idx:
        print(f"Job category '{target_job}' tidak ditemukan.")
        print(f"Tersedia: {categories}")
        return None

    # Bangun fitur
    x_desc = tfidf_desc.transform([description_text if description_text else ''])
    x_soft = tfidf_soft.transform([''])
    x_cat = csr_matrix(onehot(cat_to_idx[target_job], N_CAT)).reshape(1, -1)
    x_extra = csr_matrix(np.array([[2, 0, 0]], dtype=np.float32))  # defaults
    X_input = hstack([x_desc, x_soft, x_cat, x_extra]).tocsr()

    # Prediksi
    proba = get_proba_matrix_single(best_model, X_input)
    top_idx = np.argsort(-proba)[:top_n]
    predicted = [{'skill': candidate_skills[j], 'prob': round(float(proba[j]), 4),
                  'rank': rank+1} for rank, j in enumerate(top_idx)]

    if user_skills is None:
        return {
            'target_job': target_job,
            'predicted': predicted,
            'top_n': top_n
        }

    # Deteksi gap
    user_norm = set(s.strip().lower() for s in user_skills)
    matched, gap = [], []
    for r in predicted:
        is_match = any(r['skill'] in u or u in r['skill'] for u in user_norm)
        if is_match:
            matched.append(r)
        else:
            gap.append(r)

    gap_score = len(gap) / len(predicted) * 100 if predicted else 0

    # Rekomendasi prioritas
    recommended = []
    for i, g in enumerate(gap):
        recommended.append({
            'priority_rank': i + 1,
            'skill': g['skill'],
            'prob': g['prob'],
            'reason': f"Dibutuhkan di {target_job} (prob={g['prob']:.3f})"
        })

    return {
        'target_job': target_job,
        'predicted_count': len(predicted),
        'predicted': predicted,
        'matched': matched,
        'gap': gap,
        'recommended': recommended,
        'gap_score': round(gap_score, 1),
        'match_score': round(100 - gap_score, 1),
    }


def get_proba_matrix_single(model, X_input):
    \"\"\"Dapatkan probability vector untuk single input.\"\"\"
    p = model.predict_proba(X_input)
    if isinstance(p, list):
        return np.array([col[0, 1] if col.ndim == 2 else col[0] for col in p])
    elif p.ndim == 3:
        return p[0, :, 1]
    return p[0]


def recommend_skills(gap_result, job_cat_skills):
    \"\"\"
    Rekomendasikan skill prioritas berdasarkan gap dan frekuensi industri.

    Parameters:
    -----------
    gap_result : dict
        Hasil dari predict_skills()
    job_cat_skills : dict
        Mapping job category -> {skill: frekuensi}

    Returns:
    --------
    list of dict: skill rekomendasi beserta prioritas
    \"\"\"
    if gap_result is None or 'gap' not in gap_result:
        return []

    target = gap_result['target_job']
    gap_skills = gap_result['gap']

    # Hitung frekuensi global
    global_freq = defaultdict(int)
    for cat, skills in job_cat_skills.items():
        for skill, freq in skills.items():
            global_freq[skill.strip().lower()] += freq

    recommendations = []
    for gs in gap_skills:
        skill = gs['skill']
        cat_freq = job_cat_skills.get(target, {}).get(skill, 0)
        glob_freq = global_freq.get(skill, 0)
        recommendations.append({
            'skill': skill,
            'model_prob': gs['prob'],
            'freq_in_target_job': cat_freq,
            'freq_global': glob_freq,
            'priority_score': gs['prob'] * 100 * 0.5 + cat_freq * 0.3 + glob_freq * 0.2
        })

    recommendations.sort(key=lambda x: -x['priority_score'])
    for i, rec in enumerate(recommendations, 1):
        rec['priority_rank'] = i

    return recommendations


print("Fungsi predict_skills() dan recommend_skills() berhasil didefinisikan.")"""))

# Contoh Penggunaan
cells.append(code_cell("""# === 4.3 Contoh Penggunaan ===
print("=" * 70)
print("  CONTOH PREDIKSI SKILL & DETEKSI GAP")
print("=" * 70)

# Skenario 1: Junior Developer → Data Scientist
print("\\n" + "─" * 70)
print("  SKENARIO 1: Junior Developer → Data Scientist")
print("─" * 70)
user_skills_1 = ['Python', 'SQL', 'Excel']
gap_1 = predict_skills('', 'Data Scientist', user_skills=user_skills_1, top_n=15)
if gap_1:
    print(f"  Target Job     : {gap_1['target_job']}")
    print(f"  Gap Score      : {gap_1['gap_score']:.1f}%")
    print(f"  Match Score    : {gap_1['match_score']:.1f}%")
    print(f"\\n  ✅ Skill yang sudah dimiliki ({len(gap_1['matched'])}):")
    for m in gap_1['matched']:
        print(f"     - {m['skill']:30s} (prob={m['prob']:.3f})")
    print(f"\\n  ❌ Skill yang kurang ({len(gap_1['gap'])}):")
    for g in gap_1['gap'][:8]:
        print(f"     - {g['skill']:30s} (prob={g['prob']:.3f})")

    recs_1 = recommend_skills(gap_1, job_category_skills)
    print(f"\\n  📋 Rekomendasi Prioritas Belajar:")
    for rec in recs_1[:5]:
        print(f"     {rec['priority_rank']}. {rec['skill']:30s} "
              f"(prob={rec['model_prob']:.3f}, target_freq={rec['freq_in_target_job']}, "
              f"global_freq={rec['freq_global']})")

# Skenario 2: Experienced Dev → Machine Learning
print("\\n" + "─" * 70)
print("  SKENARIO 2: Experienced Dev → Machine Learning")
print("─" * 70)
user_skills_2 = ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Data Analysis',
                  'Statistics', 'Deep Learning', 'NLP', 'Pandas', 'NumPy']
gap_2 = predict_skills('', 'Machine Learning', user_skills=user_skills_2, top_n=15)
if gap_2:
    print(f"  Gap Score: {gap_2['gap_score']:.1f}% | Match Score: {gap_2['match_score']:.1f}%")
    print(f"  Gap skills: {[g['skill'] for g in gap_2['gap'][:5]]}")

# Skenario 3: Sysadmin → Cloud Architect
print("\\n" + "─" * 70)
print("  SKENARIO 3: Sysadmin → Cloud Architect")
print("─" * 70)
user_skills_3 = ['Linux', 'Networking', 'Docker', 'Bash', 'Monitoring']
gap_3 = predict_skills('', 'Cloud Architect', user_skills=user_skills_3, top_n=15)
if gap_3:
    print(f"  Gap Score: {gap_3['gap_score']:.1f}% | Match Score: {gap_3['match_score']:.1f}%")
    print(f"  Gap skills: {[g['skill'] for g in gap_3['gap'][:5]]}")"""))

# ────────────────────────────────────────────────────────────────────
# TAHAP 5 — EVALUATION
# ────────────────────────────────────────────────────────────────────
cells.append(md_cell("""---
## TAHAP 5 — EVALUATION

### 5.1 Classification Report — Semua Model"""))

cells.append(code_cell("""# === 5.1 Classification Report — Model Terbaik ===
# Top-20 skill yang paling sering muncul di test set
active_mask = Y_test.sum(axis=0) > 0
active_indices = np.where(active_mask)[0][:20]
active_names = [candidate_skills[i] for i in active_indices]

print("=" * 70)
print(f"  CLASSIFICATION REPORT — {best_model_name} (Top-20 Skill)")
print("=" * 70)
print(classification_report(
    Y_test[:, active_indices], best_pred[:, active_indices],
    target_names=active_names, zero_division=0
))"""))

# Confusion Matrix
cells.append(md_cell("""---
### 5.2 Confusion Matrix (Normalized) — Model Terbaik"""))

cells.append(code_cell("""# === 5.2 Confusion Matrix Multi-Label ===
mcm = multilabel_confusion_matrix(Y_test, best_pred)

# Rata-rata confusion matrix
tn = mcm[:, 0, 0].mean()
fp = mcm[:, 0, 1].mean()
fn = mcm[:, 1, 0].mean()
tp = mcm[:, 1, 1].mean()
avg_cm = np.array([[tn, fp], [fn, tp]])

fig, ax = plt.subplots(figsize=(6, 5))
sns.heatmap(avg_cm, annot=True, fmt='.1f', cmap='Blues',
            xticklabels=['Predicted 0', 'Predicted 1'],
            yticklabels=['Actual 0', 'Actual 1'], ax=ax)
ax.set_title(f'Average Confusion Matrix — {best_model_name}', fontsize=12, fontweight='bold')
plt.tight_layout()
plt.savefig('images/Confusion_Matrix_MultiLabel.png', bbox_inches='tight')
plt.show()

print(f"  Avg TP: {tp:.1f} | FP: {fp:.1f} | FN: {fn:.1f} | TN: {tn:.1f}")"""))

# K-Fold Cross Validation
cells.append(md_cell("""---
### 5.3 K-Fold Cross Validation (k=5) — Model Terbaik"""))

cells.append(code_cell("""# === 5.3 K-Fold Cross Validation (k=5) ===
kf = KFold(n_splits=5, shuffle=True, random_state=42)
cv_micro_f1 = []
cv_f1_at_10 = []

print("=" * 65)
print(f"  K-FOLD CROSS VALIDATION — {best_model_name}")
print("=" * 65)

for fold, (tr_idx, te_idx) in enumerate(kf.split(X_all), 1):
    Xtr, Xte = X_all[tr_idx], X_all[te_idx]
    Ytr, Yte = Y_all[tr_idx], Y_all[te_idx]

    # Re-instantiate model
    if 'Logistic' in best_model_name:
        m = OneVsRestClassifier(
            LogisticRegression(C=1.0, max_iter=2000, solver='liblinear'), n_jobs=-1)
    elif 'Random Forest' in best_model_name:
        m = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    elif 'SVM' in best_model_name:
        m = OneVsRestClassifier(
            SVC(kernel='linear', probability=True, C=1.0, random_state=42), n_jobs=-1)
    elif 'XGBoost' in best_model_name:
        m = OneVsRestClassifier(
            XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1,
                          use_label_encoder=False, eval_metric='logloss',
                          random_state=42, verbosity=0), n_jobs=-1)
    else:
        m = OneVsRestClassifier(
            LGBMClassifier(n_estimators=100, max_depth=6, learning_rate=0.1,
                           random_state=42, verbose=-1), n_jobs=-1)

    m.fit(Xtr, Ytr)
    ypred = m.predict(Xte)
    micro_f1 = f1_score(Yte, ypred, average='micro', zero_division=0)
    cv_micro_f1.append(micro_f1)

    # F1@10
    proba = m.predict_proba(Xte)
    if isinstance(proba, list):
        proba = np.array([col[:, 1] if col.ndim == 2 else col for col in proba]).T
    elif proba.ndim == 3:
        proba = proba[:, :, 1]
    p10 = topk_precision(Yte, proba, 10)
    r10 = topk_recall(Yte, proba, 10)
    f1_10 = 2*p10*r10/(p10+r10) if (p10+r10) else 0
    cv_f1_at_10.append(f1_10)

    print(f"  Fold {fold}: Micro F1 = {micro_f1:.4f} | F1@10 = {f1_10:.4f}")

cv_micro = np.array(cv_micro_f1)
cv_f1k = np.array(cv_f1_at_10)
print(f"\\n  Mean Micro F1 : {cv_micro.mean():.4f} ± {cv_micro.std():.4f}")
print(f"  Mean F1@10    : {cv_f1k.mean():.4f} ± {cv_f1k.std():.4f}")"""))

# ROC & PR Curve
cells.append(md_cell("""---
### 5.4 ROC & Precision-Recall Curve — Model Terbaik"""))

cells.append(code_cell("""# === 5.4 ROC & Precision-Recall Curve ===
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# ROC Curve (micro average)
fpr_micro, tpr_micro, _ = roc_curve(Y_test.ravel(), best_proba.ravel())
roc_auc_micro = auc(fpr_micro, tpr_micro)

axes[0].plot(fpr_micro, tpr_micro, color='#e74c3c', linewidth=2,
             label=f'Micro-avg ROC (AUC={roc_auc_micro:.4f})')
axes[0].plot([0, 1], [0, 1], 'k--', alpha=0.3)
axes[0].set_xlabel('False Positive Rate')
axes[0].set_ylabel('True Positive Rate')
axes[0].set_title(f'ROC Curve — {best_model_name}', fontsize=12, fontweight='bold')
axes[0].legend(fontsize=10)

# Precision-Recall Curve (micro average)
prec_micro, rec_micro, _ = precision_recall_curve(Y_test.ravel(), best_proba.ravel())
ap_micro = average_precision_score(Y_test, best_proba, average='micro')

axes[1].plot(rec_micro, prec_micro, color='#3498db', linewidth=2,
             label=f'Micro-avg PR (AP={ap_micro:.4f})')
axes[1].set_xlabel('Recall')
axes[1].set_ylabel('Precision')
axes[1].set_title(f'Precision-Recall Curve — {best_model_name}', fontsize=12, fontweight='bold')
axes[1].legend(fontsize=10)

plt.tight_layout()
plt.savefig('images/ROC_PR_Curve.png', bbox_inches='tight')
plt.show()"""))

# Feature Importance
cells.append(md_cell("""---
### 5.5 Feature Importance — Semua Model"""))

cells.append(code_cell("""# === 5.5 Feature Importance — Semua Model (Top-15 Fitur) ===
# Build feature names
feat_names_desc = [f'desc_{f}' for f in tfidf_desc.get_feature_names_out()]
feat_names_soft = [f'soft_{f}' for f in tfidf_soft.get_feature_names_out()]
feat_names_cat = [f'cat_{c}' for c in categories]
feat_names_extra = ['education_level', 'soft_skill_count', 'skill_count']
all_feature_names = feat_names_desc + feat_names_soft + feat_names_cat + feat_names_extra

fig, axes = plt.subplots(1, len(models), figsize=(5 * len(models), 8))

for ax, (name, model) in zip(axes, models.items()):
    try:
        if hasattr(model, 'coef_'):
            importances = np.abs(model.coef_).mean(axis=0)
            if hasattr(importances, 'A1'):
                importances = importances.A1  # sparse to dense
        elif hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        else:
            # For OneVsRest, try base estimators
            estimators = model.estimators_ if hasattr(model, 'estimators_') else []
            if estimators and hasattr(estimators[0], 'coef_'):
                coefs = np.array([e.coef_.toarray().flatten() if hasattr(e.coef_, 'toarray')
                                  else e.coef_.flatten() for e in estimators])
                importances = np.abs(coefs).mean(axis=0)
            elif estimators and hasattr(estimators[0], 'feature_importances_'):
                imps = np.array([e.feature_importances_ for e in estimators])
                importances = imps.mean(axis=0)
            else:
                ax.set_title(f'{name}\\n(tidak tersedia)', fontsize=9)
                continue

        if len(importances) != len(all_feature_names):
            ax.set_title(f'{name}\\n(shape mismatch)', fontsize=9)
            continue

        top_idx = np.argsort(importances)[-15:]
        top_names = [all_feature_names[i] for i in top_idx]
        top_vals = importances[top_idx]

        ax.barh(range(15), top_vals, color=sns.color_palette('viridis', 15))
        ax.set_yticks(range(15))
        ax.set_yticklabels(top_names, fontsize=7)
        ax.set_title(f'Feature Importance\\n{name}', fontsize=9, fontweight='bold')
    except Exception as e:
        ax.set_title(f'{name}\\n(error: {str(e)[:30]})', fontsize=8)

plt.tight_layout()
plt.savefig('images/Feature_Importance.png', bbox_inches='tight')
plt.show()"""))

# Evaluasi Kualitatif
cells.append(md_cell("""---
### 5.6 Evaluasi Kualitatif"""))

cells.append(code_cell("""# === 5.6 Evaluasi Kualitatif ===
print("=" * 70)
print("  EVALUASI KUALITATIF — SIMULASI SKENARIO")
print("=" * 70)

scenarios_eval = [
    ('Junior Developer (Python/SQL/Excel)',
     ['Python', 'SQL', 'Excel'], 'Data Scientist'),
    ('Experienced DS',
     ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Data Analysis',
      'Statistics', 'Deep Learning', 'NLP', 'Pandas', 'NumPy'], 'Machine Learning'),
    ('Sysadmin',
     ['Linux', 'Networking', 'Docker', 'Bash', 'Monitoring'], 'Cloud Architect'),
    ('Fresh Graduate',
     ['HTML', 'CSS', 'JavaScript'], 'Full Stack Developer'),
    ('DBA',
     ['SQL', 'Oracle', 'MySQL', 'Database Administration'], 'Data Engineer'),
]

print("\\n(a) Gap Detection via ML Model:")
print(f"{'─' * 70}")
for desc, skills, target in scenarios_eval:
    res = predict_skills('', target, user_skills=skills, top_n=15)
    if res:
        print(f"  {desc:40s} | User Skills: {len(skills):2d} | "
              f"Gap: {res['gap_score']:5.1f}% | Match: {res['match_score']:5.1f}%")

# Detail rekomendasi skenario pertama
print(f"\\n(b) Detail rekomendasi skenario pertama:")
print(f"{'─' * 70}")
res1 = predict_skills('', scenarios_eval[0][2], user_skills=scenarios_eval[0][1], top_n=15)
if res1:
    recs = recommend_skills(res1, job_category_skills)
    for rec in recs[:5]:
        print(f"  {rec['priority_rank']}. {rec['skill']:30s} "
              f"prob={rec['model_prob']:.3f} | freq_target={rec['freq_in_target_job']} | "
              f"freq_global={rec['freq_global']}")

# Coverage
print(f"\\n(c) Evaluasi Coverage:")
print(f"{'─' * 70}")
cats_covered = 0
for cat in categories:
    res = predict_skills('', cat, user_skills=['Python'], top_n=10)
    if res:
        cats_covered += 1
print(f"  Job categories dengan prediksi: {cats_covered}/{len(categories)} ({cats_covered/len(categories)*100:.1f}%)")"""))

# Ringkasan CRISP-DM
cells.append(md_cell("""---
### 5.7 Ringkasan CRISP-DM"""))

cells.append(code_cell("""print("=" * 70)
print("  RINGKASAN CRISP-DM — SKILL GAP DETECTION & SKILL PREDICTION")
print("=" * 70)

best_metrics = results[best_model_name]
print(f\"\"\"
FASE CRISP-DM:
1. BUSINESS UNDERSTANDING
   - Mendeteksi gap skill antara kompetensi user dan kebutuhan industri
   - Model memprediksi skill yang dibutuhkan berdasarkan deskripsi pekerjaan

2. DATA UNDERSTANDING
   - {len(df_jobs):,} posting lowongan, {df_jobs['Query'].nunique()} kategori pekerjaan
   - {len(skill_counter):,} skill unik, rata-rata {df_jobs['skill_count'].mean():.1f} skill/posting

3. DATA PREPARATION
   - Normalisasi & pembersihan skill
   - {len(candidate_skills)} kandidat skill sebagai label multi-label
   - TF-IDF dari Description ({X_desc.shape[1]}) + Soft Skills ({X_soft.shape[1]}) + One-hot kategori ({N_CAT}) + 3 fitur numerik
   - {X_train.shape[0]:,} instance train / {X_test.shape[0]:,} instance test

4. MODELING
   - {len(models)} model dibandingkan: {', '.join(models.keys())}
   - Model terbaik: {best_model_name}

5. EVALUATION
   - Micro F1       : {best_metrics['Micro F1']:.4f}
   - Macro F1       : {best_metrics['Macro F1']:.4f}
   - F1@10          : {best_metrics['F1@10']:.4f}
   - Hamming Loss   : {best_metrics['Hamming Loss']:.4f}
   - CV Micro F1    : {cv_micro.mean():.4f} ± {cv_micro.std():.4f}
   - CV F1@10       : {cv_f1k.mean():.4f} ± {cv_f1k.std():.4f}

6. DEPLOYMENT
   - Artefak model disimpan ke folder final_model/
\"\"\")"""))

# ────────────────────────────────────────────────────────────────────
# TAHAP 6 — DEPLOYMENT
# ────────────────────────────────────────────────────────────────────
cells.append(md_cell("""---
## BAB 6 — DEPLOYMENT

### 6.1 Simpan Model Terbaik ke `final_model/`

Menyimpan model multi-label terbaik beserta seluruh objek preprocessing ke folder `final_model/`."""))

cells.append(code_cell("""import os
import json
import joblib
from datetime import datetime

def save_final_best_model(final_dir='final_model'):
    os.makedirs(final_dir, exist_ok=True)

    print('=' * 60)
    print(f'  MENYIMPAN MODEL TERBAIK → folder: {final_dir}/')
    print('=' * 60)
    print(f'  Model terbaik : {best_model_name}')
    print(f'  F1@10         : {results[best_model_name]["F1@10"]:.4f}')

    saved_files = []

    # 1. Model
    model_fname = 'skill_model.joblib'
    joblib.dump(best_model, os.path.join(final_dir, model_fname))
    saved_files.append(model_fname)
    print(f'  [OK] Model               → {model_fname}')

    # 2. TF-IDF Description
    tfidf_desc_fname = 'tfidf_description.pkl'
    joblib.dump(tfidf_desc, os.path.join(final_dir, tfidf_desc_fname))
    saved_files.append(tfidf_desc_fname)
    print(f'  [OK] TFIDF Description   → {tfidf_desc_fname}')

    # 3. TF-IDF Soft Skills
    tfidf_soft_fname = 'tfidf_softskills.pkl'
    joblib.dump(tfidf_soft, os.path.join(final_dir, tfidf_soft_fname))
    saved_files.append(tfidf_soft_fname)
    print(f'  [OK] TFIDF Soft Skills   → {tfidf_soft_fname}')

    # 4. Candidate skills
    with open(os.path.join(final_dir, 'candidate_skills.json'), 'w') as f:
        json.dump(candidate_skills, f, indent=2)
    saved_files.append('candidate_skills.json')
    print(f'  [OK] Candidate Skills    → candidate_skills.json')

    # 5. Categories
    with open(os.path.join(final_dir, 'categories.json'), 'w') as f:
        json.dump(categories, f, indent=2)
    saved_files.append('categories.json')
    print(f'  [OK] Categories          → categories.json')

    # 6. Feature config
    feature_config = {
        "n_tfidf_desc": X_desc.shape[1],
        "n_tfidf_soft": X_soft.shape[1],
        "n_categories": N_CAT,
        "n_extra_features": 3,
        "n_total_features": X_all.shape[1],
        "n_candidate_skills": len(candidate_skills),
        "top_n_default": 15,
        "extra_features": ["education_level", "soft_skill_count", "skill_count"]
    }
    with open(os.path.join(final_dir, 'feature_config.json'), 'w') as f:
        json.dump(feature_config, f, indent=2)
    saved_files.append('feature_config.json')
    print(f'  [OK] Feature Config      → feature_config.json')

    # 7. Model info
    model_info = {
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'best_model_name': best_model_name,
        'target': 'skills (multi-label)',
        'feature_source': 'TF-IDF Description + TF-IDF Soft Skills + One-hot Query + Engineered',
        'n_candidate_skills': len(candidate_skills),
        'metrics': {k: round(float(v), 4) for k, v in results[best_model_name].items()},
        'cv_micro_f1': f"{cv_micro.mean():.4f} ± {cv_micro.std():.4f}",
        'cv_f1_at_10': f"{cv_f1k.mean():.4f} ± {cv_f1k.std():.4f}",
        'all_model_scores': {name: {k: round(float(v), 4) for k, v in m.items()}
                             for name, m in results.items()}
    }
    with open(os.path.join(final_dir, 'final_model_info.json'), 'w') as f:
        json.dump(model_info, f, indent=2)
    saved_files.append('final_model_info.json')
    print(f'  [OK] Model Info          → final_model_info.json')

    # 8. Job category skills (untuk gap detection di API)
    with open(os.path.join(final_dir, 'job_category_skills.json'), 'w') as f:
        json.dump(job_category_skills, f, indent=2, ensure_ascii=False)
    saved_files.append('job_category_skills.json')
    print(f'  [OK] Job Category Skills → job_category_skills.json')

    print('=' * 60)
    print(f'  Total file tersimpan : {len(saved_files)}')
    print('=' * 60)

save_final_best_model()"""))

# ═══════════════════════════════════════════════════════════════════
#  ASSEMBLE NOTEBOOK
# ═══════════════════════════════════════════════════════════════════
new_nb = {
    "cells": cells,
    "metadata": nb_orig.get("metadata", {}),
    "nbformat": nb_orig.get("nbformat", 4),
    "nbformat_minor": nb_orig.get("nbformat_minor", 5)
}

output_path = 'Skill_Gap_Detection_CRISP_DM_SkillOnly.ipynb'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(new_nb, f, indent=1, ensure_ascii=False)

print(f"\n✅ Notebook baru berhasil dibuat: {output_path}")
print(f"   Total cells: {len(cells)}")
