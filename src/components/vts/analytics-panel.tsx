'use client'

import { motion } from 'framer-motion'
import { vesselTypeDistribution, flagDistribution } from '@/lib/vts/data'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts'
import { trafficTrend } from '@/lib/vts/data'

export default function AnalyticsPanel() {
  const total = vesselTypeDistribution.reduce((sum, v) => sum + v.value, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      {/* Distribución por tipo */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
        <div className="text-cyan-400 text-xs font-medium mb-2">Distribución por Tipo</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vesselTypeDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={2}
              >
                {vesselTypeDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#e2e8f0',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-1 mt-1">
          {vesselTypeDistribution.map((v) => (
            <div key={v.name} className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: v.color }} />
              <span className="text-slate-400 truncate">{v.name}</span>
              <span className="text-slate-300 ml-auto font-medium">{v.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribución por bandera */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
        <div className="text-cyan-400 text-xs font-medium mb-2">Distribución por Bandera</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flagDistribution} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#475569" fontSize={9} tick={{ fontSize: 9 }} />
              <YAxis dataKey="flag" type="category" stroke="#94a3b8" fontSize={9} width={75} tick={{ fontSize: 9 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#e2e8f0',
                }}
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendencia horaria de tráfico */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
        <div className="text-cyan-400 text-xs font-medium mb-2">Tráfico por Hora</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficTrend} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hora" stroke="#475569" fontSize={9} tick={{ fontSize: 9 }} />
              <YAxis stroke="#475569" fontSize={9} tick={{ fontSize: 9 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#e2e8f0',
                }}
              />
              <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="salidas" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-3 mt-1 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-emerald-500" />
            <span className="text-slate-400">Entradas</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-amber-500" />
            <span className="text-slate-400">Salidas</span>
          </span>
        </div>
      </div>
    </div>
  )
}
