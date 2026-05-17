import { cn } from '@/lib/utils'

// ─── Status Badge ─────────────────────────────────────────────────────────────
interface StatusBadgeProps { value: string; className?: string }

export function StatusBadge({ value, className }: StatusBadgeProps) {
  const v = (value || '').toLowerCase()
  let cls = 'bg-[rgba(113,128,150,0.15)] text-[#718096]'
  if (v.includes('active') || v.includes('confirm') || v.includes('complete') || v.includes('sent') || v.includes('resolved'))
    cls = 'bg-[rgba(0,212,160,0.12)] text-[#00d4a0]'
  if (v.includes('cancel') || v.includes('flagged') || v.includes('jailbreak') || v.includes('escalat'))
    cls = 'bg-[rgba(255,77,106,0.12)] text-[#ff4d6a]'
  if (v.includes('awaiting') || v.includes('collecting') || v.includes('pending') || v.includes('progress'))
    cls = 'bg-[rgba(255,181,71,0.12)] text-[#ffb547]'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap', cls, className)}>
      {value || '—'}
    </span>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps { icon?: string; title: string; subtitle?: string }

export function EmptyState({ icon = '✅', title, subtitle }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={99}>
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="text-3xl mb-3">{icon}</div>
          <div className="text-sm font-semibold text-[#4a5568]">{title}</div>
          {subtitle && <div className="text-xs text-[#2d3f4e] mt-1">{subtitle}</div>}
        </div>
      </td>
    </tr>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps { title: string; right?: React.ReactNode }

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#718096] whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-[#1e2a35]" />
      {right}
    </div>
  )
}

// ─── Live Pill ────────────────────────────────────────────────────────────────
export function LivePill() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded bg-[rgba(0,212,160,0.1)] text-[#00d4a0] font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00d4a0] animate-blink" />
      LIVE
    </span>
  )
}

// ─── Pill Badge ───────────────────────────────────────────────────────────────
export function Pill({ children, color = 'green' }: { children: React.ReactNode; color?: 'green'|'red'|'amber'|'blue' }) {
  const cls = {
    green: 'bg-[rgba(0,212,160,0.1)] text-[#00d4a0]',
    red:   'bg-[rgba(255,77,106,0.1)] text-[#ff4d6a]',
    amber: 'bg-[rgba(255,181,71,0.1)] text-[#ffb547]',
    blue:  'bg-[rgba(77,159,255,0.1)] text-[#4d9fff]',
  }
  return (
    <span className={cn('inline-flex items-center text-[10px] px-2 py-0.5 rounded font-bold', cls[color])}>
      {children}
    </span>
  )
}
