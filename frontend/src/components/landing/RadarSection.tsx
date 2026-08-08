export default function RadarSection() {
  return (
    <div className="radar-section">
      <div className="radar-side">
        <div className="rs-num">58<span>%</span></div>
        <h3>Kesesuaian kompetensi — Data Engineer</h3>
        <p>
          Dihitung dari hasil self-assessment kamu dibanding benchmark skill yang paling sering
          diminta pada lowongan Data Engineer.
        </p>
        <div className="gap-line">
          Celah terbesar: <b>Cloud</b> dan <b>Security</b> — jadi prioritas rekomendasi belajar.
        </div>
      </div>

      <div>
        <div className="radar-legend">
          <div className="lg"><span className="sw sw-industri" />Kebutuhan Industri</div>
          <div className="lg"><span className="sw sw-kamu" />Hasil Self-Assessment</div>
        </div>
        <svg viewBox="-50 0 440 350" width="100%" height="auto">
          {/* Grid rings */}
          <polygon points="170.0,50.0 273.9,110.0 273.9,230.0 170.0,290.0 66.1,230.0 66.1,110.0"
            fill="none" stroke="#E2E0D6" strokeWidth="1"/>
          <polygon points="170.0,80.0 247.9,125.0 247.9,215.0 170.0,260.0 92.1,215.0 92.1,125.0"
            fill="none" stroke="#E2E0D6" strokeWidth="1"/>
          <polygon points="170.0,110.0 222.0,140.0 222.0,200.0 170.0,230.0 118.0,200.0 118.0,140.0"
            fill="none" stroke="#E2E0D6" strokeWidth="1"/>
          <polygon points="170.0,140.0 196.0,155.0 196.0,185.0 170.0,200.0 144.0,185.0 144.0,155.0"
            fill="none" stroke="#E2E0D6" strokeWidth="1"/>
          {/* Axes */}
          <line x1="170" y1="170" x2="170" y2="50" stroke="#E2E0D6"/>
          <line x1="170" y1="170" x2="273.9" y2="110" stroke="#E2E0D6"/>
          <line x1="170" y1="170" x2="273.9" y2="230" stroke="#E2E0D6"/>
          <line x1="170" y1="170" x2="170" y2="290" stroke="#E2E0D6"/>
          <line x1="170" y1="170" x2="66.1" y2="230" stroke="#E2E0D6"/>
          <line x1="170" y1="170" x2="66.1" y2="110" stroke="#E2E0D6"/>
          {/* Benchmark (industry) */}
          <polygon
            points="170.0,50.0 253.1,122.0 253.1,218.0 170.0,242.0 86.9,218.0 107.6,134.0"
            fill="none" stroke="#17170F" strokeWidth="1.3" strokeOpacity="0.35"/>
          {/* User (self-assessment) */}
          <polygon
            points="170.0,74.0 253.1,122.0 211.6,194.0 170.0,194.0 128.4,194.0 107.6,134.0"
            fill="rgba(47,111,78,0.14)" stroke="#2F6F4E" strokeWidth="1.6"/>
          {/* Labels */}
          <g style={{ fontFamily: 'var(--mono)', fontSize: '11px', fill: 'var(--muted)' }}>
            <text x="170.0" y="21" textAnchor="middle">Python</text>
            <text x="295.6" y="93.5" textAnchor="start">SQL</text>
            <text x="295.6" y="246.5" textAnchor="start">Cloud</text>
            <text x="170.0" y="331" textAnchor="middle">Security</text>
            <text x="44.4" y="246.5" textAnchor="end">ML</text>
            <text x="44.4" y="93.5" textAnchor="end">Data Modeling</text>
          </g>
        </svg>
      </div>
    </div>
  )
}
