import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}

export default function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconClick,
  className = '',
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F9093]">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`w-full rounded-xl border border-[#E7E8EC] bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-[#8F9093] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all ${
            icon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error ? 'border-red-400 focus:ring-red-400' : ''
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8F9093] hover:text-gray-600"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full rounded-xl border border-[#E7E8EC] bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-[#8F9093] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all resize-none ${
          error ? 'border-red-400 focus:ring-red-400' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}
