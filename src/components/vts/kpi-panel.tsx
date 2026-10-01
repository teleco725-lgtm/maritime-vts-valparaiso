'use client'

import { motion } from 'framer-motion'
import { kpis, type KPI } from '@/lib/vts/data'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function KpiCard({ kpi, index }: { kpi: KPI; index: number }) {
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus
  const trendColor =
    kpi.trend === 'up' ? 'text-emerald-400' :
    kpi.trend === 'down' ? 'text-amber-400' : 'text-slate-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-slate-900/60 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition-colors"
    >
      <div className="text-[11px] text-slate-400 mb-1 truncate">{kpi.label}</div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-xl font-bold text-slate-100 tabular-nums">{kpi.value}</span>
        <span className="text-[10px] text-slate-500">{kpi.unit}</span>
        <span className={`ml-auto text-[10px] flex items-center gap-0.5 ${trendColor}`}>
          <TrendIcon className="w-2.5 h-2.5" />
          {kpi.trendValue}
        </span>
      </div>
      <div className="text-[10px] text-slate-500 leading-tight line-clamp-2">{kpi.description}</div>
    </motion.div>
  )
}

export default function KpiPanel() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} kpi={kpi} index={i} />
      ))}
    </div>
  )
}
