const skills = [
  { name: 'SQL', pct: 92 },
  { name: 'Python (ETL)', pct: 70 },
  { name: 'Cloud Data Warehouse', pct: 35 },
]

const recs = [
  { name: 'Apache Airflow', priority: 'PRIORITAS 1', meta: 'Content-based — mirip skill SQL/ETL kamu' },
  { name: 'Cloud Data Warehouse', priority: 'PRIORITAS 2', meta: 'Content-based — sering diminta bareng SQL' },
  { name: 'Apache Spark', priority: 'PRIORITAS 3', meta: 'Collaborative — dipelajari peer serupa profilmu' },
]

export default function DemoPanel() {
  return (
    <section id="cek" className="page-section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-num">04 — CONTOH HASIL</div>
            <h2>Gap kamu dan rekomendasi hybrid</h2>
          </div>
          <p>Ilustrasi keluaran untuk profil dengan target Data Engineer. Rekomendasi menggabungkan dua pendekatan sekaligus.</p>
        </div>

        <div className="demo-panel">
          <div className="demo-top">
            <div className="sel">
              Target: <b>Data Engineer</b> · Subdomain: <b>Data Engineering</b>
            </div>
            <div className="pct-badge">KESESUAIAN 58%</div>
          </div>
          <div className="demo-body">
            <div className="demo-col">
              <h4>Hasil self-assessment</h4>
              {skills.map((s) => (
                <div className="skill-row" key={s.name}>
                  <span>{s.name}</span>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="pct">{s.pct}%</span>
                </div>
              ))}
            </div>
            <div className="demo-col">
              <h4>Rekomendasi hybrid</h4>
              {recs.map((r) => (
                <div className="rec-row" key={r.name}>
                  <div className="rtop">
                    <span>{r.name}</span>
                    <b>{r.priority}</b>
                  </div>
                  <div className="rmeta">{r.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
