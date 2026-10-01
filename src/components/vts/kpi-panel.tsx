'use client'

import { motion } from 'framer-motion'
import { kpis, type KPI } from '@/lib/vts/data'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function KpiCard({ kpi, index }: { kpi: KPI; index: number }) {
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus
  const trendColor =
    kpi.trend === 'up' ? 'text-emerald-600' :
    kpi.trend === 'down' ? 'text-amber-600' : 'text-slate-500'
  const trendBg =
    kpi.trend === 'up' ? 'bg-[#00FF66]/15' :
    kpi.trend === 'down' ? 'bg-amber-500/15' : 'bg-[#1a2433]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#111927] border border-slate-700/60 rounded-xl p-4 shadow-lg shadow-black/30 hover:border-slate-600 transition-all"
    >
      <div className="text-sm text-slate-600 mb-1 font-medium">{kpi.label}</div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-3xl font-bold text-slate-100 tabular-nums">{kpi.value}</span>
        <span className="text-sm text-slate-500 font-medium">{kpi.unit}</span>
        <span className={`ml-auto text-xs flex items-center gap-0.5 ${trendColor} ${trendBg} px-2 py-0.5 rounded-md font-semibold`}>
          <TrendIcon className="w-3 h-3" />
          {kpi.trendValue}
        </span>
      </div>
      <div className="text-xs text-slate-500 leading-snug">{kpi.description}</div>
    </motion.div>
  )
}

export default function KpiPanel() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} kpi={kpi} index={i} />
      ))}
    </div>
  )
}
