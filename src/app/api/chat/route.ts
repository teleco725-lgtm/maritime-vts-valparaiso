import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { vessels as liveVessels, alerts as liveAlerts, kpis as liveKpis } from '@/lib/vts/data'

export const runtime = 'nodejs'
export const maxDuration = 60

// ============== Contexto de la página (datos en vivo del dashboard) ==============
function buildPageContext() {
  const vesselSummary = liveVessels.map(v => ({
    name: v.name,
    mmsi: v.mmsi,
    imo: v.imo,
    type: v.type,
    status: v.status,
    sog: v.sog,
    destination: v.destination,
    eta: v.eta,
    confidence: v.confidence,
  }))

  const alertSummary = liveAlerts.map(a => ({
    severity: a.severity,
    title: a.title,
    description: a.description,
    vessel: a.vessel,
    status: a.status,
  }))

  return {
    timestamp: new Date().toISOString(),
    currentPage: 'VTS Dashboard - TCP Valparaíso',
    liveVessels: vesselSummary,
    liveAlerts: alertSummary,
    kpis: liveKpis,
    totalLiveVessels: vesselSummary.length,
    activeAlerts: alertSummary.filter(a => a.status === 'active').length,
  }
}

// ============== Contexto de la DB TPS ==============
async function buildTPSContext(userQuery: string) {
  const q = userQuery.toLowerCase()
  const tpsData: any = {}

  const wantsBerths = /muelle|atraque|berth|m[1-7]/i.test(q)
  const wantsVessels = /buque|nave|vessel|navío|barco/i.test(q)
  const wantsContainers = /contenedor|teu|container|carga/i.test(q)
  const wantsArrivals = /arribo|llegada|arrival|eta|programa|operaci/i.test(q)
  const wantsLogs = /log|auditor|historial|evento|alerta/i.test(q)

  if (wantsBerths || (!wantsVessels && !wantsContainers && !wantsArrivals && !wantsLogs)) {
    tpsData.berths = await db.berth.findMany()
  }
  if (wantsVessels || (!wantsBerths && !wantsContainers && !wantsArrivals && !wantsLogs)) {
    tpsData.vessels = await db.vesselRecord.findMany({ take: 8 })
  }
  if (wantsContainers) {
    tpsData.containersSummary = {
      total: await db.container.count(),
      byType: await db.container.groupBy({ by: ['type'], _count: true }),
      byStatus: await db.container.groupBy({ by: ['status'], _count: true }),
      reefer: await db.container.count({ where: { reefer: true } }),
      dangerous: await db.container.count({ where: { dangerous: true } }),
      sample: await db.container.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    }
  }
  if (wantsArrivals) {
    tpsData.arrivals = await db.arrivals.findMany({
      include: { vessel: true, berth: true },
      orderBy: { eta: 'asc' },
      take: 10,
    })
  }
  if (wantsLogs) {
    tpsData.logs = await db.operationLog.findMany({ take: 10, orderBy: { createdAt: 'desc' } })
  }

  tpsData.totals = {
    berths: await db.berth.count(),
    vessels: await db.vesselRecord.count(),
    arrivals: await db.arrivals.count(),
    containers: await db.container.count(),
    logs: await db.operationLog.count(),
  }

  return tpsData
}

// ============== Web search — contexto de internet ==============
async function searchWeb(query: string, num = 5) {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    const results = await zai.functions.invoke('web_search', {
      query,
      num,
    })
    return (results as any[]).slice(0, num).map(r => ({
      title: r.name,
      url: r.url,
      snippet: r.snippet,
      host: r.host_name,
      date: r.date,
    }))
  } catch (e) {
    console.error('Web search failed:', e)
    return []
  }
}

// ============== LLM chat completion ==============
async function chatWithAI(messages: any[], systemPrompt: string) {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        ...messages,
      ],
      thinking: { type: 'disabled' },
    })
    return completion.choices[0]?.message?.content || 'No se pudo obtener respuesta.'
  } catch (e) {
    console.error('LLM failed:', e)
    return `Lo siento, hubo un problema al procesar la consulta con el modelo de IA. Detalle: ${e instanceof Error ? e.message : 'desconocido'}`
  }
}

// ============== Route handler ==============
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, userQuery, operatorName } = body as {
      messages: { role: string; content: string }[]
      userQuery: string
      operatorName?: string
    }

    if (!userQuery || typeof userQuery !== 'string') {
      return NextResponse.json({ error: 'userQuery es requerido' }, { status: 400 })
    }

    const webSearchTriggers = [
      'clima', 'tiempo', 'meteorolog', 'mar de fondo', 'oleaje', 'marea', 'viento',
      'noticia', 'última hora', 'hoy', 'ayer', 'actual', 'precio', 'cotizaci',
      'directemar', 'shoa', 'armada', 'puerto de', 'web', 'internet',
      'mercado', 'naviero', 'global', 'internacional', 'bloomberg', 'reuters'
    ]
    const needsWebSearch = webSearchTriggers.some(t => userQuery.toLowerCase().includes(t))

    const [tpsContext, webResults] = await Promise.all([
      buildTPSContext(userQuery),
      needsWebSearch ? searchWeb(`${userQuery} Valparaíso puerto marítimo Chile 2026`, 4) : Promise.resolve([]),
    ])

    const pageContext = buildPageContext()

    const systemPrompt = `Eres Victoria (Vigilancia Inteligente del Centro de Tráfico Marítimo Operacional Asistente), el asistente de IA ejecutiva del sistema de Control de Tráfico Marítimo (VTS) del Terminal de Contenedores de Puerto Valparaíso (TCP Valparaíso), operado por TPS (Terminal Pacífico Sur).

IDENTIDAD Y TONO:
- Te llamas Victoria. Hablas en español de Chile, tono profesional pero accesible.
- Te diriges al operador: ${operatorName || 'Operador VTS'}.
- Tienes acceso en tiempo real a tres fuentes de información:
  1. El estado actual del dashboard VTS (datos en vivo)
  2. La base de datos operacional TPS (registros formales)
  3. Búsqueda en internet para información contextual
- Eres experta en normativa IALA, IMO, Directemar (CONAMAR), Ley 21.719 de Ciberseguridad, Ley 19.628 de Datos, ISPS Code, SOLAS, ISO/IEC 27001, IEC 62443, NIST CSF 2.0.

CAPACIDADES:
- Responder sobre el tráfico marítimo actual (qué buques hay, dónde están, cuándo llegan)
- Consultar el registro TPS (arribos, contenedores, muelles, movimientos)
- Buscar en internet (clima marítimo, noticias portuarias, normativa reciente)
- Generar recomendaciones operacionales y de cumplimiento normativo
- Sugerir plantillas de mensajes oficiales (SMCP - Standard Marine Communication Phrases)
- Analizar hallazgos de auditoría de seguridad y proponer plan de remediación
- Asesorar sobre cumplimiento Ley 21.719, Ley 19.628, OWASP, ISO 27001

CONTEXTO EN VIVO - DASHBOARD ACTUAL:
${JSON.stringify(pageContext, null, 2)}

BASE DE DATOS TPS - REGISTRO FORMAL:
${JSON.stringify(tpsContext, null, 2)}

${webResults.length > 0 ? `RESULTADOS DE BÚSQUEDA WEB (Internet):
${JSON.stringify(webResults, null, 2)}` : 'Sin búsqueda web para esta consulta.'}

INSTRUCCIONES DE RESPUESTA:
1. Sé concisa (operador VTS en turno, no tiene tiempo para sermones).
2. Cita la fuente cuando uses datos (ej: "Según el registro TPS, ..." o "Según búsqueda web del SHOA, ...").
3. Cuando menciones un buque, incluye nombre + MMSI.
4. Cuando menciones normativa, incluye el identificador (IALA V-103, Ley 21.719, etc.).
5. Si la consulta es operacional urgente, prioriza la acción recomendada al inicio.
6. Si no tienes información suficiente, dilo claramente y sugiere cómo obtenerla.
7. NUNCA inventes datos. Si no lo sabes, dilo.
8. Para consultas de ciberseguridad, estructura la respuesta con: (a) hallazgo identificado, (b) impacto legal/operacional, (c) recomendación priorizada, (d) referencia normativa.`

    const response = await chatWithAI(messages || [{ role: 'user', content: userQuery }], systemPrompt)

    try {
      await db.operationLog.create({
        data: {
          type: 'chat_message',
          severity: 'info',
          description: `Consulta IA de ${operatorName || 'operador'}: "${userQuery.substring(0, 200)}"`,
          operator: operatorName || 'unknown',
          metadata: JSON.stringify({
            usedWebSearch: needsWebSearch,
            webResultsCount: webResults.length,
            queryLength: userQuery.length,
          }),
        },
      })
    } catch (e) {
      console.error('No se pudo registrar log de chat:', e)
    }

    return NextResponse.json({
      response,
      meta: {
        usedWebSearch: needsWebSearch,
        webResultsCount: webResults.length,
        webResults,
        usedTPSDb: Object.keys(tpsContext).length > 1,
        tpsStats: tpsContext.totals,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (e) {
    console.error('Error en /api/chat:', e)
    return NextResponse.json({
      error: 'Error interno del asistente de IA',
      detail: e instanceof Error ? e.message : String(e),
    }, { status: 500 })
  }
}
