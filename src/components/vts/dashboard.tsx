'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { vessels, type Vessel } from '@/lib/vts/data'
import { useAuthStore } from '@/store/auth-store'
import Header from './header'
import VesselMap from './vessel-map'
import VesselTable from './vessel-table'
import VesselDetail from './vessel-detail'
import KpiPanel from './kpi-panel'
import AlertsPanel from './alerts-panel'
import CameraPanel from './camera-panel'
import AnalyticsPanel from './analytics-panel'
import ReportsPanel from './reports-panel'
import CompliancePanel from './compliance-panel'
import AIChatPanel from './ai-chat-panel'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { LayoutDashboard, FileText, ShieldCheck } from 'lucide-react'

export default function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const user = useAuthStore((s) => s.user)

  return (
    <div
      className="min-h-screen flex flex-col text-slate-200"
      style={{
        background: 'radial-gradient(ellipse at top, var(--vts-bg) 0%, var(--vts-bg) 50%, var(--vts-deep) 100%)',
      }}
    >
      <Header
        activeView={activeView}
        onNavigate={(v) => { setActiveView(v); setMobileNavOpen(false) }}
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
        mobileNavOpen={mobileNavOpen}
      />

      {/* Mobile nav sheet */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 bg-[var(--vts-card)]/95 backdrop-blur-xl border-slate-700/60">
          <div className="py-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider px-3 mb-2 font-semibold">Navegación</div>
            {[
              { id: 'dashboard', label: 'Dashboard Operacional', icon: LayoutDashboard },
              { id: 'reports', label: 'Informes Ejecutivos', icon: FileText },
              { id: 'compliance', label: 'Cumplimiento', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveView(item.id); setMobileNavOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-base rounded-lg mb-1 font-medium transition-colors ${
                    activeView === item.id
                      ? 'bg-[#00D2FF]/15 text-[#00D2FF]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[var(--vts-subcard)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 p-3 sm:p-4 lg:p-6">
        {activeView === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {/* KPIs */}
            <KpiPanel />

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Mapa */}
              <div className="lg:col-span-8 h-[500px] sm:h-[600px]">
                <VesselMap selectedVessel={selectedVessel} onSelectVessel={setSelectedVessel} />
              </div>

              {/* Tabla de buques */}
              <div className="lg:col-span-4 h-[500px] sm:h-[600px]">
                <VesselTable selectedVessel={selectedVessel} onSelectVessel={setSelectedVessel} />
              </div>
            </div>

            {/* Analytics */}
            <AnalyticsPanel />

            {/* Secondary grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-4 h-[400px]">
                <VesselDetail vessel={selectedVessel} />
              </div>
              <div className="lg:col-span-4 h-[400px]">
                <AlertsPanel />
              </div>
              <div className="lg:col-span-4 h-[400px]">
                <CameraPanel />
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'reports' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ReportsPanel user={user} />
          </motion.div>
        )}

        {activeView === 'compliance' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CompliancePanel />
          </motion.div>
        )}
      </main>

      <footer className="border-t border-slate-700/40 bg-[var(--vts-bg)]/60 backdrop-blur-md px-4 sm:px-6 py-3 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="font-semibold text-slate-200">MaritimeVTS v1.0</span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span>TCP Valparaíso</span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="hidden lg:inline text-slate-500">IALA V-103 · IMO MSC.428(98) · Ley 21.719</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF66]" />
            </span>
            <span className="font-medium text-slate-300">Sistema operacional · IA Victoria activa</span>
          </div>
        </div>
      </footer>

      {/* Asistente de IA flotante */}
      <AIChatPanel />
    </div>
  )
}
