import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Message, OverviewStats, ActivityItem, ActivityType, SheetData } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date parsing ─────────────────────────────────────────────────────────────
// Handles formats like:
//   "18/05/2026, 2:25:53 am"  ← Google Sheets Pakistan locale
//   "2026-05-18T02:25:53"
//   "18/05/2026"
export function parseDate(s: string): Date | null {
  if (!s) return null

  // Already a valid ISO date
  let d = new Date(s)
  if (!isNaN(d.getTime())) return d

  // Handle "DD/MM/YYYY, H:MM:SS am/pm" (Google Sheets Pakistan format)
  const ampm = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (ampm) {
    let hours = parseInt(ampm[4])
    const mins = parseInt(ampm[5])
    const secs = parseInt(ampm[6] || '0')
    const meridiem = (ampm[7] || '').toLowerCase()
    if (meridiem === 'pm' && hours < 12) hours += 12
    if (meridiem === 'am' && hours === 12) hours = 0
    d = new Date(
      parseInt(ampm[3]),   // year
      parseInt(ampm[2]) - 1, // month (0-indexed)
      parseInt(ampm[1]),   // day
      hours, mins, secs
    )
    if (!isNaN(d.getTime())) return d
  }

  // Handle "DD/MM/YYYY" date only
  const dateOnly = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
  if (dateOnly) {
    d = new Date(parseInt(dateOnly[3]), parseInt(dateOnly[2]) - 1, parseInt(dateOnly[1]))
    if (!isNaN(d.getTime())) return d
  }

  return null
}

export function isToday(s: string): boolean {
  const d = parseDate(s)
  if (!d) return false
  const n = new Date()
  return d.getFullYear()===n.getFullYear() && d.getMonth()===n.getMonth() && d.getDate()===n.getDate()
}

export function isThisWeek(s: string): boolean {
  const d = parseDate(s)
  if (!d) return false
  const n = new Date()
  const ws = new Date(n)
  ws.setDate(n.getDate()-n.getDay())
  ws.setHours(0,0,0,0)
  return d >= ws
}

export function isThisMonth(s: string): boolean {
  const d = parseDate(s)
  if (!d) return false
  const n = new Date()
  return d.getFullYear()===n.getFullYear() && d.getMonth()===n.getMonth()
}

export function fmtTs(s: string): string {
  const d = parseDate(s)
  if (!d) return s || '—'
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true
  })
}

export function fmtDate(s: string): string {
  const d = parseDate(s)
  if (!d) return s || '—'
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

export function timeAgo(s: string): string {
  const d = parseDate(s)
  if (!d) return '—'
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs/24)}d ago`
}

// ─── Stats calculator ─────────────────────────────────────────────────────────
export function calcStats(data: SheetData): OverviewStats {
  const { messages, escalated, security, dispatch, prequal, cod, orderQueue, refundQueue } = data

  const msgToday   = messages.filter(m => isToday(m.ts)).length
  const escToday   = escalated.filter(e => isToday(e.escalatedAt)).length
  const secToday   = security.filter(s => isToday(s.ts)).length
  const dispToday  = dispatch.filter(d => isToday(d.ts)).length
  const activeEsc  = escalated.filter(e => e.status.toLowerCase() === 'active').length
  const pqActive   = prequal.filter(p => p.status.toLowerCase() === 'collecting info').length
  const codAwaiting = cod.filter(c => c.finalStatus.toLowerCase().includes('awaiting')).length
  const orderActive = orderQueue.filter(o => o.status && !o.status.toLowerCase().includes('done') && !o.status.toLowerCase().includes('resolved')).length
  const refundActive = refundQueue.filter(r => r.status && !r.status.toLowerCase().includes('done') && !r.status.toLowerCase().includes('resolved')).length

  const autoReplied = messages.filter(m => m.action.toLowerCase().includes('auto reply')).length
  const botRate = messages.length > 0 ? Math.round((autoReplied / messages.length) * 100) : 0

  return {
    messagesToday: msgToday,
    messagesAllTime: messages.length,
    escalationsToday: escToday,
    escalationsAllTime: escalated.length,
    activeEscalations: activeEsc,
    preQualActive: pqActive,
    jailbreakToday: secToday,
    jailbreakAllTime: security.length,
    codAwaiting,
    dispatchedToday: dispToday,
    botResolutionRate: botRate,
    avgResponseTimeMin: 4,
    orderQueueActive: orderActive,
    refundQueueActive: refundActive,
  }
}

// ─── Activity feed builder ────────────────────────────────────────────────────
export function buildActivityFeed(data: SheetData, limit = 20): ActivityItem[] {
  const items: ActivityItem[] = []

  data.escalated.slice(-10).forEach((e, i) => {
    items.push({ id:`esc-${i}`, type:'escalation' as ActivityType, title:`Escalation — ${maskPhone(e.phone)}`, subtitle: e.reason || 'Customer escalated', ts: e.escalatedAt, urgent: e.status.toLowerCase()==='active' })
  })
  data.security.slice(-8).forEach((s, i) => {
    items.push({ id:`sec-${i}`, type:'security' as ActivityType, title:`🔒 Jailbreak blocked — ${maskPhone(s.phone)}`, subtitle: (s.originalMessage||'').slice(0,60), ts: s.ts, urgent: true })
  })
  data.dispatch.slice(-8).forEach((d, i) => {
    items.push({ id:`disp-${i}`, type:'dispatch' as ActivityType, title:`📦 Dispatched — ${d.orderNumber||'Order'}`, subtitle:`${d.item||''} via ${d.courier||''}`, ts: d.ts })
  })
  data.cod.slice(-8).forEach((c, i) => {
    const urgent = c.finalStatus.toLowerCase().includes('awaiting')
    items.push({ id:`cod-${i}`, type:'cod' as ActivityType, title:`COD ${c.finalStatus||'Update'} — ${c.orderNumber||''}`, subtitle: c.customerName || c.customerPhone, ts: c.ts, urgent })
  })
  data.orderQueue.slice(-6).forEach((o, i) => {
    items.push({ id:`oq-${i}`, type:'order' as ActivityType, title:`Order Query — ${o.orderNumber||maskPhone(o.phone)}`, subtitle: o.status||'In queue', ts: o.ts })
  })
  data.refundQueue.slice(-6).forEach((r, i) => {
    items.push({ id:`rq-${i}`, type:'refund' as ActivityType, title:`Refund Request — ${r.orderNumber||maskPhone(r.phone)}`, subtitle:`PKR ${r.refundAmount||'?'} — ${r.reason||''}`, ts: r.ts })
  })

  return items
    .filter(i => i.ts)
    .sort((a, b) => {
      const da = parseDate(a.ts)?.getTime() || 0
      const db = parseDate(b.ts)?.getTime() || 0
      return db - da
    })
    .slice(0, limit)
}

// ─── Volume chart data ────────────────────────────────────────────────────────
export function buildVolumeData(messages: Message[], days = 30) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const label = d.toLocaleDateString('en-GB', { day:'2-digit', month:'short' })
    const count = messages.filter(m => {
      const md = parseDate(m.ts)
      return md && md.getFullYear()===d.getFullYear() && md.getMonth()===d.getMonth() && md.getDate()===d.getDate()
    }).length
    return { label, count, date: d.toISOString().split('T')[0] }
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function maskPhone(p: string): string {
  if (!p || p.length <= 4) return p || '—'
  return '••••' + p.slice(-4)
}

export const SENTIMENT_COLORS: Record<string, string> = {
  angry: '#ff4d6a', frustrated: '#ffb547', worried: '#eab308', neutral: '#718096', happy: '#00d4a0',
}

export const CATEGORY_COLORS: Record<string, string> = {
  'order status': '#00d4a0', 'returns and exchange': '#4d9fff', 'damaged item': '#ff4d6a',
  'minor fault': '#ffb547', 'sizing and products': '#8b5cf6', 'payment and billing': '#ec4899',
  'cancellation': '#14b8a6', 'general': '#f97316', 'unclear': '#6b7280',
}

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  message: '#4d9fff', escalation: '#ff4d6a', cod: '#ffb547', dispatch: '#00d4a0',
  security: '#ff4d6a', prequal: '#8b5cf6', order: '#f97316', refund: '#ec4899',
}
