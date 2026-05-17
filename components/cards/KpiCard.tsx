import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: number | string
  sub?: string
  color?: 'green' | 'red' | 'amber' | 'blue' | 'purple'
  icon?: LucideIcon
  urgent?: boolean
  pulse?: boolean
}

const COLOR_MAP = {
  green:  { text: 'text-[#00d4a0]', accent: 'bg-[#00d4a0]', glow: 'hover:shadow-glow-green' },
  red:    { text: 'text-[#ff4d6a]', accent: 'bg-[#ff4d6a]', glow: 'hover:shadow-glow-red' },
  amber:  { text: 'text-[#ffb547]', accent: 'bg-[#ffb547]', glow: '' },
  blue:   { text: 'text-[#4d9fff]', accent: 'bg-[#4d9fff]', glow: '' },
  purple: { text: 'text-[#8b5cf6]', accent: 'bg-[#8b5cf6]', glow: '' },
}

export default function KpiCard({ label, value, sub, color = 'green', icon: Icon, urgent, pulse }: KpiCardProps) {
  const c = COLOR_MAP[color]
  return (
    <div className={cn(
      'relative bg-[#0d1117] border rounded-xl p-4 overflow-hidden transition-all duration-200 group',
      urgent && pulse ? 'animate-pulse-border' : 'border-[#1e2a35]',
      urgent && !pulse ? 'border-[rgba(255,77,106,0.35)]' : '',
      c.glow
    )}>
      {/* Top accent line */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px]', c.accent)} />

      {/* Icon */}
      {Icon && (
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center mb-3', `bg-[${c.text}]/10`)}>
          <Icon className={cn('w-3.5 h-3.5', c.text)} />
        </div>
      )}

      <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] mb-2">{label}</div>
      <div className={cn('font-mono text-3xl font-medium leading-none mb-1.5', c.text)}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-[#4a5568]">{sub}</div>}

      {/* Urgent glow overlay */}
      {urgent && (
        <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-br from-[rgba(255,77,106,0.03)] to-transparent" />
      )}
    </div>
  )
}
