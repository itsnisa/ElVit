const steps = [
  { n: '01', title: 'Business Understanding', desc: 'Merumuskan masalah skill gap & acuan SKKNI/SFIA.' },
  { n: '02', title: 'Data Understanding', desc: 'Eksplorasi dataset Kaggle & karakteristik lowongan kerja.' },
  { n: '03', title: 'Data Preparation', desc: 'Preprocessing bilingual (Sastrawi + NLTK), TF-IDF & IndoBERT.' },
  { n: '04', title: 'Modeling', desc: 'RF, SVM, XGBoost, BERT + hybrid recommender.' },
  { n: '05', title: 'Evaluation', desc: 'F1, cross-validation, NDCG & MAP untuk rekomendasi.' },
  { n: '06', title: 'Deployment', desc: 'Prototipe web + pengujian usability dengan SUS.' },
]

export default function CrispSteps() {
  return (
    <div className="crisp-list">
      {steps.map((s) => (
        <div className="crisp-step" key={s.n}>
          <div className="cn">{s.n}</div>
          <div>
            <h5>{s.title}</h5>
            <p>{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
