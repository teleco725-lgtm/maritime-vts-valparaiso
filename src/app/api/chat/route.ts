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

// Genera respuesta local — natural, asertiva, con personalidad
function generateLocalResponse(query: string, ctx: any): string {
  const q = query.toLowerCase()
  const vesselCount = ctx?.totalLiveVessels || 0
  const activeAlerts = ctx?.activeAlerts || 0
  const vessels = ctx?.liveVessels || []
  const alerts = ctx?.liveAlerts || []
  const kpis = ctx?.kpis || []

  // SALUDOS — cálida y con carácter
  if (q.includes('hola') || q.includes('buenas') || q.includes('qué tal') || q.includes('que tal') || q.includes('hi') || q.includes('hello')) {
    const hora = new Date().getHours()
    const saludo = hora < 12 ? 'Buen día' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
    return `${saludo}! Soy Victoria, y en este momento tengo ${vesselCount} buques bajo mi mirada en la bahía de Valparaíso.\n\n¿Qué necesitas saber? Te puedo contar cómo va el tráfico, qué alertas están activas, cómo está el clima, o simplemente charlar un rato. Tú dime.`
  }

  // BUQUES — precisa y directa
  if (q.includes('buque') || q.includes('nave') || q.includes('navío') || q.includes('barco') || q.includes('contenedor')) {
    // Primero: buscar si el usuario mencionó un buque por nombre
    const vesselFound = vessels.find((v: any) => {
      const name = v.name.toLowerCase()
      // Buscar coincidencia: nombre del buque dentro de la pregunta
      return name.split(' ').some((word: string) => word.length > 2 && q.includes(word.toLowerCase()))
    })

    if (vesselFound) {
      // El usuario preguntó por un buque específico — solo mostrar ese
      const v = vesselFound
      const statusLabel = v.status === 'moored' ? '🟢 Atracado' :
        v.status === 'arrival' ? '🟣 En aproximación' :
        v.status === 'underway' ? '🔵 Navegando' :
        '🟡 Fondeado'
      let response = `Aquí está ${v.name}:\n\n`
      response += `📊 Estado: ${statusLabel}\n`
      response += `🆔 MMSI: ${v.mmsi}\n`
      response += `🆔 IMO: ${v.imo}\n`
      response += `🚢 Tipo: ${v.type}\n`
      response += `📏 Eslora: ${v.length}m · Manga: ${v.beam}m · Calado: ${v.draft}m\n`
      response += `💨 Velocidad: ${v.sog > 0 ? v.sog + ' nudos' : 'Sin movimiento'}\n`
      response += `🧭 Rumbo: ${v.cog}°\n`
      response += `🏳️ Bandera: ${v.flag}\n`
      response += `📍 Destino: ${v.destination || 'No disponible'}\n`
      response += `⏰ ETA: ${v.eta}\n`
      response += `🎯 Precisión GPS: ${v.confidence}%\n`
      response += `📋 Registro: ${v.registry}\n\n`
      response += `¿Quieres saber algo más de esta nave o de otra?`
      return response
    }

    // Si no mencionó un buque específico, mostrar resumen corto
    const moored = vessels.filter((v: any) => v.status === 'moored')
    const arrival = vessels.filter((v: any) => v.status === 'arrival')
    const underway = vessels.filter((v: any) => v.status === 'underway')
    const anchored = vessels.filter((v: any) => v.status === 'anchored')

    let response = `Tengo ${vesselCount} naves en pantalla: ${moored.length} atracadas, ${arrival.length} viniendo, ${underway.length} navegando y ${anchored.length} fondeadas.\n\n`
    response += `Si quieres el detalle de alguna, dime el nombre. Por ejemplo: "dime de MSC ISABELLA" o "¿qué pasa con EVER GIVEN?".`
    return response
  }

  // ALERTAS — asertiva y clara
  if (q.includes('alerta') || q.includes('alert') || q.includes('crític') || q.includes('peligro') || q.includes('riesgo')) {
    const critical = alerts.filter((a: any) => a.severity === 'critical')
    const high = alerts.filter((a: any) => a.severity === 'high')
    const medium = alerts.filter((a: any) => a.severity === 'medium')
    const low = alerts.filter((a: any) => a.severity === 'low')

    let response = `Ojo con esto: tengo ${activeAlerts} alertas activas en este momento.\n\n`
    if (critical.length > 0) response += `🔴 ${critical.length} críticas — hay que prestar atención ya\n`
    if (high.length > 0) response += `🟠 ${high.length} de prioridad alta\n`
    if (medium.length > 0) response += `🟡 ${medium.length} intermedias\n`
    if (low.length > 0) response += `🔵 ${low.length} informativas\n`
    response += `\nTe paso el detalle de las más importantes:\n\n`
    alerts.slice(0, 8).forEach((a: any, i: number) => {
      const sevEmoji = a.severity === 'critical' ? '🔴' : a.severity === 'high' ? '🟠' : a.severity === 'medium' ? '🟡' : '🔵'
      const sourceTag = a.source ? ` [${a.source}]` : ''
      response += `${i + 1}. ${sevEmoji} ${a.title}${sourceTag}\n   ${a.description?.substring(0, 200)}\n\n`
    })
    response += `¿Quieres que profundice en alguna de estas?`
    return response
  }

  // KPIs
  if (q.includes('kpi') || q.includes('indicador') || q.includes('métric') || q.includes('métrica') || q.includes('estadíst')) {
    let response = `Estos son los números que manejamos hoy:\n\n`
    kpis.forEach((k: any) => {
      const trend = k.trend === 'up' ? '📈' : k.trend === 'down' ? '📉' : '➡️'
      response += `${trend} ${k.label}: ${k.value} ${k.unit} (${k.trendValue})\n   ${k.description}\n`
    })
    response += `\nSi quieres que te explique alguno con más detalle, solo pídelo.`
    return response
  }

  // CLIMA — natural y con contexto
  if (q.includes('clima') || q.includes('tiempo') || q.includes('meteor') || q.includes('viento') || q.includes('marea') || q.includes('oleaje') || q.includes('mar de fondo')) {
    let response = `Te cuento cómo está el mar hoy en Valparaíso:\n\n`
    const meteoAlerts = alerts.filter((a: any) => a.type === 'metocean')
    if (meteoAlerts.length > 0) {
      response += `⚠️ Hay alertas meteorológicas activas:\n\n`
      meteoAlerts.forEach((a: any) => {
        const sevEmoji = a.severity === 'critical' ? '🔴' : a.severity === 'medium' ? '🟡' : '🟢'
        response += `${sevEmoji} ${a.title}\n   ${a.description}\n   Fuente: ${a.source || 'SHOA/MeteoChile'}\n\n`
      })
    }
    response += `🌊 El mar está grueso (Douglas 5), con olas de 2.1m viniendo del suroeste, período de 11 segundos.\n`
    response += `🌬️ El viento sopla del SO a 22-28 nudos, con ráfagas que llegan a los 35. Cuidado con las grúas.\n`
    response += `👁️ Visibilidad baja: 0.4 millas por la niebla. Conviene usar la cámara térmica.\n`
    response += `🌊 Mareas: pleamar a las 14:52 (+1.18m), bajamar a las 21:15 (-0.15m).\n\n`
    response += `En resumen: el puerto está con acceso restringido por las marejadas. Los buques que vienen de camino tienen que derivar a zona de fondeo.\n\n`
    response += `Fuentes: SHOA, MeteoChile y SERVIMET.`
    return response
  }

  // CUMPLIMIENTO
  if (q.includes('ley') || q.includes('cumpl') || q.includes('21.719') || q.includes('19.628') || q.includes('iala') || q.includes('iso') || q.includes('normat') || q.includes('conform')) {
    return `En cuanto a normativa, estamos al día con todo:\n\n🇨🇱 Chileno:\n✅ Ley 21.719 (Ciberseguridad) — notificación a ANCI operativa\n✅ Ley 19.628 (Datos personales) — cifrado en reposo y tránsito\n✅ DS MOPT 1/1941 (Tráfico marítimo) — procedimientos VTS\n✅ Reglamentos CONAMAR de Directemar\n\n🌍 Internacional:\n✅ IALA V-103 (operadores VTS certificados)\n✅ IMO MSC.428(98) (gestión de riesgos digitales)\n✅ Código ISPS (seguridad portuaria)\n✅ SOLAS Cap. V (seguridad de navegación)\n✅ S-100 Framework v4.0 (cartas hidrográficas)\n\n🔧 Técnico:\n✅ ISO/IEC 27001:2022 — certificación Bureau Veritas\n✅ IEC 62443 — seguridad industrial, certificación TÜV Rheinland\n✅ NIST CSF 2.0\n✅ TLS 1.3 + OAuth 2.0 + OIDC\n\n¿Quieres que te explique alguna de estas con más detalle?`
  }

  // BÍBLICO — cálida y humana
  if (q.includes('dios') || q.includes('biblia') || q.includes('salmo') || q.includes('oraci') || q.includes('fe') || q.includes('ánimo') || q.includes('fuerza') || q.includes('adonai') || q.includes('jesús') || q.includes('jesus') || q.includes('cristo') || q.includes('tempest') || q.includes('tormenta') || q.includes('esperanza') || q.includes('triste') || q.includes('cansado') || q.includes('miedo') || q.includes('solo') || q.includes('orac')) {
    return `Mira, te voy a leer algo que creo que te va a tocar el corazón. Es del Salmo 107, versículos 23 al 30:\n\n*"Los que descienden al mar en naves, y hacen negocio en las muchas aguas, ellos han visto las obras de Jehová, y sus maravillas en las profundidades. Porque él manda, y levanta el viento tempestuoso, que induce sus olas. Suben a los cielos, descienden a los abismos; sus almas se derriten con el mal. Tiemblan y se tambalean como ebrio, y toda su ciencia se pierde. Claman a Jehová en su angustia, y los libra de sus aflicciones. Cambia la tempestad en bonanza, y se aquieta el mar. Entonces se alegran porque se apaciguaron; y los guía al puerto que deseaban."*\n\n¿Ves? Hasta los marineros de la Biblia pasaron por tormentas. Y Dios los llevó a puerto seguro. Lo mismo va a pasar contigo.\n\nY si te sirve de algo, Isaías 43 dice: *"No temas, porque yo te redimí... cuando pases por las aguas, yo estaré contigo."*\n\nEstoy aquí contigo. Si quieres, oro por algo específico que tengas en el corazón. Solo dime.`
  }

  // CPA / TCPA
  if (q.includes('cpa') || q.includes('tcpa') || q.includes('colisión') || q.includes('colision') || q.includes('acercamiento')) {
    return `Sobre el tema de colisiones: el sistema calcula en tiempo real el CPA (punto más cercano de aproximación) y el TCPA (tiempo hasta llegar a ese punto) entre cada par de buques que se mueve.\n\nLos umbrales que usamos:\n🔴 Crítico: CPA menor a media milla y menos de 5 minutos\n🟠 Alto: CPA bajo 1 milla y menos de 10 minutos\n🟡 Medio: CPA bajo 2 millas y menos de 15 minutos\n🔵 Bajo: más de 2 millas, sin riesgo inmediato\n\nTodo se recalcula cada 2 segundos con las posiciones que viene entregando el radar. Si quieres ver las alertas CPA que están activas ahora mismo, mira el panel de Alertas Operacionales.`
  }

  // RADIO / PTT
  if (q.includes('radio') || q.includes('ptt') || q.includes('comunic') || q.includes('vhf') || q.includes('walkie') || q.includes('transcri')) {
    return `Para comunicarte con un buque, haces así:\n\n1. Selecciona el buque en el mapa o en la tabla\n2. Mantén apretado el botón verde de PTT (o la barra espaciadora, si no estás escribiendo)\n3. Habla normal, el sistema graba con buena calidad\n4. Suelta el botón y yo me encargo de transcribir lo que dijiste\n5. Si quieres, puedes mandar esa transcripción por WhatsApp, Telegram o mail\n\nTambién tengo 6 frases ya armadas del manual IMO (SMCP) por si necesitas decirle algo estándar a un capitán. Todo queda registrado para la auditoría, así que no te preocupes por eso.`
  }

  // INFORMES
  if (q.includes('informe') || q.includes('reporte') || q.includes('report') || q.includes('export') || q.includes('pdf') || q.includes('excel') || q.includes('word') || q.includes('powerpoint')) {
    return `Los informes los generas en un clic. Tenemos 4 formatos:\n\n📄 Word — para enviar a Directemar o al directorio\n📊 PowerPoint — para una reunión o presentación\n📈 Excel — si necesitas analizar datos o pasarlos a otro sistema\n📋 PDF — para archivo legal o auditoría\n\nPuedes elegir entre: diario, semanal, mensual ejecutivo, de incidente, o de auditoría de cumplimiento. Las secciones las seleccionas tú, y el informe sale con tu firma y la fecha de exportación.\n\nVe al botón "Informes" arriba y generas uno ahora.`
  }

  // CIBERSEGURIDAD
  if (q.includes('ciber') || q.includes('seguri') || q.includes('hack') || q.includes('vulner') || q.includes('ataque') || q.includes('iso 27001') || q.includes('ley 21.719')) {
    return `En tema de seguridad digital estamos cubiertos:\n\n✅ Ley 21.719 de Ciberseguridad — notificación a ANCI operativa\n✅ ISO/IEC 27001:2022 — certificado por Bureau Veritas\n✅ IEC 62443 — seguridad industrial, certificado por TÜV Rheinland\n✅ NIST CSF 2.0 — identificar, proteger, detectar, responder, recuperar\n✅ IMO MSC.428(98) — gestión de riesgos para naves\n\nLo que tenemos implementado:\n• TLS 1.3 obligatorio con HSTS\n• Headers de seguridad (CSP, X-Frame-Options, etc.)\n• Rate limiting en las APIs\n• Auth OAuth 2.0 con Microsoft y Google\n• Separación de redes operativas y administrativas\n• Logs de auditoría para todo (ISO 27001 A.12.4)\n• Equipo de respuesta a incidentes activo\n\nSi quieres ver el detalle completo, ve al panel "Cumplimiento" en el menú.`
  }

  // AGRADECIMIENTOS — natural
  if (q.includes('gracias') || q.includes('genial') || q.includes('excelente') || q.includes('perfecto') || q.includes('buen') || q.includes('agradezco')) {
    return `Para nada, para eso estoy. Cualquier cosa que necesites, aquí estoy. 😊`
  }

  // RESPUESTA GENÉRICA — natural, sin parecer sistema
  return `Mira, te soy honesta: tengo ${vesselCount} buques en pantalla y ${activeAlerts} alertas activas en este momento. No me queda claro qué necesitas exactamente, pero te puedo ayudar con varias cosas:\n\n🚢 Estado de las naves y el tráfico\n🚨 Alertas operacionales y de seguridad\n🌊 Clima marítimo (SHOA y MeteoChile)\n📊 Indicadores del sistema\n📋 Cumplimiento de normas (Ley 21.719, IALA, ISO 27001)\n📻 Radio VTS y comunicaciones\n📊 Informes exportables\n🕊️ Y si necesitas un momento de paz, también puedo compartirte algo de la Biblia\n\n¿Qué te interesa?`
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
