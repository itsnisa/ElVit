const scopes = [
  { n: '01', label: 'Domain', desc: '4 subdomain IT — Software Development, Data Engineering, Cybersecurity, Cloud Computing.' },
  { n: '02', label: 'Acuan Kompetensi', desc: 'Kerangka SKKNI bidang IT dan SFIA (Skills Framework for the Information Age).' },
  { n: '03', label: 'Sumber Data', desc: 'Kuesioner self-assessment kompetensi profesional IT, serta deskripsi lowongan kerja daring.' },
  { n: '04', label: 'Bahasa', desc: 'Indonesia dan Inggris, mengikuti praktik penulisan lowongan kerja yang bersifat bilingual.' },
  { n: '05', label: 'Cakupan Skill', desc: 'Hanya kompetensi teknis (hard skill); soft skill tidak dievaluasi secara mendalam.' },
]

export default function ScopeList() {
  return (
    <section id="lingkup" className="page-section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-num">01 — BATASAN MASALAH</div>
            <h2>Ruang lingkup penelitian</h2>
          </div>
          <p>Agar hasil tetap fokus dan bisa dievaluasi secara objektif, sistem dibatasi pada lingkup berikut.</p>
        </div>
        <div className="scope-list">
          {scopes.map((s) => (
            <div className="scope-row" key={s.n}>
              <div className="sn">{s.n}</div>
              <div className="sl">{s.label}</div>
              <div className="sd">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
