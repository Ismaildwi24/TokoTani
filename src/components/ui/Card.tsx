import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Card({
  children,
  className = '',
  onClick,
  hover = false,
  padding = 'md',
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E7E8EC] shadow-sm ${paddings[padding]} ${
        hover ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardImageProps {
  children: React.ReactNode
  className?: string
}

export function CardImage({ children, className = '' }: CardImageProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {children}
    </div>
  )
}
