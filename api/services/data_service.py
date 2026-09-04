import pandas as pd
import numpy as np
<<<<<<< HEAD
import json
from collections import defaultdict
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'use_dataset')
JOBS_CSV = os.path.join(DATA_DIR, 'JD2Skills_processed.csv')
FINAL_DIR = os.path.join(BASE_DIR, 'final_model')
CATEGORIES_PATH = os.path.join(FINAL_DIR, 'categories.json')
CANDIDATE_PATH = os.path.join(FINAL_DIR, 'candidate_skills.json')
=======
from collections import defaultdict
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'use_dataset')
JOBS_CSV = os.path.join(DATA_DIR, 'JobsDatasetProcessed.csv')
>>>>>>> 04223921dba98899596735d7a97cb1de184e3534


def load_jobs_data():
    df_jobs = pd.read_csv(JOBS_CSV)
    return df_jobs


<<<<<<< HEAD
CURATED_EXTRA_SKILLS = [
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'google cloud', 'amazon web services',
    'power bi', 'tableau', 'apache spark', 'pandas', 'numpy', 'scikit-learn',
    'pytorch', 'tensorflow', 'keras', 'react', 'angular', 'vue', 'node.js', 'nodejs',
    'typescript', 'next.js', 'tailwind', 'gitlab', 'jenkins', 'terraform', 'ansible',
    'airflow', 'apache kafka', 'mongodb', 'postgresql', 'elasticsearch', 'redis',
    'graphql', 'rest api', 'microservices', 'ci/cd', 'mlops', 'excel', 'microsoft excel',
    'vba', 'oracle', 'snowflake', 'databricks', 'bigquery', 'redshift', 'streamlit',
    'fastapi', 'flask', 'django', 'pyspark', 'sharepoint', 'windows server',
    'azure devops', 'linux administration', 'shell scripting', 'bash', 'scala',
    'r programming', 'matplotlib', 'seaborn', 'plotly', 'dbt', 'nifi',
]


def load_model_categories():
    with open(CATEGORIES_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_candidate_skills():
    with open(CANDIDATE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_extended_skills():
    """Gabungan kandidat model + kosakata mentah JD2Skills + tool modern curated."""
    skills = set(load_candidate_skills())
    df = load_jobs_data()
    for v in df['IT Skills'].dropna():
        for s in str(v).split(','):
            s = s.strip().lower()
            if s:
                skills.add(s)
    skills.update(s.lower() for s in CURATED_EXTRA_SKILLS)
    skills.discard('')
    return sorted(skills)


=======
>>>>>>> 04223921dba98899596735d7a97cb1de184e3534
def build_job_category_skills(df_jobs):
    job_category_skills = defaultdict(lambda: defaultdict(int))
    for _, row in df_jobs.iterrows():
        query = str(row.get('Query', '')).strip().lower()
        skills = str(row.get('IT Skills', '')).strip()
        if not skills or skills == 'nan':
            continue
        for s in skills.split(','):
            cleaned = s.strip().lower()
            if cleaned:
                job_category_skills[query][cleaned] += 1
    return {cat: dict(skills) for cat, skills in job_category_skills.items()}


def get_available_categories(job_category_skills):
    return sorted(job_category_skills.keys())
