import { useState } from 'react'
import UploadZone from '../components/scan/UploadZone'

import SkillTags from '../components/scan/SkillTags'
import JobSelector from '../components/scan/JobSelector'
import GapResults from '../components/scan/GapResults'
import RecommendationList from '../components/scan/RecommendationList'
import Button from '../components/ui/Button'
import {
  parseCV,
  getJobCategories,
  detectGap,
  recommend,
  DEFAULT_JOB_CATEGORIES,
} from '../services/api'
import type {
  LogEntry,
  LogType,
  ScanResult,
  GapResult,
  RecommendationResult,
} from '../types'

export default function ScanCVPage() {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [, setLogs] = useState<LogEntry[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [targetJob, setTargetJob] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [gapResult, setGapResult] = useState<GapResult | null>(null)
  const [recResult, setRecResult] = useState<RecommendationResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)

  const addLog = (msg: string, type: LogType = '') => {
    const now = new Date()
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), ts, msg, type }])
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const handleFileSelected = (f: File) => {
    setFile(f)
    setLogs([])
    addLog(`FILE LOADED: ${f.name}`)
    addLog(`SIZE: ${(f.size / 1024).toFixed(1)} KB`)
    addLog('AWAITING EXECUTION COMMAND...', 'dim')
    setStep(2)
    setScanResult(null)
    setGapResult(null)
  }

  const resetUpload = () => {
    setFile(null)
    setSkills([])
    setScanResult(null)
    setGapResult(null)
    setRecResult(null)
    setTargetJob('')
    setErrorMsg('')
    setStep(1)
    setLogs([])
  }

  const runScan = async () => {
    if (!file) return
    setIsScanning(true)
    setErrorMsg('')
    setStep(2)

    addLog('INITIATING CV PARSER PIPELINE...', 'ok')
    addLog('EXTRACTING TEXT VIA PYMUPDF...')

    try {
      await sleep(300)
      addLog('SENDING FILE TO /api/parse-cv...')

      const data = await parseCV(file)

      addLog('TEXT EXTRACTION COMPLETE.', 'ok')
      await sleep(200)
      addLog('RUNNING NLP SKILL EXTRACTOR...')
      await sleep(300)
      addLog(`PIPELINE: ${data.extraction_notes}`, 'dim')
      await sleep(100)
      addLog(`MATCH FOUND: ${data.skill_count} SKILL ENTITIES`, 'ok')
      addLog('PROCESS TERMINATED NORMALLY.', 'ok')

      setScanResult(data)
      setSkills([...(data.detected_skills || [])])

      try {
        const catData = await getJobCategories()
        setCategories(catData.categories || DEFAULT_JOB_CATEGORIES)
      } catch (e) {
        addLog('WARN: Could not load categories from API. Using defaults.', 'warn')
        setCategories(DEFAULT_JOB_CATEGORIES)
      }

      setStep(3)
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'CV parsing failed'
      addLog(`CRITICAL ERROR: ${msg}`, 'err')
      setErrorMsg(msg)
    } finally {
      setIsScanning(false)
    }
  }

  const runGapDetect = async () => {
    if (!targetJob || skills.length === 0) return
    setIsDetecting(true)
    setErrorMsg('')
    setStep(4)
    setGapResult(null)

    try {
      const data = await detectGap(skills, targetJob, 15)
      setGapResult(data)

      try {
        const recData = await recommend(skills, targetJob, 15)
        setRecResult(recData)
      } catch (e) {
        setRecResult({ recommendations: [], target_job: targetJob })
      }

      setStep(5)
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Gap detection failed'
      setErrorMsg(msg)
      setStep(4)
    } finally {
      setIsDetecting(false)
    }
  }

  return (
    <div className="wrap fade-in">
      {/* PAGE HERO */}
      <div className="page-hero">
        <div className="eyebrow">SCAN CV — DETEKSI KESENJANGAN KOMPETENSI IT</div>
        <h1>
          Upload CV-mu,<br />
          <em>ketahui gap-nya</em> — otomatis.
        </h1>
        <p>
          Ekstraksi skill dari PDF CV menggunakan NLP, lalu dibandingkan langsung dengan benchmark
          lowongan kerja nyata. Pilih target job, hasil analisis muncul dalam hitungan detik.
        </p>
      </div>

      {/* FLOW INDICATOR */}
      <div className="flow-bar">
        <div className="flow-steps">
          <div className={`flow-step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
            <div className="step-num">01</div> Upload CV
          </div>
          <div className="flow-arrow" />
          <div className={`flow-step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
            <div className="step-num">02</div> Parse &amp; Ekstraksi
          </div>
          <div className="flow-arrow" />
          <div className={`flow-step ${step === 3 ? 'active' : step > 3 ? 'done' : ''}`}>
            <div className="step-num">03</div> Pilih Target Job
          </div>
          <div className="flow-arrow" />
          <div className={`flow-step ${step === 4 ? 'active' : step > 4 ? 'done' : ''}`}>
            <div className="step-num">04</div> Deteksi Gap
          </div>
          <div className="flow-arrow" />
          <div className={`flow-step ${step === 5 ? 'active' : step > 5 ? 'done' : ''}`}>
            <div className="step-num">05</div> Hasil &amp; Rekomendasi
          </div>
        </div>
      </div>

      <div className="main-layout">
        <div id="leftCol">
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="step-panel fade-in">
              <div className="step-label"><b>01</b> Upload CV (PDF)</div>
              <UploadZone onFileSelected={handleFileSelected} />
            </div>
          )}

          {/* FILE LOADED & TERMINAL */}
          {step >= 2 && file && (
            <div className="step-panel fade-in">
              <div className="step-label"><b>01</b> File Terpilih</div>
              <div className="file-loaded">
                <div className="file-info">
                  <div className="file-icon">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div className="file-meta">
                    <h4>{file.name}</h4>
                    <span>{(file.size / 1024).toFixed(1)} KB · PDF</span>
                  </div>
                </div>
                <button className="btn-change" onClick={resetUpload} type="button">← Ganti file</button>
              </div>

              <div
                style={{
                  marginTop: 12,
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'var(--accent-subtle, #f0faf5)',
                  border: '1px solid var(--accent-line, #b6e0cc)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F6F4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span style={{ fontSize: 13, color: '#2F6F4E', fontWeight: 500 }}>
                  CV berhasil dimuat · Siap dianalisis
                </span>
              </div>

              {step === 2 && (
                <div style={{ marginTop: 12 }}>
                  <Button fullWidth onClick={runScan} loading={isScanning}>
                    Analisis CV Saya →
                  </Button>
                  {errorMsg && (
                    <div className="error-panel">
                      <div className="ep-label">ERROR</div>
                      <p>{errorMsg}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SKILL REVIEW */}
          {step >= 3 && (
            <div className="step-panel fade-in">
              <div className="step-label"><b>02</b> Verifikasi Skill Terdeteksi</div>
              <SkillTags
                skills={skills}
                extractionNotes={scanResult?.extraction_notes}
                onAdd={(s) => {
                  if (!skills.includes(s)) setSkills([...skills, s])
                }}
                onRemove={(i) => {
                  const newSkills = [...skills]
                  newSkills.splice(i, 1)
                  setSkills(newSkills)
                }}
              />
            </div>
          )}

          {/* STEP 3: JOB SELECTOR */}
          {step >= 3 && (
            <div className="step-panel fade-in">
              <div className="step-label"><b>03</b> Pilih Target Job Category</div>
              <JobSelector categories={categories} value={targetJob} onChange={setTargetJob} />
              <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button onClick={runGapDetect} disabled={!targetJob || skills.length === 0} loading={isDetecting}>
                  Deteksi Kesenjangan
                </Button>
                <Button variant="secondary" onClick={resetUpload}>
                  Mulai Ulang
                </Button>
              </div>
              {errorMsg && step >= 3 && (
                <div className="error-panel">
                  <div className="ep-label">ERROR</div>
                  <p>{errorMsg}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-panel">
          <div className="info-panel">
            <div className="ip-label">RINGKASAN PLATFORM</div>
            <div className="ip-num">3<span>,142</span></div>
            <div className="ip-sub">lowongan kerja IT dianalisis sebagai benchmark skill industri</div>
          </div>
          <div className="info-panel">
            <div className="ip-label">ALUR PROSES</div>
            <div className="flow-mini">
              <div className={`flow-mini-row ${step === 1 ? 'active-step' : step > 1 ? 'done-step' : ''}`}>
                <div className="fmn">01</div>
                <div>
                  <h5>Upload CV</h5>
                  <p>Pilih dan unggah file CV Anda dalam format PDF.</p>
                </div>
              </div>
              <div className={`flow-mini-row ${step === 2 ? 'active-step' : step > 2 ? 'done-step' : ''}`}>
                <div className="fmn">02</div>
                <div>
                  <h5>Parse & Ekstraksi</h5>
                  <p>Sistem mengekstrak teks dan mengidentifikasi skill teknis Anda.</p>
                </div>
              </div>
              <div className={`flow-mini-row ${step === 3 ? 'active-step' : step > 3 ? 'done-step' : ''}`}>
                <div className="fmn">03</div>
                <div>
                  <h5>Pilih Target Job</h5>
                  <p>Verifikasi skill yang ditemukan dan tentukan target pekerjaan Anda.</p>
                </div>
              </div>
              <div className={`flow-mini-row ${step === 4 ? 'active-step' : step > 4 ? 'done-step' : ''}`}>
                <div className="fmn">04</div>
                <div>
                  <h5>Deteksi Gap</h5>
                  <p>Membandingkan skill Anda dengan data benchmark industri.</p>
                </div>
              </div>
              <div className={`flow-mini-row ${step === 5 ? 'active-step' : step > 5 ? 'done-step' : ''}`}>
                <div className="fmn">05</div>
                <div>
                  <h5>Hasil & Rekomendasi</h5>
                  <p>Melihat visualisasi kesenjangan dan daftar prioritas belajar Anda.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS SECTION */}
      {step === 5 && gapResult && recResult && (
        <div className="fade-in">
          <GapResults gap={gapResult} />
          <RecommendationList rec={recResult} jobLabel={targetJob} />
          <div className="cta-next">
            <div>
              <h4>Coba job category lain?</h4>
              <p>Ganti target job di atas dan jalankan ulang analisis tanpa upload ulang.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn-restart"
                onClick={() => {
                  setStep(3)
                  setGapResult(null)
                  setRecResult(null)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                type="button"
              >
                Ganti Target Job
              </button>
              <button className="btn-restart" onClick={resetUpload} type="button">
                Upload CV Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
