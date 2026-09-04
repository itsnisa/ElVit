interface SubdomainTabsProps {
  tabs: string[]
  activeTab: string
  onChange: (tab: string) => void
}

export default function SubdomainTabs({ tabs, activeTab, onChange }: SubdomainTabsProps) {
  return (
    <div className="subdomain-tabs">
      {tabs.map((tab) => (
        <span
          key={tab}
          className={`stab ${tab === activeTab ? 'active' : ''}`}
          onClick={() => onChange(tab)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onChange(tab)
            }
          }}
          role="button"
          tabIndex={0}
        >
          {tab}
        </span>
      ))}
    </div>
  )
}
