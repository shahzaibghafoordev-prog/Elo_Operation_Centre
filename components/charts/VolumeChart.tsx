'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface VolumeChartProps {
  data: { label: string; count: number }[]
}

export default function VolumeChart({ data }: VolumeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4a0" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#00d4a0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1e2a35" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fill:'#4a5568', fontSize:10 }} axisLine={false} tickLine={false}
          interval="preserveStartEnd" tickCount={8} />
        <YAxis tick={{ fill:'#4a5568', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background:'#0d1117', border:'1px solid #1e2a35', borderRadius:8, fontSize:12 }}
          labelStyle={{ color:'#718096', fontSize:10 }}
          itemStyle={{ color:'#00d4a0' }}
        />
        <Area type="monotone" dataKey="count" name="Messages" stroke="#00d4a0" strokeWidth={2}
          fill="url(#msgGrad)" dot={false} activeDot={{ r:4, fill:'#00d4a0', strokeWidth:0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
