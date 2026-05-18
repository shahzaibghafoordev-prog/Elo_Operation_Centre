import { NextResponse } from 'next/server'
import { loadRefundStatusQueue } from '@/lib/sheets'
export const runtime = 'nodejs'
export async function GET() {
  try { return NextResponse.json({ data: await loadRefundStatusQueue() }) }
  catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 }) }
}
