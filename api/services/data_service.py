import pandas as pd
import numpy as np
from collections import defaultdict
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'use_dataset')
JOBS_CSV = os.path.join(DATA_DIR, 'JobsDatasetProcessed.csv')


def load_jobs_data():
    df_jobs = pd.read_csv(JOBS_CSV)
    return df_jobs


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
