import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero" style={{ borderBottom: 'none', paddingBottom: 0 }}>
      <div className="eyebrow">DETEKSI KESENJANGAN KOMPETENSI TEKNIS IT</div>
      <h1>
        Kesenjangan skill kamu,<br />
        <em>terlihat jelas</em> bukan dugaan.
      </h1>
      <p className="hero-desc">
        ElvIT memadukan hasil asesmen mandiri dengan data lowongan kerja nyata dari LinkedIn,
        Jobstreet, dan Glints memakai NLP &amp; machine learning untuk mendeteksi gap kompetensi
        teknis dan memberi rekomendasi belajar yang personal.
      </p>
      <div className="hero-actions">
        <Link to="/scan-cv" className="btn-primary">
          Upload CV &amp; Scan Skill →
        </Link>
        <a className="link-arrow" href="#asesmen">
          Atau asesmen manual ↓
        </a>
      </div>
      <div className="scope-tags">
        <span>4 SUBDOMAIN IT</span>
        <span>ACUAN SKKNI &amp; SFIA</span>
        <span>BILINGUAL ID/EN</span>
        <span>FOKUS HARD SKILL</span>
      </div>
    </section>
  )
}
