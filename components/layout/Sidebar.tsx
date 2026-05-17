'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, MessageSquare, AlertTriangle, ShoppingCart,
  Shield, Truck, Users, ClipboardList, RefreshCw, LogOut, Zap
} from 'lucide-react'

const NAV = [
  { href: '/overview',     icon: LayoutDashboard, label: 'Overview',         badge: null },
  { href: '/messages',     icon: MessageSquare,   label: 'Messages',          badge: null },
  { href: '/escalations',  icon: AlertTriangle,   label: 'Escalations',       badge: 'urgent' },
  { href: '/cod',          icon: ShoppingCart,    label: 'COD Verification',  badge: null },
  { href: '/order-queue',  icon: ClipboardList,   label: 'Order Queue',       badge: null },
  { href: '/refund-queue', icon: RefreshCw,       label: 'Refund Queue',      badge: null },
  { href: '/prequal',      icon: Users,           label: 'Pre-Qual Funnel',   badge: null },
  { href: '/dispatch',     icon: Truck,           label: 'Dispatch',          badge: null },
  { href: '/security',     icon: Shield,          label: 'Security Log',      badge: null },
]

async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/login'
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#0d1117] border-r border-[#1e2a35] flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#1e2a35]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[rgba(0,212,160,0.12)] border border-[rgba(0,212,160,0.2)] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-[#00d4a0]" />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-[0.12em] text-[#00d4a0] uppercase">ELO Ops</div>
            <div className="text-[9px] text-[#4a5568] tracking-wide">Operations Center</div>
          </div>
        </div>
      </div>

      {/* Bot status */}
      <div className="px-4 py-3 border-b border-[#1e2a35]">
        <div className="flex items-center gap-2 bg-[rgba(0,212,160,0.06)] border border-[rgba(0,212,160,0.12)] rounded-lg px-3 py-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4a0] shadow-[0_0_6px_#00d4a0] animate-blink flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-[#00d4a0]">Alia is Active</div>
            <div className="text-[9px] text-[#4a5568]">Bot running normally</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-[#2d3f4e] px-2 py-1.5 mb-1">Navigation</div>
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all group',
                active
                  ? 'bg-[rgba(0,212,160,0.1)] text-[#00d4a0] border border-[rgba(0,212,160,0.15)]'
                  : 'text-[#718096] hover:text-[#a0aec0] hover:bg-[rgba(255,255,255,0.03)]'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-[#00d4a0]' : 'text-[#4a5568] group-hover:text-[#718096]')} />
              <span className="truncate">{label}</span>
              {badge === 'urgent' && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ff4d6a] animate-blink flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[#1e2a35]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#4a5568] hover:text-[#ff4d6a] hover:bg-[rgba(255,77,106,0.06)] transition-all"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Sign out</span>
        </button>
        <div className="mt-2 px-2 text-[9px] text-[#2d3f4e]">exportleftovers.com</div>
      </div>
    </aside>
  )
}
