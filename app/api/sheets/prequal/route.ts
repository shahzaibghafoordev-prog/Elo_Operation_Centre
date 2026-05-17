import { NextResponse } from 'next/server'
import { loadPreQual } from '@/lib/sheets'
export const runtime = 'nodejs'
export async function GET() {
  try { return NextResponse.json({ data: await loadPreQual() }) }
  catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 }) }
}
