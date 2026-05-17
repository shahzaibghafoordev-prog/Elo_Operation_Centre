import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  const validUser = process.env.DASHBOARD_USER || 'elo-admin'
  const validPass = process.env.DASHBOARD_PASS || 'Alia@2025!'
  if (username === validUser && password === validPass) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('elo-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })
    return res
  }
  return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
}
