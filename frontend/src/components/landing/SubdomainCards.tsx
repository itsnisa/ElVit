const subdomains = [
  { idx: '01', title: 'Software Development', tags: ['JavaScript', 'Git', 'REST API', 'TypeScript', 'Docker'] },
  { idx: '02', title: 'Data Engineering', tags: ['SQL', 'Apache Airflow', 'Apache Spark', 'Python (ETL)', 'BigQuery'] },
  { idx: '03', title: 'Cybersecurity', tags: ['Network Security', 'SIEM', 'Penetration Testing', 'IAM', 'Compliance'] },
  { idx: '04', title: 'Cloud Computing', tags: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'] },
]

export default function SubdomainCards() {
  return (
    <section id="subdomain" className="page-section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-num">03 — CAKUPAN</div>
            <h2>Empat subdomain IT</h2>
          </div>
          <p>Benchmark disusun terpisah per subdomain, merujuk pada kerangka SKKNI bidang IT dan SFIA.</p>
        </div>
        <div className="subdomains">
          {subdomains.map((s) => (
            <div className="sub-card" key={s.idx}>
              <div className="sub-idx">{s.idx}</div>
              <h3>{s.title}</h3>
              <div className="sub-tags">
                {s.tags.map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
