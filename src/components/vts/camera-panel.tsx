'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cameraFeeds } from '@/lib/vts/data'
import { Badge } from '@/components/ui/badge'
import { Cctv, Maximize2, Maximize, AlertCircle, Video, VideoOff } from 'lucide-react'

export default function CameraPanel() {
  const [selected, setSelected] = useState('cam5')
  const selectedCam = cameraFeeds.find((c) => c.id === selected)!

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-sky-100/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-700 text-base font-semibold">
            <Cctv className="w-5 h-5" />
            <span>CCTV en Vivo</span>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5">
            {cameraFeeds.filter((c) => c.online).length} en línea
          </Badge>
        </div>
      </div>

      {/* Vista principal de cámara */}
      <div className="aspect-video bg-slate-900 relative overflow-hidden">
        {selectedCam.online ? (
          <div className="absolute inset-0">
            {/* Simulación de feed */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950" />
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 3px)'
            }} />
            {/* "Buque" simulado */}
            <motion.div
              initial={{ x: -50, y: 200 }}
              animate={{ x: 400, y: 180 }}
              transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
              className="absolute w-32 h-10 bg-slate-700 rounded-sm shadow-lg"
              style={{ boxShadow: '0 0 10px rgba(6,182,212,0.4)' }}
            />
            {/* HUD overlay */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-emerald-400">
              <span>{selectedCam.name}</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                REC
              </span>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-emerald-400/70">
              <span>Zona: {selectedCam.zone}</span>
              <span>{new Date().toLocaleTimeString('es-CL')}</span>
            </div>
            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12">
              <div className="absolute inset-0 border border-emerald-400/40 rounded-full" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/40" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/40" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <VideoOff className="w-8 h-8 mb-2" />
            <span className="text-xs">Cámara fuera de línea</span>
          </div>
        )}
      </div>

      {/* Selector de cámaras */}
      <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
        {cameraFeeds.map((cam) => (
          <button
            key={cam.id}
            onClick={() => setSelected(cam.id)}
            className={`flex items-center gap-1 px-2 py-2 rounded-lg text-xs transition-colors border font-medium ${
              selected === cam.id
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title={cam.name}
          >
            {cam.online ? <Video className="w-3.5 h-3.5 flex-shrink-0" /> : <VideoOff className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />}
            <span className="truncate">{cam.id.toUpperCase()}</span>
            <span className="ml-auto text-[9px] text-slate-500">{cam.type}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
