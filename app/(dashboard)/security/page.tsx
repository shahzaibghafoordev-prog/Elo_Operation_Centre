'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import { SectionHeader, EmptyState } from '@/components/ui'
import { fmtTs, maskPhone } from '@/lib/utils'
import type { SecurityEntry } from '@/types'

export default function SecurityPage() {
  const [data, setData] = useState<SecurityEntry[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/sheets/security')
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setData(j.data)
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    setRefreshing(false)
  }, [])

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Security Log" subtitle="Jailbreak attempts and blocked interactions"
        onRefresh={load} refreshing={refreshing} lastUpdated={lastUpdated} />
      <div className="p-6 flex flex-col gap-5">
        {error && <div className="bg-[#0d1117] border border-[#ff4d6a] rounded-xl p-4 text-[#ff4d6a] text-sm">⚠️ {error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
            <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] mb-1.5">Total Attempts Logged</div>
            <div className="font-mono text-2xl font-medium text-[#ff4d6a]">{data.length}</div>
          </div>
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
            <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] mb-1.5">Unique Phones</div>
            <div className="font-mono text-2xl font-medium text-[#ffb547]">{new Set(data.map(d=>d.phone)).size}</div>
          </div>
        </div>

        <div>
          <SectionHeader title="Jailbreak Attempt Log" />
          <div className="bg-[#0d1117] border border-[rgba(255,77,106,0.15)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[rgba(0,0,0,0.2)]">
                    {['Timestamp','Phone (masked)','Message','Action Taken'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] text-left whitespace-nowrap border-b border-[#1e2a35]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0
                    ? <EmptyState icon="🛡️" title="No jailbreak attempts logged" subtitle="Alia's security is holding strong" />
                    : [...data].reverse().map((r, i) => (
                      <tr key={i} className="border-b border-[#1e2a35]/50 hover:bg-[rgba(255,77,106,0.02)]">
                        <td className="px-4 py-2.5 font-mono text-[10px] text-[#718096] whitespace-nowrap">{fmtTs(r.ts)}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#ff4d6a]">{maskPhone(r.phone)}</td>
                        <td className="px-4 py-2.5 text-[11px] text-[#718096] max-w-[400px]">
                          <span className="truncate block">{(r.originalMessage || '—').slice(0, 80)}{r.originalMessage?.length > 80 ? '…' : ''}</span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-[#ffb547]">{r.actionTaken || '—'}</td>
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
