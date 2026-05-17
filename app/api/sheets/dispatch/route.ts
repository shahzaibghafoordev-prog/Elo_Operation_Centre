import { NextResponse } from 'next/server'
import { loadDispatch } from '@/lib/sheets'
export const runtime = 'nodejs'
export async function GET() {
  try { return NextResponse.json({ data: await loadDispatch() }) }
  catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 }) }
}
