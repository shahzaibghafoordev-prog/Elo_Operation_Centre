'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import { SectionHeader } from '@/components/ui'
import SentimentBadge from '@/components/ui/SentimentBadge'
import VolumeChart from '@/components/charts/VolumeChart'
import { CategoryDonut, SentimentBar } from '@/components/charts'
import { fmtTs, buildVolumeData } from '@/lib/utils'
import type { Message } from '@/types'

export default function MessagesPage() {
  const [data, setData] = useState<Message[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/sheets/overview')
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      // We'll re-use overview endpoint and just show messages data
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  const CATS = ['Order Status','Returns and Exchange','Damaged Item','Minor Fault','Sizing and Products','Payment and Billing','Cancellation','General','Unclear']
  const SENTS = ['Angry','Frustrated','Worried','Neutral','Happy']

  const catData = CATS.map(c => ({ name: c, count: data.filter(m => m.cat.toLowerCase()===c.toLowerCase()).length }))
  const sentData = SENTS.map(s => ({ name: s, count: data.filter(m => m.sentiment.toLowerCase()===s.toLowerCase()).length }))
  const volData = buildVolumeData(data, 30)

  const filtered = search ? data.filter(m => m.msg.toLowerCase().includes(search.toLowerCase()) || m.cat.toLowerCase().includes(search.toLowerCase())) : data

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Message Analytics" subtitle="All customer messages handled by Alia"
        onRefresh={load} refreshing={refreshing} lastUpdated={lastUpdated} />
      <div className="p-6 flex flex-col gap-5">
        {error && <div className="bg-[#0d1117] border border-[#ff4d6a] rounded-xl p-4 text-[#ff4d6a] text-sm">⚠️ {error}</div>}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4 col-span-2">
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#718096] mb-3">Volume — Last 30 Days</div>
            <VolumeChart data={volData} />
          </div>
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#718096] mb-3">Sentiment This Week</div>
            <SentimentBar data={sentData} />
          </div>
        </div>

        <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#718096] mb-3">Category Breakdown</div>
          <CategoryDonut data={catData} />
        </div>

        <div>
          <SectionHeader title="Message Log" />
          <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a35]">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                {data.length} messages across {new Set(data.map(m=>m.tabName)).size} customers
              </span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search messages…"
                className="bg-[#07090f] border border-[#1e2a35] rounded-lg px-3 py-1.5 text-[11px] text-[#e2e8f0] placeholder-[#2d3f4e] outline-none focus:border-[#00d4a0] w-48" />
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[rgba(0,0,0,0.2)]">
                    {['Timestamp','Customer Message','Category','Sentiment','Action','Security'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[9px] font-bold tracking-[0.1em] uppercase text-[#4a5568] text-left whitespace-nowrap border-b border-[#1e2a35]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-16 text-center text-[#4a5568] text-sm">
                      {data.length === 0 ? '💬 No messages yet — Alia will populate this as customers interact' : 'No results for your search'}
                    </td></tr>
                  ) : [...filtered].reverse().slice(0, 200).map((r, i) => (
                    <tr key={i} className="border-b border-[#1e2a35]/50 hover:bg-[rgba(255,255,255,0.01)]">
                      <td className="px-4 py-2.5 font-mono text-[10px] text-[#718096] whitespace-nowrap">{fmtTs(r.ts)}</td>
                      <td className="px-4 py-2.5 text-[11px] text-[#a0aec0] max-w-[220px] truncate">{r.msg || '—'}</td>
                      <td className="px-4 py-2.5 text-[11px] text-[#718096]">{r.cat || '—'}</td>
                      <td className="px-4 py-2.5"><SentimentBadge value={r.sentiment} /></td>
                      <td className="px-4 py-2.5 text-[11px] text-[#718096]">{r.action || '—'}</td>
                      <td className="px-4 py-2.5">
                        {r.secFlag && r.secFlag.toLowerCase().includes('jailbreak')
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(255,77,106,0.12)] text-[#ff4d6a]">⚠ {r.secFlag}</span>
                          : <span className="text-[10px] text-[#2d3f4e]">{r.secFlag || 'Clean'}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
