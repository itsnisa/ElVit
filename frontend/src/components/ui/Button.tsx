import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  fullWidth?: boolean
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClass = `btn-${variant}`
  const widthClass = fullWidth ? ' btn-full' : ''
  const classes = `${baseClass}${widthClass} ${className}`.trim()

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Processing...' : children}
    </button>
  )
}
