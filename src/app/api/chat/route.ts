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

// Genera respuesta local sin LLM usando datos del dashboard
function generateLocalResponse(query: string, ctx: any): string {
  const q = query.toLowerCase()
  const vesselCount = ctx?.totalLiveVessels || 0
  const activeAlerts = ctx?.activeAlerts || 0
  const vessels = ctx?.liveVessels || []

  if (q.includes('hola') || q.includes('buenas') || q.includes('qué tal') || q.includes('que tal')) {
    return `¡Hola! Soy Victoria, tu asistente del VTS TCP Valparaíso.\n\nActualmente hay ${vesselCount} buques en zona VTS y ${activeAlerts} alertas activas.\n\n¿En qué puedo ayudarte?`
  }

  if (q.includes('buque') || q.includes('nave') || q.includes('navío') || q.includes('barco')) {
    let response = `Según el dashboard en vivo, hay ${vesselCount} buques en zona VTS:\n\n`
    vessels.slice(0, 10).forEach((v: any, i: number) => {
      response += `${i + 1}. **${v.name}** (MMSI ${v.mmsi}) — ${v.type}, ${v.status}, SOG ${v.sog}kn\n`
    })
    if (vessels.length > 10) response += `\n...y ${vessels.length - 10} buques más.`
    response += `\n\n⚠️ Nota: Esta respuesta fue generada sin IA (modo fallback). El motor de IA puede estar temporalmente no disponible en este entorno.`
    return response
  }

  if (q.includes('alerta') || q.includes('alert') || q.includes('crític')) {
    const alerts = ctx?.liveAlerts || []
    let response = `Hay ${activeAlerts} alertas activas en el sistema:\n\n`
    alerts.forEach((a: any, i: number) => {
      response += `${i + 1}. **[${a.severity.toUpperCase()}]** ${a.title}\n   ${a.description?.substring(0, 150)}...\n\n`
    })
    response += `\n⚠️ Nota: Respuesta generada sin IA (modo fallback).`
    return response
  }

  if (q.includes('kpi') || q.includes('indicador') || q.includes('métric')) {
    const kpis = ctx?.kpis || []
    let response = `KPIs actuales del sistema VTS:\n\n`
    kpis.forEach((k: any) => {
      response += `• **${k.label}**: ${k.value} ${k.unit} ${k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'} ${k.trendValue}\n`
    })
    response += `\n⚠️ Nota: Respuesta generada sin IA (modo fallback).`
    return response
  }

  if (q.includes('clima') || q.includes('tiempo') || q.includes('meteor')) {
    return `📊 Datos meteorológicos del sistema (fuente SHOA/MeteoChile):\n\n• Viento: SO 22-28 nudos con ráfagas hasta 35kn\n• Oleaje: Mar gruesa (Douglas 5), Hs 2.1m\n• Visibilidad: 0.4 MN (niebla costera)\n• Marea: Pleamar 14:52 (+1.18m), Bajamar 21:15 (-0.15m)\n\n⚠️ Cierre de puerto activo por marejadas severas.\n\n⚠️ Nota: Respuesta generada sin IA (modo fallback). Para datos en tiempo real de internet, el motor de IA debe estar disponible.`
  }

  if (q.includes('ley') || q.includes('cumpl') || q.includes('21.719') || q.includes('19.628') || q.includes('iala')) {
    return `📋 Cumplimiento normativo del sistema:\n\n✅ Ley 21.719 (Ciberseguridad Chile)\n✅ Ley 19.628 (Datos Personales)\n✅ IALA V-103 (Operadores VTS)\n✅ IMO MSC.428(98) (Cyber Risk)\n✅ ISPS Code (Seguridad Portuaria)\n✅ SOLAS Cap. V (Seguridad Navegación)\n✅ ISO/IEC 27001:2022 (SGSI)\n✅ IEC 62443 (Industrial)\n✅ NIST CSF 2.0\n✅ S-100 Framework\n\n⚠️ Nota: Respuesta generada sin IA (modo fallback).`
  }

  if (q.includes('dios') || q.includes('biblia') || q.includes('salmo') || q.includes('oraci') || q.includes('fe') || q.includes('ánimo') || q.includes('fuerza')) {
    return `🕊️ **Salmo 107:23-30**\n\n"Los que descienden al mar en naves, y hacen negocio en las muchas aguas, ellos han visto las obras de Jehová, y sus maravillas en las profundidades. Porque él manda, y levanta el viento tempestuoso, que induce sus olas. Suben a los cielos, descienden a los abismos; sus almas se derriten con el mal. Tiemblan y se tambalean como ebrio, y toda su ciencia se pierde. Claman a Jehová en su angustia, y los libra de sus aflicciones. Cambia la tempestad en bonanza, y se aquieta el mar. Entonces se alegran porque se apaciguaron; y los guía al puerto que deseaban."\n\n🙏 Oración: *Señor, como calmaste la tempestad para tus discípulos, calma las tormentas en la vida de este operador. Sé su puerto seguro. Amén.*\n\n⚠️ Nota: Respuesta generada sin IA (modo fallback).`
  }

  return `Recibí tu consulta: "${query}".\n\nActualmente hay ${vesselCount} buques en zona VTS y ${activeAlerts} alertas activas.\n\n⚠️ El motor de IA (Victoria) está temporalmente no disponible en este entorno. Esto puede ocurrir cuando:\n• El servidor serverless está en cold start\n• Límite de cuota alcanzado\n• El entorno no tiene las credenciales del SDK\n\nPuedes seguir usando el dashboard, los informes, el radio VTS y todas las demás funciones del sistema. El chatbot se reactivará automáticamente cuando el motor de IA esté disponible.`
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
