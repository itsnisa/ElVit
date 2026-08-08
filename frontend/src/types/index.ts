export interface ScanResult {
  detected_skills: string[];
  skill_count: number;
  extraction_notes: string;
  raw_text_length?: number;
}

export interface SkillItem {
  skill: string;
  prob: number;
}

export interface GapResult {
  matched: SkillItem[];
  gap: SkillItem[];
  match_score: number;
  gap_score: number;
  target_job: string;
  benchmark_count: number;
  user_skill_count: number;
}

export interface Recommendation {
  skill: string;
  prob: number;
  priority_rank: number;
}

export interface RecommendationResult {
  recommendations: Recommendation[];
  target_job: string;
  method?: string;
}

export interface JobCategoriesResult {
  categories: string[];
}

export interface HealthResult {
  status: string;
  model_loaded?: boolean;
}

export type LogType = 'ok' | 'err' | 'warn' | 'dim' | '';

export interface LogEntry {
  id: number;
  ts: string;
  msg: string;
  type: LogType;
}

export type ScanStep = 1 | 2 | 3 | 4 | 5;
export type StepStatus = 'active' | 'done' | 'error';

export interface AssessmentSkill {
  name: string;
  description: string;
  level: number; // 0=Tidak Tahu, 1=Dasar, 2=Menengah, 3=Mahir
}

export interface SubdomainData {
  id: string;
  label: string;
  skills: AssessmentSkill[];
}
