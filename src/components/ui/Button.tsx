import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

  const variants = {
    primary:
      'bg-[#22C55E] hover:bg-[#16a34a] text-white focus-visible:ring-[#22C55E] shadow-sm hover:shadow-md',
    secondary:
      'bg-[#006E2F] hover:bg-[#005525] text-white focus-visible:ring-[#006E2F] shadow-sm hover:shadow-md',
    outline:
      'border-2 border-[#006E2F] text-[#006E2F] bg-white hover:bg-[#006E2F] hover:text-white focus-visible:ring-[#006E2F]',
    ghost:
      'text-[#006E2F] hover:bg-[#E6EEFF] focus-visible:ring-[#22C55E]',
    danger:
      'border-2 border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white focus-visible:ring-red-500',
  }

  const sizes = {
    sm: 'text-sm px-4 py-1.5',
    md: 'text-sm px-6 py-2.5',
    lg: 'text-base px-8 py-3',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Memproses...
        </>
      ) : (
        children
      )}
    </button>
  )
}
