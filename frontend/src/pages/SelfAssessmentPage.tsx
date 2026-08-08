import { useState, useEffect } from 'react'
import AssessmentForm from '../components/assessment/AssessmentForm'
import JobSelector from '../components/scan/JobSelector'
import GapResults from '../components/scan/GapResults'
import RecommendationList from '../components/scan/RecommendationList'
import Button from '../components/ui/Button'
import { getJobCategories, detectGap, recommend, DEFAULT_JOB_CATEGORIES } from '../services/api'
import type { GapResult, RecommendationResult } from '../types'

// Mock Data for skills assessment (in a real app, this could come from API)
const MOCK_SKILLS_DATA = {
  'Software Development': [
    { name: 'JavaScript', desc: 'Pemrograman frontend & backend dasar' },
    { name: 'TypeScript', desc: 'Static typing untuk JS skala besar' },
    { name: 'React', desc: 'Membangun UI berbasis komponen' },
    { name: 'Node.js', desc: 'Runtime backend JavaScript' },
    { name: 'Git', desc: 'Version control system' },
  ],
  'Data Engineering': [
    { name: 'SQL', desc: 'Query, optimisasi, desain skema' },
    { name: 'Python (ETL)', desc: 'Scripting untuk pipeline data' },
    { name: 'Apache Airflow', desc: 'Orkestrasi workflow data' },
    { name: 'BigQuery', desc: 'Cloud data warehouse' },
  ],
  'Cybersecurity': [
    { name: 'Penetration Testing', desc: 'Uji kerentanan sistem' },
    { name: 'Network Security', desc: 'Keamanan jaringan dan firewall' },
    { name: 'IAM', desc: 'Identity and Access Management' },
  ],
  'Cloud Computing': [
    { name: 'AWS', desc: 'Layanan komputasi awan Amazon' },
    { name: 'Docker', desc: 'Containerization aplikasi' },
    { name: 'Kubernetes', desc: 'Orkestrasi container' },
    { name: 'Terraform', desc: 'Infrastructure as Code' },
  ],
}

export default function SelfAssessmentPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [targetJob, setTargetJob] = useState('')
  const [assessmentResults, setAssessmentResults] = useState<Record<string, number> | null>(null)
  
  const [isDetecting, setIsDetecting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [gapResult, setGapResult] = useState<GapResult | null>(null)
  const [recResult, setRecResult] = useState<RecommendationResult | null>(null)

  useEffect(() => {
    getJobCategories()
      .then((data) => setCategories(data.categories || DEFAULT_JOB_CATEGORIES))
      .catch(() => setCategories(DEFAULT_JOB_CATEGORIES))
  }, [])

  const handleAssessmentSubmit = (results: Record<string, number>) => {
    setAssessmentResults(results)
    // Clear previous results
    setGapResult(null)
    setRecResult(null)
    setErrorMsg('')
    
    // Scroll to job selector
    setTimeout(() => {
      document.getElementById('jobSelectorSection')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const runAnalysis = async () => {
    if (!assessmentResults || !targetJob) return
    setIsDetecting(true)
    setErrorMsg('')
    setGapResult(null)

    // Convert assessment results to a flat list of skills that have a level > 0
    // In a real scenario, you might weight the skills based on the level (1, 2, 3)
    // For this prototype, we just treat level >= 1 as "possessing the skill"
    const possessedSkills = Object.entries(assessmentResults)
      .filter(([_, level]) => level > 0)
      .map(([skill, _]) => skill)

    try {
      const data = await detectGap(possessedSkills, targetJob, 15)
      setGapResult(data)

      try {
        const recData = await recommend(possessedSkills, targetJob, 15)
        setRecResult(recData)
      } catch (e) {
        setRecResult({ recommendations: [], target_job: targetJob })
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Analisis gagal')
    } finally {
      setIsDetecting(false)
    }
  }

  return (
    <div className="wrap fade-in">
      <div className="page-hero" style={{ paddingBottom: 40, borderBottom: 'none' }}>
        <div className="eyebrow">SELF ASSESSMENT</div>
        <h1>Evaluasi kemampuanmu sendiri</h1>
        <p>
          Isi kuesioner ini dengan jujur. Hasilnya akan dibandingkan dengan kebutuhan riil industri 
          berdasarkan analisis ribuan data lowongan kerja.
        </p>
      </div>

      <AssessmentForm skillsData={MOCK_SKILLS_DATA} onSubmit={handleAssessmentSubmit} />

      {assessmentResults && (
        <div id="jobSelectorSection" className="step-panel fade-in" style={{ marginTop: 40 }}>
          <div className="step-label"><b>Tahap 2</b> Pilih Target Pekerjaan</div>
          <p style={{ marginBottom: 16 }}>
            Bandingkan skill yang baru saja kamu nilai dengan standar untuk posisi:
          </p>
          <JobSelector categories={categories} value={targetJob} onChange={setTargetJob} />
          
          <div style={{ marginTop: 24 }}>
            <Button onClick={runAnalysis} disabled={!targetJob} loading={isDetecting}>
              Jalankan Analisis Kesenjangan
            </Button>
            {errorMsg && (
              <div className="error-panel" style={{ marginTop: 16 }}>
                <div className="ep-label">ERROR</div>
                <p>{errorMsg}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {gapResult && recResult && (
        <div className="fade-in" style={{ marginTop: 40 }}>
          <GapResults gap={gapResult} />
          <RecommendationList rec={recResult} jobLabel={targetJob} />
        </div>
      )}
    </div>
  )
}
