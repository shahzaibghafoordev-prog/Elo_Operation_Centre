import type {
  Message, EscalatedCustomer, PreQual, SecurityEntry,
  Dispatch, FallbackLog, CodOrder, OrderStatusQueue, RefundQueue, SheetData
} from '@/types'

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const KEY  = process.env.GOOGLE_API_KEY!
const S1   = process.env.SHEET1_ID!
const S2   = process.env.SHEET2_ID!

// ─── Core fetch ──────────────────────────────────────────────────────────────
async function gFetch(sid: string, path: string, params = '') {
  const url = `${BASE}/${sid}${path}?key=${KEY}${params}`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Sheets API error: ${res.status}`)
  }
  return res.json()
}

async function getRange(sid: string, range: string): Promise<string[][]> {
  const d = await gFetch(sid, `/values/${encodeURIComponent(range)}`)
  return d.values || []
}

async function listTabs(sid: string): Promise<string[]> {
  const d = await gFetch(sid, '', '&fields=sheets.properties.title')
  return d.sheets.map((s: { properties: { title: string } }) => s.properties.title)
}

async function batchGet(sid: string, ranges: string[]): Promise<{ values?: string[][] }[]> {
  if (!ranges.length) return []
  const results: { values?: string[][] }[] = []
  for (let i = 0; i < ranges.length; i += 50) {
    const chunk = ranges.slice(i, i + 50)
    const q = chunk.map(r => `&ranges=${encodeURIComponent(r)}`).join('')
    const d = await gFetch(sid, '/values:batchGet', q)
    results.push(...(d.valueRanges || []))
  }
  return results
}

// ─── Row mappers ─────────────────────────────────────────────────────────────
function toMsg(r: string[], tabName?: string): Message {
  return { ts: r[0]||'', msg: r[1]||'', cat: r[2]||'', sentiment: r[3]||'', botResponse: r[4]||'', action: r[5]||'', workflowStatus: r[6]||'', secFlag: r[7]||'', tabName }
}

function toEsc(r: string[]): EscalatedCustomer {
  return { phone: r[0]||'', escalatedAt: r[1]||'', reason: r[2]||'', status: r[3]||'', unlockedAt: r[4]||'', unlockedBy: r[5]||'', followUpSent: r[6]||'' }
}

function toPQ(r: string[]): PreQual {
  return { phone: r[0]||'', startedAt: r[1]||'', sentiment: r[2]||'', originalMessage: r[3]||'', step: r[4]||'', orderNumber: r[5]||'', issueType: r[6]||'', receivedDate: r[7]||'', status: r[8]||'' }
}

function toSec(r: string[]): SecurityEntry {
  return { ts: r[0]||'', phone: r[1]||'', originalMessage: r[2]||'', actionTaken: r[3]||'' }
}

function toDisp(r: string[]): Dispatch {
  return { ts: r[0]||'', phone: r[1]||'', orderNumber: r[2]||'', item: r[3]||'', trackingNumber: r[4]||'', courier: r[5]||'', status: r[6]||'' }
}

function toFallback(r: string[]): FallbackLog {
  return { ts: r[0]||'', customerMessage: r[1]||'', category: r[2]||'', sentiment: r[3]||'', botResponse: r[4]||'', actionTaken: r[5]||'', workflowStatus: r[6]||'' }
}

function toCod(r: string[]): CodOrder {
  return { ts: r[0]||'', orderNumber: r[1]||'', customerPhone: r[2]||'', customerName: r[3]||'', orderTotal: r[4]||'', items: r[5]||'', orderId: r[6]||'', verificationSent: r[7]||'', customerReply: r[8]||'', finalStatus: r[9]||'' }
}

function toOrderQ(r: string[]): OrderStatusQueue {
  return { ts: r[0]||'', phone: r[1]||'', orderNumber: r[2]||'', status: r[3]||'', agentNote: r[4]||'' }
}

function toRefundQ(r: string[]): RefundQueue {
  return { ts: r[0]||'', phone: r[1]||'', orderNumber: r[2]||'', refundAmount: r[3]||'', reason: r[4]||'', status: r[5]||'' }
}

// ─── Main loader ──────────────────────────────────────────────────────────────
export async function loadAllSheetData(): Promise<SheetData> {
  const [
    tabs,
    escRaw, pqRaw, secRaw, dispRaw, fallRaw,
    codRaw, orderQRaw, refundQRaw
  ] = await Promise.all([
    listTabs(S1),
    getRange(S1, 'Escalated Customers!A:G').catch(() => [] as string[][]),
    getRange(S1, 'Pre-Qualification Queue!A:I').catch(() => [] as string[][]),
    getRange(S1, 'Security Log!A:D').catch(() => [] as string[][]),
    getRange(S1, 'Dispatch Notifications!A:G').catch(() => [] as string[][]),
    getRange(S1, 'Fallback Logs!A:G').catch(() => [] as string[][]),
    // Sheet 2 - try multiple possible tab names
    tryMultipleRanges(S2, ['ELO COD Verification Log!A:J', 'Sheet1!A:J', 'COD Log!A:J', 'COD Verification Log!A:J']),
    getRange(S1, 'Order Status Queue!A:E').catch(() => [] as string[][]),
    getRange(S1, 'Refund Queue!A:F').catch(() => [] as string[][]),
  ])

  const tgTabs = tabs.filter((t: string) => t.startsWith('TG_'))
  let messages: Message[] = []

  if (tgTabs.length > 0) {
    const batches = await batchGet(S1, tgTabs.map((t: string) => `${t}!A:H`))
    batches.forEach((vr, idx) => {
      ;(vr.values || []).slice(1).forEach(r => {
        if (r[0]) messages.push(toMsg(r, tgTabs[idx]))
      })
    })
  }

  return {
    messages,
    escalated: escRaw.slice(1).map(toEsc),
    prequal:   pqRaw.slice(1).map(toPQ),
    security:  secRaw.slice(1).map(toSec),
    dispatch:  dispRaw.slice(1).map(toDisp),
    fallback:  fallRaw.slice(1).map(toFallback),
    cod:       codRaw.slice(1).map(toCod),
    orderQueue: orderQRaw.slice(1).map(toOrderQ),
    refundQueue: refundQRaw.slice(1).map(toRefundQ),
    tgTabCount: tgTabs.length,
  }
}

async function tryMultipleRanges(sid: string, ranges: string[]): Promise<string[][]> {
  for (const range of ranges) {
    try {
      const rows = await getRange(sid, range)
      if (rows.length > 0) return rows
    } catch { /* try next */ }
  }
  return []
}

// ─── Partial loaders for individual pages ────────────────────────────────────
export async function loadCodData() {
  return tryMultipleRanges(S2, ['ELO COD Verification Log!A:J', 'Sheet1!A:J', 'COD Log!A:J'])
    .then(rows => rows.slice(1).map(toCod))
}

export async function loadEscalations() {
  return getRange(S1, 'Escalated Customers!A:G')
    .then(rows => rows.slice(1).map(toEsc))
    .catch(() => [] as EscalatedCustomer[])
}

export async function loadSecurity() {
  return getRange(S1, 'Security Log!A:D')
    .then(rows => rows.slice(1).map(toSec))
    .catch(() => [] as SecurityEntry[])
}

export async function loadDispatch() {
  return getRange(S1, 'Dispatch Notifications!A:G')
    .then(rows => rows.slice(1).map(toDisp))
    .catch(() => [] as Dispatch[])
}

export async function loadPreQual() {
  return getRange(S1, 'Pre-Qualification Queue!A:I')
    .then(rows => rows.slice(1).map(toPQ))
    .catch(() => [] as PreQual[])
}

export async function loadOrderQueue() {
  return getRange(S1, 'Order Status Queue!A:E')
    .then(rows => rows.slice(1).map(toOrderQ))
    .catch(() => [] as OrderStatusQueue[])
}

export async function loadRefundQueue() {
  return getRange(S1, 'Refund Queue!A:F')
    .then(rows => rows.slice(1).map(toRefundQ))
    .catch(() => [] as RefundQueue[])
}
