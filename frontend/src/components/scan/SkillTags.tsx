import { useRef, useState } from 'react'

interface SkillTagsProps {
  skills: string[]
  extractionNotes?: string
  onRemove: (index: number) => void
  onAdd: (skill: string) => void
}

export default function SkillTags({ skills, extractionNotes, onRemove, onAdd }: SkillTagsProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    const val = input.trim()
    if (!val) return
    onAdd(val)
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="skill-area">
      <h4>Skill ditemukan dari CV</h4>
      <div className="sa-meta">
        {skills.length} skill terdeteksi · {extractionNotes || 'NLP pipeline'}
      </div>
      <div className="skill-tags">
        {skills.map((s, i) => (
          <div className="skill-tag fade-in" key={`${s}-${i}`}>
            <span>{s}</span>
            <button onClick={() => onRemove(i)} title="Hapus skill ini" type="button">×</button>
          </div>
        ))}
      </div>
      <div className="skill-add-row">
        <input
          ref={inputRef}
          type="text"
          className="skill-add-input"
          id="addSkillInput"
          placeholder="Tambah skill manual..."
          aria-label="Tambah skill manual"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
        />
        <button className="skill-add-btn" onClick={handleAdd} type="button">+ Tambah</button>
      </div>
    </div>
  )
}
