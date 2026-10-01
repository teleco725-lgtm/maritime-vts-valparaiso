'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Vessel } from '@/lib/vts/data'

export interface RadioMessage {
  id: string
  timestamp: string
  operator: string
  recipientMmsi?: string
  recipientName?: string
  duration: number
  transcription: string
  audioBase64?: string
  mimeType?: string
  warning?: string
}

export interface Contact {
  id: string
  name: string
  role: string
  vessel?: string
  phone: string  // +56912345678
  email?: string
  channels: ('whatsapp' | 'telegram' | 'sms' | 'email')[]
}

export const defaultContacts: Contact[] = [
  {
    id: 'c1', name: 'Cap. Andrés Martínez', role: 'Práctico de Puerto',
    vessel: 'MSC ISABELLA', phone: '+56987654321', email: 'andres.martinez@practicosvalpo.cl',
    channels: ['whatsapp', 'telegram', 'sms', 'email'],
  },
  {
    id: 'c2', name: 'Ing. Carla Rojas', role: 'Directemar RCC',
    vessel: 'PACIFIC STAR', phone: '+56923456789', email: 'c.rojas@directemar.cl',
    channels: ['whatsapp', 'telegram', 'email'],
  },
  {
    id: 'c3', name: 'Cap. Juan Soto', role: 'Capitán',
    vessel: 'EVER GIVEN', phone: '+56934567890', email: 'capitan@evergiven.liberia',
    channels: ['whatsapp', 'sms'],
  },
  {
    id: 'c4', name: 'TPS Operaciones', role: 'Central Operaciones',
    phone: '+56945678901', email: 'operaciones@tps.cl',
    channels: ['whatsapp', 'email'],
  },
  {
    id: 'c5', name: 'Prácticos Valparaíso', role: 'Grupo de Prácticos',
    phone: '+56956789012',
    channels: ['whatsapp', 'telegram'],
  },
  {
    id: 'c6', name: 'CSIRT Nacional ANCI', role: 'Ciberseguridad',
    phone: '+56967890123', email: 'csirt@anci.gob.cl',
    channels: ['whatsapp', 'email'],
  },
]

interface RadioState {
  // Estado del receptor/destinatario
  activeRecipient: Vessel | null
  setRecipient: (v: Vessel | null) => void

  // Estado del PTT
  isRecording: boolean
  recordingStart: number | null
  setRecording: (recording: boolean) => void

  // Mensaje transcrito actual
  currentTranscription: string | null
  currentAudioBase64: string | null
  currentDuration: number
  setCurrentMessage: (msg: Partial<RadioMessage>) => void
  clearCurrent: () => void

  // Historial de mensajes
  messages: RadioMessage[]
  addMessage: (msg: RadioMessage) => void
  clearMessages: () => void

  // Contactos
  contacts: Contact[]
  addContact: (c: Contact) => void
  removeContact: (id: string) => void

  // Procesando transcripción
  isProcessing: boolean
  setProcessing: (p: boolean) => void
}

export const useRadioStore = create<RadioState>()(
  persist(
    (set) => ({
      activeRecipient: null,
      setRecipient: (v) => set({ activeRecipient: v }),

      isRecording: false,
      recordingStart: null,
      setRecording: (recording) =>
        set({
          isRecording: recording,
          recordingStart: recording ? Date.now() : null,
        }),

      currentTranscription: null,
      currentAudioBase64: null,
      currentDuration: 0,
      setCurrentMessage: (msg) =>
        set((prev) => ({
          currentTranscription: msg.transcription ?? prev.currentTranscription,
          currentAudioBase64: msg.audioBase64 ?? prev.currentAudioBase64,
          currentDuration: msg.duration ?? prev.currentDuration,
        })),
      clearCurrent: () =>
        set({
          currentTranscription: null,
          currentAudioBase64: null,
          currentDuration: 0,
        }),

      messages: [],
      addMessage: (msg) =>
        set((prev) => ({ messages: [...prev.messages, msg] })),
      clearMessages: () => set({ messages: [] }),

      contacts: defaultContacts,
      addContact: (c) =>
        set((prev) => ({ contacts: [...prev.contacts, c] })),
      removeContact: (id) =>
        set((prev) => ({ contacts: prev.contacts.filter((c) => c.id !== id) })),

      isProcessing: false,
      setProcessing: (p) => set({ isProcessing: p }),
    }),
    {
      name: 'vts-radio',
      partialize: (state) => ({
        contacts: state.contacts,
        messages: state.messages.slice(-10), // keep last 10
      }),
    }
  )
)
