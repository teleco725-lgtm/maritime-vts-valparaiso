'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth-store'
import { useRadioStore, type RadioMessage } from '@/store/radio-store'
import { vessels as allVessels, getVesselStatusColor, type Vessel } from '@/lib/vts/data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import ShareTranscriptionModal from './share-transcription-modal'
import {
  Radio, Mic, Square, Send, Trash2, Volume2, Loader2,
  Ship, Phone, Share2, History, Cctv, AlertTriangle,
  ChevronDown, Search,
} from 'lucide-react'

// Helper para obtener color del estado como string hex (para usar en styles inline)
const getVesselStatusColorHex = (status: Vessel['status']): string => getVesselStatusColor(status)

// Frases SMCP pre-codificadas (Standard Marine Communication Phrases — IMO)
const smcpPhrases = [
  { id: 'reduce', text: 'Buque [NOMBRE], reduzca velocidad a [X] nudos. Cambio.' },
  { id: 'heave', text: 'Buque [NOMBRE], manténgase al pairo. Cambio.' },
  { id: 'anchor', text: 'Buque [NOMBRE], diríjase a zona de fondeo número 2. Cambio.' },
  { id: 'pilot_embark', text: 'Buque [NOMBRE], práctico embarcando en 10 minutos. Cambio.' },
  { id: 'pilot_disembark', text: 'Buque [NOMBRE], práctico desembarcando. Cambio.' },
  { id: 'vts_standby', text: 'Buque [NOMBRE], manténgase a la escucha en canal VTS 12. Cambio.' },
]

export default function RadioVTSPanel() {
  const user = useAuthStore((s) => s.user)
  const {
    activeRecipient, setRecipient,
    isRecording, setRecording,
    currentTranscription, currentAudioBase64, currentDuration,
    setCurrentMessage, clearCurrent,
    messages, addMessage,
    isProcessing, setProcessing,
  } = useRadioStore()

  const [showShareModal, setShowShareModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showVesselPicker, setShowVesselPicker] = useState(false)
  const [vesselSearch, setVesselSearch] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingStartRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [volume, setVolume] = useState(0)

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // PTT con barra espaciadora — SOLO cuando NO se está escribiendo en un input/textarea
  useEffect(() => {
    const isTypingInField = () => {
      const el = document.activeElement
      if (!el) return false
      const tag = el.tagName.toLowerCase()
      // Si el foco está en un input, textarea o contenteditable, NO activar PTT
      if (tag === 'input' || tag === 'textarea') return true
      if (el.isContentEditable) return true
      // También verificar si el elemento tiene role=textbox
      if (el.getAttribute('role') === 'textbox') return true
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // No activar PTT si se está escribiendo en cualquier campo de texto
      if (isTypingInField()) return
      if (e.code === 'Space' && !e.repeat && !isRecording && !isProcessing && activeRecipient) {
        e.preventDefault()
        startRecording()
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      // No procesar si se está escribiendo
      if (isTypingInField()) return
      if (e.code === 'Space' && isRecording) {
        e.preventDefault()
        stopRecording()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isRecording, isProcessing, activeRecipient])

  // Medidor de volumen (simulado con animación)
  useEffect(() => {
    if (!isRecording) {
      setVolume(0)
      return
    }
    const interval = setInterval(() => {
      setVolume(Math.random() * 100)
    }, 100)
    return () => clearInterval(interval)
  }, [isRecording])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      // Detectar mimeType soportado
      const mimeOptions = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
      const mimeType = mimeOptions.find((m) => MediaRecorder.isTypeSupported(m)) || 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1]
          const duration = Date.now() - (recordingStartRef.current || Date.now())

          // Mostrar audio para reproducción
          const url = URL.createObjectURL(audioBlob)
          setAudioUrl(url)

          // Enviar a transcripción ASR
          setProcessing(true)
          try {
            const res = await fetch('/api/radio/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType,
                operatorName: user?.name,
                recipientMmsi: activeRecipient?.mmsi,
                recipientName: activeRecipient?.name,
                duration,
              }),
            })

            if (!res.ok) throw new Error('Error en transcripción')

            const data = await res.json()
            const transcription = data.transcription || '[Sin transcripción]'

            setCurrentMessage({
              transcription,
              audioBase64: base64Audio,
              duration,
            })

            // Agregar al historial
            const msg: RadioMessage = {
              id: `m${Date.now()}`,
              timestamp: new Date().toISOString(),
              operator: user?.name || 'Operador',
              recipientMmsi: activeRecipient?.mmsi,
              recipientName: activeRecipient?.name,
              duration,
              transcription,
              audioBase64: base64Audio,
              mimeType,
              warning: data.warning,
            }
            addMessage(msg)

            toast.success('Transcripción completada', {
              description: `${Math.round(duration / 100) / 10}s · Listo para compartir`,
            })
          } catch (e) {
            console.error(e)
            toast.error('No se pudo transcribir', {
              description: e instanceof Error ? e.message : 'Error desconocido',
            })
          } finally {
            setProcessing(false)
            // Detener el stream
            streamRef.current?.getTracks().forEach((t) => t.stop())
            streamRef.current = null
          }
        }
        reader.readAsDataURL(audioBlob)
      }

      recorder.start(100) // chunk cada 100ms
      mediaRecorderRef.current = recorder
      recordingStartRef.current = Date.now()
      setRecording(true)
      toast.info('Grabando...', {
        description: `Destinatario: ${activeRecipient?.name} (MMSI ${activeRecipient?.mmsi})`,
      })
    } catch (e) {
      console.error('No se pudo acceder al micrófono:', e)
      toast.error('No se pudo acceder al micrófono', {
        description: 'Verifica permisos del navegador',
      })
    }
  }, [activeRecipient, user, setRecording, setCurrentMessage, addMessage, setProcessing])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }, [setRecording])

  const handleSMCPClick = (text: string) => {
    if (!activeRecipient) {
      toast.error('Selecciona un buque destinatario primero')
      return
    }
    const finalText = text.replace('[NOMBRE]', activeRecipient.name)
    setCurrentMessage({
      transcription: finalText,
      audioBase64: undefined,
      duration: 0,
    })
    // También agregar al historial
    const msg: RadioMessage = {
      id: `m${Date.now()}`,
      timestamp: new Date().toISOString(),
      operator: user?.name || 'Operador',
      recipientMmsi: activeRecipient?.mmsi,
      recipientName: activeRecipient?.name,
      duration: 0,
      transcription: finalText,
    }
    addMessage(msg)
    toast.success('Mensaje SMCP cargado', { description: 'Listo para compartir' })
  }

  const handleClear = () => {
    clearCurrent()
    setAudioUrl(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${s}.${Math.floor((ms % 1000) / 100)}s`
  }

  return (
    <div className="bg-[var(--vts-card)] border border-slate-700/60 rounded-xl overflow-hidden shadow-lg shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/40 bg-[var(--vts-subcard)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00FF66] to-emerald-700 flex items-center justify-center shadow-md">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-100 flex items-center gap-2">
              Radio VTS
              <Badge variant="outline" className="bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/30 text-[10px] px-1.5 py-0">
                PTT
              </Badge>
            </div>
            <div className="text-xs text-slate-500">Walkie-Talkie Virtual con IA</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-[#00D2FF]/15 text-[#00D2FF]' : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'}`}
            title="Historial de mensajes"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Destinatario activo */}
        <div className="rounded-lg bg-[var(--vts-subcard)] border border-slate-700/40 p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold flex items-center justify-between">
            <span>Destinatario del Radio</span>
            {activeRecipient && (
              <span className="flex items-center gap-1 text-[#00FF66] normal-case tracking-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                Conectado
              </span>
            )}
          </div>

          {activeRecipient ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00FF66] to-emerald-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {activeRecipient.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-100 truncate">{activeRecipient.name}</div>
                  <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                    <span>MMSI {activeRecipient.mmsi}</span>
                    <span className="text-slate-700">·</span>
                    <span className="truncate">{activeRecipient.flag}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setShowVesselPicker(true)}
                  className="text-slate-400 hover:text-[#00D2FF] text-xs px-2.5 py-1 rounded hover:bg-[#00D2FF]/10 transition-colors"
                  title="Cambiar destinatario"
                >
                  Cambiar
                </button>
                <button
                  onClick={() => setRecipient(null)}
                  className="text-slate-500 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/10"
                  title="Quitar destinatario"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Ship className="w-4 h-4 flex-shrink-0" />
                <span>No hay destinatario seleccionado</span>
              </div>
              <button
                onClick={() => setShowVesselPicker(true)}
                className="w-full px-3 py-2 rounded-lg bg-[#00FF66]/15 hover:bg-[#00FF66]/25 border border-[#00FF66]/30 text-[#00FF66] text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Seleccionar buque destinatario
              </button>
              <div className="text-[10px] text-slate-600 text-center">
                💡 Tip: también puedes hacer clic en un buque del mapa o de la tabla
              </div>
            </div>
          )}
        </div>

        {/* Botón PTT grande */}
        <div className="flex flex-col items-center gap-3 py-2">
          <motion.button
            whileHover={{ scale: activeRecipient && !isProcessing ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={isRecording ? stopRecording : undefined}
            onTouchStart={(e) => { e.preventDefault(); startRecording() }}
            onTouchEnd={(e) => { e.preventDefault(); stopRecording() }}
            disabled={!activeRecipient || isProcessing}
            className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all ${
              !activeRecipient
                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                : isRecording
                ? 'bg-red-600 text-white'
                : isProcessing
                ? 'bg-amber-500 text-white'
                : 'bg-gradient-to-br from-[#00FF66] to-emerald-700 text-white hover:shadow-[#00FF66]/40'
            }`}
            style={{
              boxShadow: isRecording
                ? `0 0 40px ${volume > 50 ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.3)'}`
                : activeRecipient
                ? '0 10px 25px -5px rgba(0,255,102,0.4)'
                : 'none',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="text-[10px] font-semibold mt-2">TRANSCRIBIENDO</span>
              </>
            ) : isRecording ? (
              <>
                <Square className="w-10 h-10 fill-current" />
                <span className="text-[10px] font-semibold mt-2">GRABANDO</span>
                <span className="text-[9px] opacity-80 mt-0.5">Suelta para enviar</span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10" />
                <span className="text-[10px] font-semibold mt-2">PULSA PARA HABLAR</span>
                <span className="text-[9px] opacity-80 mt-0.5">o [Espacio]</span>
              </>
            )}
          </motion.button>

          {/* Indicador visual de volumen */}
          {isRecording && (
            <div className="flex items-center gap-1 h-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#00FF66] rounded transition-all"
                  style={{
                    height: `${Math.max(2, (volume / 100) * 12 * (1 - i * 0.08))}px`,
                    opacity: i * 8 < volume ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          )}

          <div className="text-xs text-slate-500 text-center max-w-xs">
            {isRecording
              ? `Grabando... ${formatDuration(Date.now() - (recordingStartRef.current || Date.now()))}`
              : isProcessing
              ? 'IA Victoria transcribiendo audio...'
              : activeRecipient
              ? `Mantén presionado para hablar con ${activeRecipient.name}`
              : 'Selecciona un buque destinatario en el mapa'}
          </div>
        </div>

        {/* Frases SMCP rápidas */}
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-semibold">
            Mensajes SMCP rápidos (IMO)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {smcpPhrases.map((p) => {
              const finalText = activeRecipient
                ? p.text.replace('[NOMBRE]', activeRecipient.name)
                : p.text
              return (
                <button
                  key={p.id}
                  onClick={() => handleSMCPClick(p.text)}
                  disabled={!activeRecipient}
                  className="text-left p-2 rounded-lg bg-[var(--vts-subcard)] border border-slate-700/40 hover:border-[#00FF66]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-xs text-slate-300 line-clamp-2 leading-snug">{finalText}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Transcripción actual */}
        {currentTranscription && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-[#00FF66]/5 border border-[#00FF66]/30 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] text-[#00FF66] uppercase tracking-wider font-semibold flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Transcripción IA Victoria
              </div>
              {currentDuration > 0 && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatDuration(currentDuration)}
                </span>
              )}
            </div>

            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mb-3">
              {currentTranscription}
            </div>

            {/* Audio playback */}
            {audioUrl && (
              <audio controls src={audioUrl} className="w-full h-8 mb-2" />
            )}

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowShareModal(true)}
                size="sm"
                className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-white h-8"
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                Compartir
              </Button>
              <Button
                onClick={handleClear}
                size="sm"
                variant="outline"
                className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700/40 h-8"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Limpiar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Historial */}
        <AnimatePresence>
          {showHistory && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-[var(--vts-subcard)] border border-slate-700/40 overflow-hidden"
            >
              <div className="text-[10px] text-slate-500 uppercase tracking-wider p-3 pb-2 font-semibold border-b border-slate-700/30">
                Historial ({messages.length})
              </div>
              <div className="max-h-48 overflow-y-auto custom-scroll">
                {[...messages].reverse().map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 border-b border-slate-700/20 hover:bg-slate-700/20"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {m.recipientName || 'Sin destinatario'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(m.timestamp).toLocaleTimeString('es-CL')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-2 leading-snug">
                      {m.transcription}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info legal */}
        <div className="text-[10px] text-slate-500 text-center leading-relaxed">
          🔒 Grabación + transcripción registrada en log de auditoría · Ley 19.628 · IMO MSC.428(98)
        </div>
      </div>

      {/* Modal de compartir */}
      {currentTranscription && (
        <ShareTranscriptionModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          transcription={currentTranscription}
          recipientName={activeRecipient?.name}
          recipientMmsi={activeRecipient?.mmsi}
        />
      )}

      {/* Modal de selección de buque destinatario */}
      <AnimatePresence>
        {showVesselPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVesselPicker(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--vts-card)] border border-slate-700/60 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b border-slate-700/40 bg-[var(--vts-subcard)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <Ship className="w-4 h-4 text-[#00FF66]" />
                    Seleccionar buque destinatario
                  </div>
                  <button
                    onClick={() => setShowVesselPicker(false)}
                    className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-700/40"
                  >
                    ✕
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    value={vesselSearch}
                    onChange={(e) => setVesselSearch(e.target.value)}
                    placeholder="Buscar por nombre, MMSI o IMO..."
                    autoFocus
                    className="w-full pl-8 pr-3 h-9 bg-[var(--vts-bg)] border border-slate-700/60 rounded-lg text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#00FF66]/50"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scroll p-2">
                {allVessels
                  .filter((v) => {
                    const q = vesselSearch.toLowerCase()
                    return (
                      v.name.toLowerCase().includes(q) ||
                      v.mmsi.includes(q) ||
                      v.imo.includes(q)
                    )
                  })
                  .map((v) => {
                    const isSelected = activeRecipient?.mmsi === v.mmsi
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setRecipient(v)
                          setShowVesselPicker(false)
                          setVesselSearch('')
                          toast.success('Destinatario seleccionado', {
                            description: `${v.name} (MMSI ${v.mmsi})`,
                          })
                        }}
                        className={`w-full text-left p-2.5 rounded-lg mb-1 transition-colors border ${
                          isSelected
                            ? 'bg-[#00FF66]/10 border-[#00FF66]/40'
                            : 'bg-[var(--vts-subcard)] border-transparent hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getVesselStatusColorHex(v.status) }} />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-slate-100 truncate">{v.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                MMSI: {v.mmsi} · {v.flag}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-[#00FF66] text-xs font-semibold flex-shrink-0">
                              ✓ Activo
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                {allVessels.filter((v) => {
                  const q = vesselSearch.toLowerCase()
                  return v.name.toLowerCase().includes(q) || v.mmsi.includes(q) || v.imo.includes(q)
                }).length === 0 && (
                  <div className="text-center text-sm text-slate-500 py-8">
                    No se encontraron buques
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </div>
  )
}
