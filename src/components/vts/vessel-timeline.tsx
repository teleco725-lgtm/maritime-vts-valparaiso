'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { type Vessel, getStatusLabel } from '@/lib/vts/data'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Ship, Anchor, Navigation, Clock, FileText, CheckCircle2,
  Calendar, MapPin, User, FileCheck, AlertCircle, Anchor as AnchorIcon,
  TrendingUp, Activity
} from 'lucide-react'

interface Milestone {
  id: string
  type: 'arrival_bay' | 'pilot_boarding' | 'first_line' | 'operation_start' | 'operation_end' | 'last_line' | 'pilot_disembark' | 'departure' | 'document_verified'
  label: string
  timestamp: string
  status: 'completed' | 'in_progress' | 'pending'
  operator?: string
  detail?: string
  documents?: { name: string; verified: boolean; signedBy?: string }[]
}

// Genera hitos de bitácora según el estado del buque
function getMilestonesForVessel(v: Vessel | null): Milestone[] {
  if (!v) return []
  const now = new Date()
  const baseTime = now.getTime()

  // Tiempos relativos según estado del buque
  const completed = (label: string, minsAgo: number, op: string, detail?: string): Milestone => ({
    id: `m-${label}-${minsAgo}`,
    type: 'arrival_bay',
    label,
    timestamp: new Date(baseTime - minsAgo * 60000).toISOString(),
    status: 'completed',
    operator: op,
    detail,
  })

  const milestones: Milestone[] = []

  if (v.status === 'moored') {
    // Buque atracado — hitos completos hasta operación
    milestones.push(completed('Llegada a bahía (ETA real)', 240, 'VTS-OP-001', `Coordenadas ${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}`))
    milestones.push({
      ...completed('Embarque de práctico', 180, 'P. González'),
      type: 'pilot_boarding',
      detail: `Práctico embarcado en zona de embarque No.1 — Viento 8kn SO`,
    })
    milestones.push({
      ...completed('Primer espía (atranque)', 120, 'VTS-OP-002'),
      type: 'first_line',
      detail: `Atraque confirmado en ${v.destination}`,
    })
    milestones.push({
      ...completed('Inicio de faena', 90, 'TPS-PATIO'),
      type: 'operation_start',
      detail: `Inicio descarga — TEU esperados: 3,200`,
      documents: [
        { name: 'Manifiesto de carga', verified: true, signedBy: 'Autoridad Marítima' },
        { name: 'Certificado de recepción', verified: true, signedBy: 'Directemar' },
        { name: 'Declaración de sanidad', verified: true, signedBy: 'SAG' },
      ],
    })
    milestones.push({
      id: 'op-current',
      type: 'operation_end',
      label: 'Término de faena (en progreso)',
      timestamp: 'en progreso',
      status: 'in_progress',
      operator: 'TPS-PATIO',
      detail: `Progreso actual: 65% — TEU movidos: 2,080 / 3,200`,
    })
    milestones.push({
      id: 'op-pending-1',
      type: 'last_line',
      label: 'Último espía (desatraque)',
      timestamp: 'pendiente',
      status: 'pending',
      detail: 'Pendiente de coordinación con plan de zarpes',
    })
    milestones.push({
      id: 'op-pending-2',
      type: 'pilot_disembark',
      label: 'Desembarque de práctico',
      timestamp: 'pendiente',
      status: 'pending',
    })
    milestones.push({
      id: 'op-pending-3',
      type: 'departure',
      label: 'Zarpe (ETD real)',
      timestamp: 'pendiente',
      status: 'pending',
      detail: `Destino: ${v.destination.includes('→') ? v.destination.split('→')[1]?.trim() : 'próximo puerto'}`,
    })
  } else if (v.status === 'arrival') {
    // Buque en aproximación — solo ETA completado
    milestones.push({
      ...completed('Aviso de arribo (ANR)', 1440, 'Agente de naves'),
      type: 'arrival_bay',
      detail: 'Aviso de Navío en Ruta (ANR) recibido 24h antes',
    })
    milestones.push({
      ...completed('Confirmación de ETA', 720, 'VTS-OP-001'),
      type: 'arrival_bay',
      detail: `ETA confirmada: ${v.eta}`,
    })
    milestones.push({
      id: 'op-cur-1',
      type: 'arrival_bay',
      label: 'Llegada a bahía (ETA real)',
      timestamp: 'en progreso',
      status: 'in_progress',
      operator: 'VTS-OP-001',
      detail: `Buque aproximándose · SOG ${v.sog.toFixed(1)}kn · Dist. al puerto: ${(Math.random() * 8 + 4).toFixed(1)}NM`,
    })
    milestones.push({
      id: 'op-pend-1',
      type: 'pilot_boarding',
      label: 'Embarque de práctico',
      timestamp: 'pendiente',
      status: 'pending',
    })
    milestones.push({
      id: 'op-pend-2',
      type: 'first_line',
      label: 'Primer espía (atranque)',
      timestamp: 'pendiente',
      status: 'pending',
      detail: `Sitio de atraque asignado: ${v.destination}`,
    })
  } else if (v.status === 'anchored') {
    // Buque fondeado
    milestones.push(completed('Llegada a bahía', 360, 'VTS-OP-001'))
    milestones.push({
      ...completed('Fondeo confirmado', 300, 'Cap. del buque'),
      type: 'first_line',
      detail: `Fondeo en ${v.destination} · Ancla largada a 8m`,
      documents: [
        { name: 'Declaración de fondeo', verified: true, signedBy: 'Autoridad Marítima' },
      ],
    })
    milestones.push({
      id: 'op-cur-fond',
      type: 'operation_start',
      label: 'En espera de sitio de atraque',
      timestamp: 'en progreso',
      status: 'in_progress',
      detail: 'En espera de asignación de muelle',
    })
  } else if (v.status === 'underway') {
    // En navegación — pocos hitos
    milestones.push(completed('Zarpe confirmado', 60, 'VTS-OP-001'))
    milestones.push({
      id: 'op-cur-nav',
      type: 'departure',
      label: 'En navegación',
      timestamp: 'en progreso',
      status: 'in_progress',
      detail: `Rumbo ${v.cog}° · SOG ${v.sog.toFixed(1)}kn`,
    })
  }

  return milestones
}

const milestoneConfig = {
  arrival_bay: { icon: MapPin, color: 'text-sky-400', bg: 'bg-sky-500/10', label: 'ARRIBO' },
  pilot_boarding: { icon: User, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'PRÁCTICO' },
  first_line: { icon: Anchor, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'ATRANQUE' },
  operation_start: { icon: Activity, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'INICIO' },
  operation_end: { icon: CheckCircle2, color: 'text-[#00FF66]', bg: 'bg-[#00FF66]/10', label: 'TÉRMINO' },
  last_line: { icon: Anchor, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'DESATRANQUE' },
  pilot_disembark: { icon: User, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'DESEMBARQUE' },
  departure: { icon: Navigation, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'ZARPE' },
  document_verified: { icon: FileCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'DOC' },
}

interface Props {
  vessel: Vessel | null
}

export default function VesselTimeline({ vessel }: Props) {
  const milestones = getMilestonesForVessel(vessel)

  if (!vessel) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center p-4 bg-[var(--vts-card)] border border-slate-700/60 rounded-xl shadow-lg shadow-black/30">
        <div>
          <Ship className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
          <div className="font-medium text-slate-600 mb-1">Bitácora de Hitos</div>
          <div className="text-xs text-slate-500">Selecciona un buque para ver su trazabilidad temporal</div>
        </div>
      </div>
    )
  }

  const completedCount = milestones.filter(m => m.status === 'completed').length
  const inProgressCount = milestones.filter(m => m.status === 'in_progress').length
  const pendingCount = milestones.filter(m => m.status === 'pending').length
  const progress = (completedCount / milestones.length) * 100

  const handleExport = () => {
    const csv = [
      'Hito,Tipo,Timestamp,Estado,Operador,Detalle',
      ...milestones.map(m => [
        `"${m.label}"`,
        m.type,
        m.timestamp,
        m.status,
        m.operator || 'N/A',
        `"${m.detail || ''}"`,
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bitacora-${vessel.name.replace(/\s/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Bitácora exportada', {
      description: `CSV con ${milestones.length} hitos descargado`,
    })
  }

  return (
    <div className="flex flex-col h-full bg-[var(--vts-card)] border border-slate-700/60 rounded-xl overflow-hidden shadow-lg shadow-black/30">
      <div className="p-3 border-b border-slate-700/40 bg-[var(--vts-subcard)]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[#00FF66] text-sm font-semibold font-mono flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Bitácora de Hitos
          </div>
          <Button
            onClick={handleExport}
            size="sm"
            variant="outline"
            className="h-7 text-[10px] bg-transparent border-slate-700/40 text-slate-300 hover:bg-slate-700/40"
          >
            <FileText className="w-3 h-3 mr-1" />
            CSV
          </Button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
          <span>{vessel.name} · MMSI {vessel.mmsi}</span>
          <span>{completedCount}/{milestones.length} hitos</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-[#00FF66] h-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scroll">
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700/40" />

          <div className="space-y-3">
            {milestones.map((m, i) => {
              const cfg = milestoneConfig[m.type] || milestoneConfig.arrival_bay
              const Icon = cfg.icon
              const dotColor = m.status === 'completed' ? '#00FF66' : m.status === 'in_progress' ? '#FFB800' : '#475569'

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-10"
                >
                  {/* Círculo */}
                  <div
                    className="absolute left-2 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10"
                    style={{
                      backgroundColor: m.status === 'completed' ? 'var(--vts-card)' : 'var(--vts-card)',
                      borderColor: dotColor,
                    }}
                  >
                    {m.status === 'in_progress' && (
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: dotColor }} />
                    )}
                    {m.status === 'completed' && (
                      <CheckCircle2 className="w-3 h-3" style={{ color: dotColor }} />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className={`rounded-lg border p-2.5 ${cfg.bg} ${m.status === 'pending' ? 'border-slate-700/30 opacity-60' : 'border-slate-700/40'}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        <span className="text-xs font-semibold text-slate-200">{m.label}</span>
                      </div>
                      <Badge variant="outline" className={`text-[8px] ${cfg.bg} ${cfg.color} border-current`}>
                        {cfg.label}
                      </Badge>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mb-1">
                      <Clock className="w-2.5 h-2.5" />
                      {m.timestamp === 'en progreso' ? (
                        <span className="text-amber-400 font-semibold">EN PROGRESO</span>
                      ) : m.timestamp === 'pendiente' ? (
                        <span className="text-slate-500">PENDIENTE</span>
                      ) : (
                        new Date(m.timestamp).toLocaleString('es-CL', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        })
                      )}
                      {m.operator && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span>{m.operator}</span>
                        </>
                      )}
                    </div>

                    {m.detail && (
                      <div className="text-[11px] text-slate-400 leading-snug">{m.detail}</div>
                    )}

                    {/* Documentos verificados */}
                    {m.documents && m.documents.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {m.documents.map((doc, j) => (
                          <div key={j} className="flex items-center gap-1.5 text-[10px]">
                            {doc.verified ? (
                              <CheckCircle2 className="w-3 h-3 text-[#00FF66]" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-amber-400" />
                            )}
                            <span className="text-slate-400">{doc.name}</span>
                            {doc.signedBy && (
                              <span className="text-slate-600 ml-auto font-mono">
                                · {doc.signedBy}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700/40 bg-[var(--vts-subcard)] p-2 text-[9px] text-slate-500 text-center font-mono">
        {completedCount} ✓ · {inProgressCount} en progreso · {pendingCount} pendientes
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </div>
  )
}
