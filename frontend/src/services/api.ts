import axios from 'axios'
import type {
  HealthResult,
  JobCategoriesResult,
  ScanResult,
  GapResult,
  RecommendationResult,
} from '../types'

const api = axios.create({
  baseURL: '/api',
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
]
