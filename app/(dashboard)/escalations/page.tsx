'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import { SectionHeader, StatusBadge, EmptyState, Pill } from '@/components/ui'
import { fmtTs } from '@/lib/utils'
import type { EscalatedCustomer } from '@/types'
import { Search, X } from 'lucide-react'

export default function EscalationsPage() {
  const [data, setData] = useState<EscalatedCustomer[]>([])
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<string | null>(null)

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/sheets/escalations')
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setData(j.data)
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    setRefreshing(false)
  }, [])

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

  const active = data.filter(r => r.status.toLowerCase() === 'active')
  const all = search ? data.filter(r => r.phone.includes(search) || r.reason.toLowerCase().includes(search.toLowerCase())) : data

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Escalation Tracker" subtitle="Active customer escalations requiring human review"
        onRefresh={load} refreshing={refreshing} lastUpdated={lastUpdated} />

      <div className="p-6 flex flex-col gap-5">
        {error && <div className="bg-[#0d1117] border border-[#ff4d6a] rounded-xl p-4 text-[#ff4d6a] text-sm">⚠️ {error}</div>}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Active Now', value: active.length, color:'text-[#ff4d6a]' },
            { label:'Total Escalations', value: data.length, color:'text-[#a0aec0]' },
            { label:'Resolved', value: data.filter(r=>r.status.toLowerCase()==='resolved').length, color:'text-[#00d4a0]' },
          ].map(c => (
            <div key={c.label} className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
              <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] mb-1.5">{c.label}</div>
              <div className={`font-mono text-2xl font-medium ${c.color}`}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Active escalations */}
        <div>
          <SectionHeader title="Active Escalations" right={<Pill color="red">{active.length} active</Pill>} />
          <div className="bg-[#0d1117] border border-[active.length > 0 ? '#ff4d6a33' : '#1e2a35'] rounded-xl overflow-hidden"
            style={{ borderColor: active.length > 0 ? 'rgba(255,77,106,0.2)' : '#1e2a35' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a35]">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#718096]">Escalated Customers</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4a5568]" />
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search phone or reason…"
                  className="bg-[#07090f] border border-[#1e2a35] rounded-lg pl-7 pr-3 py-1.5 text-[11px] text-[#e2e8f0] placeholder-[#2d3f4e] outline-none focus:border-[#00d4a0] w-52" />
              </div>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[rgba(0,0,0,0.2)]">
                    {['Phone','Escalated At','Reason','Status','Follow Up','Action'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] text-left whitespace-nowrap border-b border-[#1e2a35]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {all.length === 0
                    ? <EmptyState icon="✅" title="No active escalations" subtitle="Alia is handling everything smoothly" />
                    : all.map((r, i) => (
                      <tr key={i} className="border-b border-[#1e2a35]/50 hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-[#00d4a0]">{r.phone || '—'}</td>
                        <td className="px-4 py-2.5 text-[11px] text-[#718096] whitespace-nowrap font-mono">{fmtTs(r.escalatedAt)}</td>
                        <td className="px-4 py-2.5 text-[12px] text-[#a0aec0] max-w-[200px] truncate">{r.reason || '—'}</td>
                        <td className="px-4 py-2.5"><StatusBadge value={r.status} /></td>
                        <td className="px-4 py-2.5">
                          <StatusBadge value={r.followUpSent?.toLowerCase()==='yes' || r.followUpSent==='TRUE' ? '✓ Sent' : 'Pending'} />
                        </td>
                        <td className="px-4 py-2.5">
                          {r.status.toLowerCase()==='active' && (
                            <button onClick={() => setModal(r.phone)}
                              className="px-2.5 py-1 border border-[#1e2a35] rounded-lg text-[10px] font-bold text-[#718096] hover:border-[#ffb547] hover:text-[#ffb547] transition-all">
                              🔓 Unlock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Unlock Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-2xl p-7 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">🔓 Unlock Escalation</h2>
              <button onClick={() => setModal(null)}><X className="w-4 h-4 text-[#4a5568]" /></button>
            </div>
            <p className="text-[12px] text-[#718096] mb-4">To resolve this escalation, update the Google Sheet:</p>
            <div className="space-y-3 mb-5">
              {[
                'Open ELO Whatsapp Customer Logs → tab Escalated Customers',
                `Find the row where Phone = ${modal}`,
                'Change Status from Active → Resolved',
                'Fill in Unlocked At and Unlocked By',
                'Click Refresh on this dashboard to confirm',
              ].map((step, i) => (
                <div key={i} className="flex gap-3 text-[12px] text-[#718096]">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-[rgba(0,212,160,0.1)] border border-[rgba(0,212,160,0.2)] text-[#00d4a0] flex items-center justify-center text-[9px] font-bold mt-0.5">{i+1}</div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setModal(null)}
              className="w-full py-2.5 bg-[#00d4a0] text-black font-bold text-sm rounded-lg hover:opacity-88">
              Got it — I&apos;ll update the sheet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
