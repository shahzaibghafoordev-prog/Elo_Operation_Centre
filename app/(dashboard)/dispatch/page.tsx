'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import { SectionHeader, StatusBadge, EmptyState } from '@/components/ui'
import { fmtTs, isToday } from '@/lib/utils'
import type { Dispatch } from '@/types'

export default function DispatchPage() {
  const [data, setData] = useState<Dispatch[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/sheets/dispatch')
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setData(j.data)
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    setRefreshing(false)
  }, [])

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

  const todayCount = data.filter(d => isToday(d.ts)).length

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Dispatch Notifications" subtitle="Order dispatch and tracking notifications sent to customers"
        onRefresh={load} refreshing={refreshing} lastUpdated={lastUpdated} />
      <div className="p-6 flex flex-col gap-5">
        {error && <div className="bg-[#0d1117] border border-[#ff4d6a] rounded-xl p-4 text-[#ff4d6a] text-sm">⚠️ {error}</div>}

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Dispatched Today', value: todayCount, color: 'text-[#00d4a0]' },
            { label: 'Total Dispatches', value: data.length, color: 'text-[#a0aec0]' },
            { label: 'Unique Couriers', value: new Set(data.map(d=>d.courier).filter(Boolean)).size, color: 'text-[#4d9fff]' },
          ].map(m => (
            <div key={m.label} className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
              <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] mb-1.5">{m.label}</div>
              <div className={`font-mono text-2xl font-medium ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>

        <div>
          <SectionHeader title="Dispatch Log" />
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[rgba(0,0,0,0.2)]">
                    {['Timestamp','Phone','Order #','Item','Tracking #','Courier','Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] text-left whitespace-nowrap border-b border-[#1e2a35]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0
                    ? <EmptyState icon="📦" title="No dispatch notifications yet" subtitle="Dispatches will appear here as orders ship" />
                    : [...data].reverse().map((r, i) => (
                      <tr key={i} className="border-b border-[#1e2a35]/50 hover:bg-[rgba(255,255,255,0.01)]">
                        <td className="px-4 py-2.5 font-mono text-[10px] text-[#718096] whitespace-nowrap">{fmtTs(r.ts)}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#718096]">{r.phone || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#00d4a0]">{r.orderNumber || '—'}</td>
                        <td className="px-4 py-2.5 text-[12px] text-[#a0aec0] max-w-[150px] truncate">{r.item || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-[#4d9fff]">{r.trackingNumber || '—'}</td>
                        <td className="px-4 py-2.5 text-[12px] text-[#a0aec0]">{r.courier || '—'}</td>
                        <td className="px-4 py-2.5"><StatusBadge value={r.status || 'Sent'} /></td>
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
