import { NextResponse } from 'next/server'
import { loadAllSheetData } from '@/lib/sheets'
import { buildVolumeData } from '@/lib/utils'
export const runtime = 'nodejs'
export async function GET() {
  try {
    const data = await loadAllSheetData()
    const volume = buildVolumeData(data.messages, 30)
    const cats = ['Order Status','Returns and Exchange','Damaged Item','Minor Fault','Sizing and Products','Payment and Billing','Cancellation','General','Unclear']
    const categoryData = cats.map(c => ({ name: c, count: data.messages.filter(m => m.cat.toLowerCase() === c.toLowerCase()).length }))
    const sents = ['Angry','Frustrated','Worried','Neutral','Happy']
    const now = new Date()
    const ws = new Date(now)
    ws.setDate(now.getDate() - now.getDay())
    ws.setHours(0, 0, 0, 0)
    const weekMsgs = data.messages.filter(m => { const d = new Date(m.ts); return d >= ws })
    const sentimentData = sents.map(s => ({ name: s, count: weekMsgs.filter(m => m.sentiment.toLowerCase() === s.toLowerCase()).length }))
    return NextResponse.json({ messages: data.messages, volume, categoryData, sentimentData, tgTabCount: data.tgTabCount })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
