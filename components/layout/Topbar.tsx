'use client'
import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title: string
  subtitle?: string
  onRefresh?: () => void
  refreshing?: boolean
  lastUpdated?: string
}

export default function Topbar({ title, subtitle, onRefresh, refreshing, lastUpdated }: TopbarProps) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="h-14 bg-[#0d1117] border-b border-[#1e2a35] flex items-center justify-between px-6 sticky top-0 z-30 flex-shrink-0">
      <div>
        <h1 className="text-sm font-bold text-[#e2e8f0]">{title}</h1>
        {subtitle && <p className="text-[10px] text-[#4a5568]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="font-mono text-[10px] text-[#2d3f4e] bg-[#07090f] border border-[#1e2a35] rounded px-2 py-1">
            Updated {lastUpdated}
          </span>
        )}
        <div className="font-mono text-[10px] text-[#4a5568]">{time}</div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(0,212,160,0.08)] border border-[rgba(0,212,160,0.2)] rounded-lg text-[#00d4a0] text-[11px] font-bold transition-all hover:bg-[#00d4a0] hover:text-black',
              refreshing && 'opacity-60 cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('w-3 h-3', refreshing && 'animate-spin')} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        )}
      </div>
    </header>
  )
}
