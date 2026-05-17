import { NextResponse } from 'next/server'
import { loadEscalations } from '@/lib/sheets'
export const runtime = 'nodejs'
export async function GET() {
  try {
    const data = await loadEscalations()
    return NextResponse.json({ data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
