import axios from 'axios'
import type {
  HealthResult,
  JobCategoriesResult,
  ScanResult,
  GapResult,
  RecommendationResult,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

export const getHealth = async (): Promise<HealthResult> => {
  const { data } = await api.get<HealthResult>('/health')
  return data
}

export const getJobCategories = async (): Promise<JobCategoriesResult> => {
  const { data } = await api.get<JobCategoriesResult>('/job-categories')
  return data
}

export const parseCV = async (file: File): Promise<ScanResult> => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<ScanResult>('/parse-cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const detectGap = async (
  skills: string[],
  targetJob: string,
  topN = 15
): Promise<GapResult> => {
  const { data } = await api.post<GapResult>('/detect-gap', {
    skills,
    target_job: targetJob,
    top_n: topN,
  })
  return data
}

export const recommend = async (
  skills: string[],
  targetJob: string,
  topN = 10
): Promise<RecommendationResult> => {
  const { data } = await api.post<RecommendationResult>('/recommend', {
    skills,
    target_job: targetJob,
    top_n: topN,
  })
  return data
}

export const DEFAULT_JOB_CATEGORIES = [
<<<<<<< HEAD
  'Business Analysis',
  'Cybersecurity',
  'Data Analytics & BI',
  'Data Engineering',
  'Data Science & AI',
  'Database Administration',
  'DevOps & Cloud',
  'Engineering & Technical',
  'Enterprise Systems & ERP',
  'ICT Training & Education',
  'IT Audit & Compliance',
  'IT Consulting',
  'IT Management',
  'IT Sales & Business Development',
  'IT Support & Helpdesk',
  'Mobile Development',
  'Network Engineering',
  'Other IT Roles',
  'Product Management',
  'Project & Program Management',
  'Quality Assurance & Testing',
  'Software Development',
  'Solution Architecture',
  'UI/UX Design',
=======
  'data analyst',
  'data scientist',
  'data engineer',
  'machine learning engineer',
  'software engineer',
  'frontend developer',
  'backend developer',
  'devops engineer',
  'cloud engineer',
  'cyber security analyst',
>>>>>>> 04223921dba98899596735d7a97cb1de184e3534
]
