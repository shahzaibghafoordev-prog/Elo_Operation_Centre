'use client'
import { ActivityItem, ActivityType } from '@/types'
import { timeAgo, ACTIVITY_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<ActivityType, string> = {
  message: '💬', escalation: '🚨', cod: '📋', dispatch: '📦',
  security: '🔒', prequal: '🔍', order: '🛍️', refund: '↩️',
}

interface ActivityFeedProps {
  items: ActivityItem[]
  className?: string
}

export default function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <div className={cn('bg-[#0d1117] border border-[#1e2a35] rounded-xl flex flex-col', className)}>
      <div className="px-4 py-3 border-b border-[#1e2a35] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4a0] animate-blink" />
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#718096]">Live Activity</span>
        </div>
        <span className="text-[9px] text-[#2d3f4e] font-mono">Last {items.length} events</span>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[520px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-3xl mb-2">🕐</div>
            <div className="text-xs text-[#4a5568] font-semibold">No recent activity</div>
            <div className="text-[10px] text-[#2d3f4e] mt-0.5">Events appear as Alia handles customers</div>
          </div>
        ) : (
          <div className="divide-y divide-[#1e2a35]/50">
            {items.map((item) => {
              const color = ACTIVITY_COLORS[item.type]
              return (
                <div key={item.id} className={cn(
                  'flex items-start gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.01)] transition-colors',
                  item.urgent && 'bg-[rgba(255,77,106,0.03)]'
                )}>
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5"
                    style={{ background: `${color}14` }}
                  >
                    {TYPE_ICONS[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'text-[11px] font-semibold truncate',
                      item.urgent ? 'text-[#ff4d6a]' : 'text-[#a0aec0]'
                    )}>
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-[10px] text-[#4a5568] truncate mt-0.5">{item.subtitle}</div>
                    )}
                  </div>
                  <div className="text-[9px] text-[#2d3f4e] font-mono flex-shrink-0 mt-0.5">
                    {timeAgo(item.ts)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
