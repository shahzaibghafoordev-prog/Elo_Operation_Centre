'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import { SectionHeader, StatusBadge, EmptyState } from '@/components/ui'
import SentimentBadge from '@/components/ui/SentimentBadge'
import { fmtTs } from '@/lib/utils'
import type { PreQual } from '@/types'

const FUNNEL_STEPS = [
  { label: 'Step 1', color: '#4d9fff' },
  { label: 'Step 2', color: '#8b5cf6' },
  { label: 'Step 3', color: '#ffb547' },
  { label: 'Complete', color: '#00d4a0' },
  { label: 'Cancelled', color: '#ff4d6a' },
]

export default function PreQualPage() {
  const [data, setData] = useState<PreQual[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/sheets/prequal')
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setData(j.data)
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    }
    setRefreshing(false)
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [load])

  // Step can be "1","2","3" OR "Complete" OR "Cancelled" — handle all cases
  const counts = [
    data.filter(r => r.step === '1' || r.step === '1.0').length,
    data.filter(r => r.step === '2' || r.step === '2.0').length,
    data.filter(r => r.step === '3' || r.step === '3.0').length,
    data.filter(r => r.status?.toLowerCase() === 'complete' || r.step?.toLowerCase() === 'complete').length,
    data.filter(r => r.status?.toLowerCase() === 'cancelled' || r.step?.toLowerCase() === 'cancelled').length,
  ]
  const max = Math.max(...counts, 1)

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Pre-Qualification Funnel" subtitle="Customer issue collection pipeline"
        onRefresh={load} refreshing={refreshing} lastUpdated={lastUpdated} />
      <div className="p-6 flex flex-col gap-5">
        {error && <div className="bg-[#0d1117] border border-[#ff4d6a] rounded-xl p-4 text-[#ff4d6a] text-sm">⚠️ {error}</div>}

        <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-6">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#718096] mb-5">Pipeline Funnel</div>
          <div className="flex flex-col gap-3">
            {FUNNEL_STEPS.map((step, idx) => {
              const n = counts[idx]
              const pct = Math.round(n / max * 100)
              return (
                <div key={step.label} className="flex items-center gap-4">
                  <div className="text-[11px] text-[#718096] w-20 text-right shrink-0">{step.label}</div>
                  <div className="flex-1 h-7 bg-[rgba(255,255,255,0.03)] rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                      style={{
                        width: `${Math.max(pct, n > 0 ? 6 : 0)}%`,
                        background: `${step.color}20`,
                        border: `1px solid ${step.color}40`
                      }}
                    >
                      {n > 0 && <span className="font-mono text-[11px] font-bold" style={{ color: step.color }}>{n}</span>}
                    </div>
                  </div>
                  <div className="font-mono text-[10px] text-[#4a5568] w-8 text-right">{pct}%</div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <SectionHeader title="All Pre-Qualification Entries" />
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[rgba(0,0,0,0.2)]">
                    {['Phone', 'Started At', 'Order #', 'Original Message', 'Issue Type', 'Step', 'Sentiment', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] text-left whitespace-nowrap border-b border-[#1e2a35]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <EmptyState icon="🔍" title="No pre-qualification entries" subtitle="Entries appear as Alia collects customer info" />
                  ) : (
                    [...data].reverse().map((r, i) => (
                      <tr key={i} className="border-b border-[#1e2a35]/50 hover:bg-[rgba(255,255,255,0.01)]">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#00d4a0]">{r.phone || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-[#718096] whitespace-nowrap">{fmtTs(r.startedAt)}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#4d9fff]">{r.orderNumber || '—'}</td>
                        <td className="px-4 py-2.5 text-[11px] text-[#a0aec0] max-w-[200px]">
                          <span className="block truncate" title={r.originalMessage}>{r.originalMessage || '—'}</span>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-[#718096]">{r.issueType || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#8b5cf6]">{r.step || '—'}</td>
                        <td className="px-4 py-2.5"><SentimentBadge value={r.sentiment} /></td>
                        <td className="px-4 py-2.5"><StatusBadge value={r.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
