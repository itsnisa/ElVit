const stackItems = ['FastAPI · backend', 'React.js · frontend', 'PostgreSQL · database', 'SUS · usability testing']

export default function StandardsSection() {
  return (
    <section id="standar" className="page-section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-num">05 — ACUAN &amp; TEKNOLOGI</div>
            <h2>Berpijak pada standar yang diakui</h2>
          </div>
          <p />
        </div>

        <div className="standards">
          <div className="std-col">
            <div className="std-tag">SKKNI</div>
            <h3>Standar Kompetensi Kerja Nasional Indonesia</h3>
            <p>
              Kerangka kompetensi resmi yang digunakan sebagai acuan lokal untuk memetakan kebutuhan
              skill di industri IT Indonesia.
            </p>
          </div>
          <div className="std-col">
            <div className="std-tag">SFIA</div>
            <h3>Skills Framework for the Information Age</h3>
            <p>
              Kerangka kompetensi internasional yang melengkapi SKKNI agar benchmark tetap relevan
              secara global.
            </p>
          </div>
        </div>

        <div className="stack-row">
          <div className="ss-label">Prototipe dibangun dengan</div>
          <div className="stack-badges">
            {stackItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
