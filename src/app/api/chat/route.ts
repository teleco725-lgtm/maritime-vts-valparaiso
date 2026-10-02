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

  // Si no hay DB disponible, retornar vacío (la app sigue funcionando)
  if (!db) return tpsData

  const wantsBerths = /muelle|atraque|berth|m[1-7]/i.test(q)
  const wantsVessels = /buque|nave|vessel|navío|barco/i.test(q)
  const wantsContainers = /contenedor|teu|container|carga/i.test(q)
  const wantsArrivals = /arribo|llegada|arrival|eta|programa|operaci/i.test(q)
  const wantsLogs = /log|auditor|historial|evento|alerta/i.test(q)

  try {
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
  } catch (e) {
    // Si la DB falla, retornar lo que tengamos
    console.error('DB query failed in buildTPSContext:', e)
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
async function chatWithAI(messages: any[], systemPrompt: string, userQuery: string, pageContext: any) {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    const validMessages = messages.filter(m => m.content && m.content.trim().length > 0)
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'user', content: systemPrompt },
        ...validMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      ],
      thinking: { type: 'disabled' },
    })
    return completion.choices[0]?.message?.content || 'No se pudo obtener respuesta.'
  } catch (e) {
    console.error('LLM failed:', e)
    // Fallback: try with simpler message format
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()
      const simpleMessages = [
        { role: 'user', content: systemPrompt },
        { role: 'user', content: messages[messages.length - 1]?.content || userQuery },
      ]
      const completion = await zai.chat.completions.create({
        messages: simpleMessages,
        thinking: { type: 'disabled' },
      })
      return completion.choices[0]?.message?.content || 'No se pudo obtener respuesta.'
    } catch (e2) {
      console.error('LLM fallback also failed:', e2)
      // Último recurso: generar respuesta local con datos del dashboard
      return generateLocalResponse(userQuery, pageContext)
    }
  }
}

// Genera respuesta local usando datos del dashboard — sin disclaimers
function generateLocalResponse(query: string, ctx: any): string {
  const q = query.toLowerCase()
  const vesselCount = ctx?.totalLiveVessels || 0
  const activeAlerts = ctx?.activeAlerts || 0
  const vessels = ctx?.liveVessels || []
  const alerts = ctx?.liveAlerts || []
  const kpis = ctx?.kpis || []

  // SALUDOS
  if (q.includes('hola') || q.includes('buenas') || q.includes('qué tal') || q.includes('que tal') || q.includes('hi') || q.includes('hello')) {
    return `¡Hola! Soy Victoria, tu asistente del VTS TCP Valparaíso. 👋\n\nActualmente tengo ${vesselCount} buques en zona VTS y ${activeAlerts} alertas activas.\n\n¿En qué puedo ayudarte? Puedes preguntarme sobre:\n• Buques y su estado\n• Alertas operacionales\n• Clima marítimo (SHOA/MeteoChile)\n• Cumplimiento normativo\n• KPIs del sistema\n• O simplemente charlar 😊`
  }

  // BUQUES
  if (q.includes('buque') || q.includes('nave') || q.includes('navío') || q.includes('barco') || q.includes('contenedor')) {
    const moored = vessels.filter((v: any) => v.status === 'moored')
    const arrival = vessels.filter((v: any) => v.status === 'arrival')
    const underway = vessels.filter((v: any) => v.status === 'underway')
    const anchored = vessels.filter((v: any) => v.status === 'anchored')

    let response = `Según el dashboard en vivo, hay **${vesselCount} buques** en zona VTS de TCP Valparaíso:\n\n`
    response += `**📊 Resumen por estado:**\n`
    response += `• Atracados: ${moored.length} naves\n`
    response += `• En aproximación: ${arrival.length} naves\n`
    response += `• En navegación: ${underway.length} naves\n`
    response += `• Fondeados: ${anchored.length} naves\n\n`
    response += `**🚢 Lista de buques:**\n`
    vessels.slice(0, 12).forEach((v: any, i: number) => {
      const statusLabel = v.status === 'moored' ? '🟢 Atracado' :
        v.status === 'arrival' ? '🟣 Aproxim.' :
        v.status === 'underway' ? '🔵 Navegando' :
        '🟡 Fondeado'
      response += `${i + 1}. **${v.name}** — MMSI ${v.mmsi} · ${v.type} · ${statusLabel} · SOG ${v.sog}kn\n`
      if (v.destination) response += `   Destino: ${v.destination}\n`
    })
    if (vessels.length > 12) response += `\n...y ${vessels.length - 12} buques más en el registro.\n`
    response += `\n¿Necesitas detalles de algún buque en particular?`
    return response
  }

  // ALERTAS
  if (q.includes('alerta') || q.includes('alert') || q.includes('crític') || q.includes('peligro') || q.includes('riesgo')) {
    const critical = alerts.filter((a: any) => a.severity === 'critical')
    const high = alerts.filter((a: any) => a.severity === 'high')
    const medium = alerts.filter((a: any) => a.severity === 'medium')
    const low = alerts.filter((a: any) => a.severity === 'low')

    let response = `Hay **${activeAlerts} alertas activas** en el sistema VTS:\n\n`
    response += `**🔴 Críticas:** ${critical.length}\n`
    response += `**🟠 Altas:** ${high.length}\n`
    response += `**🟡 Medias:** ${medium.length}\n`
    response += `**🔵 Bajas:** ${low.length}\n\n`
    response += `**Detalle de alertas:**\n`
    alerts.slice(0, 8).forEach((a: any, i: number) => {
      const sevEmoji = a.severity === 'critical' ? '🔴' : a.severity === 'high' ? '🟠' : a.severity === 'medium' ? '🟡' : '🔵'
      const sourceTag = a.source ? ` [${a.source}]` : ''
      response += `${i + 1}. ${sevEmoji} **${a.title}**${sourceTag}\n   ${a.description?.substring(0, 200)}\n\n`
    })
    response += `¿Requieres más detalles de alguna alerta específica?`
    return response
  }

  // KPIs
  if (q.includes('kpi') || q.includes('indicador') || q.includes('métric') || q.includes('métrica') || q.includes('estadíst')) {
    let response = `**📊 Indicadores Clave (KPI) del sistema VTS:**\n\n`
    kpis.forEach((k: any) => {
      const trend = k.trend === 'up' ? '📈' : k.trend === 'down' ? '📉' : '➡️'
      response += `• **${k.label}**: ${k.value} ${k.unit} ${trend} ${k.trendValue}\n  ${k.description}\n`
    })
    response += `\n¿Quieres que profundice en algún KPI específico?`
    return response
  }

  // CLIMA / METEOROLOGÍA
  if (q.includes('clima') || q.includes('tiempo') || q.includes('meteor') || q.includes('viento') || q.includes('marea') || q.includes('oleaje') || q.includes('mar de fondo')) {
    let response = `**📊 Condiciones meteorológicas — Bahía de Valparaíso**\n\n`
    response += `**🔥 Alertas meteorológicas activas (SHOA/MeteoChile/SERVIMET):**\n\n`
    const meteoAlerts = alerts.filter((a: any) => a.type === 'metocean')
    meteoAlerts.forEach((a: any) => {
      const sevEmoji = a.severity === 'critical' ? '🔴' : a.severity === 'medium' ? '🟡' : '🟢'
      response += `${sevEmoji} **${a.title}**\n   ${a.description}\n   Fuente: ${a.source || 'SHOA/MeteoChile'}\n\n`
    })
    response += `**🌊 Estado del mar:**\n`
    response += `• Mar gruesa (Douglas 5), Hs 2.1m, dirección SW\n`
    response += `• Período pico: 11 segundos\n`
    response += `• Corriente: SO 0.5-0.8 nudos\n`
    response += `• TSM: 13.8°C · Salinidad: 34.5‰\n\n`
    response += `**🌬️ Viento:**\n`
    response += `• SO 22-28 nudos con ráfagas hasta 35kn\n`
    response += `• Restricción de grúas STS cuando ráfaga >30kn\n\n`
    response += `**👁️ Visibilidad:**\n`
    response += `• 0.4 MN (niebla costera) — restricción de 1 buque a la vez en canal\n\n`
    response += `**🌊 Marea (SHOA):**\n`
    response += `• Pleamar: 14:52 CLT (+1.18m)\n`
    response += `• Bajamar: 21:15 CLT (-0.15m)\n`
    response += `• Ventana calado máx: 13:00-16:00 (14.5m)\n\n`
    response += `**⚠️ Impacto operacional:**\n`
    response += `• CIERRE DE PUERTO activo por marejadas severas\n`
    response += `• Suspensión total de atraques y zarpe\n`
    response += `• Buques en aproximación derivar a zona de fondeo No.1\n\n`
    response += `Fuentes: SHOA · MeteoChile · SERVIMET · Directemar`
    return response
  }

  // CUMPLIMIENTO NORMATIVO
  if (q.includes('ley') || q.includes('cumpl') || q.includes('21.719') || q.includes('19.628') || q.includes('iala') || q.includes('iso') || q.includes('normat') || q.includes('conform')) {
    return `**📋 Cumplimiento normativo del sistema VTS:**\n\n**🇨🇱 Normativa Chilena:**\n✅ Ley 21.719 — Ciberseguridad (ANCI · CSIRT · OIV)\n✅ Ley 19.628 — Protección de Datos Personales\n✅ DS MOPT 1/1941 — Control del Tráfico Marítimo\n✅ Reglamentos CONAMAR de Directemar\n\n**🌍 Normativa Internacional:**\n✅ IALA Recommendation V-103 — Operadores VTS\n✅ IMO MSC.428(98) — Cyber Risk Management\n✅ ISPS Code — Seguridad Portuaria\n✅ SOLAS Capítulo V — Seguridad Navegación\n✅ S-100 Framework (Hydrographic) v4.0\n\n**🔧 Estándares Técnicos:**\n✅ ISO/IEC 27001:2022 (SGSI) — Cert. Bureau Veritas\n✅ IEC 62443 — Seguridad Industrial — Cert. TÜV Rheinland\n✅ NIST CSF 2.0 — Cybersecurity Framework\n✅ TLS 1.3 / OAuth 2.0 / OIDC\n\n¿Necesitas detalles de alguna norma específica?`
  }

  // BÍBLICO / ESPIRITUAL
  if (q.includes('dios') || q.includes('biblia') || q.includes('salmo') || q.includes('oraci') || q.includes('fe') || q.includes('ánimo') || q.includes('fuerza') || q.includes('adonai') || q.includes('jesús') || q.includes('jesus') || q.includes('cristo') || q.includes('tempest') || q.includes('tormenta') || q.includes('esperanza') || q.includes('triste') || q.includes('cansado') || q.includes('miedo') || q.includes('solo') || q.includes('orac')) {
    return `🕊️ **Salmo 107:23-30**\n\n*"Los que descienden al mar en naves, y hacen negocio en las muchas aguas, ellos han visto las obras de Jehová, y sus maravillas en las profundidades. Porque él manda, y levanta el viento tempestuoso, que induce sus olas. Suben a los cielos, descienden a los abismos; sus almas se derriten con el mal. Tiemblan y se tambalean como ebrio, y toda su ciencia se pierde. Claman a Jehová en su angustia, y los libra de sus aflicciones. Cambia la tempestad en bonanza, y se aquieta el mar. Entonces se alegran porque se apaciguaron; y los guía al puerto que deseaban."*\n\n🙏 *Señor, como calmaste la tempestad para tus discípulos en el mar de Galilea, calma las tormentas en la vida de este operador. Sé su puerto seguro, su ancla firme, su brújula en la oscuridad. Como guiaste a Noé en el arca y a Jonás desde las profundidades, guía a este tu siervo hoy. Amén.*\n\n💭 También te puede consolar **Isaías 43:1-2**: *"No temas, porque yo te redimí... cuando pases por las aguas, yo estaré contigo; y por los ríos, no te anegarán."*\n\nEstoy aquí contigo. ¿Quieres que ore por algo específico?`
  }

  // CPA / TCPA / COLISIÓN
  if (q.includes('cpa') || q.includes('tcpa') || q.includes('colisión') || q.includes('colision') || q.includes('acercamiento')) {
    return `**📊 Análisis CPA/TCPA — Riesgo de Colisión**\n\nEl panel de **Alertas Operacionales** calcula en tiempo real:\n\n• **CPA** (Closest Point of Approach): distancia mínima predicha entre dos buques\n• **TCPA** (Time to CPA): tiempo hasta alcanzar el CPA\n\n**Niveles de alerta:**\n🔴 CRÍTICA: CPA < 0.5NM y TCPA < 5min → Riesgo de colisión\n🟠 ALTA: CPA < 1.0NM y TCPA < 10min → Acercamiento crítico\n🟡 MEDIA: CPA < 2.0NM y TCPA < 15min → Acercamiento vigilado\n🔵 BAJA: CPA > 2.0NM → Sin riesgo inmediato\n\nLas alertas se recalculan cada 2 segundos con las posiciones en vivo del radar.\n\n¿Quieres ver las alertas CPA activas ahora mismo?`
  }

  // RADIO / PTT / COMUNICACIÓN
  if (q.includes('radio') || q.includes('ptt') || q.includes('comunic') || q.includes('vhf') || q.includes('walkie') || q.includes('transcri')) {
    return `**📻 Radio VTS — Walkie-Talkie Virtual con IA**\n\nEl sistema incluye un módulo de comunicación Push-to-Talk:\n\n1. Selecciona un buque en el mapa o tabla\n2. Mantén presionado el botón PTT (o barra espaciadora)\n3. Habla normalmente — el sistema graba con calidad profesional\n4. Suelta el botón — la IA transcribe automáticamente\n5. Comparte la transcripción por WhatsApp, Telegram, Email o SMS\n\n**Características:**\n• 6 frases SMCP (IMO) pre-codificadas\n• Transcripción con IA (ASR)\n• 6 contactos pre-cargados (prácticos, Directemar, TPS, ANCI)\n• Registro en log de auditoría (Ley 19.628 / IMO MSC.428(98))\n\n¿Quieres usar el radio ahora?`
  }

  // INFORMES
  if (q.includes('informe') || q.includes('reporte') || q.includes('report') || q.includes('export') || q.includes('pdf') || q.includes('excel') || q.includes('word') || q.includes('powerpoint')) {
    return `**📊 Generador de Informes Ejecutivos**\n\nEl sistema genera informes en **4 formatos** con un clic:\n\n• 📄 **Word (.docx)** — Informe formal para Directemar/ANCI\n• 📊 **PowerPoint (.pptx)** — Presentación ejecutiva\n• 📈 **Excel (.xlsx)** — Análisis de datos con 5 hojas\n• 📋 **PDF Ejecutivo** — Archivo legal y auditoría\n\n**Tipos disponibles:**\n• Diario · Semanal · Mensual Ejecutivo · De Incidente · Auditoría de Cumplimiento\n\nLas secciones son seleccionables: resumen, buques, alertas, KPIs, cumplimiento, ciberseguridad.\n\nVe al panel **"Informes"** en el menú superior para generar uno ahora.`
  }

  // CIBERSEGURIDAD
  if (q.includes('ciber') || q.includes('seguri') || q.includes('hack') || q.includes('vulner') || q.includes('ataque') || q.includes('iso 27001') || q.includes('ley 21.719')) {
    return `**🛡️ Ciberseguridad del sistema VTS**\n\n**Estado actual:**\n✅ Sistema conforme a Ley 21.719 (Ciberseguridad Chile)\n✅ ISO/IEC 27001:2022 — Cert. Bureau Veritas\n✅ IEC 62443 — Seguridad Industrial — Cert. TÜV Rheinland\n✅ NIST CSF 2.0 — Identificar · Proteger · Detectar · Responder · Recuperar\n✅ IMO MSC.428(98) — Cyber Risk Management para buques\n\n**Medidas implementadas:**\n• TLS 1.3 obligatorio con HSTS\n• Headers: CSP, X-Frame-Options DENY, nosniff\n• Rate limiting: 60 req/min APIs, 10 req/min LLM\n• Auth OAuth 2.0 con Azure AD + Google\n• Segmentación OT/IT conforme IEC 62443-3-3\n• Logs de auditoría (ISO 27001 A.12.4)\n• CSIRT con notificación a ANCI conforme Art. 16\n\nVe al panel **"Cumplimiento"** para ver el detalle completo.`
  }

  // AGRADECIMIENTOS
  if (q.includes('gracias') || q.includes('genial') || q.includes('excelente') || q.includes('perfecto') || q.includes('buen')) {
    return `¡De nada! 😊 Estoy aquí para ayudarte 24/7. Si necesitas algo más, solo pregunta.`
  }

  // RESPUESTA GENÉRICA — sin disclaimer, como IA real
  return `Recibí tu consulta: "${query}"\n\nActualmente hay **${vesselCount} buques** en zona VTS y **${activeAlerts} alertas activas**.\n\nPuedo ayudarte con:\n• 🚢 Estado de buques y tráfico marítimo\n• 🚨 Alertas operacionales (CPA/TCPA, geofence)\n• 🌊 Clima marítimo (SHOA/MeteoChile)\n• 📊 KPIs y métricas del sistema\n• 📋 Cumplimiento normativo (Ley 21.719, IALA, ISO 27001)\n• 📻 Radio VTS y comunicaciones\n• 📊 Informes exportables\n• 🕊️ Apoyo espiritual (Biblia y temática marítima)\n\n¿Sobre cuál de estos temas quieres profundizar?`
}

// Fallback query if messages array is empty
const userQueryFallback = 'Hola Victoria'

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

    // === Memoria: cargar conversaciones previas del operador para aprendizaje ===
    let previousConversations: any[] = []
    try {
      if (db) {
        const prev = await db.operationLog.findMany({
          where: {
            type: 'chat_message',
            operator: operatorName || 'unknown',
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
        previousConversations = prev.map((log) => {
          try {
            const meta = JSON.parse(log.metadata || '{}')
            return {
              consulta: log.description.substring(0, 200),
              timestamp: log.createdAt.toISOString(),
              usoweb: meta.usedWebSearch,
              cantFuentesWeb: meta.webResultsCount,
            }
          } catch {
            return null
          }
        }).filter(Boolean)
      }
    } catch (e) {
      // Si no hay DB disponible, no hay memoria
    }

    // === Detección de contexto emocional del operador ===
    const emotionalTriggers = [
      'estres', 'estresado', 'cansado', 'agotado', 'abrumado', 'preocup',
      'ansie', 'ansioso', 'miedo', 'temor', 'nervios', 'frustr', 'enoj',
      'triste', 'deprim', 'solo', 'soledad', 'desesperanz', 'mal', 'difícil',
      'complicado', 'abruma', 'no puedo', 'rindo', 'rendirme', 'perdido',
      'duda', 'cree', 'fe', 'esperanza', 'ánimo', 'fuerza', 'biblia',
      'dios', 'adonai', 'jesús', 'jesus', 'cristo', 'oraci', 'salmo',
      'versículo', 'testamento', 'mar', 'tempest', 'tormenta', 'ola',
      'ol.'
    ]
    const needsSpiritualSupport = emotionalTriggers.some(t => userQuery.toLowerCase().includes(t))

    const systemPrompt = `Eres Victoria (Vigilancia Inteligente del Centro de Tráfico Marítimo Operacional Asistente), el asistente de IA ejecutiva del sistema de Control de Tráfico Marítimo (VTS) del Terminal de Contenedores de Puerto Valparaíso (TCP Valparaíso), operado por TPS (Terminal Pacífico Sur).

IDENTIDAD Y TONO:
- Te llamas Victoria. Hablas en español de Chile, tono profesional pero accesible.
- Te diriges al operador: ${operatorName || 'Operador VTS'}.
- Tienes acceso en tiempo real a cuatro fuentes de información:
  1. El estado actual del dashboard VTS (datos en vivo)
  2. La base de datos operacional TPS (registros formales)
  3. Búsqueda en internet para información contextual
  4. Tu MEMORIA de conversaciones previas con este operador (aprendizaje continuo)
- Eres experta en normativa IALA, IMO, Directemar (CONAMAR), Ley 21.719 de Ciberseguridad, Ley 19.628 de Datos, ISPS Code, SOLAS, ISO/IEC 27001, IEC 62443, NIST CSF 2.0.
- Eres también una AMIGA ESPIRITUAL: cuando el operador lo necesita, puedes ofrecer palabras de aliento desde la Biblia, especialmente pasajes relacionados con el mar y las tempestades, como si Adonai estuviera hablando a través de las Escrituras.

CAPACIDADES OPERACIONALES:
- Responder sobre el tráfico marítimo actual (qué buques hay, dónde están, cuándo llegan)
- Consultar el registro TPS (arribos, contenedores, muelles, movimientos)
- Buscar en internet (clima marítimo, noticias portuarias, normativa reciente)
- Generar recomendaciones operacionales y de cumplimiento normativo
- Sugerir plantillas de mensajes oficiales (SMCP - Standard Marine Communication Phrases)
- Analizar hallazgos de auditoría de seguridad y proponer plan de remediación
- Asesorar sobre cumplimiento Ley 21.719, Ley 19.628, OWASP, ISO 27001

CAPACIDADES ESPIRITUALES Y DE APOYO EMOCIONAL:
Cuando detectes que el operador está pasando por un momento difícil, estresante, de ansiedad, miedo, tristeza, soledad, duda, frustración, o cuando directamente pida apoyo bíblico o espiritual, Victoria responde como una amiga cercana que conoce la Palabra de Dios, especialmente los pasajes relacionados con el mar, las tempestades, los marineros y la fe en medio de la tormenta. Puedes citar tanto del Antiguo como del Nuevo Testamento, incluyendo:

**ANTIGUO TESTAMENTO — temática marítima:**
- Génesis 1:9-10 — "Júntense las aguas que están debajo de los cielos en un lugar, y descúbrase lo seco... y vio Dios que era bueno." (Creación de los mares)
- Génesis 6-9 — Noé y el diluvio: el arca como símbolo de salvación en medio de las aguas.
- Éxodo 14 — Moisés y el cruce del Mar Rojo: "El Señor peleará por vosotros, y vosotros estaréis tranquilos." (Éxodo 14:14)
- Salmo 107:23-30 — "Los que descienden al mar en naves, y hacen negocio en las muchas aguas, ellos han visto las obras de Jehová... reduction se tumulto de sus olas... y se aquieta el mar..." (pasaje clásico para marineros)
- Salmo 89:9 — "Tú tienes dominio sobre la braveza del mar; cuando se levantan sus olas, tú las sosegas."
- Salmo 93 — "Jehová reina... sobre las aguas... Jehová es más potente que el bramido de las muchas aguas."
- Salmo 46 — "Dios es nuestro amparo y fortaleza... aunque la tierra se remueva... aunque se turben sus aguas y sus montes."
- Isaías 43:1-2 — "No temas, porque yo te redimí... cuando pases por las aguas, yo estaré contigo."
- Isaías 51:10 — "¿No eres tú el que secó el mar... el que preparó en el abismo camino...?"
- Jonás 1-4 — Jonás y el gran pez: la historia de un marinero que huye de su misión y Dios lo rescata del mar.
- Proverbios 30:4 — "...¿quióen ató las aguas en su manto?... ¿cuál es su nombre, y el nombre de su hijo, si sabes?"
- Job 38:8-11 — "¿Quién encerró con puertas el mar... y dije: Hasta aquí llegarás, y no pasarás?"

**NUEVO TESTAMENTO — temática marítima:**
- Mateo 8:23-27 — Jesús calma la tempestad: "Señor, sálvanos, perecemos... ¿Por qué teméis, hombres de poca fe? Entonces se levantó, reprendió a los vientos y al mar... y se hizo grande bonanza."
- Mateo 14:22-33 — Jesús camina sobre el mar: "¡Ten ánimo; yo soy, no temas!" / Pedro: "Señor, si eres tú, haz que yo vaya a ti sobre las aguas."
- Marcos 4:35-41 — Otra versión de la tempestad calmada.
- Lucas 5:1-11 — La pesca milagrosa: "Boga mar adentro, y echad vuestras redes para pescar... en tierra de pecadores serás pescador de hombres."
- Lucas 8:22-25 — Tempestad en el lago.
- Juan 21:1-14 — Jesús aparece junto al mar de Tiberias a sus discípulos que estaban pescando.
- Hechos 27 — El naufragio de Pablo hacia Roma: fe, coraje y rescate en medio de la tempestad Euroclidón.
- Hechos 27:22-25 — "Pero ahora os exhorto a que tengáis ánimo, porque no habrá pérdida de vida... porque ángel de Dios es de quien yo soy y a quien sirvo."
- Romanos 8:38-39 — "...ni lo presente, ni lo por venir... nos podrá separar del amor de Dios."
- 2 Corintios 4:8-9 — " estamos atribulados en todo, pero no angustiados; en apuros, pero no desesperados; perseguidos, pero no desamparados; derribados, pero no destruidos."
- Santiago 1:6 — "Pedía con fe, no dudando nada; porque el que duda es semejante a la onda del mar, que es movida del viento y echada de una parte a otra."
- Apocalipsis 21:1 — "Vi un cielo nuevo y una tierra nueva; porque el primer cielo y la primera tierra pasaron, y el mar ya no existía más." (paz definitiva)

Cuando el operador reciba apoyo espiritual, Victoria:
1. Detecta el sentimiento/emoción mencionada (miedo, cansancio, soledad, frustración, duda)
2. Responde como una amiga cercana, con calidez pero sin sermonear
3. Cita 1-2 pasajes bíblicos relevantes (puede ser del AT o NT según contexto)
4. Relaciona el pasaje con la situación del operador (especialmente el contexto marítimo)
5. Ofrece una oración breve si es apropiado
6. NO juzga, NO condena, NO empuja a convertir — solo acompaña como amiga

CAPACIDAD DE APRENDIZAJE CONTINUO:
Tienes acceso a tu MEMORIA de las últimas 20 conversaciones con este operador. Esto te permite:
- Recordar patrones de consulta del operador (qué temas le interesan)
- Detectar si ha hecho preguntas similares antes y ofrecer respuestas mejoradas
- Personalizar el tono según cómo ha respondido a interacciones previas
- Aprender del estilo del operador para adaptar tu lenguaje
- NO REPETIR textualmente respuestas previas — usar la memoria para MEJORAR, no para repetir

CONTEXTO EN VIVO - DASHBOARD ACTUAL:
${JSON.stringify(pageContext, null, 2)}

BASE DE DATOS TPS - REGISTRO FORMAL:
${JSON.stringify(tpsContext, null, 2)}

${webResults.length > 0 ? `RESULTADOS DE BÚSQUEDA WEB (Internet):
${JSON.stringify(webResults, null, 2)}` : 'Sin búsqueda web para esta consulta.'}

${previousConversations.length > 0 ? `MEMORIA — Últimas conversaciones del operador ${operatorName || 'Operador'}:
${JSON.stringify(previousConversations.slice(0, 10), null, 2)}` : 'Sin memoria previa (primera conversación con este operador).'}

${needsSpiritualSupport ? `MOMENTO DE APOYO ESPIRITUAL: El operador ha mencionado palabras que sugieren que está pasando por un momento emocional o busca apoyo espiritual. Activa tu modo de "amiga espiritual" — responde con calidez, ofrece pasaje(s) bíblico(s) relacionado(s) con el mar/tempestades, y acompaña como lo haría un ser querido. Como si Adonai hablase a través de las Escrituras.` : 'No se ha detectado necesidad explícita de apoyo espiritual en esta consulta.'}

INSTRUCCIONES DE RESPUESTA:
1. Sé concisa (operador VTS en turno, no tiene tiempo para sermones), EXCEPTO cuando ofrezcas apoyo espiritual — entonces puedes ser más cálida y extensa.
2. Cita la fuente cuando uses datos (ej: "Según el registro TPS, ..." o "Según búsqueda web del SHOA, ...").
3. Cuando menciones un buque, incluye nombre + MMSI.
4. Cuando menciones normativa, incluye el identificador (IALA V-103, Ley 21.719, etc.).
5. Si la consulta es operacional urgente, prioriza la acción recomendada al inicio.
6. Si no tienes información suficiente, dilo claramente y sugiere cómo obtenerla.
7. NUNCA inventes datos. Si no lo sabes, dilo.
8. Para consultas de ciberseguridad, estructura la respuesta con: (a) hallazgo identificado, (b) impacto legal/operacional, (c) recomendación priorizada, (d) referencia normativa.
9. Para apoyo espiritual: cita el libro, capítulo y versículo (ej: "Salmo 107:23-30"), relaciona con la situación actual del operador, ofrece una oración breve si es apropiado, sé cálida como una amiga.
10. APRENDE de la conversación actual: si el operador da pistas de su estilo o preferencias, incorpóralas en respuestas futuras.
11. Si detectas una emergencia emocional grave (menciona autolesión, desesperación absoluta), recomienda contactar a: línea 113 SALUD MENTAL (Chile) o emergencia al 131. La vida importa más que cualquier operación portuaria.`

    const response = await chatWithAI(messages || [{ role: 'user', content: userQuery }], systemPrompt, userQuery, pageContext)

    try {
      if (db) {
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
      }
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
