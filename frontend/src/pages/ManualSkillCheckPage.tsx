import { useState, useEffect, type KeyboardEvent } from 'react'
import JobSelector from '../components/scan/JobSelector'
import GapResults from '../components/scan/GapResults'
import RecommendationList from '../components/scan/RecommendationList'
import Button from '../components/ui/Button'
import { getJobCategories, detectGap, recommend, DEFAULT_JOB_CATEGORIES } from '../services/api'
import type { GapResult, RecommendationResult } from '../types'

export default function ManualSkillCheckPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [targetJob, setTargetJob] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState('')
  
  const [isDetecting, setIsDetecting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [gapResult, setGapResult] = useState<GapResult | null>(null)
  const [recResult, setRecResult] = useState<RecommendationResult | null>(null)

  useEffect(() => {
    getJobCategories()
      .then((data) => setCategories(data.categories || DEFAULT_JOB_CATEGORIES))
      .catch(() => setCategories(DEFAULT_JOB_CATEGORIES))
  }, [])

  const handleAddSkill = () => {
    const trimmed = currentSkill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setCurrentSkill('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  const runAnalysis = async () => {
    if (skills.length === 0 || !targetJob) return
    setIsDetecting(true)
    setErrorMsg('')
    setGapResult(null)
    setRecResult(null)

    try {
      const data = await detectGap(skills, targetJob, 15)
      setGapResult(data)

      try {
        const recData = await recommend(skills, targetJob, 15)
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
        <div className="eyebrow">CEK KESENJANGAN SKILL MANUAL</div>
        <h1>Input Skill Secara Manual</h1>
        <p>
          Ketikkan skill yang kamu miliki satu per satu, lalu pilih target pekerjaan untuk melihat kesenjangan kompetensimu.
        </p>
      </div>

      <div className="step-panel fade-in">
        <div className="step-label"><b>Tahap 1</b> Masukkan Skill</div>
        <p style={{ marginBottom: 16 }}>Ketik skill dan tekan Enter atau klik Tambah.</p>
        
        <div className="manual-input-row">
          <input 
            type="text" 
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Contoh: Python, React, Data Analysis"
            className="skill-add-input"
          />
          <Button onClick={handleAddSkill} disabled={!currentSkill.trim()}>Tambah</Button>
        </div>


        {skills.length > 0 && (
          <div className="skill-chip-area">
            <div className="skill-chip-header">
              <span className="skill-chip-count">{skills.length} skill{skills.length > 1 ? 's' : ''} ditambahkan</span>
            </div>
            <div className="skill-chip-list">
              {skills.map((skill, idx) => (
                <span
                  key={skill}
                  className={`skill-chip skill-chip--color-${(idx % 6) + 1}`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <span className="skill-chip-index">{idx + 1}</span>
                  <span className="skill-chip-name">{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="skill-chip-remove"
                    aria-label={`Hapus ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div id="jobSelectorSection" className="step-panel fade-in" style={{ marginTop: 40 }}>
          <div className="step-label"><b>Tahap 2</b> Pilih Target Pekerjaan</div>
          <p style={{ marginBottom: 16 }}>
            Bandingkan skill yang kamu miliki dengan standar untuk posisi:
          </p>
          <JobSelector categories={categories} value={targetJob} onChange={setTargetJob} />
          
          <div style={{ marginTop: 24 }}>
            <Button onClick={runAnalysis} disabled={!targetJob || skills.length === 0} loading={isDetecting}>
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
