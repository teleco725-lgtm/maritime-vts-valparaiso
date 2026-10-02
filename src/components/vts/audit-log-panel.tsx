'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  History, User, FileText, AlertTriangle, Activity, ShieldAlert,
  Clock, Download, Filter, ShieldCheck, Anchor, Radio, Brain
} from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  operator: string
  action: string
  type: 'maneuver' | 'berth_assign' | 'radio_ptt' | 'chat_message' | 'alert' | 'security' | 'report' | 'theme_change'
  severity: 'info' | 'warning' | 'critical'
  detail?: string
}

// Logs simulados de auditoría (en producción vendrían de la DB OperationLog)
const simulatedLogs: AuditLog[] = [
  { id: '1', timestamp: new Date(Date.now() - 60000).toISOString(), operator: 'VTS-OP-001', action: 'Cambio de estado de buque', type: 'maneuver', severity: 'info', detail: 'MSC ISABELLA: arrival → underway' },
  { id: '2', timestamp: new Date(Date.now() - 120000).toISOString(), operator: 'VTS-OP-002', action: 'Asignación de muelle', type: 'berth_assign', severity: 'info', detail: 'MSC ISABELLA → Muelle 5 (TPS)' },
  { id: '3', timestamp: new Date(Date.now() - 180000).toISOString(), operator: 'VTS-OP-001', action: 'PTT grabado y transcrito', type: 'radio_ptt', severity: 'info', detail: '3.2s de audio a EVER GIVEN (MMSI 636019825)' },
  { id: '4', timestamp: new Date(Date.now() - 240000).toISOString(), operator: 'VTS-OP-001', action: 'Consulta IA Victoria', type: 'chat_message', severity: 'info', detail: '¿Qué buques hay en zona VTS ahora?' },
  { id: '5', timestamp: new Date(Date.now() - 300000).toISOString(), operator: 'SYSTEM', action: 'Alerta CPA crítica generada', type: 'alert', severity: 'warning', detail: 'COSCO SHIPPING ↔ PACIFIC STAR: CPA 0.45NM' },
  { id: '6', timestamp: new Date(Date.now() - 420000).toISOString(), operator: 'VTS-OP-002', action: 'Atraque completado', type: 'maneuver', severity: 'info', detail: 'EVER GIVEN atracado en Muelle 3' },
  { id: '7', timestamp: new Date(Date.now() - 600000).toISOString(), operator: 'SYSTEM', action: 'Intento de login bloqueado', type: 'security', severity: 'critical', detail: 'IP 190.234.x.x — 3 intentos fallidos' },
  { id: '8', timestamp: new Date(Date.now() - 720000).toISOString(), operator: 'VTS-OP-001', action: 'Informe generado', type: 'report', severity: 'info', detail: 'PDF ejecutivo diario descargado' },
  { id: '9', timestamp: new Date(Date.now() - 900000).toISOString(), operator: 'VTS-OP-001', action: 'Tug asignado', type: 'berth_assign', severity: 'info', detail: 'RANCAGUA + VALPARAÍSO III → MSC ISABELLA' },
  { id: '10', timestamp: new Date(Date.now() - 1200000).toISOString(), operator: 'VTS-OP-002', action: 'Zona de fondeo asignada', type: 'berth_assign', severity: 'info', detail: 'NORDIC BREEZE → Zona de fondeo No.1' },
  { id: '11', timestamp: new Date(Date.now() - 1500000).toISOString(), operator: 'VTS-OP-001', action: 'Cambio de tema visual', type: 'theme_change', severity: 'info', detail: 'Azul Aqua → Azul Marino' },
  { id: '12', timestamp: new Date(Date.now() - 1800000).toISOString(), operator: 'SYSTEM', action: 'Backup automático completado', type: 'security', severity: 'info', detail: 'DB snapshot + replicación geográfica OK' },
]

const typeConfig = {
  maneuver: { icon: Anchor, color: 'text-emerald-400', label: 'MANIOBRA' },
  berth_assign: { icon: Anchor, color: 'text-sky-400', label: 'ATRAQUE' },
  radio_ptt: { icon: Radio, color: 'text-amber-400', label: 'RADIO' },
  chat_message: { icon: Brain, color: 'text-violet-400', label: 'IA VICTORIA' },
  alert: { icon: AlertTriangle, color: 'text-yellow-400', label: 'ALERTA' },
  security: { icon: ShieldAlert, color: 'text-red-400', label: 'SEGURIDAD' },
  report: { icon: FileText, color: 'text-cyan-400', label: 'INFORME' },
  theme_change: { icon: ShieldCheck, color: 'text-slate-400', label: 'CONFIG' },
}

const severityConfig = {
  info: { color: 'text-slate-400', label: 'INFO' },
  warning: { color: 'text-amber-400', label: 'WARN' },
  critical: { color: 'text-red-400', label: 'CRIT' },
}

export default function AuditLogPanel() {
  const [filter, setFilter] = useState<'all' | AuditLog['type']>('all')
  const [logs] = useState<AuditLog[]>(simulatedLogs)

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter)

  const handleExportCSV = () => {
    const csv = [
      'Timestamp,Operador,Acción,Tipo,Severidad,Detalle',
      ...filtered.map(l => [
        new Date(l.timestamp).toISOString(),
        l.operator,
        `"${l.action}"`,
        l.type,
        l.severity,
        `"${l.detail || ''}"`,
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-auditoria-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Logs exportados', {
      description: `${filtered.length} registros en CSV`,
    })
  }

  return (
    <div className="flex flex-col h-full bg-[var(--vts-card)] border border-slate-700/60 rounded-xl overflow-hidden shadow-lg shadow-black/30">
      <div className="p-4 border-b border-slate-700/40 bg-[var(--vts-subcard)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#00D2FF] text-base font-semibold font-mono">
            <History className="w-5 h-5" />
            Logs de Auditoría
          </div>
          <Button
            onClick={handleExportCSV}
            size="sm"
            variant="outline"
            className="h-7 text-[10px] bg-transparent border-slate-700/40 text-slate-300 hover:bg-slate-700/40"
          >
            <Download className="w-3 h-3 mr-1" />
            CSV
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'maneuver', label: 'Maniobras' },
            { id: 'berth_assign', label: 'Atraques' },
            { id: 'radio_ptt', label: 'Radio' },
            { id: 'chat_message', label: 'IA' },
            { id: 'alert', label: 'Alertas' },
            { id: 'security', label: 'Seguridad' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-2 py-1 text-[10px] font-medium rounded font-mono transition-colors ${
                filter === f.id
                  ? 'bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/40'
                  : 'bg-[#1a2433] text-slate-400 border border-slate-700/40 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scroll">
        <AnimatePresence>
          {filtered.map((log) => {
            const typeCfg = typeConfig[log.type]
            const sevCfg = severityConfig[log.severity]
            const Icon = typeCfg.icon
            return (
              <motion.div
                key={log.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-slate-700/40 bg-[var(--vts-subcard)] p-2.5"
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${typeCfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-700/40 text-slate-300 font-mono">
                        {typeCfg.label}
                      </span>
                      <span className={`text-[9px] font-bold ${sevCfg.color}`}>
                        {sevCfg.label}
                      </span>
                      <span className="text-[9px] text-slate-500 ml-auto font-mono">
                        {new Date(log.timestamp).toLocaleString('es-CL', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-100">{log.action}</div>
                    <div className="text-[11px] text-slate-400 leading-snug">{log.detail}</div>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                      👤 {log.operator}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="border-t border-slate-700/40 bg-[var(--vts-subcard)] p-2 text-[9px] text-slate-500 text-center font-mono">
        {filtered.length} registros · Conforme Ley 19.628 · IMO MSC.428(98) · ISO 27001 A.12.4
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </div>
  )
}
