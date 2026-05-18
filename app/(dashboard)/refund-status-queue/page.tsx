'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import { SectionHeader, StatusBadge, EmptyState, Pill } from '@/components/ui'
import { fmtTs } from '@/lib/utils'
import type { RefundStatusQueue } from '@/types'

export default function RefundStatusQueuePage() {
  const [data, setData] = useState<RefundStatusQueue[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'complete'>('all')

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/sheets/refund-status-queue')
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setData(j.data)
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    setRefreshing(false)
  }, [])

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

  const active    = data.filter(r => r.status?.toLowerCase() !== 'complete')
  const complete  = data.filter(r => r.status?.toLowerCase() === 'complete')
  const displayed = filter === 'active' ? active : filter === 'complete' ? complete : data

  // Step breakdown
  const steps = ['1','2','3','Complete'].map(s => ({
    label: s === 'Complete' ? 'Complete' : `Step ${s}`,
    count: data.filter(r => String(r.step) === s || r.status?.toLowerCase() === s.toLowerCase()).length
  }))

  const totalToday = data.filter(r => {
    if (!r.startedAt) return false
    const d = new Date(r.startedAt)
    const n = new Date()
    return d.getDate()===n.getDate() && d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear()
  }).length

  return (
    <div className="flex flex-col flex-1">
      <Topbar
        title="Refund & Returns Queue"
        subtitle="Tracks refund requests and return cases with condition and step tracking"
        onRefresh={load} refreshing={refreshing} lastUpdated={lastUpdated}
      />
      <div className="p-6 flex flex-col gap-5">
        {error && <div className="bg-[#0d1117] border border-[#ff4d6a] rounded-xl p-4 text-[#ff4d6a] text-sm">⚠️ {error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Active Cases',    value: active.length,   color: 'text-[#ffb547]' },
            { label: 'Completed Today', value: totalToday,      color: 'text-[#00d4a0]' },
            { label: 'Total Resolved',  value: complete.length, color: 'text-[#4d9fff]' },
            { label: 'Total Cases',     value: data.length,     color: 'text-[#a0aec0]' },
          ].map(m => (
            <div key={m.label} className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
              <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] mb-1.5">{m.label}</div>
              <div className={`font-mono text-2xl font-medium ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Step funnel */}
        <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-5">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#718096] mb-4">Pipeline Steps</div>
          <div className="flex gap-3">
            {steps.map((s, i) => {
              const colors = ['#4d9fff','#8b5cf6','#ffb547','#00d4a0']
              return (
                <div key={s.label} className="flex-1 rounded-lg p-3 text-center" style={{ background: `${colors[i]}10`, border: `1px solid ${colors[i]}25` }}>
                  <div className="font-mono text-xl font-medium mb-1" style={{ color: colors[i] }}>{s.count}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wide text-[#4a5568]">{s.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Table */}
        <div>
          <SectionHeader title="Refund & Returns Cases" right={
            <div className="flex bg-[#07090f] border border-[#1e2a35] rounded-lg overflow-hidden">
              {(['all','active','complete'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-[10px] font-bold capitalize transition-all ${filter===f ? 'bg-[#00d4a0] text-black' : 'text-[#718096] hover:text-[#a0aec0]'}`}>
                  {f}
                </button>
              ))}
            </div>
          } />
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a35]">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                {displayed.length} {filter === 'all' ? 'total' : filter} cases
              </span>
              <Pill color={active.length > 0 ? 'amber' : 'green'}>
                {active.length} active
              </Pill>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[rgba(0,0,0,0.2)]">
                    {['#','Phone','Started At','Order #','Reason','Condition','Step','Status','Completed At'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] text-left whitespace-nowrap border-b border-[#1e2a35]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.length === 0
                    ? <EmptyState icon="↩️" title="No refund or return cases" subtitle="Cases appear as customers submit requests" />
                    : [...displayed].reverse().map((r, i) => (
                      <tr key={i} className={`border-b border-[#1e2a35]/50 hover:bg-[rgba(255,255,255,0.01)] transition-colors ${r.status?.toLowerCase() !== 'complete' ? 'bg-[rgba(255,181,71,0.02)]' : ''}`}>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-[#4a5568]">{r.rowNumber || i+1}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#00d4a0]">{r.phone || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-[#718096] whitespace-nowrap">{fmtTs(r.startedAt)}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#4d9fff]">{r.orderNumber || '—'}</td>
                        <td className="px-4 py-2.5 text-[11px] text-[#a0aec0] max-w-[160px] truncate">{r.reason || '—'}</td>
                        <td className="px-4 py-2.5 text-[11px] text-[#718096] max-w-[140px] truncate">{r.condition || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#8b5cf6]">{r.step || '—'}</td>
                        <td className="px-4 py-2.5"><StatusBadge value={r.status || '—'} /></td>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-[#718096] whitespace-nowrap">{r.completedAt ? fmtTs(r.completedAt) : '—'}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
