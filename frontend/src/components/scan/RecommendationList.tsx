import type { RecommendationResult } from '../../types'

interface RecommendationListProps {
  rec: RecommendationResult
  jobLabel: string
}

export default function RecommendationList({ rec, jobLabel }: RecommendationListProps) {
  const recs = (rec.recommendations || []).slice(0, 8)

  return (
    <div className="rec-section">
      <h3>Rekomendasi Prioritas Belajar</h3>
      <div className="rec-sub">
        Berdasarkan gap yang ditemukan, berikut skill yang paling perlu dipelajari untuk target job{' '}
        <span id="recJobLabel" style={{ fontWeight: 600 }}>{jobLabel}</span>:
      </div>
      <div className="rec-score-legend">
        <span className="rec-score-legend-icon">ℹ</span>
        <span>
          <b>Probabilitas</b> = keyakinan model ML bahwa skill tersebut dibutuhkan untuk target job.
          Semakin tinggi probabilitas, semakin mendesak skill itu dipelajari.
        </span>
      </div>
      <div>
        {recs.length === 0 ? (
          <div className="rec-full-row" style={{ color: 'var(--muted)', fontSize: 13 }}>
            Tidak ada rekomendasi spesifik.
          </div>
        ) : (
          recs.map((r, i) => {
            const prioText =
              i === 0
                ? 'PRIORITAS 1 — Sangat Kritis'
                : i === 1
                ? 'PRIORITAS 2 — Kritis'
                : i === 2
                ? 'PRIORITAS 3 — Tinggi'
                : `PRIORITAS ${i + 1}`

            return (
              <div className="rec-full-row fade-in" key={r.skill}>
                <div className="rtop">
                  <span>{r.skill}</span>
                  <b>{prioText}</b>
                </div>
                <div className="rmeta">
                  Diperlukan untuk target role <em>{jobLabel}</em> — diprediksi oleh model multi-label skill
                </div>
                <div className="rfreq">
                  <span title="Probabilitas model bahwa skill ini dibutuhkan untuk kategori target">
                    Probabilitas: {Math.round(r.prob * 100)}%
                  </span>
                  {' · '}
                  <span className="rfreq-score">
                    Prioritas: #{r.priority_rank}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
