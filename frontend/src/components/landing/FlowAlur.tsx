const flows = [
  { n: '01', title: 'Pilih Metode Input', desc: 'Gunakan fitur Scan CV, Self Assessment, atau Input Manual untuk memasukkan data skill Anda.' },
  { n: '02', title: 'Tentukan Target Pekerjaan', desc: 'Pilih kategori posisi atau peran spesifik di industri IT yang ingin Anda tuju.' },
  { n: '03', title: 'Analisis Kesenjangan (Gap)', desc: 'Sistem akan secara instan membandingkan profil skill Anda dengan standar riil di industri.' },
  { n: '04', title: 'Dapatkan Rekomendasi', desc: 'Terima hasil analisis berupa daftar prioritas skill yang perlu Anda pelajari selanjutnya.' },
]

export default function FlowAlur() {
  return (
    <section id="alur" className="page-section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-num">01 — CARA KERJA</div>
            <h2>Bagaimana cara kerja ElvIT?</h2>
          </div>
          <p>Empat langkah mudah, dari penginputan data profil skill hingga mendapatkan rekomendasi personal yang bisa langsung ditindaklanjuti.</p>
        </div>
        <div className="flow-list">
          {flows.map((f) => (
            <div className="flow-row" key={f.n}>
              <div className="fn">{f.n}</div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
              <div />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
