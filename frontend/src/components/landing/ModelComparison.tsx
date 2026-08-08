const models = [
  { name: 'BERT-based', val: 0.91, pct: 91, best: true },
  { name: 'XGBoost', val: 0.87, pct: 87, best: false },
  { name: 'Random Forest', val: 0.84, pct: 84, best: false },
  { name: 'SVM', val: 0.78, pct: 78, best: false },
]

export default function ModelComparison() {
  return (
    <div>
      <div className="model-list">
        {models.map((m) => (
          <div className={`model-row${m.best ? ' best' : ''}`} key={m.name}>
            <div className="mname">{m.name}</div>
            <div className="model-bar-bg">
              <div className="model-bar-fill" style={{ width: `${m.pct}%` }} />
            </div>
            <div className="mval">.{String(m.pct)}</div>
          </div>
        ))}
      </div>
      <p className="model-note">
        Klasifikasi dievaluasi dengan accuracy/precision/recall/F1 + k-fold cross validation.
        Rekomendasi hybrid dievaluasi terpisah dengan NDCG &amp; MAP. Nilai bersifat ilustratif.
      </p>
    </div>
  )
}
