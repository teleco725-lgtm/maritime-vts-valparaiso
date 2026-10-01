'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ShieldCheck, Ship, Radar, Cctv, Waves, Lock, Globe2, Anchor } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 23 23" className={className} aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H1.95v2.85A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H1.95a11 11 0 0 0 0 9.9l3.89-2.85z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 1.95 7.05l3.89 2.85C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  )
}

export default function LoginView() {
  const { login, isAuthenticating } = useAuthStore()
  const [activeProvider, setActiveProvider] = useState<'microsoft' | 'google' | 'guest' | null>(null)

  const handleLogin = async (provider: 'microsoft' | 'google' | 'guest') => {
    setActiveProvider(provider)
    await login(provider)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-slate-800"
      style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 25%, #f0f9ff 55%, #ffffff 100%)',
      }}
    >
      {/* Panel izquierdo — branding */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 lg:p-14 relative overflow-hidden">
        {/* Decoración suave */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Ship className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">MaritimeVTS</h1>
              <p className="text-sm text-slate-600">Control de Tráfico Marítimo · TCP Valparaíso</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-8 lg:my-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-5 bg-sky-50 text-sky-700 border-sky-200 px-3 py-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Sistema conforme a IALA V-103 · Ley 21.719
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-5 text-slate-900">
              Plataforma Ejecutiva de<br/>
              <span className="bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                Vigilancia Marítima
              </span>
            </h2>
            <p className="text-slate-600 text-base lg:text-lg max-w-md leading-relaxed mb-6">
              Sistema integrado AIS, Radar y Cámaras con fusión de sensores basada en IA.
              Diseñado para operadores con cualquier nivel de experiencia.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-8 max-w-md">
              {[
                { icon: Radar, label: 'Radar ARPA', desc: 'Detección 24/7' },
                { icon: Cctv, label: 'CCTV PTZ', desc: 'Visual en vivo' },
                { icon: Waves, label: 'MET-OCEAN', desc: 'Clima marítimo' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="rounded-xl bg-white/80 backdrop-blur border border-sky-100 p-3 flex flex-col items-center gap-1.5 shadow-sm">
                  <Icon className="w-6 h-6 text-sky-600" strokeWidth={2} />
                  <span className="text-xs font-semibold text-slate-700 text-center">{label}</span>
                  <span className="text-[10px] text-slate-500 text-center">{desc}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-slate-600">
              <Anchor className="w-4 h-4 text-sky-600" />
              <span>Puerto de Valparaíso · Terminal Pacífico Sur</span>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 space-y-1">
          <p className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Conexión cifrada TLS 1.3 · Ley 19.628 / 21.719</p>
          <p className="flex items-center gap-2"><Globe2 className="w-3.5 h-3.5" /> Operación en jurisdicción marítima chilena (12 mn)</p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/95 border-slate-200 backdrop-blur-xl shadow-2xl shadow-sky-900/10">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl text-slate-900">Acceso al Sistema</CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Seleccione su cuenta institucional para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleLogin('microsoft')}
                disabled={isAuthenticating}
                className="w-full h-14 bg-white hover:bg-slate-50 text-slate-800 font-medium text-base border border-slate-300 shadow-sm"
              >
                {isAuthenticating && activeProvider === 'microsoft' ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <MicrosoftIcon className="w-6 h-6 mr-3" />
                )}
                Continuar con Microsoft 365
              </Button>

              <Button
                onClick={() => handleLogin('google')}
                disabled={isAuthenticating}
                className="w-full h-14 bg-white hover:bg-slate-50 text-slate-800 font-medium text-base border border-slate-300 shadow-sm"
              >
                {isAuthenticating && activeProvider === 'google' ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <GoogleIcon className="w-6 h-6 mr-3" />
                )}
                Continuar con Google
              </Button>

              <div className="relative my-3">
                <Separator className="bg-slate-200" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-500 font-medium">
                  o acceso rápido
                </span>
              </div>

              <Button
                onClick={() => handleLogin('guest')}
                disabled={isAuthenticating}
                className="w-full h-14 bg-sky-600 hover:bg-sky-700 text-white font-medium text-base shadow-md shadow-sky-500/30"
              >
                {isAuthenticating && activeProvider === 'guest' ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <ShieldCheck className="w-5 h-5 mr-3" />
                )}
                Acceso de Demostración
              </Button>

              <p className="text-xs leading-relaxed text-slate-500 text-center pt-3">
                Al continuar, el usuario acepta la política de tratamiento de datos personales
                conforme a la <span className="font-semibold text-slate-700">Ley 21.719</span> y los protocolos
                de la <span className="font-semibold text-slate-700">Directemar</span>.
              </p>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Prototipo demostrativo · TCP Valparaíso · v1.0</p>
            <p className="mt-1">© 2026 MaritimeVTS — Todos los derechos reservados</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
