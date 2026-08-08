interface JobSelectorProps {
  categories: string[]
  value: string
  onChange: (val: string) => void
}

function capitalize(s: string) {
  return s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function JobSelector({ categories, value, onChange }: JobSelectorProps) {
  return (
    <div className="job-select-wrap">
      <select
        className="job-select"
        id="jobSelect"
        aria-label="Pilih kategori pekerjaan target"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— Pilih job category —</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{capitalize(cat)}</option>
        ))}
      </select>
    </div>
  )
}
