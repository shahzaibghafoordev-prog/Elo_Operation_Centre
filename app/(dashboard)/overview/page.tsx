'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import KpiCard from '@/components/cards/KpiCard'
import ActivityFeed from '@/components/cards/ActivityFeed'
import VolumeChart from '@/components/charts/VolumeChart'
import { CategoryDonut, SentimentBar } from '@/components/charts'
import { SectionHeader, LivePill, Pill } from '@/components/ui'
import { MessageSquare, AlertTriangle, ShoppingCart, Shield, Truck, Users, ClipboardList, RefreshCw, Bot, Zap } from 'lucide-react'
import type { OverviewStats, ActivityItem } from '@/types'

interface OverviewData {
  stats: OverviewStats
  activity: ActivityItem[]
  volume: { label: string; count: number }[]
  categoryData: { name: string; count: number }[]
  sentimentData: { name: string; count: number }[]
  tgTabCount: number
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [view, setView] = useState<'today' | 'all'>('today')

  const load = useCallback(async () => {
    setRefreshing(true); setError('')
    try {
      const res = await fetch('/api/sheets/overview')
      if (!res.ok) throw new Error((await res.json()).error || 'API error')
      setData(await res.json())
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    }
    setRefreshing(false)
  }, [])

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

  const s = data?.stats

  const msgs    = view==='today' ? s?.messagesToday    : s?.messagesAllTime
  const escs    = view==='today' ? s?.escalationsToday : s?.escalationsAllTime
  const jbs     = view==='today' ? s?.jailbreakToday   : s?.jailbreakAllTime

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Operations Overview" subtitle="Live WhatsApp AI Support Dashboard"
        onRefresh={load} refreshing={refreshing} lastUpdated={lastUpdated} />

      <div className="flex-1 p-6 flex flex-col gap-6">

        {error && (
          <div className="bg-[#0d1117] border border-[#ff4d6a] rounded-xl p-4 text-[#ff4d6a] text-sm flex gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <div className="font-bold">Connection Error</div>
              <div className="text-[12px] text-[#ff4d6a]/70 mt-0.5">{error} — Check both sheets are shared as &quot;Anyone with the link can view&quot;</div>
            </div>
          </div>
        )}

        {/* Bot Health Bar */}
        <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl px-5 py-3 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[rgba(0,212,160,0.1)] flex items-center justify-center">
              <Bot className="w-3 h-3 text-[#00d4a0]" />
            </div>
            <span className="text-[11px] font-bold text-[#00d4a0]">Alia Bot</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4a0] animate-blink" />
          </div>
          <div className="h-4 w-px bg-[#1e2a35]" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#ffb547]" />
            <span className="text-[10px] text-[#718096]">Bot Resolution Rate</span>
            <span className="font-mono text-[11px] text-[#ffb547] font-bold">{s?.botResolutionRate ?? '—'}%</span>
          </div>
          <div className="h-4 w-px bg-[#1e2a35]" />
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-[#4d9fff]" />
            <span className="text-[10px] text-[#718096]">Active Customers</span>
            <span className="font-mono text-[11px] text-[#4d9fff] font-bold">{data?.tgTabCount ?? '—'}</span>
          </div>
          <div className="h-4 w-px bg-[#1e2a35]" />
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-[#ff4d6a]" />
            <span className="text-[10px] text-[#718096]">Active Escalations</span>
            <span className={`font-mono text-[11px] font-bold ${(s?.activeEscalations ?? 0) > 0 ? 'text-[#ff4d6a]' : 'text-[#00d4a0]'}`}>
              {s?.activeEscalations ?? '—'}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex bg-[#07090f] border border-[#1e2a35] rounded-lg overflow-hidden">
              {(['today','all'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-[11px] font-bold transition-all ${view===v ? 'bg-[#00d4a0] text-black' : 'text-[#718096] hover:text-[#a0aec0]'}`}>
                  {v === 'today' ? 'Today' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div>
          <SectionHeader title="Live Overview" right={<LivePill />} />
          <div className="grid grid-cols-4 gap-3 mb-3">
            <KpiCard label="Messages Handled" value={msgs ?? '—'} sub={view==='today' ? 'today' : 'total all time'} color="green" icon={MessageSquare} />
            <KpiCard label="Escalations" value={escs ?? '—'} sub={view==='today' ? 'escalated today' : 'total escalations'} color="red" icon={AlertTriangle} urgent={(s?.escalationsToday ?? 0) > 0} />
            <KpiCard label="Active Escalations" value={s?.activeEscalations ?? '—'} sub="need resolution now" color="red" icon={AlertTriangle} urgent={(s?.activeEscalations ?? 0) > 0} pulse={(s?.activeEscalations ?? 0) > 0} />
            <KpiCard label="COD Awaiting" value={s?.codAwaiting ?? '—'} sub="pending confirmation" color="amber" icon={ShoppingCart} urgent={(s?.codAwaiting ?? 0) > 0} />
          </div>
          <div className="grid grid-cols-5 gap-3">
            <KpiCard label="Pre-Qual Active" value={s?.preQualActive ?? '—'} sub="collecting info" color="blue" icon={Users} />
            <KpiCard label="Jailbreak Attempts" value={jbs ?? '—'} sub={view==='today' ? 'flagged today' : 'total flagged'} color="red" icon={Shield} urgent={(s?.jailbreakToday ?? 0) > 0} />
            <KpiCard label="Dispatched Today" value={s?.dispatchedToday ?? '—'} sub="notifications sent" color="green" icon={Truck} />
            <KpiCard label="Order Queue" value={s?.orderQueueActive ?? '—'} sub="active queries" color="purple" icon={ClipboardList} />
            <KpiCard label="Refund Queue" value={s?.refundQueueActive ?? '—'} sub="pending refunds" color="amber" icon={RefreshCw} />
          </div>
        </div>

        {/* Charts + Activity Feed */}
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 flex flex-col gap-5">
            {/* Volume */}
            <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
              <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#718096] mb-3">Message Volume — Last 30 Days</div>
              {data ? <VolumeChart data={data.volume} /> : <div className="h-[200px] flex items-center justify-center text-[#2d3f4e] text-sm">Loading…</div>}
            </div>

            {/* Category + Sentiment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#718096] mb-3">Category Breakdown</div>
                {data ? <CategoryDonut data={data.categoryData} /> : <div className="h-[160px] flex items-center justify-center text-[#2d3f4e] text-sm">Loading…</div>}
              </div>
              <div className="bg-[#0d1117] border border-[#1e2a35] rounded-xl p-4">
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#718096] mb-3">Sentiment — This Week</div>
                {data ? <SentimentBar data={data.sentimentData} /> : <div className="h-[150px] flex items-center justify-center text-[#2d3f4e] text-sm">Loading…</div>}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <ActivityFeed items={data?.activity ?? []} className="col-span-1" />
        </div>

      </div>
    </div>
  )
}
