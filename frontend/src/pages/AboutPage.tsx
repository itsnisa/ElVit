export default function AboutPage() {
  return (
    <div className="wrap fade-in">
      <div className="page-hero" style={{ borderBottom: 'none' }}>
        <div className="eyebrow">TENTANG PROYEK</div>
        <h1>
          Riset: Deteksi Kesenjangan Kompetensi IT dengan Pendekatan Hybrid NLP
        </h1>
        <p>
          Aplikasi ElvIT dibangun sebagai prototipe hasil penelitian untuk mendeteksi gap antara 
          kompetensi yang dimiliki individu dengan kebutuhan industri secara otomatis.
        </p>
      </div>

      <section className="page-section">
        <div className="section-head">
          <div>
            <div className="section-num">01 — LATAR BELAKANG</div>
            <h2>Mengapa ElvIT dibangun?</h2>
          </div>
        </div>
        <div style={{ maxWidth: 700, margin: '0 auto', fontSize: 16, lineHeight: 1.7, color: 'var(--fg)' }}>
          <p style={{ marginBottom: 16 }}>
            Perkembangan teknologi yang cepat membuat keterampilan teknis di bidang IT (hard skills) menjadi 
            sangat dinamis. Hal ini seringkali menciptakan kesenjangan antara kurikulum akademis atau 
            pembelajaran mandiri dengan apa yang sebenarnya dibutuhkan oleh industri saat ini.
          </p>
          <p>
            ElvIT mencoba menjembatani kesenjangan tersebut dengan memanfaatkan Natural Language Processing (NLP) 
            untuk mengekstrak skill dari dokumen CV atau kuesioner mandiri, lalu membandingkannya secara 
            langsung dengan data historis lowongan pekerjaan (job vacancies) nyata di Indonesia.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="section-head">
          <div>
            <div className="section-num">02 — KERANGKA ACUAN</div>
            <h2>SKKNI &amp; SFIA</h2>
          </div>
        </div>
        <div style={{ maxWidth: 700, margin: '0 auto', fontSize: 16, lineHeight: 1.7, color: 'var(--fg)' }}>
          <p style={{ marginBottom: 16 }}>
            Untuk memastikan bahwa terminologi skill yang digunakan terstandarisasi, proyek ini merujuk pada 
            dua kerangka utama:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginBottom: 16 }}>
            <li style={{ marginBottom: 8 }}>
              <b>SKKNI (Standar Kompetensi Kerja Nasional Indonesia)</b> bidang IT sebagai rujukan lokal yang 
              diakui pemerintah dan industri nasional.
            </li>
            <li>
              <b>SFIA (Skills Framework for the Information Age)</b> sebagai rujukan global untuk melengkapi 
              teknologi terbaru yang mungkin belum tercakup sepenuhnya di SKKNI.
            </li>
          </ul>
        </div>
      </section>

      <section className="page-section">
        <div className="section-head">
          <div>
            <div className="section-num">03 — METODOLOGI</div>
            <h2>Sistem Rekomendasi Hybrid</h2>
          </div>
        </div>
        <div style={{ maxWidth: 700, margin: '0 auto', fontSize: 16, lineHeight: 1.7, color: 'var(--fg)' }}>
          <p style={{ marginBottom: 16 }}>
            Rekomendasi pembelajaran (prioritas belajar) yang dihasilkan oleh sistem tidak hanya menggunakan 
            satu metode, melainkan penggabungan dua pendekatan (Hybrid Recommender System):
          </p>
          <ol style={{ listStyleType: 'decimal', paddingLeft: 24, marginBottom: 16 }}>
            <li style={{ marginBottom: 8 }}>
              <b>Content-Based Filtering:</b> Merekomendasikan skill yang memiliki kemiripan konteks atau 
              keterkaitan erat dengan skill yang sudah kamu kuasai (misalnya, jika bisa SQL, direkomendasikan 
              belajar Apache Airflow).
            </li>
            <li>
              <b>Collaborative Filtering:</b> Merekomendasikan skill berdasarkan pola yang dipelajari atau 
              dibutuhkan oleh profil profesional lain yang memiliki target pekerjaan serupa denganmu.
            </li>
          </ol>
        </div>
      </section>
    </div>
  )
}
