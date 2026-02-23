import { cn } from '@/lib/utils'

interface WaneYenLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function WaneYenLogo({ className, size = 'md' }: WaneYenLogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn(
          'text-sky-500',
          size === 'sm' && 'size-6',
          size === 'md' && 'size-8',
          size === 'lg' && 'size-10'
        )}
      >
        <path
          d="M12 2L12 22M2 12L22 12M4.93 4.93L19.07 19.07M19.07 4.93L4.93 19.07"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className={cn('font-bold text-foreground', sizeClasses[size])}>
        เวรเย็น
      </span>
    </div>
  )
}
