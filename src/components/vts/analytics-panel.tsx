'use client'

import { motion } from 'framer-motion'
import { vesselTypeDistribution, flagDistribution } from '@/lib/vts/data'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts'
import { trafficTrend } from '@/lib/vts/data'

export default function AnalyticsPanel() {
  const total = vesselTypeDistribution.reduce((sum, v) => sum + v.value, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
      {/* Distribución por tipo */}
      <div className="bg-[#1B3A5F] border border-slate-700/60 rounded-xl p-4 shadow-lg shadow-black/30">
        <div className="text-[#00FF66] text-sm font-semibold mb-3">Distribución por Tipo</div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vesselTypeDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
              >
                {vesselTypeDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1B3A5F',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#e2e8f0',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {vesselTypeDistribution.map((v) => (
            <div key={v.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: v.color }} />
              <span className="text-slate-600 truncate">{v.name}</span>
              <span className="text-slate-100 ml-auto font-semibold">{v.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribución por bandera */}
      <div className="bg-[#1B3A5F] border border-slate-700/60 rounded-xl p-4 shadow-lg shadow-black/30">
        <div className="text-[#00FF66] text-sm font-semibold mb-3">Distribución por Bandera</div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flagDistribution} layout="vertical" margin={{ left: 10, right: 15, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tick={{ fontSize: 11 }} />
              <YAxis dataKey="flag" type="category" stroke="#64748b" fontSize={11} width={80} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1B3A5F',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#e2e8f0',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
                }}
              />
              <Bar dataKey="count" fill="#0284c7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendencia horaria de tráfico */}
      <div className="bg-[#1B3A5F] border border-slate-700/60 rounded-xl p-4 shadow-lg shadow-black/30">
        <div className="text-[#00FF66] text-sm font-semibold mb-3">Tráfico por Hora (24h)</div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficTrend} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hora" stroke="#94a3b8" fontSize={11} tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" fontSize={11} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1B3A5F',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#e2e8f0',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
              <Line type="monotone" dataKey="entradas" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} name="Entradas" />
              <Line type="monotone" dataKey="salidas" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4 }} name="Salidas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
