import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 60

// Recibe audio base64, lo transcribe con z-ai-web-dev-sdk ASR,
// registra en OperationLog y devuelve el texto.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { audioBase64, mimeType, operatorName, recipientMmsi, recipientName, duration } = body as {
      audioBase64?: string
      mimeType?: string
      operatorName?: string
      recipientMmsi?: string
      recipientName?: string
      duration?: number
    }

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return NextResponse.json(
        { error: 'audioBase64 es requerido' },
        { status: 400 }
      )
    }

    // 1. Transcribir el audio con z-ai-web-dev-sdk (ASR)
    let transcription = ''
    let asrError: string | undefined

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()
      const response = await zai.audio.asr.create({
        file_base64: audioBase64,
      })
      transcription = response?.text || ''
    } catch (e) {
      console.error('ASR failed:', e)
      asrError = e instanceof Error ? e.message : String(e)
      // Fallback para demo: mensaje predefinido
      transcription = '[Audio grabado — transcripción ASR no disponible en prototipo]'
    }

    // 2. Si la transcripción está vacía, ofrecer mensaje simulado
    if (!transcription || transcription.trim().length === 0) {
      transcription = '[Sin voz detectada en el audio grabado]'
    }

    // 3. Registrar en OperationLog (auditoría Ley 19.628 / IMO MSC.428(98))
    try {
      await db.operationLog.create({
        data: {
          type: 'chat_message',
          severity: 'info',
          description: `Comunicación radio PTT de ${operatorName || 'operador'} a ${recipientName || 'destinatario'} (${recipientMmsi || 'N/A'}) — ${duration || 0}ms`,
          operator: operatorName || 'unknown',
          metadata: JSON.stringify({
            kind: 'radio_ptt',
            audioSize: audioBase64.length,
            mimeType: mimeType || 'audio/webm',
            duration: duration || 0,
            recipientMmsi: recipientMmsi,
            recipientName: recipientName,
            transcription: transcription,
            asrError: asrError,
            timestamp: new Date().toISOString(),
          }),
        },
      })
    } catch (e) {
      console.error('No se pudo registrar log de radio:', e)
    }

    return NextResponse.json({
      success: true,
      transcription,
      duration: duration || 0,
      recipientMmsi: recipientMmsi,
      recipientName: recipientName,
      operatorName: operatorName,
      timestamp: new Date().toISOString(),
      warning: asrError ? `ASR tuvo un problema: ${asrError}` : undefined,
    })
  } catch (e) {
    console.error('Error en /api/radio/transcribe:', e)
    return NextResponse.json(
      {
        error: 'Error interno al transcribir audio',
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    )
  }
}
