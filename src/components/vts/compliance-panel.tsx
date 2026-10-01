'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, ShieldCheck, Lock, FileText, Globe2, Anchor, Cpu, Activity } from 'lucide-react'

const complianceItems = [
  {
    category: 'Normativa Internacional',
    icon: Globe2,
    items: [
      { name: 'IALA Recommendation V-103', status: 'compliant', detail: 'Formación y certificación de operadores VTS' },
      { name: 'IMO MSC.428(98) — Cyber Risk Management', status: 'compliant', detail: 'Gestión de riesgos cibernéticos para buques' },
      { name: 'SOLAS Capítulo V — Seguridad Navegación', status: 'compliant', detail: 'Cumplimiento de servicios VTS' },
      { name: 'ISPS Code — Seguridad Portus', status: 'compliant', detail: 'Protección de instalaciones portuarias' },
      { name: 'S-100 Framework (Hydrographic)', status: 'partial', detail: 'En transición desde S-57' },
    ],
  },
  {
    category: 'Normativa Chilena',
    icon: Anchor,
    items: [
      { name: 'Ley 21.719 — Ciberseguridad', status: 'compliant', detail: 'ANCI · CSIRT Nacional · OIV' },
      { name: 'Ley 19.628 / Ley 21.719 — Protección de Datos', status: 'compliant', detail: 'Tratamiento de datos personales' },
      { name: 'DS MOPT 1/1941 — Control Tráfico Marítimo', status: 'compliant', detail: 'Directemar — CONAMAR' },
      { name: 'Reglamento Marítimo CONAMAR', status: 'compliant', detail: 'Procedimientos VTS nacionales' },
    ],
  },
  {
    category: 'Estándares Técnicos',
    icon: Cpu,
    items: [
      { name: 'ISO/IEC 27001 — SGSI', status: 'compliant', detail: 'Sistema de Gestión de Seguridad Información' },
      { name: 'IEC 62443 — Seguridad Industrial', status: 'compliant', detail: 'Redes OT/IT segmentadas' },
      { name: 'NIST CSF 2.0', status: 'compliant', detail: 'Identificar · Proteger · Detectar · Responder · Recuperar' },
      { name: 'TLS 1.3 / OAuth 2.0 / OIDC', status: 'compliant', detail: 'Cifrado y autenticación' },
    ],
  },
]

const securityPosture = [
  { label: 'Confidencialidad', value: 96 },
  { label: 'Integridad', value: 98 },
  { label: 'Disponibilidad', value: 99 },
  { label: 'Trazabilidad', value: 100 },
]

const recentAudits = [
  { date: '2026-09-28', auditor: 'ANCI Chile', scope: 'Ley 21.719 — OIV', result: 'Aprobado', findings: 0 },
  { date: '2026-09-15', auditor: 'Directemar', scope: 'CONAMAR VTS', result: 'Aprobado', findings: 1 },
  { date: '2026-08-30', auditor: 'Bureau Veritas', scope: 'ISO 27001', result: 'Aprobado', findings: 2 },
  { date: '2026-08-12', auditor: 'SHOA', scope: 'Cartas ENC', result: 'Aprobado', findings: 0 },
]

export default function CompliancePanel() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Cumplimiento Normativo y Auditoría
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Estado de cumplimiento del sistema VTS conforme a normativa internacional, chilena y estándares técnicos.
        </p>
      </div>

      {/* Security posture */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {securityPosture.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <Lock className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{s.value}%</div>
                <Progress value={s.value} className="h-1 bg-sky-100/60" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Compliance categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {complianceItems.map((cat, idx) => {
          const Icon = cat.icon
          return (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white border-slate-200 shadow-sm h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sky-700 text-base flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {cat.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-start gap-2 p-2 rounded-md bg-sky-100/60/40 border border-slate-800"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          item.status === 'compliant'
                            ? 'text-emerald-400'
                            : item.status === 'partial'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-slate-700">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.detail}</div>
                      </div>
                      {item.status === 'partial' && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[9px]">
                          Parcial
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Auditorías recientes */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sky-700 text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Auditorías Recientes
          </CardTitle>
          <CardDescription className="text-slate-500">
            Registro de auditorías formales realizadas al sistema VTS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b border-slate-300">
                  <th className="pb-2 text-slate-500 font-medium">Fecha</th>
                  <th className="pb-2 text-slate-500 font-medium">Auditor</th>
                  <th className="pb-2 text-slate-500 font-medium">Alcance</th>
                  <th className="pb-2 text-slate-500 font-medium">Resultado</th>
                  <th className="pb-2 text-slate-500 font-medium text-right">Hallazgos</th>
                </tr>
              </thead>
              <tbody>
                {recentAudits.map((a) => (
                  <tr key={a.date} className="border-b border-slate-800/50">
                    <td className="py-2.5 text-slate-700">{a.date}</td>
                    <td className="py-2.5 text-slate-700">{a.auditor}</td>
                    <td className="py-2.5 text-slate-500">{a.scope}</td>
                    <td className="py-2.5">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                        {a.result}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right text-slate-700">{a.findings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
