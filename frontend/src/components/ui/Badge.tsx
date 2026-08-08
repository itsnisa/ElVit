import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'warn' | 'mono'
  className?: string
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  let vClass = ''
  if (variant === 'accent') vClass = 'pct-badge'
  else if (variant === 'warn') vClass = 'priority-badge bg-warn text-white border-warn' // Adjust if needed
  else if (variant === 'mono') vClass = 'file-badge'

  return (
    <span className={`${vClass} ${className}`.trim()}>
      {children}
    </span>
  )
}
