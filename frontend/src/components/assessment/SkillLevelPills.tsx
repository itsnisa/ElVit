interface SkillLevelPillsProps {
  level: number
  onChange: (level: number) => void
}

const levels = [
  { val: 0, label: 'Tidak Tahu' },
  { val: 1, label: 'Dasar' },
  { val: 2, label: 'Menengah' },
  { val: 3, label: 'Mahir' },
]

export default function SkillLevelPills({ level, onChange }: SkillLevelPillsProps) {
  return (
    <div className="level-pills">
      {levels.map((lvl) => (
        <span
          key={lvl.val}
          className={`lp ${level === lvl.val ? 'sel' : ''}`}
          onClick={() => onChange(lvl.val)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onChange(lvl.val)
            }
          }}
          role="button"
          tabIndex={0}
        >
          {lvl.label}
        </span>
      ))}
    </div>
  )
}
