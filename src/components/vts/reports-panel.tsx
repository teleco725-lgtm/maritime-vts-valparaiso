'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { vessels, alerts, kpis } from '@/lib/vts/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FileText, FileSpreadsheet, Presentation, FileDown, Calendar, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  user: { name: string; role: string; organization: string } | null
}

const formats = [
  { id: 'word', label: 'Word (.docx)', icon: FileText, color: 'from-blue-500 to-blue-700', ext: 'docx' },
  { id: 'powerpoint', label: 'PowerPoint (.pptx)', icon: Presentation, color: 'from-orange-500 to-red-700', ext: 'pptx' },
  { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'from-emerald-500 to-green-700', ext: 'xlsx' },
  { id: 'pdf', label: 'PDF Ejecutivo', icon: FileDown, color: 'from-slate-500 to-slate-800', ext: 'pdf' },
] as const

type FormatId = (typeof formats)[number]['id']

export default function ReportsPanel({ user }: Props) {
  const [format, setFormat] = useState<FormatId>('word')
  const [reportType, setReportType] = useState('daily')
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [includeSections, setIncludeSections] = useState<string[]>(['summary', 'vessels', 'alerts', 'kpis'])
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const toggleSection = (s: string) => {
    setIncludeSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerated(false)
    try {
      const params = new URLSearchParams({
        format,
        reportType,
        dateFrom,
        dateTo,
        includeSections: includeSections.join(','),
        operator: user?.name || 'Operador',
        organization: user?.organization || 'TCP Valparaíso',
      })
      const res = await fetch(`/api/reports?${params.toString()}`)
      if (!res.ok) throw new Error('Error al generar informe')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const ext = formats.find((f) => f.id === format)?.ext || 'bin'
      a.download = `informe-VTS-Valparaiso-${dateFrom}_${dateTo}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setGenerated(true)
      toast.success('Informe generado correctamente', {
        description: `Archivo ${ext.toUpperCase()} descargado al equipo.`,
      })
    } catch (e) {
      toast.error('No se pudo generar el informe', {
        description: e instanceof Error ? e.message : 'Error desconocido',
      })
    } finally {
      setGenerating(false)
    }
  }

  const sections = [
    { id: 'summary', label: 'Resumen Ejecutivo' },
    { id: 'vessels', label: 'Registro de Buques' },
    { id: 'alerts', label: 'Alertas y Eventos' },
    { id: 'kpis', label: 'Indicadores KPI' },
    { id: 'compliance', label: 'Cumplimiento Normativo (IALA/Directemar)' },
    { id: 'security', label: 'Ciberseguridad y Auditoría' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Configuración */}
      <Card className="bg-[#111927] border-slate-700/60 shadow-lg shadow-black/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#00FF66] text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generador de Informes Ejecutivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formato */}
          <div>
            <Label className="text-slate-700 text-xs mb-2">Formato de Exportación</Label>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((f) => {
                const Icon = f.icon
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`relative flex items-center gap-2 p-3 rounded-lg border transition-all ${
                      format === f.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-300 bg-[#1a2433]/50 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-slate-700 text-left">{f.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tipo de informe */}
          <div>
            <Label className="text-slate-700 text-xs mb-1.5">Tipo de Informe</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-[#1a2433] border-slate-700/60 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2433] border-slate-300">
                <SelectItem value="daily">Informe Diario</SelectItem>
                <SelectItem value="weekly">Informe Semanal</SelectItem>
                <SelectItem value="monthly">Informe Mensual Ejecutivo</SelectItem>
                <SelectItem value="incident">Informe de Incidente</SelectItem>
                <SelectItem value="compliance">Auditoría de Cumplimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rango de fechas */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-slate-700 text-xs mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Desde
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-[#1a2433] border-slate-700/60 text-slate-200 text-sm"
              />
            </div>
            <div>
              <Label className="text-slate-700 text-xs mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Hasta
              </Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-[#1a2433] border-slate-700/60 text-slate-200 text-sm"
              />
            </div>
          </div>

          {/* Secciones */}
          <div>
            <Label className="text-slate-700 text-xs mb-1.5">Secciones a Incluir</Label>
            <div className="grid grid-cols-1 gap-1.5">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleSection(s.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs border transition-colors ${
                    includeSections.includes(s.id)
                      ? 'border-emerald-500/40 bg-[#00FF66]/150/10 text-emerald-200'
                      : 'border-slate-300 bg-[#1a2433]/50 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className={`w-3 h-3 ${includeSections.includes(s.id) ? 'opacity-100' : 'opacity-30'}`} />
                  <span className="flex-1 text-left">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generar */}
          <Button
            onClick={handleGenerate}
            disabled={generating || includeSections.length === 0}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando informe...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Generar y Descargar
              </>
            )}
          </Button>

          {generated && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs text-emerald-400 bg-[#00FF66]/150/10 border border-emerald-500/30 rounded p-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Informe generado y descargado correctamente.
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Vista previa */}
      <Card className="bg-[#111927] border-slate-700/60 shadow-lg shadow-black/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#00FF66] text-base">Vista Previa del Informe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="bg-[#1a2433]/50 rounded-lg p-3 border border-slate-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Encabezado</span>
              <Badge variant="outline" className="bg-cyan-500/10 text-[#00FF66] border-cyan-500/30 text-[9px]">
                {reportType === 'daily' && 'DIARIO'}
                {reportType === 'weekly' && 'SEMANAL'}
                {reportType === 'monthly' && 'MENSUAL'}
                {reportType === 'incident' && 'INCIDENTE'}
                {reportType === 'compliance' && 'AUDITORÍA'}
              </Badge>
            </div>
            <div className="text-slate-100 font-semibold">Informe de Tráfico Marítimo</div>
            <div className="text-xs text-slate-500">TCP Valparaíso · {dateFrom} → {dateTo}</div>
            <div className="text-[10px] text-slate-500 mt-1">Operador: {user?.name} · {user?.organization}</div>
          </div>

          {includeSections.includes('summary') && (
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-wide mb-1">Resumen Ejecutivo</div>
              <div className="text-xs text-slate-700 leading-relaxed">
                Durante el período reportado se registraron <b className="text-slate-100">{vessels.length}</b> naves en zona VTS,
                con <b className="text-slate-100">{vessels.filter(v => v.status === 'moored').length}</b> atracadas y
                <b className="text-slate-100"> {vessels.filter(v => v.status === 'arrival').length}</b> en aproximación.
                Precisión GPS media con fusión IA: <b className="text-emerald-400">{kpis[3].value}%</b>.
              </div>
            </div>
          )}

          {includeSections.includes('vessels') && (
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-wide mb-1">Registro de Buques</div>
              <div className="space-y-0.5">
                {vessels.slice(0, 4).map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-[10px] bg-[#1a2433]/30 rounded px-2 py-1">
                    <span className="text-slate-700">{v.name}</span>
                    <span className="text-slate-500">{v.mmsi} · {v.flag}</span>
                  </div>
                ))}
                <div className="text-[10px] text-slate-500 text-center pt-1">+ {vessels.length - 4} registros adicionales</div>
              </div>
            </div>
          )}

          {includeSections.includes('alerts') && (
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-wide mb-1">Alertas Activas</div>
              <div className="text-xs text-slate-700">
                {alerts.filter(a => a.status === 'active').length} alertas activas ·
                <span className="text-red-400"> {alerts.filter(a => a.severity === 'critical').length} crítica</span> ·
                <span className="text-amber-400"> {alerts.filter(a => a.severity === 'high').length} alta</span>
              </div>
            </div>
          )}

          {includeSections.includes('compliance') && (
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-wide mb-1">Cumplimiento Normativo</div>
              <div className="text-xs text-slate-700 space-y-0.5">
                <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> IALA V-103</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> IMO MSC.428(98)</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ley 21.719 Ciberseguridad</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ley 19.628 Datos</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
