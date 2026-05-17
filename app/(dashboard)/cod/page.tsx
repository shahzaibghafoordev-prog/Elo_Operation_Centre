'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import { SectionHeader, StatusBadge, EmptyState } from '@/components/ui'
import { fmtTs } from '@/lib/utils'
import type { CodOrder } from '@/types'

export default function CodPage() {
  const [data, setData] = useState<CodOrder[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/sheets/cod')
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setData(j.data)
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    setRefreshing(false)
  }, [])

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

  const total = data.length || 1
  const confirmed = data.filter(r => r.finalStatus.toLowerCase().includes('confirm')).length
  const cancelled = data.filter(r => r.finalStatus.toLowerCase().includes('cancel')).length
  const noReply   = data.filter(r => r.finalStatus.toLowerCase().includes('no reply')).length
  const awaiting  = data.filter(r => r.finalStatus.toLowerCase().includes('awaiting')).length

  const metrics = [
    { label: 'Confirmation Rate', value: `${Math.round(confirmed/total*100)}%`, color: 'text-[#00d4a0]', count: confirmed },
    { label: 'Cancellation Rate', value: `${Math.round(cancelled/total*100)}%`, color: 'text-[#ff4d6a]', count: cancelled },
    { label: 'No Reply Rate',     value: `${Math.round(noReply/total*100)}%`,   color: 'text-[#ffb547]', count: noReply },
    { label: 'Awaiting',          value: awaiting,                               color: 'text-[#ffb547]', count: awaiting },
  ]

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="COD Verification" subtitle="Cash on Delivery order verification log"
        onRefresh={load} refreshing={refreshing} lastUpdated={lastUpdated} />
      <div className="p-6 flex flex-col gap-5">
        {error && <div className="bg-[#0d1117] border border-[#ff4d6a] rounded-xl p-4 text-[#ff4d6a] text-sm">⚠️ {error}</div>}

        <div className="grid grid-cols-4 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4 text-center">
              <div className={`font-mono text-2xl font-medium mb-1 ${m.color}`}>{m.value}</div>
              <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568]">{m.label}</div>
            </div>
          ))}
        </div>

        <div>
          <SectionHeader title="Recent COD Orders" />
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[rgba(0,0,0,0.2)]">
                    {['Timestamp','Order #','Customer','Phone','Total (PKR)','Verification Sent','Final Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] text-left whitespace-nowrap border-b border-[#1e2a35]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0
                    ? <EmptyState icon="📋" title="No COD orders found" subtitle="Orders will appear as they are logged" />
                    : [...data].reverse().map((r, i) => (
                      <tr key={i} className="border-b border-[#1e2a35]/50 hover:bg-[rgba(255,255,255,0.01)]">
                        <td className="px-4 py-2.5 font-mono text-[10px] text-[#718096] whitespace-nowrap">{fmtTs(r.ts)}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#00d4a0]">{r.orderNumber || '—'}</td>
                        <td className="px-4 py-2.5 text-[12px] text-[#a0aec0]">{r.customerName || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#718096]">{r.customerPhone || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#e2e8f0]">{r.orderTotal || '—'}</td>
                        <td className="px-4 py-2.5"><StatusBadge value={r.verificationSent || '—'} /></td>
                        <td className="px-4 py-2.5"><StatusBadge value={r.finalStatus || '—'} /></td>
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
