import { useState } from 'react'
import SubdomainTabs from './SubdomainTabs'
import SkillLevelPills from './SkillLevelPills'

interface Skill {
  name: string
  desc: string
}

interface AssessmentFormProps {
  skillsData: Record<string, Skill[]>
  onSubmit: (assessedSkills: Record<string, number>) => void
}

export default function AssessmentForm({ skillsData, onSubmit }: AssessmentFormProps) {
  const tabs = Object.keys(skillsData)
  const [activeTab, setActiveTab] = useState(tabs[0] || '')
  // Store the assessment results as { "Skill Name": level }
  const [results, setResults] = useState<Record<string, number>>({})

  const activeSkills = skillsData[activeTab] || []

  const handleLevelChange = (skillName: string, level: number) => {
    setResults((prev) => ({ ...prev, [skillName]: level }))
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const countAssessed = Object.keys(results).length
  const totalSkills = Object.values(skillsData).flat().length

  return (
    <div className="assess-panel">
      <div className="assess-top">
        <div className="at-title">
          Nilai level kemampuanmu
          <span>Pilih subdomain dan nilai secara jujur</span>
        </div>
        <SubdomainTabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      <div className="assess-body">
        {activeSkills.map((skill) => (
          <div className="arow fade-in" key={skill.name}>
            <div className="askill">
              {skill.name}
              <small>{skill.desc}</small>
            </div>
            <SkillLevelPills
              level={results[skill.name] ?? -1}
              onChange={(val) => handleLevelChange(skill.name, val)}
            />
          </div>
        ))}
      </div>

      <div className="assess-foot">
        <span>
          {countAssessed} DARI {totalSkills} SKILL DINILAI
        </span>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: 13 }}
          onClick={() => onSubmit(results)}
          disabled={countAssessed === 0}
          type="button"
        >
          Lihat Hasil Analisis →
        </button>
      </div>
    </div>
  )
}
