'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import { SectionHeader, StatusBadge, EmptyState } from '@/components/ui'
import { fmtTs } from '@/lib/utils'
import type { RefundQueue } from '@/types'

export default function RefundQueuePage() {
  const [data, setData] = useState<RefundQueue[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/sheets/refund-queue')
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setData(j.data)
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    setRefreshing(false)
  }, [])

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

  const active = data.filter(r => !['done','resolved','complete'].some(s => r.status?.toLowerCase().includes(s)))
  const totalPKR = data.reduce((sum, r) => sum + (parseFloat(r.refundAmount?.replace(/,/g,'') || '0') || 0), 0)

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Refund Queue" subtitle="Pending and processed customer refund requests"
        onRefresh={load} refreshing={refreshing} lastUpdated={lastUpdated} />
      <div className="p-6 flex flex-col gap-5">
        {error && <div className="bg-[#0d1117] border border-[#ff4d6a] rounded-xl p-4 text-[#ff4d6a] text-sm">⚠️ {error}</div>}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
            <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] mb-1.5">Active Refunds</div>
            <div className="font-mono text-2xl font-medium text-[#ffb547]">{active.length}</div>
          </div>
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
            <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] mb-1.5">Total Requests</div>
            <div className="font-mono text-2xl font-medium text-[#a0aec0]">{data.length}</div>
          </div>
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
            <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] mb-1.5">Total Refund Value</div>
            <div className="font-mono text-2xl font-medium text-[#ff4d6a]">PKR {totalPKR.toLocaleString()}</div>
          </div>
        </div>

        <div>
          <SectionHeader title="Refund Queue" />
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[rgba(0,0,0,0.2)]">
                    {['Timestamp','Phone','Order #','Refund Amount','Reason','Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] text-left whitespace-nowrap border-b border-[#1e2a35]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0
                    ? <EmptyState icon="↩️" title="Refund Queue is empty" subtitle="Refund requests will appear as customers submit them" />
                    : [...data].reverse().map((r, i) => (
                      <tr key={i} className="border-b border-[#1e2a35]/50 hover:bg-[rgba(255,255,255,0.01)]">
                        <td className="px-4 py-2.5 font-mono text-[10px] text-[#718096] whitespace-nowrap">{fmtTs(r.ts)}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#00d4a0]">{r.phone || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#4d9fff]">{r.orderNumber || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#ff4d6a]">PKR {r.refundAmount || '—'}</td>
                        <td className="px-4 py-2.5 text-[11px] text-[#a0aec0] max-w-[200px] truncate">{r.reason || '—'}</td>
                        <td className="px-4 py-2.5"><StatusBadge value={r.status || '—'} /></td>
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
