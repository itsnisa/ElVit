import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/landing/Hero'
import RadarSection from '../components/landing/RadarSection'
import StatsBar from '../components/landing/StatsBar'
import FlowAlur from '../components/landing/FlowAlur'
import SubdomainCards from '../components/landing/SubdomainCards'
import DemoPanel from '../components/landing/DemoPanel'
import StandardsSection from '../components/landing/StandardsSection'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [hash])

  return (
    <div className="wrap">
      <Hero />
      <RadarSection />
      <StatsBar />
      <FlowAlur />

      {/* ASESMEN (Manual Assessment preview) */}
      <section id="asesmen" className="page-section">
        <div className="section-head">
          <div>
            <div className="section-num">02 — INPUT UTAMA</div>
            <h2>Asesmen kompetensi teknis</h2>
          </div>
          <p>Bentuk kuesioner self-assessment yang jadi salah satu sumber data utama sistem.</p>
        </div>
        <div className="assess-panel">
          <div className="assess-top">
            <div className="at-title">
              Nilai level kemampuanmu
              <span>Subdomain: Data Engineering · hard skill only</span>
            </div>
            <div className="subdomain-tabs">
              <span className="stab">Software Dev</span>
              <span className="stab active">Data Engineering</span>
              <span className="stab">Cybersecurity</span>
              <span className="stab">Cloud Computing</span>
            </div>
          </div>
          <div className="assess-body">
            <div className="arow">
              <div className="askill">
                SQL<small>Query, optimisasi, desain skema</small>
              </div>
              <div className="level-pills">
                <span className="lp">Tidak Tahu</span>
                <span className="lp">Dasar</span>
                <span className="lp">Menengah</span>
                <span className="lp sel">Mahir</span>
              </div>
            </div>
            <div className="arow">
              <div className="askill">
                Python (ETL)<small>Scripting untuk pipeline data</small>
              </div>
              <div className="level-pills">
                <span className="lp">Tidak Tahu</span>
                <span className="lp">Dasar</span>
                <span className="lp sel">Menengah</span>
                <span className="lp">Mahir</span>
              </div>
            </div>
          </div>
          <div className="assess-foot">
            <span>4 DARI 12 SKILL DINILAI</span>
            <span>HASIL OTOMATIS DIBANDINGKAN KE BENCHMARK LOWONGAN →</span>
          </div>
        </div>
      </section>

      <SubdomainCards />
      <DemoPanel />

      <StandardsSection />

      <section style={{ borderBottom: 'none' }} className="page-section">
        <div className="cta-block">
          <h2>Mulai dari asesmen mandiri, bukan tebakan.</h2>
          <p>
            Isi self-assessment kompetensi teknismu, dan lihat celah yang paling menentukan langkah
            karir berikutnya.
          </p>
          <Link to="/self-assessment" className="btn-primary">
            Mulai Asesmen Kompetensi
          </Link>
        </div>
      </section>
    </div>
  )
}
