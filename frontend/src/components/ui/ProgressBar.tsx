interface ProgressBarProps {
  progress: number // 0-100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="bar-wrap">
      <div className="bar-fill" style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
    </div>
  )
}
