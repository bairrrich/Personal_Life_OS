import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl',
        'hover:border-white/20 hover:bg-white/10 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface GlassButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function GlassButton({ 
  children, 
  className, 
  variant = 'default',
  ...props 
}: GlassButtonProps) {
  const variants = {
    default: 'bg-primary/20 hover:bg-primary/30 text-primary-foreground border-primary/30',
    outline: 'bg-transparent hover:bg-white/10 text-foreground border-white/20',
    ghost: 'bg-transparent hover:bg-white/10 text-foreground border-transparent',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-300 backdrop-blur-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
