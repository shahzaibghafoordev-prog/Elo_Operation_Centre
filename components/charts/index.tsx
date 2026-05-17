'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const CAT_COLORS = ['#00d4a0','#4d9fff','#ff4d6a','#ffb547','#8b5cf6','#ec4899','#14b8a6','#f97316','#6b7280']
const SENT_COLORS = ['#ff4d6a','#ffb547','#eab308','#718096','#00d4a0']

interface DonutChartProps {
  data: { name: string; count: number }[]
}

export function CategoryDonut({ data }: DonutChartProps) {
  const total = data.reduce((a, b) => a + b.count, 0) || 1
  return (
    <div className="flex gap-6">
      <div style={{ width:160, height:160, flexShrink:0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} strokeWidth={0} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background:'#0d1117', border:'1px solid #1e2a35', borderRadius:8, fontSize:11 }}
              formatter={(v: number, n: string) => [`${Math.round(v/total*100)}% (${v})`, n]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1.5 justify-center flex-1 min-w-0">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-[10px]">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
            <span className="text-[#a0aec0] truncate">{d.name}</span>
            <span className="ml-auto font-mono text-[#4a5568]">{Math.round(d.count/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SentimentBarProps {
  data: { name: string; count: number }[]
}

export function SentimentBar({ data }: SentimentBarProps) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top:4, right:4, bottom:0, left:-10 }}>
        <CartesianGrid stroke="#1e2a35" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fill:'#4a5568', fontSize:11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill:'#4a5568', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background:'#0d1117', border:'1px solid #1e2a35', borderRadius:8, fontSize:12 }}
          cursor={{ fill:'rgba(255,255,255,0.02)' }}
        />
        <Bar dataKey="count" name="Count" radius={[4,4,0,0]}>
          {data.map((_, i) => <Cell key={i} fill={SENT_COLORS[i % SENT_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
