import elvitIcon from '@/assets/elvit-icon.svg'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-wrap">
        <div className="logo">
          <img src={elvitIcon} alt="ElvIT Logo" style={{ width: '100px', height: '28px' }} />
        </div>
        <div className="foot-meta">
          RISET: DETEKSI KESENJANGAN &amp; REKOMENDASI KOMPETENSI IT · CRISP-DM · SKKNI &amp; SFIA
        </div>
      </div>
    </footer>
  )
}
