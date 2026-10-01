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
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { LayoutDashboard, FileText, ShieldCheck } from 'lucide-react'

export default function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header
        activeView={activeView}
        onNavigate={(v) => { setActiveView(v); setMobileNavOpen(false) }}
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
        mobileNavOpen={mobileNavOpen}
      />

      {/* Mobile nav sheet */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 bg-slate-900 border-slate-800">
          <div className="py-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider px-3 mb-2">Navegación</div>
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md mb-1 ${
                    activeView === item.id
                      ? 'bg-cyan-500/15 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
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

      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-3 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span>MaritimeVTS v1.0 · TCP Valparaíso</span>
            <span className="hidden sm:inline">·</span>
            <span>IALA V-103 · IMO MSC.428(98) · Ley 21.719</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span>Sistema operacional · CSIRT activo</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
