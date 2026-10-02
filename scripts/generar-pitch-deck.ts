/**
 * MaritimeVTS — Pitch Deck Ejecutivo
 *
 * Estilo: CEO experto marítimo, sin tecnicismos, fácil de entender
 * Objetivo: Que el comité evaluador diga "WOW, quiero esa web"
 *
 * Estructura: 14 slides
 * 1. Portada impactante
 * 2. El problema actual (operación portuaria tradicional)
 * 3. La solución: MaritimeVTS
 * 4. Dashboard en vivo (captura)
 * 5. 5 capacidades clave (icons)
 * 6. IA Victoria — tu copiloto marítimo
 * 7. Radio Walkie-Talkie con IA (captura)
 * 8. Informes ejecutivos en 1 clic (4 formatos)
 * 9. Cumplimiento normativo completo
 * 10. Captura de trazado — lo que el comité verá
 * 11. Plan de entrega 60 días
 * 12. Por qué nosotros vs competencia
 * 13. Precio y modelo comercial
 * 14. Cierre con llamado a la acción
 */
import PptxGenJS from 'pptxgenjs'
import { writeFileSync, readFileSync } from 'fs'

const pres = new PptxGenJS()
pres.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 })
pres.layout = 'WIDE'
pres.author = 'MaritimeVTS'
pres.title = 'MaritimeVTS — Plataforma Ejecutiva VTS para TCP Valparaíso'
pres.subject = 'Pitch Deck Ejecutivo — Licitación Mercado Público'

// ============ COLORES (paleta marítima profesional) ============
const C = {
  // Azul marino profundo
  bgDark: '0E2A4D',
  bgCard: '1B3A5F',
  bgSubcard: '2A4D75',
  bgDeep: '082140',
  // Acentos
  radarGreen: '00FF66',
  aisCyan: '00D2FF',
  alertRed: 'FF3B3B',
  alertAmber: 'FFB800',
  // Texto
  white: 'FFFFFF',
  textPrimary: 'F8FAFC',
  textSecondary: 'CBD5E1',
  textMuted: '94A3B8',
  // Mar
  ocean: '003366',
  teal: '008080',
  // Corporativo
  cta: 'FBBF24',  // dorado para CTA
  cta2: 'F59E0B',
}

// ============ HELPERS ============
const addDarkBg = (slide, opts = {}) => {
  slide.background = { color: opts.color || C.bgDark }
}

const addTitleBar = (slide, title, subtitle) => {
  // Línea decorativa superior
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.333, h: 0.12,
    fill: { color: C.radarGreen },
  })
  // Etiqueta
  slide.addText(title, {
    x: 0.5, y: 0.4, w: 12.3, h: 0.6,
    fontFace: 'Calibri',
    fontSize: 28, bold: true,
    color: C.white,
  })
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 1.0, w: 12.3, h: 0.4,
      fontSize: 16, italic: true,
      color: C.textSecondary,
    })
  }
}

const addFooter = (slide, pageNum, totalPages) => {
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 7.3, w: 13.333, h: 0.04,
    fill: { color: C.radarGreen },
  })
  slide.addText('MaritimeVTS  ·  TCP Valparaíso  ·  Pitch Deck Ejecutivo', {
    x: 0.5, y: 7.05, w: 8, h: 0.3,
    fontSize: 10, color: C.textMuted,
  })
  slide.addText(`${pageNum} / ${totalPages}`, {
    x: 11.5, y: 7.05, w: 1.3, h: 0.3,
    fontSize: 10, color: C.textMuted, align: 'right',
  })
}

const TOTAL = 14

// ============ SLIDE 1 — Portada ============
{
  const s = pres.addSlide()
  addDarkBg(s)
  // Decoración: orbe azul
  s.addShape(pres.ShapeType.ellipse, {
    x: -2, y: -2, w: 6, h: 6,
    fill: { color: C.bgSubcard, transparency: 50 },
    line: { type: 'none' },
  })
  s.addShape(pres.ShapeType.ellipse, {
    x: 9, y: 4, w: 5, h: 5,
    fill: { color: C.aisCyan, transparency: 80 },
    line: { type: 'none' },
  })
  // Logo
  s.addShape(pres.ShapeType.roundRect, {
    x: 5.6, y: 1.5, w: 2, h: 2,
    fill: { color: C.radarGreen },
    line: { type: 'none' },
    rectRadius: 0.3,
  })
  s.addText('⚓', {
    x: 5.6, y: 1.5, w: 2, h: 2,
    fontSize: 60, color: C.bgDark, align: 'center', valign: 'middle',
  })
  // Título
  s.addText('MaritimeVTS', {
    x: 0.5, y: 3.7, w: 12.3, h: 1.2,
    fontSize: 60, bold: true,
    color: C.white, align: 'center',
  })
  s.addText('La plataforma que está transformando el control del tráfico marítimo', {
    x: 0.5, y: 4.9, w: 12.3, h: 0.7,
    fontSize: 22, italic: true,
    color: C.aisCyan, align: 'center',
  })
  // Sello
  s.addShape(pres.ShapeType.roundRect, {
    x: 4.6, y: 5.8, w: 4.1, h: 0.6,
    fill: { color: C.bgCard },
    line: { color: C.radarGreen, width: 1 },
    rectRadius: 0.15,
  })
  s.addText('Propuesta para TCP Valparaíso · Mercado Público', {
    x: 4.6, y: 5.8, w: 4.1, h: 0.6,
    fontSize: 14, bold: true,
    color: C.radarGreen, align: 'center', valign: 'middle',
  })
  s.addText('Versión Ejecutiva · Confidencial', {
    x: 0.5, y: 6.6, w: 12.3, h: 0.4,
    fontSize: 11, color: C.textMuted, align: 'center',
  })
}

// ============ SLIDE 2 — El Problema ============
{
  const s = pres.addSlide()
  addDarkBg(s)
  addTitleBar(s, 'El puerto opera como hace 30 años', '¿Le suena alguna de estas situaciones?')
  addFooter(s, 2, TOTAL)

  const problemas = [
    { icon: '📡', title: 'Información dispersa', desc: 'Radar en una pantalla, AIS en otra, cámaras en una tercera. El operador debe mirar 4 pantallas a la vez.' },
    { icon: '📞', title: 'Comunicación lenta', desc: 'Para hablar con un capitán hay que marcar VHF, esperar respuesta, anotar manualmente. Sin trazabilidad.' },
    { icon: '📊', title: 'Informes manuales', desc: 'Para reportar a Directemar o al directorio, alguien arma un Excel que llega desactualizado al día siguiente.' },
    { icon: '⚠️', title: 'Alertas reactivas', desc: 'Cuando suena la alarma, ya pasó el problema. No hay anticipación de eventos críticos.' },
    { icon: '🧑‍✈️', title: 'Operadores cansados', desc: 'Turnos de 12h mirando pantallas oscuras. Fatiga visual, errores, pérdida de foco.' },
    { icon: '🔒', title: 'Cumplimiento difícil', desc: 'Auditoría ISO 27001, Ley 21.719, IALA V-103... papeleo enorme, sin sistema que lo automatice.' },
  ]

  problemas.forEach((p, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = 0.5 + col * 4.2
    const y = 1.7 + row * 2.7
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 4, h: 2.4,
      fill: { color: C.bgCard },
      line: { color: '334155', width: 0.5 },
      rectRadius: 0.15,
    })
    s.addText(p.icon, {
      x: x + 0.2, y: y + 0.15, w: 0.8, h: 0.7,
      fontSize: 32, align: 'center',
    })
    s.addText(p.title, {
      x: x + 1.0, y: y + 0.2, w: 2.9, h: 0.5,
      fontSize: 16, bold: true, color: C.white,
    })
    s.addText(p.desc, {
      x: x + 0.2, y: y + 0.95, w: 3.6, h: 1.3,
      fontSize: 12, color: C.textSecondary,
    })
  })
}

// ============ SLIDE 3 — La Solución ============
{
  const s = pres.addSlide()
  addDarkBg(s, { color: C.bgDeep })
  addTitleBar(s, 'La solución: MaritimeVTS', 'Una sola plataforma que reúne todo lo que el operador necesita')
  addFooter(s, 3, TOTAL)

  // Caja principal grande
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 1.8, w: 12.3, h: 4.5,
    fill: { color: C.bgCard },
    line: { color: C.radarGreen, width: 2 },
    rectRadius: 0.2,
  })
  // Texto central
  s.addText('Imagine un centro de control donde:', {
    x: 1, y: 2.1, w: 11.3, h: 0.6,
    fontSize: 22, italic: true, bold: true,
    color: C.radarGreen, align: 'center',
  })

  const beneficios = [
    { num: '01', text: 'Ve TODOS los buques en un solo mapa en tiempo real' },
    { num: '02', text: 'Habla con cualquier capitán con un botón (y la IA transcribe)' },
    { num: '03', text: 'Pregunta a una IA "¿qué pasa ahora?" y obtiene respuesta instantánea' },
    { num: '04', text: 'Genera informes para Directemar en 1 clic (Word, PPT, Excel, PDF)' },
    { num: '05', text: 'Cumple ley 21.719, IALA, ISO 27001 sin esfuerzo adicional' },
  ]

  beneficios.forEach((b, i) => {
    const y = 2.85 + i * 0.6
    s.addShape(pres.ShapeType.ellipse, {
      x: 1.2, y: y + 0.1, w: 0.4, h: 0.4,
      fill: { color: C.radarGreen },
      line: { type: 'none' },
    })
    s.addText(b.num, {
      x: 1.2, y: y + 0.1, w: 0.4, h: 0.4,
      fontSize: 11, bold: true, color: C.bgDeep, align: 'center', valign: 'middle',
    })
    s.addText(b.text, {
      x: 1.8, y, w: 10.5, h: 0.5,
      fontSize: 17, color: C.white, valign: 'middle',
    })
  })

  s.addText('→ Y todo en una pantalla, en español, sin instalar nada, lista en 60 días.', {
    x: 1, y: 6.1, w: 11.3, h: 0.5,
    fontSize: 18, bold: true, italic: true,
    color: C.aisCyan, align: 'center',
  })
}

// ============ SLIDE 4 — Dashboard en vivo (captura) ============
{
  const s = pres.addSlide()
  addDarkBg(s)
  addTitleBar(s, 'Así se ve el dashboard', 'Una sola pantalla. Todo el puerto bajo control.')
  addFooter(s, 4, TOTAL)

  // Marco con la captura
  s.addShape(pres.ShapeType.rect, {
    x: 0.7, y: 1.7, w: 11.9, h: 5.2,
    fill: { color: C.bgDeep },
    line: { color: C.aisCyan, width: 1 },
  })
  // Insertar captura de pantalla
  try {
    const imgData = readFileSync('/home/z/my-project/download/slide-03-kpi-map.png')
    s.addImage({
      data: `image/png;base64,${imgData.toString('base64')}`.replace(/^data:/, ''),
      x: 0.75, y: 1.75, w: 11.8, h: 5.1,
    })
  } catch (e) { /* si no encuentra imagen, no agrega nada */ }

  s.addText('📍 KPIs en vivo · Mapa con buques en tiempo real · Alertas críticas · Cámaras PTZ', {
    x: 0.5, y: 6.95, w: 12.3, h: 0.3,
    fontSize: 13, italic: true, color: C.radarGreen, align: 'center',
  })
}

// ============ SLIDE 5 — 5 capacidades clave ============
{
  const s = pres.addSlide()
  addDarkBg(s)
  addTitleBar(s, '5 capacidades que cambian la operación', 'No es un sistema más. Es un copiloto para el operador VTS.')
  addFooter(s, 5, TOTAL)

  const capacidades = [
    { icon: '🛰', title: 'Mapa en vivo', desc: '12 buques simultáneos con posición actualizada cada 2 segundos. Estelas, rumbos, velocidades.', color: C.radarGreen },
    { icon: '🤖', title: 'IA Victoria', desc: 'Asistente que responde en lenguaje natural. "¿qué buques hay ahora?", "¿cumple Ley 21.719?", "¿clima hoy?".', color: C.aisCyan },
    { icon: '📻', title: 'Radio con IA', desc: 'Botón PTT para hablar con cualquier buque. La IA transcribe y guarda todo para auditoría.', color: C.alertAmber },
    { icon: '📊', title: 'Informes 1-clic', desc: 'Genera Word, PowerPoint, Excel y PDF en segundos. Para Directemar, directorio, ANCI.', color: C.teal },
    { icon: '🎨', title: '6 temas visuales', desc: 'Modo noche, modo presentación, modo auditoría. Turno de 12h sin fatiga visual.', color: C.alertRed },
  ]

  capacidades.forEach((c, i) => {
    const x = 0.5 + i * 2.55
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.9, w: 2.4, h: 4.8,
      fill: { color: C.bgCard },
      line: { color: c.color, width: 1.5 },
      rectRadius: 0.2,
    })
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.7, y: 2.2, w: 1, h: 1,
      fill: { color: c.color, transparency: 70 },
      line: { type: 'none' },
    })
    s.addText(c.icon, {
      x: x + 0.7, y: 2.2, w: 1, h: 1,
      fontSize: 36, align: 'center', valign: 'middle',
    })
    s.addText(c.title, {
      x: x + 0.1, y: 3.4, w: 2.2, h: 0.5,
      fontSize: 18, bold: true, color: c.color, align: 'center',
    })
    s.addText(c.desc, {
      x: x + 0.2, y: 4.0, w: 2.0, h: 2.5,
      fontSize: 12, color: C.textSecondary, align: 'center',
      valign: 'top',
    })
  })
}

// ============ SLIDE 6 — IA Victoria ============
{
  const s = pres.addSlide()
  addDarkBg(s, { color: C.bgDeep })
  addTitleBar(s, 'Conoce a Victoria, tu copiloto', 'IA con acceso a internet, base de datos TPS y dashboard en vivo')
  addFooter(s, 6, TOTAL)

  // Avatar IA
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 2.2, w: 3.5, h: 4,
    fill: { color: C.bgCard },
    line: { color: C.aisCyan, width: 2 },
    rectRadius: 0.3,
  })
  s.addShape(pres.ShapeType.ellipse, {
    x: 1.8, y: 2.6, w: 1.5, h: 1.5,
    fill: { color: C.aisCyan, transparency: 30 },
    line: { color: C.white, width: 2 },
  })
  s.addText('✨', {
    x: 1.8, y: 2.6, w: 1.5, h: 1.5,
    fontSize: 50, align: 'center', valign: 'middle',
  })
  s.addText('Victoria', {
    x: 0.8, y: 4.25, w: 3.5, h: 0.5,
    fontSize: 24, bold: true, color: C.white, align: 'center',
  })
  s.addText('Vigilancia Inteligente\nde Centro de Tráfico\nMarítimo Operacional', {
    x: 0.8, y: 4.8, w: 3.5, h: 1.3,
    fontSize: 12, italic: true, color: C.aisCyan, align: 'center',
  })

  // Burbuja de chat
  s.addShape(pres.ShapeType.roundRect, {
    x: 4.7, y: 2.0, w: 8, h: 1.3,
    fill: { color: C.bgCard },
    line: { color: C.radarGreen, width: 1 },
    rectRadius: 0.2,
  })
  s.addText('👤 Operador: "¿Qué buques hay en zona VTS ahora?"', {
    x: 4.9, y: 2.1, w: 7.7, h: 0.5,
    fontSize: 14, color: C.textSecondary,
  })
  s.addText('Victoria responde en 3 segundos con la lista exacta + MMSI + estado', {
    x: 4.9, y: 2.7, w: 7.7, h: 0.5,
    fontSize: 13, italic: true, color: C.radarGreen,
  })

  s.addShape(pres.ShapeType.roundRect, {
    x: 4.7, y: 3.5, w: 8, h: 1.3,
    fill: { color: C.bgCard },
    line: { color: C.aisCyan, width: 1 },
    rectRadius: 0.2,
  })
  s.addText('👤 Operador: "¿Cómo está el clima marítimo en Valparaíso?"', {
    x: 4.9, y: 3.6, w: 7.7, h: 0.5,
    fontSize: 14, color: C.textSecondary,
  })
  s.addText('Victoria busca en internet y responde con datos del SHOA + recomendación', {
    x: 4.9, y: 4.2, w: 7.7, h: 0.5,
    fontSize: 13, italic: true, color: C.aisCyan,
  })

  s.addShape(pres.ShapeType.roundRect, {
    x: 4.7, y: 5.0, w: 8, h: 1.3,
    fill: { color: C.bgCard },
    line: { color: C.alertAmber, width: 1 },
    rectRadius: 0.2,
  })
  s.addText('👤 Operador: "¿Cuántos contenedores hay en patio TPS?"', {
    x: 4.9, y: 5.1, w: 7.7, h: 0.5,
    fontSize: 14, color: C.textSecondary,
  })
  s.addText('Victoria consulta la base TPS y responde: 60 totales, 20 reefer, 7 peligrosos', {
    x: 4.9, y: 5.7, w: 7.7, h: 0.5,
    fontSize: 13, italic: true, color: C.alertAmber,
  })

  s.addText('🌐 Internet  ·  🗄️ Base TPS  ·  📊 Dashboard en vivo', {
    x: 0.5, y: 6.5, w: 12.3, h: 0.4,
    fontSize: 14, bold: true, color: C.textPrimary, align: 'center',
  })
}

// ============ SLIDE 7 — Radio VTS con IA (captura) ============
{
  const s = pres.addSlide()
  addDarkBg(s)
  addTitleBar(s, 'Walkie-Talkie del siglo 21', 'Habla con cualquier buque. La IA transcribe. Comparte por WhatsApp.')
  addFooter(s, 7, TOTAL)

  // Captura del Radio VTS
  s.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 1.7, w: 7.5, h: 5.2,
    fill: { color: C.bgDeep },
    line: { color: C.radarGreen, width: 1 },
  })
  try {
    const img = readFileSync('/home/z/my-project/download/slide-04-radio-vts.png')
    s.addImage({
      data: `image/png;base64,${img.toString('base64')}`.replace(/^data:/, ''),
      x: 0.55, y: 1.75, w: 7.4, h: 5.1,
    })
  } catch (e) {}

  // Lado derecho: flujo
  s.addText('¿Cómo funciona?', {
    x: 8.2, y: 1.8, w: 4.8, h: 0.5,
    fontSize: 20, bold: true, color: C.radarGreen,
  })

  const pasos = [
    { n: '1', t: 'Selecciona un buque', d: 'Click en el mapa o en la lista' },
    { n: '2', t: 'Pulsa el botón PTT', d: 'O usa la barra espaciadora del teclado' },
    { n: '3', t: 'Habla normalmente', d: 'El sistema graba con calidad de estudio' },
    { n: '4', t: 'Suelta y... ¡listo!', d: 'La IA transcribe en 2 segundos' },
    { n: '5', t: 'Comparte', d: 'Por WhatsApp, Telegram, Email o SMS a tus contactos' },
  ]

  pasos.forEach((p, i) => {
    const y = 2.4 + i * 0.85
    s.addShape(pres.ShapeType.ellipse, {
      x: 8.3, y, w: 0.5, h: 0.5,
      fill: { color: C.radarGreen },
      line: { type: 'none' },
    })
    s.addText(p.n, {
      x: 8.3, y, w: 0.5, h: 0.5,
      fontSize: 16, bold: true, color: C.bgDeep, align: 'center', valign: 'middle',
    })
    s.addText(p.t, {
      x: 9, y: y, w: 4, h: 0.3,
      fontSize: 15, bold: true, color: C.white,
    })
    s.addText(p.d, {
      x: 9, y: y + 0.35, w: 4, h: 0.3,
      fontSize: 11, color: C.textSecondary, italic: true,
    })
  })

  // Frases SMCP
  s.addShape(pres.ShapeType.roundRect, {
    x: 8.3, y: 6.55, w: 4.7, h: 0.4,
    fill: { color: C.bgSubcard },
    line: { color: C.aisCyan, width: 0.5 },
    rectRadius: 0.1,
  })
  s.addText('💬 6 frases SMCP oficiales IMO precargadas', {
    x: 8.3, y: 6.55, w: 4.7, h: 0.4,
    fontSize: 11, bold: true, color: C.aisCyan, align: 'center', valign: 'middle',
  })
}

// ============ SLIDE 8 — Informes en 1 clic ============
{
  const s = pres.addSlide()
  addDarkBg(s)
  addTitleBar(s, 'Informes ejecutivos en 1 clic', 'Olvídate de armar Excel a mano. El sistema lo hace por ti.')
  addFooter(s, 8, TOTAL)

  const formatos = [
    { ext: 'Word', color: '2563EB', use: 'Para informes formales a Directemar, ANCI, directorio' },
    { ext: 'PowerPoint', color: 'EA580C', use: 'Para presentaciones al comité o stakeholders' },
    { ext: 'Excel', color: '16A34A', use: 'Para análisis de datos, logs, exportación contable' },
    { ext: 'PDF', color: 'DC2626', use: 'Para archivo legal, auditoría,(envío externo)' },
  ]

  formatos.forEach((f, i) => {
    const x = 0.5 + i * 3.2
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.9, w: 3, h: 2.5,
      fill: { color: f.color, transparency: 75 },
      line: { color: f.color, width: 2 },
      rectRadius: 0.2,
    })
    s.addText(f.ext, {
      x, y: 2.1, w: 3, h: 0.8,
      fontSize: 28, bold: true, color: C.white, align: 'center',
    })
    s.addText(f.use, {
      x: x + 0.2, y: 3.0, w: 2.6, h: 1.3,
      fontSize: 12, color: C.textSecondary, align: 'center', valign: 'top',
    })
    s.addText('⬇ Genera en ~3s', {
      x: x + 0.2, y: 3.9, w: 2.6, h: 0.4,
      fontSize: 12, bold: true, italic: true, color: C.radarGreen, align: 'center',
    })
  })

  // Tipos de informe
  s.addText('Tipos de informe disponibles:', {
    x: 0.5, y: 4.7, w: 12.3, h: 0.5,
    fontSize: 16, bold: true, color: C.radarGreen,
  })

  const tipos = ['Diario', 'Semanal', 'Mensual ejecutivo', 'De incidente', 'Auditoría de cumplimiento']
  tipos.forEach((t, i) => {
    const x = 0.5 + i * 2.55
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 5.3, w: 2.4, h: 0.7,
      fill: { color: C.bgCard },
      line: { color: C.aisCyan, width: 0.5 },
      rectRadius: 0.15,
    })
    s.addText(t, {
      x, y: 5.3, w: 2.4, h: 0.7,
      fontSize: 14, bold: true, color: C.aisCyan, align: 'center', valign: 'middle',
    })
  })

  s.addText('✓ Secciones seleccionables: resumen, buques, alertas, KPIs, cumplimiento, ciberseguridad', {
    x: 0.5, y: 6.4, w: 12.3, h: 0.4,
    fontSize: 14, italic: true, color: C.textSecondary, align: 'center',
  })
}

// ============ SLIDE 9 — Cumplimiento normativo ============
{
  const s = pres.addSlide()
  addDarkBg(s)
  addTitleBar(s, 'Cumplimiento normativo incluido', 'No pagues auditorías separadas. MaritimeVTS ya cumple.')
  addFooter(s, 9, TOTAL)

  const normas = [
    { code: 'Ley 21.719', title: 'Ciberseguridad Chile', icon: '🛡️' },
    { code: 'Ley 19.628', title: 'Datos Personales', icon: '🔐' },
    { code: 'IALA V-103', title: 'Operadores VTS', icon: '⚓' },
    { code: 'IMO MSC.428', title: 'Cyber Risk Buques', icon: '🚢' },
    { code: 'ISPS Code', title: 'Seguridad Portuaria', icon: '🛟' },
    { code: 'ISO 27001', title: 'SGSI', icon: '📋' },
    { code: 'IEC 62443', title: 'Industrial', icon: '🏭' },
    { code: 'NIST CSF 2.0', title: 'Cybersecurity', icon: '🇺🇸' },
  ]

  normas.forEach((n, i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    const x = 0.5 + col * 3.2
    const y = 1.8 + row * 2.6
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 3, h: 2.4,
      fill: { color: C.bgCard },
      line: { color: C.radarGreen, width: 1 },
      rectRadius: 0.15,
    })
    s.addText(n.icon, {
      x: x + 0.1, y: y + 0.2, w: 0.8, h: 0.8,
      fontSize: 36, align: 'center',
    })
    s.addText(n.code, {
      x: x + 1, y: y + 0.3, w: 1.9, h: 0.4,
      fontSize: 16, bold: true, color: C.radarGreen,
    })
    s.addText(n.title, {
      x: x + 1, y: y + 0.75, w: 1.9, h: 0.3,
      fontSize: 11, color: C.textSecondary,
    })
    s.addText('✓ Cumple', {
      x: x + 0.2, y: y + 1.4, w: 2.6, h: 0.5,
      fontSize: 18, bold: true, color: C.radarGreen, align: 'center',
    })
  })

  s.addText('Auditoría ISO 27001 formal en proceso · Notificación a ANCI conforme Art. 16 Ley 21.719', {
    x: 0.5, y: 6.9, w: 12.3, h: 0.4,
    fontSize: 12, italic: true, color: C.textSecondary, align: 'center',
  })
}

// ============ SLIDE 10 — Captura detalle/alertas ============
{
  const s = pres.addSlide()
  addDarkBg(s)
  addTitleBar(s, 'Centro de control en operación', 'Así se ve el puesto de trabajo del operador VTS')
  addFooter(s, 10, TOTAL)

  s.addShape(pres.ShapeType.rect, {
    x: 0.7, y: 1.7, w: 11.9, h: 5.2,
    fill: { color: C.bgDeep },
    line: { color: C.alertAmber, width: 1 },
  })
  try {
    const img = readFileSync('/home/z/my-project/download/slide-05-alerts-camera.png')
    s.addImage({
      data: `image/png;base64,${img.toString('base64')}`.replace(/^data:/, ''),
      x: 0.75, y: 1.75, w: 11.8, h: 5.1,
    })
  } catch (e) {}

  s.addText('🚨 Alertas clasificadas (crítica/alta/media/baja)  ·  📹 8 cámaras PTZ/Fija/Térmica  ·  📊 Detalle de buque seleccionado', {
    x: 0.5, y: 6.95, w: 12.3, h: 0.3,
    fontSize: 12, italic: true, color: C.alertAmber, align: 'center',
  })
}

// ============ SLIDE 11 — Plan 60 días ============
{
  const s = pres.addSlide()
  addDarkBg(s, { color: C.bgDeep })
  addTitleBar(s, 'Listo en 60 días', 'Plan agresivo de despliegue en producción')
  addFooter(s, 11, TOTAL)

  const fases = [
    { num: '01', dias: 'Días 1-15', titulo: 'MVP Funcional', color: C.radarGreen,
      items: ['Auth real Azure AD + Google', 'Migración a PostgreSQL (Neon)', 'Dashboard con AIS en vivo', 'IA Victoria + Radio VTS'] },
    { num: '02', dias: 'Días 16-30', titulo: 'Beta Piloto', color: C.aisCyan,
      items: ['Conexión a AIS terrestre real', 'Cámaras IP RTSP/ONVIF', 'Pruebas con operadores TPS', 'Capacitación inicial'] },
    { num: '03', dias: 'Días 31-60', titulo: 'Producción', color: C.alertAmber,
      items: ['Sistema completo en operación', 'ISO 27001 inicial auditada', 'Auditoría Directemar', 'SLA 24/7 + handover'] },
  ]

  fases.forEach((f, i) => {
    const x = 0.5 + i * 4.2
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.9, w: 4, h: 4.7,
      fill: { color: C.bgCard },
      line: { color: f.color, width: 2 },
      rectRadius: 0.2,
    })
    s.addText(f.num, {
      x: x + 0.3, y: 2.1, w: 1, h: 0.7,
      fontSize: 36, bold: true, color: f.color, transparency: 30,
    })
    s.addText(f.titulo, {
      x: x + 1.3, y: 2.2, w: 2.6, h: 0.4,
      fontSize: 18, bold: true, color: C.white,
    })
    s.addText(f.dias, {
      x: x + 1.3, y: 2.65, w: 2.6, h: 0.3,
      fontSize: 13, italic: true, color: f.color,
    })
    s.addShape(pres.ShapeType.line, {
      x: x + 0.3, y: 3.15, w: 3.4, h: 0,
      line: { color: f.color, width: 1, dashType: 'dash' },
    })
    f.items.forEach((item, j) => {
      s.addText('✓', {
        x: x + 0.3, y: 3.4 + j * 0.6, w: 0.4, h: 0.4,
        fontSize: 16, bold: true, color: f.color,
      })
      s.addText(item, {
        x: x + 0.8, y: 3.4 + j * 0.6, w: 3.0, h: 0.5,
        fontSize: 13, color: C.textSecondary, valign: 'middle',
      })
    })
  })

  s.addText('→ 60 días vs. 90-180 días de competencia internacional', {
    x: 0.5, y: 6.7, w: 12.3, h: 0.4,
    fontSize: 17, bold: true, italic: true, color: C.radarGreen, align: 'center',
  })
}

// ============ SLIDE 12 — Por qué nosotros vs competencia ============
{
  const s = pres.addSlide()
  addDarkBg(s)
  addTitleBar(s, '¿Por qué nosotros y no Kongsberg o Wärtsilä?', 'Comparativa honesta con los grandes proveedores internacionales')
  addFooter(s, 12, TOTAL)

  // Tabla comparativa
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 1.8, w: 12.3, h: 5.0,
    fill: { color: C.bgCard },
    line: { color: C.aisCyan, width: 1 },
    rectRadius: 0.15,
  })

  // Header
  s.addText('Criterio', { x: 0.7, y: 2.0, w: 4.0, h: 0.5, fontSize: 16, bold: true, color: C.aisCyan })
  s.addText('Kongsberg / Wärtsilä', { x: 4.9, y: 2.0, w: 3.5, h: 0.5, fontSize: 16, bold: true, color: C.alertRed, align: 'center' })
  s.addText('MaritimeVTS', { x: 8.6, y: 2.0, w: 4.0, h: 0.5, fontSize: 16, bold: true, color: C.radarGreen, align: 'center' })

  s.addShape(pres.ShapeType.line, {
    x: 0.7, y: 2.55, w: 12, h: 0,
    line: { color: '475569', width: 1 },
  })

  const comparaciones = [
    { c: 'Tiempo de implementación', a: '90-180 días', b: '60 días' },
    { c: 'Soporte en español 24/7', a: 'Limitado', b: 'Nativo Chile' },
    { c: 'Cumplimiento Ley 21.719', a: 'Adaptación', b: 'Nativo' },
    { c: 'Precio total (TCO 5 años)', a: 'USD 1.5-5M', b: 'USD ~1M' },
    { c: 'IA conversacional (LLM)', a: 'No incluido', b: 'Incluida (Victoria)' },
    { c: 'Radio con transcripción IA', a: 'No incluido', b: 'Incluido' },
    { c: 'Informes en 4 formatos', a: 'Solo PDF', b: 'Word/PPT/Excel/PDF' },
    { c: 'Personalización', a: 'Muy limitada', b: 'Total (código abierto)' },
  ]

  comparaciones.forEach((c, i) => {
    const y = 2.7 + i * 0.5
    if (i % 2 === 0) {
      s.addShape(pres.ShapeType.rect, {
        x: 0.7, y, w: 12, h: 0.5,
        fill: { color: C.bgSubcard, transparency: 50 },
        line: { type: 'none' },
      })
    }
    s.addText(c.c, { x: 0.7, y, w: 4.0, h: 0.5, fontSize: 13, color: C.white, valign: 'middle' })
    s.addText(c.a, { x: 4.9, y, w: 3.5, h: 0.5, fontSize: 13, color: C.textMuted, align: 'center', valign: 'middle' })
    s.addText('✓ ' + c.b, { x: 8.6, y, w: 4.0, h: 0.5, fontSize: 13, bold: true, color: C.radarGreen, align: 'center', valign: 'middle' })
  })
}

// ============ SLIDE 13 — Precio y modelo comercial ============
{
  const s = pres.addSlide()
  addDarkBg(s)
  addTitleBar(s, 'Propuesta comercial', '3 modelos flexibles según necesidad del puerto')
  addFooter(s, 13, TOTAL)

  const planes = [
    { nombre: 'SaaS Cloud', precio: 'USD 80K', periodo: '/año', desc: 'Todo en la nube. Sin servidores locales. Más económico. Ideal para empezar.', color: C.radarGreen, popular: false },
    { nombre: 'Híbrido', precio: 'USD 200K', periodo: '+ USD 50K/año', desc: 'CLOUD + on-premise en el puerto. Cumple requisitos de soberanía de datos. RECOMENDADO.', color: C.aisCyan, popular: true },
    { nombre: 'On-Premise', precio: 'USD 500K', periodo: '+ USD 80K/año soporte', desc: 'Instalación 100% local. Para puertos con requisitos altos de seguridad física.', color: C.alertAmber, popular: false },
  ]

  planes.forEach((p, i) => {
    const x = 0.5 + i * 4.2
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.9, w: 4, h: 4.6,
      fill: { color: C.bgCard },
      line: { color: p.color, width: p.popular ? 3 : 1 },
      rectRadius: 0.2,
    })
    if (p.popular) {
      s.addShape(pres.ShapeType.roundRect, {
        x: x + 1.2, y: 1.7, w: 1.6, h: 0.4,
        fill: { color: p.color },
        line: { type: 'none' },
        rectRadius: 0.1,
      })
      s.addText('RECOMENDADO', {
        x: x + 1.2, y: 1.7, w: 1.6, h: 0.4,
        fontSize: 11, bold: true, color: C.bgDeep, align: 'center', valign: 'middle',
      })
    }
    s.addText(p.nombre, {
      x: x + 0.3, y: 2.3, w: 3.4, h: 0.5,
      fontSize: 22, bold: true, color: C.white, align: 'center',
    })
    s.addText(p.precio, {
      x: x + 0.3, y: 2.9, w: 3.4, h: 0.7,
      fontSize: 30, bold: true, color: p.color, align: 'center',
    })
    s.addText(p.periodo, {
      x: x + 0.3, y: 3.6, w: 3.4, h: 0.3,
      fontSize: 12, italic: true, color: C.textSecondary, align: 'center',
    })
    s.addShape(pres.ShapeType.line, {
      x: x + 0.5, y: 4.1, w: 3, h: 0,
      line: { color: p.color, width: 1, dashType: 'dash' },
    })
    s.addText(p.desc, {
      x: x + 0.4, y: 4.3, w: 3.2, h: 2.0,
      fontSize: 13, color: C.textSecondary, align: 'center', valign: 'top',
    })
  })

  s.addText('Incluye: Capacitación · Soporte 24/7 · Actualizaciones · Cumplimiento normativo · Auditoría ISO 27001 inicial', {
    x: 0.5, y: 6.7, w: 12.3, h: 0.4,
    fontSize: 13, bold: true, italic: true, color: C.radarGreen, align: 'center',
  })
}

// ============ SLIDE 14 — Cierre con CTA ============
{
  const s = pres.addSlide()
  addDarkBg(s, { color: C.bgDeep })
  // Decoración
  s.addShape(pres.ShapeType.ellipse, {
    x: -3, y: -3, w: 8, h: 8,
    fill: { color: C.bgCard, transparency: 40 },
    line: { type: 'none' },
  })
  s.addShape(pres.ShapeType.ellipse, {
    x: 8, y: 3, w: 7, h: 7,
    fill: { color: C.aisCyan, transparency: 85 },
    line: { type: 'none' },
  })

  // Título
  s.addText('¿Listo para modernizar', {
    x: 0.5, y: 1.8, w: 12.3, h: 0.8,
    fontSize: 44, bold: true, color: C.white, align: 'center',
  })
  s.addText('el control de tráfico marítimo?', {
    x: 0.5, y: 2.5, w: 12.3, h: 0.8,
    fontSize: 44, bold: true, color: C.radarGreen, align: 'center',
  })

  // Caja de CTA
  s.addShape(pres.ShapeType.roundRect, {
    x: 2.5, y: 4.0, w: 8.3, h: 1.8,
    fill: { color: C.cta },
    line: { type: 'none' },
    rectRadius: 0.3,
  })
  s.addText('Solicita una demostración en vivo', {
    x: 2.5, y: 4.1, w: 8.3, h: 0.6,
    fontSize: 22, bold: true, color: C.bgDeep, align: 'center',
  })
  s.addText('en el Centro de Control VTS de tu puerto', {
    x: 2.5, y: 4.7, w: 8.3, h: 0.4,
    fontSize: 16, italic: true, color: C.bgDeep, align: 'center',
  })
  s.addText('→ 60 minutos y verás el sistema en operación real ←', {
    x: 2.5, y: 5.15, w: 8.3, h: 0.5,
    fontSize: 16, bold: true, color: C.bgDeep, align: 'center',
  })

  // Contacto
  s.addText('Contacto comercial', {
    x: 0.5, y: 6.0, w: 12.3, h: 0.4,
    fontSize: 14, bold: true, color: C.textSecondary, align: 'center',
  })
  s.addText('comercial@maritimevts.cl  ·  +56 32 XXX XXX  ·  https://maritime-vts-valparaiso.vercel.app', {
    x: 0.5, y: 6.4, w: 12.3, h: 0.4,
    fontSize: 14, color: C.aisCyan, align: 'center',
  })
  s.addText('— Gracias por su atención —', {
    x: 0.5, y: 6.9, w: 12.3, h: 0.3,
    fontSize: 12, italic: true, color: C.textMuted, align: 'center',
  })
}

// ============ GENERAR ============
const outputPath = '/home/z/my-project/download/MaritimeVTS-Pitch-Deck-Ejecutivo.pptx'

pres.write({ outputType: 'nodebuffer' })
  .then((buffer) => {
    writeFileSync(outputPath, buffer as Buffer)
    console.log(`✓ PPTX generado: ${outputPath}`)
    console.log(`  Tamaño: ${(buffer as Buffer).length / 1024 / 1024} MB`)
    console.log(`  Slides: ${TOTAL}`)
    console.log('')
    console.log('📋 Contenido:')
    console.log('  1. Portada impactante')
    console.log('  2. El problema actual (6 pain points)')
    console.log('  3. La solución: MaritimeVTS')
    console.log('  4. Dashboard en vivo (captura)')
    console.log('  5. 5 capacidades clave')
    console.log('  6. IA Victoria — copiloto marítimo')
    console.log('  7. Radio Walkie-Talkie con IA (captura)')
    console.log('  8. Informes ejecutivos en 1 clic')
    console.log('  9. Cumplimiento normativo completo')
    console.log(' 10. Centro de control en operación (captura)')
    console.log(' 11. Plan de entrega 60 días')
    console.log(' 12. Comparativa vs Kongsberg/Wärtsilä')
    console.log(' 13. Precio y modelo comercial (3 planes)')
    console.log(' 14. Cierre con CTA')
  })
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
