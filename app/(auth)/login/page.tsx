'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    })
    if (res.ok) {
      router.push('/overview')
    } else {
      setErr('Invalid username or password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07090f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[rgba(0,212,160,0.04)] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Card */}
        <div className="bg-[#0d1117] border border-[#1e2a35] rounded-2xl p-8 relative overflow-hidden">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00d4a0] to-transparent" />

          {/* Logo */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-9 h-9 rounded-xl bg-[rgba(0,212,160,0.1)] border border-[rgba(0,212,160,0.2)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#00d4a0]" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-[0.15em] text-[#00d4a0] uppercase">ELO Operations</div>
              <div className="text-[9px] text-[#4a5568]">Powered by Alia AI</div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-[#e2e8f0] mb-1">Welcome back</h1>
          <p className="text-sm text-[#718096] mb-6">Sign in to access the live dashboard</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.08em] uppercase text-[#718096] mb-1.5">Username</label>
              <input
                type="text" value={user} onChange={e => setUser(e.target.value)}
                placeholder="Enter username" autoComplete="username" required
                className="w-full bg-[#07090f] border border-[#1e2a35] rounded-lg px-3.5 py-2.5 text-[13px] text-[#e2e8f0] placeholder-[#2d3f4e] outline-none transition-colors focus:border-[#00d4a0] font-sans"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.08em] uppercase text-[#718096] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="Enter password" autoComplete="current-password" required
                  className="w-full bg-[#07090f] border border-[#1e2a35] rounded-lg px-3.5 py-2.5 pr-10 text-[13px] text-[#e2e8f0] placeholder-[#2d3f4e] outline-none transition-colors focus:border-[#00d4a0] font-sans"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#718096]">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {err && <p className="text-[#ff4d6a] text-xs">{err}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#00d4a0] text-black font-bold text-sm rounded-lg transition-opacity hover:opacity-88 disabled:opacity-60 mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[#2d3f4e] mt-4">
          exportleftovers.com · Internal use only
        </p>
      </div>
    </div>
  )
}
