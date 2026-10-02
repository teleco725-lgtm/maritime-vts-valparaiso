'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'
import {
  Brain, Send, X, Sparkles, Globe2, Database, Activity,
  MessageSquare, Loader2, Trash2, ChevronDown, ChevronUp,
  Ship, AlertTriangle, FileText, ShieldCheck, Mic,
  ShieldAlert, Lock, KeyRound, FileWarning, Network,
  Heart, Waves, Anchor
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  meta?: {
    usedWebSearch?: boolean
    webResultsCount?: number
    usedTPSDb?: boolean
    tpsStats?: any
    timestamp?: string
  }
}

const SUGGESTED_PROMPTS = [
  { icon: Ship, text: '¿Qué buques hay en zona VTS ahora?', color: 'text-cyan-400', category: 'operacional' },
  { icon: AlertTriangle, text: '¿Cuáles son las alertas activas críticas?', color: 'text-amber-400', category: 'operacional' },
  { icon: Database, text: '¿Cuántos contenedores hay en patio TPS?', color: 'text-emerald-400', category: 'operacional' },
  { icon: Globe2, text: '¿Cómo está el clima marítimo en Valparaíso hoy?', color: 'text-sky-400', category: 'operacional' },
  { icon: ShieldCheck, text: '¿Cumple el sistema con la Ley 21.719?', color: 'text-violet-400', category: 'ciberseguridad' },
  { icon: FileText, text: 'Genera mensaje SMCP para buque en aproximación', color: 'text-pink-400', category: 'operacional' },
]

const AUDIT_PROMPTS = [
  {
    icon: ShieldAlert,
    text: '¿Cuáles son los hallazgos críticos de la auditoría de seguridad?',
    color: 'text-red-400',
    category: 'ciberseguridad',
  },
  {
    icon: Lock,
    text: '¿Qué headers HTTP de seguridad faltan en el sistema?',
    color: 'text-orange-400',
    category: 'ciberseguridad',
  },
  {
    icon: KeyRound,
    text: '¿Cómo implemento autenticación OAuth real con NextAuth?',
    color: 'text-amber-400',
    category: 'ciberseguridad',
  },
  {
    icon: Activity,
    text: '¿Qué endpoints API están sin autenticación ni rate limiting?',
    color: 'text-yellow-400',
    category: 'ciberseguridad',
  },
  {
    icon: Database,
    text: '¿Cómo cumplo la Ley 19.628 sobre protección de datos personales?',
    color: 'text-lime-400',
    category: 'ciberseguridad',
  },
  {
    icon: FileWarning,
    text: 'Dame el plan de remediación prioritario para subir el score de cumplimiento',
    color: 'text-green-400',
    category: 'ciberseguridad',
  },
  {
    icon: Network,
    text: '¿Cómo segmento redes OT/IT conforme a IEC 62443?',
    color: 'text-emerald-400',
    category: 'ciberseguridad',
  },
  {
    icon: ShieldCheck,
    text: '¿Qué necesito para certificar ISO/IEC 27001 en el VTS?',
    color: 'text-teal-400',
    category: 'ciberseguridad',
  },
  {
    icon: AlertTriangle,
    text: '¿Cómo notifico un incidente a la ANCI conforme al Art. 16 Ley 21.719?',
    color: 'text-cyan-400',
    category: 'ciberseguridad',
  },
  {
    icon: FileText,
    text: 'Genera plantilla de respuesta a incidente cibernético para CSIRT',
    color: 'text-sky-400',
    category: 'ciberseguridad',
  },
  {
    icon: Lock,
    text: '¿Cómo cifro la base de datos TPS en reposo y en tránsito?',
    color: 'text-blue-400',
    category: 'ciberseguridad',
  },
  {
    icon: Activity,
    text: '¿Qué derechos ARCO debo implementar por la Ley 19.628?',
    color: 'text-indigo-400',
    category: 'ciberseguridad',
  },
]

// Sugerencias bíblicas con temática marítima
const BIBLICAL_PROMPTS = [
  {
    icon: Heart,
    text: 'Estoy pasando por una tempestad en mi vida, ¿qué versículo me recomiendas?',
    color: 'text-amber-400',
    category: 'biblico',
  },
  {
    icon: Waves,
    text: 'Léeme el Salmo 107 (los que descienden al mar en naves)',
    color: 'text-sky-400',
    category: 'biblico',
  },
  {
    icon: Anchor,
    text: '¿Cómo calmó Jesús la tempestad en Mateo 8?',
    color: 'text-cyan-400',
    category: 'biblico',
  },
  {
    icon: Ship,
    text: 'Cuéntame la historia de Jonás y el gran pez',
    color: 'text-emerald-400',
    category: 'biblico',
  },
  {
    icon: Heart,
    text: 'Me siento solo y cansado en este turno, ¿puedes darme ánimo?',
    color: 'text-violet-400',
    category: 'biblico',
  },
  {
    icon: Waves,
    text: '¿Qué dice Isaías 43 sobre pasar por las aguas?',
    color: 'text-blue-400',
    category: 'biblico',
  },
  {
    icon: Anchor,
    text: 'Dame un versículo para fortalecer mi fe antes de mi jornada',
    color: 'text-rose-400',
    category: 'biblico',
  },
  {
    icon: Heart,
    text: 'Tengo miedo por la operación de hoy, ayúdame con la Palabra',
    color: 'text-pink-400',
    category: 'biblico',
  },
  {
    icon: Ship,
    text: '¿Qué nos enseña el naufragio de Pablo en Hechos 27?',
    color: 'text-teal-400',
    category: 'biblico',
  },
  {
    icon: Waves,
    text: 'Jesús caminó sobre el agua — ¿qué significa para mí hoy?',
    color: 'text-indigo-400',
    category: 'biblico',
  },
  {
    icon: Anchor,
    text: 'Oración por los marineros y navegantes del día',
    color: 'text-emerald-300',
    category: 'biblico',
  },
  {
    icon: Heart,
    text: 'Necesito esperanza, ¿qué me dice Adonai hoy?',
    color: 'text-amber-300',
    category: 'biblico',
  },
]

export default function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestionTab, setSuggestionTab] = useState<'operacional' | 'ciberseguridad' | 'biblico'>('operacional')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const send = async (text?: string, retryCount = 0) => {
    const query = (text ?? input).trim()
    if (!query || loading) return

    const userMsg: Message = { role: 'user', content: query }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      // Fetch con timeout de 45 segundos (Vercel free tier tiene 60s max)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          userQuery: query,
          operatorName: user?.name,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.error || `Error del servidor (${res.status})`)
      }

      const data = await res.json()
      const aiMsg: Message = {
        role: 'assistant',
        content: data.response,
        meta: data.meta,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (e) {
      // Retry automático: si es la primera vez y no fue abort por timeout, reintentar
      if (retryCount < 2 && !(e instanceof DOMException && e.name === 'AbortError')) {
        console.log(`🔄 Reintentando (intento ${retryCount + 1}/2)...`)
        setLoading(false)
        // Quitar el mensaje del usuario del estado para re-enviarlo
        setMessages(prev => prev.slice(0, -1))
        await new Promise(r => setTimeout(r, 1500))
        return send(text || query, retryCount + 1)
      }

      const isTimeout = e instanceof DOMException && e.name === 'AbortError'
      const errorMsg = isTimeout
        ? 'Victoria tardó demasiado en responder (timeout). El servidor podría estar sobrecargado.'
        : e instanceof Error ? e.message : 'Error desconocido'

      toast.error('Victoria no pudo responder', {
        description: errorMsg,
      })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isTimeout
          ? '⏳ Disculpa, tardé demasiado en procesar tu consulta. El servidor podría estar sobrecargado. Por favor intenta nuevamente.'
          : '⚠️ No pude conectarme con el servidor de IA. Esto puede ser temporal.\n\nPosibles causas:\n• El servidor está reiniciándose\n• Límite de cuota alcanzado\n• Conexión intermitente\n\n**Intenta nuevamente en unos segundos.**',
      }])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    toast.success('Conversación reiniciada')
  }

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/40 flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Abrir asistente IA"
          >
            <Brain className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-slate-950" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] md:w-[440px] h-[600px] max-h-[calc(100vh-3rem)] flex flex-col border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden bg-[var(--vts-card)]/95 backdrop-blur-xl"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-700/40 bg-[#0f1620]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                    Victoria
                    <Badge variant="outline" className="bg-[var(--vts-subcard)] text-[#00FF66] border-slate-700/50 text-[10px] px-1.5 py-0">
                      IA
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 truncate">
                    Asistente Marítimo · TCP Valparaíso
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                  aria-label="Limpiar conversación"
                  title="Limpiar conversación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                  aria-label="Cerrar chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status bar con fuentes de información */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#0f1620] border-b border-slate-700/40 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Globe2 className="w-3 h-3" /> Internet
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-[#00D2FF] font-medium">
                <Database className="w-3 h-3" /> TPS
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-violet-600 font-medium">
                <Activity className="w-3 h-3" /> VTS
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Heart className="w-3 h-3" /> Fe
              </span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3 bg-transparent">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-lg font-bold text-slate-100">Hola, soy Victoria</div>
                    <div className="text-sm text-slate-600 mt-1 px-2">
                      Asistente de IA del VTS. Tengo acceso al dashboard en vivo,
                      la base de datos TPS y búsqueda web.
                    </div>
                  </motion.div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 mb-2 p-1 bg-[#0f1620] backdrop-blur-sm rounded-lg border border-slate-700/40">
                      <button
                        onClick={() => setSuggestionTab('operacional')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-semibold transition-colors ${
                          suggestionTab === 'operacional'
                            ? 'bg-[#00FF66]/15 text-[#00FF66] shadow-sm'
                            : 'text-slate-600 hover:text-slate-100'
                        }`}
                      >
                        <Ship className="w-3.5 h-3.5" /> Oper.
                      </button>
                      <button
                        onClick={() => setSuggestionTab('ciberseguridad')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-semibold transition-colors ${
                          suggestionTab === 'ciberseguridad'
                            ? 'bg-red-500/15 text-red-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-100'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Ciber
                        <span className="ml-1 px-1.5 py-0 rounded bg-red-100 text-red-700 text-[9px] font-bold">12</span>
                      </button>
                      <button
                        onClick={() => setSuggestionTab('biblico')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-semibold transition-colors ${
                          suggestionTab === 'biblico'
                            ? 'bg-amber-500/15 text-amber-300 shadow-sm'
                            : 'text-slate-600 hover:text-slate-100'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" /> Bíblico
                        <span className="ml-1 px-1.5 py-0 rounded bg-amber-100 text-amber-700 text-[9px] font-bold">12</span>
                      </button>
                    </div>

                    <div className="text-xs text-slate-500 uppercase tracking-wider px-1 mb-1 font-semibold">
                      {suggestionTab === 'operacional'
                        ? 'Sugerencias Operacionales'
                        : suggestionTab === 'ciberseguridad'
                        ? 'Sugerencias de Auditoría'
                        : 'Palabras de Vida — Temática Marítima'}
                    </div>
                    {(suggestionTab === 'operacional'
                      ? SUGGESTED_PROMPTS
                      : suggestionTab === 'ciberseguridad'
                      ? AUDIT_PROMPTS
                      : BIBLICAL_PROMPTS
                    ).map((p, i) => {
                      const Icon = p.icon
                      return (
                        <motion.button
                          key={`${suggestionTab}-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => send(p.text)}
                          className={`w-full flex items-center gap-2 p-2.5 rounded-lg border hover:bg-[var(--vts-subcard)] transition-colors text-left ${
                            suggestionTab === 'ciberseguridad'
                              ? 'border-red-100 hover:border-red-300 bg-red-50/30'
                              : suggestionTab === 'biblico'
                              ? 'border-amber-100 hover:border-amber-300 bg-amber-50/5'
                              : 'border-slate-700/50 hover:border-sky-300 bg-[var(--vts-subcard)]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${p.color}`} />
                          <span className="text-sm text-slate-700 line-clamp-2">{p.text}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[88%] ${msg.role === 'user' ? 'bg-sky-600 text-white border-sky-600' : 'bg-[var(--vts-subcard)] border-slate-700/50'} border rounded-2xl p-3 ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs text-[#00FF66] font-semibold">
                        <Sparkles className="w-3 h-3" />
                        Victoria
                      </div>
                    )}
                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-slate-200'}`}>
                      {msg.content}
                    </div>
                    {msg.meta && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-700/50/50 flex-wrap">
                        {msg.meta.usedWebSearch && (
                          <span className="text-[10px] flex items-center gap-0.5 text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded-full font-medium">
                            <Globe2 className="w-2.5 h-2.5" /> Web
                          </span>
                        )}
                        {msg.meta.usedTPSDb && (
                          <span className="text-[10px] flex items-center gap-0.5 text-[#00FF66] bg-[#00D2FF]/10 px-2 py-0.5 rounded-full font-medium">
                            <Database className="w-2.5 h-2.5" /> TPS
                          </span>
                        )}
                        {msg.meta.webResultsCount ? (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {msg.meta.webResultsCount} fuentes web
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-[var(--vts-subcard)] border border-slate-700/50 rounded-2xl rounded-tl-sm p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#00D2FF]" />
                      <span className="text-sm text-slate-600">Consultando fuentes...</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-0.5"><Globe2 className="w-3 h-3 text-emerald-600" /> Internet</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Database className="w-3 h-3 text-[#00D2FF]" /> TPS</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Activity className="w-3 h-3 text-violet-600" /> VTS</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-700/40 bg-[#0f1620]">
              <form
                onSubmit={(e) => { e.preventDefault(); send() }}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu consulta..."
                  disabled={loading}
                  className="flex-1 h-11 bg-[var(--vts-subcard)] backdrop-blur border-slate-700/50 text-slate-200 text-sm placeholder:text-slate-500"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="h-11 w-11 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
              <div className="text-xs text-slate-500 mt-2 text-center">
                Victoria accede a Internet · DB TPS · Dashboard VTS en tiempo real
              </div>
            </div>

            <style jsx>{`
              .custom-scroll::-webkit-scrollbar { width: 5px; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
