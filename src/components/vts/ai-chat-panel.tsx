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
  Ship, AlertTriangle, FileText, ShieldCheck, Mic
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
  { icon: Ship, text: '¿Qué buques hay en zona VTS ahora?', color: 'text-cyan-400' },
  { icon: AlertTriangle, text: '¿Cuáles son las alertas activas críticas?', color: 'text-amber-400' },
  { icon: Database, text: '¿Cuántos contenedores hay en patio TPS?', color: 'text-emerald-400' },
  { icon: Globe2, text: '¿Cómo está el clima marítimo en Valparaíso hoy?', color: 'text-sky-400' },
  { icon: ShieldCheck, text: '¿Cumple el sistema con la Ley 21.719?', color: 'text-violet-400' },
  { icon: FileText, text: 'Genera mensaje SMCP para buque en aproximación', color: 'text-pink-400' },
]

export default function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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

  const send = async (text?: string) => {
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

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          userQuery: query,
          operatorName: user?.name,
        }),
      })

      if (!res.ok) {
        throw new Error('Error en la respuesta del servidor')
      }

      const data = await res.json()
      const aiMsg: Message = {
        role: 'assistant',
        content: data.response,
        meta: data.meta,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (e) {
      toast.error('No se pudo conectar con el asistente IA', {
        description: e instanceof Error ? e.message : 'Error desconocido',
      })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Disculpa, hubo un problema técnico. Por favor intenta nuevamente en unos segundos.',
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
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] md:w-[440px] h-[600px] max-h-[calc(100vh-3rem)] flex flex-col border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a1d24 0%, #1b1f26 35%, #1c1e22 70%, #1d1c1f 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-700/60" style={{ background: 'rgba(15, 18, 22, 0.6)' }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                    MarÍA
                    <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[9px] px-1 py-0">
                      AI
                    </Badge>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Asistente Marítimo · TCP Valparaíso
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  aria-label="Limpiar conversación"
                  title="Limpiar conversación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  aria-label="Cerrar chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status bar con fuentes de información */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border-b border-slate-800 text-[9px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <Globe2 className="w-2.5 h-2.5" /> Internet
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Database className="w-2.5 h-2.5" /> DB TPS
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1 text-violet-400">
                <Activity className="w-2.5 h-2.5" /> Dashboard
              </span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scroll p-3 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-2">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-medium text-slate-200">Hola, soy MarÍA</div>
                    <div className="text-xs text-slate-500 mt-1 px-2">
                      Asistente de IA del VTS. Tengo acceso al dashboard en vivo,
                      la base de datos TPS y búsqueda web.
                    </div>
                  </motion.div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider px-1">
                      Sugerencias
                    </div>
                    {SUGGESTED_PROMPTS.map((p, i) => {
                      const Icon = p.icon
                      return (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => send(p.text)}
                          className="w-full flex items-center gap-2 p-2 rounded-md bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-colors text-left"
                        >
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${p.color}`} />
                          <span className="text-xs text-slate-300 truncate">{p.text}</span>
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
                  <div className={`max-w-[88%] ${msg.role === 'user' ? 'bg-cyan-500/15 border-cyan-500/30' : 'bg-slate-900/70 border-slate-700'} border rounded-lg p-2.5`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1 text-[9px] text-cyan-400">
                        <Sparkles className="w-2.5 h-2.5" />
                        MarÍA
                      </div>
                    )}
                    <div className={`text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-slate-200' : 'text-slate-300'}`}>
                      {msg.content}
                    </div>
                    {msg.meta && (
                      <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-700/50 flex-wrap">
                        {msg.meta.usedWebSearch && (
                          <span className="text-[8px] flex items-center gap-0.5 text-emerald-400">
                            <Globe2 className="w-2 h-2" /> Web
                          </span>
                        )}
                        {msg.meta.usedTPSDb && (
                          <span className="text-[8px] flex items-center gap-0.5 text-cyan-400">
                            <Database className="w-2 h-2" /> TPS
                          </span>
                        )}
                        {msg.meta.webResultsCount ? (
                          <span className="text-[8px] text-slate-500">
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
                  <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                      <span className="text-xs text-slate-400">Consultando fuentes...</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[8px] text-slate-500">
                      <span className="flex items-center gap-0.5"><Globe2 className="w-2 h-2" /> Internet</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Database className="w-2 h-2" /> TPS</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Activity className="w-2 h-2" /> VTS</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-700/60" style={{ background: 'rgba(15, 18, 22, 0.7)' }}>
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
                  className="flex-1 h-9 bg-slate-900 border-slate-700 text-slate-200 text-xs placeholder:text-slate-600"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="h-9 w-9 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="text-[9px] text-slate-600 mt-1.5 text-center">
                MarÍA accede a Internet · DB TPS · Dashboard VTS en tiempo real
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
