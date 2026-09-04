export default function StatsBar() {
  const stats = [
    { num: '85 Juta', lbl: 'pekerjaan diproyeksi tergantikan otomasi (2025)' },
    { num: '97 Juta', lbl: 'pekerjaan baru muncul, didominasi bidang teknologi' },
    { num: '4', lbl: 'subdomain IT: Dev, Data, Security, Cloud' },
    { num: '3', lbl: 'platform lowongan: LinkedIn, Jobstreet, Glints' },
  ]

  return (
    <div className="stats">
      <div className="stats-row">
        {stats.map((s) => (
          <div className="stat" key={s.num}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>
      <div className="stats-src">SUMBER — WORLD ECONOMIC FORUM, 2020</div>
    </div>
  )
}
