import { cn } from '@/lib/utils'

const MAP: Record<string, string> = {
  angry:      'bg-[rgba(255,77,106,0.12)] text-[#ff4d6a]',
  frustrated: 'bg-[rgba(255,181,71,0.12)] text-[#ffb547]',
  worried:    'bg-[rgba(234,179,8,0.12)]  text-[#eab308]',
  neutral:    'bg-[rgba(113,128,150,0.15)] text-[#718096]',
  happy:      'bg-[rgba(0,212,160,0.12)] text-[#00d4a0]',
}

export default function SentimentBadge({ value }: { value: string }) {
  const key = (value || '').toLowerCase()
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold', MAP[key] || MAP['neutral'])}>
      {value || '—'}
    </span>
  )
}
