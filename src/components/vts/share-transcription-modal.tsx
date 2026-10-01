'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRadioStore } from '@/store/radio-store'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  MessageCircle, Send, Mail, Phone, Copy, Check, Search,
  Ship, User, ChevronRight, Share2
} from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  transcription: string
  recipientName?: string
  recipientMmsi?: string
}

type Channel = 'whatsapp' | 'telegram' | 'sms' | 'email' | 'copy'

const channelConfig: Record<Channel, { label: string; icon: typeof MessageCircle; color: string; bg: string }> = {
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/40' },
  telegram: { label: 'Telegram', icon: Send, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/40' },
  email: { label: 'Email', icon: Mail, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/40' },
  sms: { label: 'SMS', icon: Phone, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/40' },
  copy: { label: 'Copiar texto', icon: Copy, color: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-500/40' },
}

export default function ShareTranscriptionModal({
  isOpen,
  onClose,
  transcription,
  recipientName,
  recipientMmsi,
}: Props) {
  const { contacts } = useRadioStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      (c.vessel?.toLowerCase().includes(q) || false)
    )
  })

  const buildMessage = (contactName: string) => {
    const header = `🚢 *MaritimeVTS — TCP Valparaíso*\n`
    const meta = `Operador: ${recipientName ? 'Respuesta a ' + recipientName : 'Comunicación saliente'}${recipientMmsi ? ' (MMSI ' + recipientMmsi + ')' : ''}\n`
    const ts = `Hora: ${new Date().toLocaleString('es-CL')}\n`
    const body = `---\n${transcription}`
    return `${header}${meta}${ts}${body}`
  }

  const buildUrl = (channel: Channel, phone: string, email?: string) => {
    const contact = contacts.find((c) => c.id === selectedContactId)
    const contactName = contact?.name || ''
    const message = buildMessage(contactName)

    switch (channel) {
      case 'whatsapp': {
        // WhatsApp: limpia el número (solo dígitos)
        const cleanPhone = phone.replace(/[^0-9]/g, '')
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      }
      case 'telegram': {
        // Telegram: usa t.me/share/url
        return `https://t.me/share/url?url=${encodeURIComponent('https://vts.tcpvalparaiso.cl')}&text=${encodeURIComponent(message)}`
      }
      case 'sms': {
        const cleanPhone = phone.replace(/[^0-9+]/g, '')
        return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`
      }
      case 'email': {
        return `mailto:${email || ''}?subject=${encodeURIComponent('Comunicación VTS — TCP Valparaíso')}&body=${encodeURIComponent(message)}`
      }
      case 'copy': {
        return null
      }
    }
  }

  const handleShare = (channel: Channel) => {
    const contact = contacts.find((c) => c.id === selectedContactId)
    if (!contact && channel !== 'copy') {
      toast.error('Selecciona un contacto primero', {
        description: 'Debes elegir un destinatario antes de compartir',
      })
      return
    }

    if (channel === 'copy') {
      navigator.clipboard?.writeText(buildMessage(contact?.name || ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Transcripción copiada al portapapeles')
      return
    }

    const url = buildUrl(channel, contact!.phone, contact!.email)
    if (!url) return

    // Verifica que el canal esté soportado por el contacto
    if (!contact!.channels.includes(channel as any)) {
      toast.error('Canal no disponible', {
        description: `${contact!.name} no tiene ${channelConfig[channel].label} configurado`,
      })
      return
    }

    // Abrir el link en una nueva pestaña
    window.open(url, '_blank', 'noopener,noreferrer')
    toast.success(`Compartido por ${channelConfig[channel].label}`, {
      description: `Mensaje enviado a ${contact!.name}`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[var(--vts-card)] border-slate-700/60 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg text-slate-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#00D2FF]" />
            Compartir Transcripción
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Envía el mensaje transcrito por el canal preferido del destinatario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scroll pr-1">
          {/* Preview del mensaje */}
          <div className="rounded-lg bg-[var(--vts-subcard)] border border-slate-700/40 p-3">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
              Vista previa del mensaje
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {transcription}
            </div>
          </div>

          {/* Selector de contacto */}
          <div>
            <Label className="text-slate-300 text-sm mb-2 block">Selecciona destinatario</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, rol o buque..."
                className="pl-10 h-10 bg-[var(--vts-subcard)] border-slate-700/60 text-slate-200"
              />
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scroll">
              {filteredContacts.map((c) => {
                const isSelected = selectedContactId === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContactId(c.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#00D2FF]/10 border-[#00D2FF]/50'
                        : 'bg-[var(--vts-subcard)] border-slate-700/40 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-200 truncate">{c.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span>{c.role}</span>
                          {c.vessel && (
                            <>
                              <ChevronRight className="w-3 h-3" />
                              <span className="flex items-center gap-1">
                                <Ship className="w-3 h-3" /> {c.vessel}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {c.channels.map((ch) => {
                          const Icon = channelConfig[ch].icon
                          return (
                            <div
                              key={ch}
                              className={`w-6 h-6 rounded flex items-center justify-center ${channelConfig[ch].bg} border`}
                              title={channelConfig[ch].label}
                            >
                              <Icon className={`w-3 h-3 ${channelConfig[ch].color}`} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </button>
                )
              })}
              {filteredContacts.length === 0 && (
                <div className="text-center text-sm text-slate-500 py-4">
                  No se encontraron contactos
                </div>
              )}
            </div>
          </div>

          {/* Botones de canales */}
          <div>
            <Label className="text-slate-300 text-sm mb-2 block">Enviar por canal</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['whatsapp', 'telegram', 'sms', 'email', 'copy'] as Channel[]).map((ch) => {
                const cfg = channelConfig[ch]
                const Icon = cfg.icon
                const isCopied = ch === 'copy' && copied
                return (
                  <Button
                    key={ch}
                    onClick={() => handleShare(ch)}
                    variant="outline"
                    className={`h-12 ${cfg.bg} ${cfg.color} border hover:opacity-90 transition-opacity`}
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Icon className="w-4 h-4 mr-2" />
                    )}
                    {isCopied ? 'Copiado!' : cfg.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Nota legal */}
          <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2.5">
            <div className="text-[11px] text-amber-300/80 leading-relaxed">
              <strong>Nota de auditoría (Ley 19.628 / IMO MSC.428(98)):</strong> Esta comunicación
              queda registrada en el log de auditoría del sistema con timestamp, operador,
              destinatario y transcripción. El envío externo por WhatsApp/Telegram/Email es responsabilidad
              del operador.
            </div>
          </div>
        </div>
      </DialogContent>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </Dialog>
  )
}
