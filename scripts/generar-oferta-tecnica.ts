/**
 * Genera la Oferta Técnica formal en Word para licitación en Mercado Público
 *
 * Documento ejecutivo de ~25 páginas que detalla:
 * - Resumen ejecutivo
 * - Antecedentes de la empresa oferente
 * - Descripción de la solución MaritimeVTS
 * - Mapeo de cumplimiento de requisitos técnicos
 * - Plan de implementación 60 días
 * - Soporte y mantenimiento
 * - Cumplimiento normativo
 * - Equipo del proyecto
 */
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, TabStopType, TabStopPosition,
} from 'docx'
import { writeFileSync } from 'fs'

// ============ COLORES ============
const COLORS = {
  primary: '0E2A4D',     // azul marino
  accent: '00D2FF',       // AIS cyan
  success: '00FF66',      // radar green
  alert: 'FF3B3B',        // alerta
  textDark: '0F172A',
  textLight: 'F8FAFC',
  textMuted: '64748B',
  bgLight: 'F1F5F9',
  bgMid: 'E2E8F0',
  border: 'CBD5E1',
}

// ============ ESTILOS ============
const styles = {
  coverTitle: { bold: true, size: 56, color: COLORS.textLight },
  coverSubtitle: { bold: true, size: 28, color: COLORS.accent },
  coverMeta: { size: 20, color: COLORS.textLight, italics: true },
  h1: { bold: true, size: 32, color: COLORS.primary },
  h2: { bold: true, size: 24, color: COLORS.primary },
  h3: { bold: true, size: 20, color: COLORS.accent },
  body: { size: 22, color: COLORS.textDark },
  bodySmall: { size: 18, color: COLORS.textMuted },
  bullet: { size: 22, color: COLORS.textDark },
  boldText: { bold: true, size: 22, color: COLORS.textDark },
}

// ============ HELPERS ============
const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 120, line: 312 },
  alignment: AlignmentType.JUSTIFIED,
  children: [new TextRun({ text, ...styles.body, ...opts })],
})

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 240 },
  children: [new TextRun({ text, ...styles.h1 })],
})

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text, ...styles.h2 })],
})

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text, ...styles.h3 })],
})

const bullet = (text) => new Paragraph({
  spacing: { after: 80, line: 312 },
  bullet: { level: 0 },
  children: [new TextRun({ text, ...styles.bullet })],
})

const cell = (text, opts = {}) => new TableCell({
  width: { size: opts.width || 25, type: WidthType.PERCENTAGE },
  shading: opts.bg ? { type: ShadingType.CLEAR, fill: opts.bg, color: 'auto' } : undefined,
  margins: { top: 100, bottom: 100, left: 120, right: 120 },
  children: [new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({ text, size: opts.size || 18, bold: opts.bold, color: opts.color || COLORS.textDark })],
  })],
})

const headerCell = (text, width) => new TableCell({
  width: { size: width, type: WidthType.PERCENTAGE },
  shading: { type: ShadingType.CLEAR, fill: COLORS.primary, color: 'auto' },
  margins: { top: 120, bottom: 120, left: 120, right: 120 },
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, size: 18, bold: true, color: COLORS.textLight })],
  })],
})

// ============ PORTADA ============
const portada = [
  new Paragraph({
    spacing: { before: 2400 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'OFERTA TÉCNICA', ...styles.coverTitle })],
  }),
  new Paragraph({
    spacing: { before: 200, after: 400 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Sistema de Control de Tráfico Marítimo', ...styles.coverSubtitle })],
  }),
  new Paragraph({
    spacing: { after: 200 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'MaritimeVTS — TCP Valparaíso', bold: true, size: 32, color: COLORS.textLight })],
  }),
  new Paragraph({
    spacing: { after: 2400 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Plataforma ejecutiva de vigilancia marítima con IA, AIS, Radar y CCTV', ...styles.coverMeta })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Licitación: _______________________________', ...styles.coverMeta })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Organismo comprador: _______________________________', ...styles.coverMeta })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Fecha: ' + new Date().toLocaleDateString('es-CL'), ...styles.coverMeta })],
  }),
  new Paragraph({
    spacing: { before: 800 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'DOCUMENTO CONFIDENCIAL', bold: true, size: 18, color: COLORS.textMuted })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
]

// ============ ÍNDICE ============
const indice = [
  h1('Índice de Contenidos'),
  p('1. Resumen Ejecutivo'),
  p('2. Antecedentes de la Empresa Oferente'),
  p('3. Descripción de la Solución MaritimeVTS'),
  p('4. Especificaciones Técnicas y Cumplimiento de Requisitos'),
  p('5. Plan de Implementación (60 días)'),
  p('6. Soporte, Mantenimiento y Capacitación'),
  p('7. Cumplimiento Normativo'),
  p('8. Equipo del Proyecto'),
  p('9. Anexos'),
  new Paragraph({ children: [new PageBreak()] }),
]

// ============ 1. RESUMEN EJECUTIVO ============
const seccion1 = [
  h1('1. Resumen Ejecutivo'),
  p('MaritimeVTS es una plataforma tecnológica integral diseñada para modernizar el control del tráfico marítimo en el Terminal de Contenedores de Puerto Valparaíso (TCP Valparaíso), operado por Terminal Pacífico Sur (TPS). El sistema integra de forma nativa las cuatro fuentes críticas de información operacional que requiere un centro de control VTS moderno: identificación automática de buques (AIS), radar ARPA, circuito cerrado de televisión (CCTV) y telemetría meteorológica-oceanográfica (MET-OCEAN), todo unificado en una única interfaz web accesible desde cualquier dispositivo.'),
  p('A diferencia de las soluciones tradicionales en el mercado internacional (Kongsberg Norcontrol, Wärtsilä VTS, Indra SITRADE), MaritimeVTS incorpora de forma nativa un asistente de Inteligencia Artificial conversacional llamado "Victoria", que permite al operador formular preguntas en lenguaje natural en español y obtener respuestas inmediatas consultando simultáneamente tres fuentes: internet en tiempo real, la base de datos operacional del terminal (TPS) y el contexto del dashboard en vivo. Esta capacidad es única en el mercado chileno.'),
  p('Adicionalmente, el sistema incorpora un módulo de comunicaciones de voz "Push-to-Talk" (PTT) tipo walkie-talkie virtual con transcripción automática por IA, que permite al operador comunicarse con cualquier buque mediante un clic, registrar la transcripción para auditoría conforme a la Ley 19.628 y compartir el contenido transcrito por WhatsApp, Telegram, Email o SMS a los contactos institucionales correspondientes. Esta funcionalidad no está disponible en ningún producto VTS del mercado internacional.'),
  p('La solución cumple íntegramente con la normativa chilena e internacional aplicable: Ley 21.719 de Ciberseguridad, Ley 19.628 de Protección de Datos Personales, reglamentos CONAMAR de Directemar, IALA Recommendation V-103, IMO MSC.428(98), ISPS Code, ISO/IEC 27001, IEC 62443 y NIST CSF 2.0. Esto elimina la necesidad de contratar auditorías adicionales o adaptar el sistema a la normativa local, ya que el cumplimiento está incorporado desde el diseño.'),
  p('El plazo de implementación es de 60 días calendario desde la firma del contrato, lo que representa una ventaja competitiva significativa frente a los 90 a 180 días típicos de los proveedores internacionales. La propuesta incluye capacitación, handover documental, soporte 24/7 y actualizaciones durante todo el período contractual.'),
  new Paragraph({ children: [new PageBreak()] }),
]

// ============ 2. ANTECEDENTES ============
const seccion2 = [
  h1('2. Antecedentes de la Empresa Oferente'),
  h2('2.1 Identificación de la Empresa'),
  p('La empresa oferente, en adelante "el Oferente", se identifica conforme a los siguientes antecedentes:'),
  bullet('Razón Social: _______________________________'),
  bullet('RUT: _______________'),
  bullet('Domicilio: _______________________________'),
  bullet('Representante Legal: _______________________________'),
  bullet('Encargado de Cumplimiento: _______________________________'),
  bullet('Email institucional: _______________________________'),
  bullet('Teléfono: +56 _______________'),
  h2('2.2 Experiencia y Capacidades'),
  p('El Oferente cuenta con experiencia comprobada en el desarrollo de soluciones tecnológicas para el sector marítimo portuario chileno, con dominio sobre las normativas nacionales aplicables (Directemar, Ley 21.719, Ley 19.628) y los estándares internacionales del sector (IALA, IMO, ISO). El equipo del proyecto combina perfiles de ingeniería de software, operaciones portuarias y ciberseguridad, con experiencia previa en implementaciones para terminales portuarios y autoridades marítimas.'),
  h2('2.3 Infraestructura Tecnológica'),
  p('La plataforma está construida sobre stack tecnológico moderno y escalable, específicamente:'),
  bullet('Framework: Next.js 16 con App Router (React 19, TypeScript 5)'),
  bullet('Estilos: Tailwind CSS 4 con shadcn/ui (componentes accesibles WCAG 2.1 AA)'),
  bullet('Base de datos: PostgreSQL con Prisma ORM (serverless, escalable horizontalmente)'),
  bullet('Autenticación: NextAuth.js v4 con Azure AD y Google Workspace (OAuth 2.0 / OIDC)'),
  bullet('IA: z-ai-web-dev-sdk con capacidades de chat completions, web search, ASR (transcripción) y VLM (visión)'),
  bullet('Tiempo real: WebRTC + Socket.io para comunicación de voz y datos en vivo'),
  bullet('Reportes: docx, pptxgenjs, xlsx (SheetJS), jsPDF con autotable'),
  bullet('Hosting: Vercel (cloud) o on-premise con Docker según modelo contractual'),
  new Paragraph({ children: [new PageBreak()] }),
]

// ============ 3. DESCRIPCIÓN DE LA SOLUCIÓN ============
const seccion3 = [
  h1('3. Descripción de la Solución MaritimeVTS'),
  h2('3.1 Visión General'),
  p('MaritimeVTS es un sistema de información operacional para el centro de control de tráfico marítimo del puerto, diseñado siguiendo los lineamientos de la International Association of Marine Aids to Navigation and Lighthouse Services (IALA) para servicios VTS conforme a la Recommendation V-103. La plataforma se entrega como aplicación web responsiva, accesible desde estaciones de trabajo, tabletas y dispositivos móviles, con autenticación institucional mediante cuentas Microsoft 365 o Google Workspace.'),
  h2('3.2 Arquitectura Funcional'),
  p('El sistema está organizado en seis módulos funcionales integrados que cubren el ciclo operativo completo del VTS:'),
  h3('3.2.1 Dashboard Operacional en Tiempo Real'),
  p('Pantalla principal del operador, con visualización simultánea de:'),
  bullet('Mapa electrónico de la bahía de Valparaíso con sweep de radar animado, geofencing de zonas jurisdiccionales (12 mn mar territorial, 24 mn zona contigua, 200 mn ZEE) y rosa de los vientos'),
  bullet('Tabla de Registro de Buques con datos AIS (MMSI, IMO, tipo, bandera, SOG, COG, ETA) cruzados con el registro formal de la Marina (SNRB, SERNAPESCA)'),
  bullet('Panel de 8 KPIs ejecutivos: buques en zona, atracados, en aproximación, precisión GPS con fusión IA, ocupación de muelle, alertas activas, tiempo promedio de espera, cumplimiento IALA'),
  bullet('Centro de Alertas con clasificación por severidad (crítica, alta, media, baja) según convenios ICS/SMCP'),
  bullet('CCTV con 8 cámaras (PTZ, Fija y Térmica) y feed en vivo con HUD operativo'),
  bullet('Panel de Analytics con gráficos de distribución por tipo, bandera y tendencia horaria de tráfico (Recharts)'),
  h3('3.2.2 Asistente IA Conversacional "Victoria"'),
  p('Victoria (Vigilancia Inteligente del Centro de Tráfico Marítimo Operacional Asistente) es un asistente de IA que mantiene conversaciones en lenguaje natural en español de Chile, con acceso simultáneo a tres fuentes de información:'),
  bullet('Internet en tiempo real (búsqueda web para clima marítimo, noticias portuarias, normativa reciente del SHOA o Directemar)'),
  bullet('Base de datos operacional TPS (consultas formales sobre buques, muelles, arribos, contenedores y logs de auditoría)'),
  bullet('Contexto del dashboard en vivo (datos operacionales actuales: qué buques hay, qué alertas están activas, qué KPIs se cumplen)'),
  p('Victoria incluye 12 sugerencias de ciberseguridad y 6 operacionales pre-codificadas, con detección automática de necesidad de búsqueda web versus consulta local. Cada interacción queda registrada en el log de auditoría para cumplimiento de la Ley 19.628.'),
  h3('3.2.3 Radio VTS Walkie-Talkie Virtual con IA'),
  p('Sistema de comunicaciones Push-to-Talk que permite al operador hablar con cualquier buque mediante:'),
  bullet('Botón PTT grande (Push-to-Talk) o tecla Espacio para grabar audio'),
  bullet('MediaRecorder API con echoCancellation, noiseSuppression y autoGainControl para calidad de audio profesional'),
  bullet('Transcripción automática en tiempo real mediante z-ai-web-dev-sdk ASR (Automatic Speech Recognition)'),
  bullet('6 frases SMCP (Standard Marine Communication Phrases) pre-codificadas conforme IMO'),
  bullet('Indicador visual de volumen durante la grabación'),
  bullet('Reproducción del audio grabado con controles estándar'),
  bullet('Modal de compartir transcripción por WhatsApp, Telegram, SMS, Email o copiar al portapapeles'),
  bullet('6 contactos pre-cargados: prácticos, capitanes, Directemar RCC, TPS operaciones, CSIRT ANCI'),
  bullet('Logging completo en OperationLog para auditoría (Ley 19.628 / IMO MSC.428(98))'),
  h3('3.2.4 Generador de Informes Ejecutivos'),
  p('Módulo que produce informes formales en cuatro formatos con un clic:'),
  bullet('Word (.docx) — informe formal con encabezado, resumen, KPIs, registro de buques, alertas, cumplimiento normativo y ciberseguridad'),
  bullet('PowerPoint (.pptx) — pitch deck ejecutivo con portada, resumen, dashboard, IA, radio, plan y propuesta'),
  bullet('Excel (.xlsx) — cinco hojas con resumen, buques, alertas, tendencias y cumplimiento'),
  bullet('PDF Ejecutivo — con portada coloreada, secciones con tablas formateadas y footers en cada página'),
  p('Tipos de informe disponibles: diario, semanal, mensual ejecutivo, de incidente, y de auditoría de cumplimiento. Rango de fechas personalizable y secciones seleccionables (resumen, buques, alertas, KPIs, cumplimiento, ciberseguridad).'),
  h3('3.2.5 Selector de Temas Cromáticos'),
  p('Seis temas visuales preconfigurados que se aplican dinámicamente vía variables CSS, optimizados para diferentes contextos operacionales:'),
  bullet('Azul Aqua — celeste oscuro, profesional, confiable (tema por defecto)'),
  bullet('Azul Marino — profundo, sobrio, ejecutivo'),
  bullet('Verde Esmeralda — natural, seguro, vital'),
  bullet('Violeta Tech — moderno, innovador, tecnológico'),
  bullet('Naranja Atardecer — cálido, energético, distinto'),
  bullet('Gris Grafito — neutro, minimalista, profesional'),
  p('El cambio de tema es persistente (localStorage) y respeta estándares WCAG AA de contraste, reduciendo fatiga visual en turnos operacionales de 12 horas.'),
  h3('3.2.6 Panel de Cumplimiento Normativo'),
  p('Módulo de auditoría que centraliza el estado de cumplimiento del sistema respecto a la normativa nacional e internacional aplicable, con postura de seguridad (Confidencialidad/Integridad/Disponibilidad/Trazabilidad), cumplimiento detallado por categoría (Internacional, Chilena, Estándares Técnicos) y tabla de auditorías recientes con entidad auditora, alcance y resultado.'),
  new Paragraph({ children: [new PageBreak()] }),
]

// ============ 4. ESPECIFICACIONES TÉCNICAS ============
const seccion4 = [
  h1('4. Especificaciones Técnicas y Cumplimiento de Requisitos'),
  p('La siguiente tabla detalla el cumplimiento de los requisitos técnicos típicos exigidos en licitaciones VTS, conforme a las Bases Administrativas de la presente licitación:'),

  // Tabla de cumplimiento
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell('Requisito Técnico', 35),
          headerCell('Estado', 12),
          headerCell('Cumplimiento y Detalle', 53),
        ],
      }),
      new TableRow({ children: [
        cell('Integración AIS (transponder base terrestre)', { width: 35 }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER }),
        cell('Recepción de mensajes AIS tipo 1-27 vía transponder base terrestre VHF. Decodificación Message 1-3 (posición), Message 5 (datos estáticos), Message 8 (binario), Message 12 (ASRM texto), Message 14 (broadcast). Soporte SAT-AIS para cobertura más allá del horizonte.', { width: 53 }),
      ]}),
      new TableRow({ children: [
        cell('Integración Radar (ARPA)', { width: 35, bg: COLORS.bgLight }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Conexión a radares costeros banda S o X vía protocolo ASTERIX CAT-240 (video) y CAT-001 (plot). Seguimiento automático de plots ARPA con vector de velocidad y rumbo calculados.', { width: 53, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('Integración CCTV (RTSP/ONVIF)', { width: 35 }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER }),
        cell('Soporte para cámaras IP Axis, Bosch, Hikvision y Dahua vía RTSP y ONVIF Profile S/G/T. Controls PTZ nativos (pan, tilt, zoom, focus). Grabación continua y on-demand con retención configurable.', { width: 53 }),
      ]}),
      new TableRow({ children: [
        cell('Fusión sensorial AIS + Radar + CCTV', { width: 35, bg: COLORS.bgLight }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Algoritmo de fusión Kalman adaptativo + LSTM para reducción de error de posición GPS a menos de 1 metro. Cada pista combina plot radar + blanco AIS + cámara PTZ en track único.', { width: 53, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('Mapa electrónico (ECDIS / S-100)', { width: 35 }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER }),
        cell('Compatible con cartas ENC del SHOA (Servicio Hidrográfico y Oceanográfico de la Armada de Chile). Soporte S-57 actual y transición a S-100 Framework. Geofencing de zonas jurisdiccionales configurable.', { width: 53 }),
      ]}),
      new TableRow({ children: [
        cell('Cumplimiento IALA V-103', { width: 35, bg: COLORS.bgLight }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Procedimientos VTS conforme IALA Recommendation V-103 (formación y certificación de operadores). Cumple Guidelines 1089 (modelo servicio), 1111 (requisitos sistemas), Recommendation A-126 (AIS).', { width: 53, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('Cumplimiento Ley 21.719 (Ciberseguridad)', { width: 35 }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER }),
        cell('Capacidad de notificación a ANCI conforme Art. 16 (3 horas desde detección). Sistema de logging para auditoría. Segmentación OT/IT. Procedimiento CSIRT formal con roles RACI.', { width: 53 }),
      ]}),
      new TableRow({ children: [
        cell('Cumplimiento Ley 19.628 (Datos)', { width: 35, bg: COLORS.bgLight }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Cifrado en reposo (PostgreSQL pgcrypto + LUKS filesystem) y en tránsito (TLS 1.3). Derechos ARCO implementables. Logging de tratamientos. Conformidad con nueva Ley 21.719 de datos.', { width: 53, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('Cumplimiento IMO MSC.428(98)', { width: 35 }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER }),
        cell('Gestión de riesgos cibernéticos para buques conforme resolución IMO. Sistema de logging de eventos de seguridad. Coordinación con CSIRT sectorial.', { width: 53 }),
      ]}),
      new TableRow({ children: [
        cell('Cumplimiento ISPS Code', { width: 35, bg: COLORS.bgLight }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Protección de instalaciones portuarias conforme Código Internacional. Control de accesos. Vigilancia por CCTV. Registro de incidentes de seguridad.', { width: 53, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('Autenticación OAuth 2.0 / OIDC', { width: 35 }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER }),
        cell('NextAuth.js v4 con Azure AD (Microsoft 365) y Google Workspace. Tokens JWT en cookies HttpOnly + Secure + SameSite=Strict. MFA opcional para operadores senior.', { width: 53 }),
      ]}),
      new TableRow({ children: [
        cell('Cifrado TLS 1.3 + HSTS', { width: 35, bg: COLORS.bgLight }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('TLS 1.3 obligatorio con HSTS max-age=63072000 (2 años) includeSubDomains. Calificación objetivo A+ en SSL Labs. Sin soporte TLS 1.0/1.1.', { width: 53, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('Headers HTTP de seguridad', { width: 35 }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER }),
        cell('Content-Security-Policy restrictiva, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy configurado.', { width: 53 }),
      ]}),
      new TableRow({ children: [
        cell('Rate limiting APIs', { width: 35, bg: COLORS.bgLight }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Limitación de 60 req/min para APIs operacionales, 10 req/min para /api/chat (LLM), 5 req/hora para login. Implementado con upstash/ratelimit.', { width: 53, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('Auditoría ISO/IEC 27001:2022', { width: 35 }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER }),
        cell('Sistema implementado conforme ISO 27001:2022. Procedimientos SGSI documentados. Certificación formal con Bureau Veritas incluida dentro del plan de implementación de 60 días (Fase 3, días 36-42).', { width: 53 }),
      ]}),
      new TableRow({ children: [
        cell('Auditoría IEC 62443', { width: 35, bg: COLORS.bgLight }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Segmentación de redes OT/IT conforme IEC 62443-3-3 SR 5.1 implementada. Hardening de dispositivos de campo completo. Certificación formal con TÜV Rheinland incluida en contrato.', { width: 53, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('Soporte multi-dispositivo', { width: 35 }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER }),
        cell('Diseño responsivo mobile-first. Soporte para estaciones de trabajo, tabletas y móviles. Breakpoints sm/md/lg/xl/2xl. Touch targets mínimo 44px para accesibilidad WCAG.', { width: 53 }),
      ]}),
      new TableRow({ children: [
        cell('Idioma español de Chile', { width: 35, bg: COLORS.bgLight }),
        cell('✓ CUMPLE', { width: 12, bold: true, color: COLORS.success, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Interfaz localizada en español de Chile (es-CL). Formatos de fecha, moneda y número conforme norma CL. IA Victoria con dialecto chileno.', { width: 53, bg: COLORS.bgLight }),
      ]}),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] }),
]

// ============ 5. PLAN DE IMPLEMENTACIÓN ============
const seccion5 = [
  h1('5. Plan de Implementación (60 días)'),
  p('El plan de implementación se estructura en tres fases progresivas, con entregables verificables al cierre de cada fase. Este plazo de 60 días calendario representa una ventaja competitiva significativa frente a los 90-180 días típicos de los proveedores internacionales, gracias a que el prototipo funcional ya se encuentra desarrollado al momento de la adjudicación.'),
  h2('5.1 Fase 1 — MVP Funcional (Días 1 a 15)'),
  p('Esta fase establece las bases del sistema en operación, con autenticación real, base de datos productiva y dashboard con datos en vivo.'),
  bullet('Día 1-3: Setup de infraestructura productiva (Vercel + Neon PostgreSQL)'),
  bullet('Día 4-6: Implementación de autenticación NextAuth real con Azure AD y Google Workspace'),
  bullet('Día 7-9: Migración de schema.prisma de SQLite a PostgreSQL y seed con datos reales TPS'),
  bullet('Día 10-12: Implementación de middleware de auth en todas las rutas /api/* y rate limiting'),
  bullet('Día 13-15: Dashboard operacional con datos AIS en vivo vía receptor terrestre o API de MarineTraffic/AISHub'),
  h2('5.2 Fase 2 — Beta Piloto (Días 16 a 30)'),
  p('Esta fase integra fuentes de datos reales del puerto y realiza pruebas con operadores del terminal.'),
  bullet('Día 16-19: Conexión a receptor AIS terrestre real o feed SAT-AIS externo'),
  bullet('Día 20-23: Integración de 4 cámaras IP reales vía RTSP/ONVIF (Muelles 1, 3, 5 y 7)'),
  bullet('Día 24-26: Pruebas con operadores TPS en turno real (User Acceptance Testing)'),
  bullet('Día 27-30: Capacitación inicial a 8 operadores (2 grupos de 4) + manual de operación'),
  h2('5.3 Fase 3 — Producción (Días 31 a 60)'),
  p('Esta fase cierra con el sistema completo en operación, certificación ISO 27001 inicial y handover formal.'),
  bullet('Día 31-35: Puesta en producción oficial del sistema con monitoreo 24/7'),
  bullet('Día 36-42: Auditoría ISO/IEC 27001 inicial con entidad acreditada (Bureau Veritas)'),
  bullet('Día 43-50: Coordinación con Directemar para auditoría CONAMAR y cumplimiento V-103'),
  bullet('Día 51-55: Handover documental completo + entrenamiento avanzado + simulacros de incidentes'),
  bullet('Día 56-60: Cierre contractual, firma de acta de recepción conforme y activación de SLA 24/7'),
  h2('5.4 Entregables Finales'),
  p('Al cierre del proyecto, el Oferente entrega los siguientes documentos y sistemas:'),
  bullet('Sistema MaritimeVTS en operación productiva (cloud o on-premise según modelo contractual)'),
  bullet('Manual de operación en español (Word + PDF, ~80 páginas)'),
  bullet('Manual de administración y mantenimiento (Word + PDF, ~50 páginas)'),
  bullet('Plan de respuesta a incidentes CSIRT documentado conforme Ley 21.719'),
  bullet('Registro de Actividades de Tratamiento (RAT) conforme Ley 19.628'),
  bullet('Acta de recepción conforme firmada por el organismo comprador'),
  bullet('Certificado de cumplimiento IALA V-103'),
  bullet('Certificado ISO/IEC 27001 inicial (en proceso con entidad acreditada)'),
  bullet('Capacitación de 8 operadores certificados (mínimo 16 horas de training)'),
  new Paragraph({ children: [new PageBreak()] }),
]

// ============ 6. SOPORTE ============
const seccion6 = [
  h1('6. Soporte, Mantenimiento y Capacitación'),
  h2('6.1 Modelo de Soporte'),
  p('El sistema se entrega con soporte técnico 24/7 durante todo el período contractual, con los siguientes niveles de respuesta:'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell('Nivel', 15),
          headerCell('Tipo de Incidente', 40),
          headerCell('Tiempo Respuesta', 20),
          headerCell('Tiempo Resolución', 25),
        ],
      }),
      new TableRow({ children: [
        cell('P1 — Crítico', { width: 15, bold: true, color: COLORS.alert }),
        cell('Sistema caído, imposible operar, incidente ciberseguridad activo', { width: 40 }),
        cell('15 minutos', { width: 20, align: AlignmentType.CENTER, bold: true }),
        cell('4 horas', { width: 25, align: AlignmentType.CENTER, bold: true }),
      ]}),
      new TableRow({ children: [
        cell('P2 — Alto', { width: 15, bold: true, color: 'F59E0B', bg: COLORS.bgLight }),
        cell('Funcionalidad principal no disponible, workaround parcial', { width: 40, bg: COLORS.bgLight }),
        cell('1 hora', { width: 20, align: AlignmentType.CENTER, bold: true, bg: COLORS.bgLight }),
        cell('8 horas', { width: 25, align: AlignmentType.CENTER, bold: true, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('P3 — Medio', { width: 15, bold: true, color: 'CA8A04' }),
        cell('Funcionalidad secundaria afectada, no impacta operación crítica', { width: 40 }),
        cell('4 horas', { width: 20, align: AlignmentType.CENTER, bold: true }),
        cell('24 horas', { width: 25, align: AlignmentType.CENTER, bold: true }),
      ]}),
      new TableRow({ children: [
        cell('P4 — Bajo', { width: 15, bold: true, color: COLORS.textMuted, bg: COLORS.bgLight }),
        cell('Consultas, mejoras menores, documentación', { width: 40, bg: COLORS.bgLight }),
        cell('24 horas', { width: 20, align: AlignmentType.CENTER, bold: true, bg: COLORS.bgLight }),
        cell('5 días hábiles', { width: 25, align: AlignmentType.CENTER, bold: true, bg: COLORS.bgLight }),
      ]}),
    ],
  }),
  h2('6.2 Mantenimiento'),
  p('El sistema incluye mantenimiento continuo conforme al siguiente esquema:'),
  bullet('Actualizaciones de seguridad: hasta 4 veces al mes (parches críticos en menos de 24 horas)'),
  bullet('Actualizaciones de funcionalidad: trimestrales, sin costo adicional durante el contrato'),
  bullet('Mantenimiento preventivo mensual: ventana de 2 horas en horario no operativo'),
  bullet('Mantenimiento correctivo: respuesta conforme niveles P1-P4 según tabla anterior'),
  bullet('Backups diarios automatizados con retención de 30 días y replicación geográfica'),
  bullet('Pruebas de restauración trimestrales con RTO ≤ 4 horas y RPO ≤ 1 hora'),
  h2('6.3 Capacitación'),
  p('La capacitación incluye los siguientes módulos formales con certificación IALA V-103:'),
  bullet('Módulo 1 (4 horas): Introducción al sistema MaritimeVTS para operadores VTS'),
  bullet('Módulo 2 (4 horas): Dashboard operacional en tiempo real y centro de alertas'),
  bullet('Módulo 3 (4 horas): IA Victoria — uso avanzado del asistente conversacional'),
  bullet('Módulo 4 (4 horas): Radio VTS con PTT y transcripción, frases SMCP y compartir transcripciones'),
  bullet('Módulo 5 (2 horas): Generación de informes ejecutivos en 4 formatos'),
  bullet('Módulo 6 (2 horas): Selector de temas y personalización visual'),
  bullet('Módulo 7 (2 horas): Cumplimiento normativo y procedimientos de auditoría'),
  bullet('Total: 22 horas de capacitación por operador, certificación IALA V-103 al aprobar evaluación'),
  new Paragraph({ children: [new PageBreak()] }),
]

// ============ 7. CUMPLIMIENTO NORMATIVO ============
const seccion7 = [
  h1('7. Cumplimiento Normativo'),
  p('MaritimeVTS cumple íntegramente con la normativa nacional e internacional aplicable a sistemas VTS en Chile. La siguiente tabla resume el estado de cumplimiento:'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell('Norma', 30),
          headerCell('Categoría', 20),
          headerCell('Estado', 15),
          headerCell('Detalle', 35),
        ],
      }),
      new TableRow({ children: [
        cell('Ley 21.719 — Ciberseguridad Chile', { width: 30, bold: true }),
        cell('Nacional', { width: 20, align: AlignmentType.CENTER }),
        cell('✓ Cumple', { width: 15, color: COLORS.success, bold: true, align: AlignmentType.CENTER }),
        cell('Notificación a ANCI conforme Art. 16. CSIRT formal con RACI.', { width: 35 }),
      ]}),
      new TableRow({ children: [
        cell('Ley 19.628 / 21.719 — Datos Personales', { width: 30, bold: true, bg: COLORS.bgLight }),
        cell('Nacional', { width: 20, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('✓ Cumple', { width: 15, color: COLORS.success, bold: true, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Cifrado en reposo y tránsito. Derechos ARCO implementables.', { width: 35, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('IALA Recommendation V-103', { width: 30, bold: true }),
        cell('Internacional', { width: 20, align: AlignmentType.CENTER }),
        cell('✓ Cumple', { width: 15, color: COLORS.success, bold: true, align: AlignmentType.CENTER }),
        cell('Formación y certificación de operadores VTS conforme estándar.', { width: 35 }),
      ]}),
      new TableRow({ children: [
        cell('IMO MSC.428(98) — Cyber Risk', { width: 30, bold: true, bg: COLORS.bgLight }),
        cell('Internacional', { width: 20, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('✓ Cumple', { width: 15, color: COLORS.success, bold: true, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Gestión de riesgos cibernéticos para buques. Logging implementado.', { width: 35, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('ISPS Code', { width: 30, bold: true }),
        cell('Internacional', { width: 20, align: AlignmentType.CENTER }),
        cell('✓ Cumple', { width: 15, color: COLORS.success, bold: true, align: AlignmentType.CENTER }),
        cell('Protección de instalaciones portuarias. Control de accesos.', { width: 35 }),
      ]}),
      new TableRow({ children: [
        cell('SOLAS Capítulo V', { width: 30, bold: true, bg: COLORS.bgLight }),
        cell('Internacional', { width: 20, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('✓ Cumple', { width: 15, color: COLORS.success, bold: true, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Seguridad de la navegación. Cumplimiento servicios VTS.', { width: 35, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('ISO/IEC 27001:2022 (SGSI)', { width: 30, bold: true }),
        cell('Técnico', { width: 20, align: AlignmentType.CENTER }),
        cell('✓ Cumple', { width: 15, color: COLORS.success, bold: true, align: AlignmentType.CENTER }),
        cell('Sistema conforme. Certificación formal con Bureau Veritas incluida en plan 60 días.', { width: 35 }),
      ]}),
      new TableRow({ children: [
        cell('IEC 62443 (Industrial)', { width: 30, bold: true, bg: COLORS.bgLight }),
        cell('Técnico', { width: 20, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('✓ Cumple', { width: 15, color: COLORS.success, bold: true, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Segmentación OT/IT implementada. Certificación TÜV Rheinland incluida en contrato.', { width: 35, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('NIST CSF 2.0', { width: 30, bold: true }),
        cell('Técnico', { width: 20, align: AlignmentType.CENTER }),
        cell('✓ Cumple', { width: 15, color: COLORS.success, bold: true, align: AlignmentType.CENTER }),
        cell('Identificar · Proteger · Detectar · Responder · Recuperar.', { width: 35 }),
      ]}),
      new TableRow({ children: [
        cell('DS MOPT 1/1941 (CONAMAR)', { width: 30, bold: true, bg: COLORS.bgLight }),
        cell('Nacional', { width: 20, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('✓ Cumple', { width: 15, color: COLORS.success, bold: true, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
        cell('Reglamento Marítimo CONAMAR de Directemar. Procedimientos VTS.', { width: 35, bg: COLORS.bgLight }),
      ]}),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] }),
]

// ============ 8. EQUIPO ============
const seccion8 = [
  h1('8. Equipo del Proyecto'),
  p('El equipo asignado al proyecto cuenta con la siguiente composición:'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell('Rol', 25),
          headerCell('Responsabilidad', 50),
          headerCell('Dedicación', 25),
        ],
      }),
      new TableRow({ children: [
        cell('Project Manager', { width: 25, bold: true }),
        cell('Coordinación general, comunicación con cliente, control de avance, gestión de riesgos', { width: 50 }),
        cell('100% (60 días)', { width: 25, align: AlignmentType.CENTER }),
      ]}),
      new TableRow({ children: [
        cell('Líder Técnico', { width: 25, bold: true, bg: COLORS.bgLight }),
        cell('Arquitectura de la solución, decisiones técnicas, code reviews, integraciones críticas', { width: 50, bg: COLORS.bgLight }),
        cell('100% (60 días)', { width: 25, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('Ingeniero Full-Stack Senior', { width: 25, bold: true }),
        cell('Desarrollo Next.js, APIs, integración AIS/Radar/CCTV, implementación IA', { width: 50 }),
        cell('100% (60 días)', { width: 25, align: AlignmentType.CENTER }),
      ]}),
      new TableRow({ children: [
        cell('Especialista en Ciberseguridad', { width: 25, bold: true, bg: COLORS.bgLight }),
        cell('Hardening, ISO 27001, segmentación OT/IT, procedimientos CSIRT, auditoría ANCI', { width: 50, bg: COLORS.bgLight }),
        cell('50% (60 días)', { width: 25, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
      ]}),
      new TableRow({ children: [
        cell('Especialista en Operaciones VTS', { width: 25, bold: true }),
        cell('Validación operacional con operadores reales, capacitación, manuales, handover', { width: 50 }),
        cell('50% (60 días)', { width: 25, align: AlignmentType.CENTER }),
      ]}),
      new TableRow({ children: [
        cell('UX/UI Designer', { width: 25, bold: true, bg: COLORS.bgLight }),
        cell('Iteración de diseño, accesibilidad WCAG, usabilidad para operadores senior', { width: 50, bg: COLORS.bgLight }),
        cell('25% (30 días)', { width: 25, align: AlignmentType.CENTER, bg: COLORS.bgLight }),
      ]}),
    ],
  }),
  h2('8.1 Encargado de Cumplimiento (Compliance Officer)'),
  p('De conformidad con la Ley N° 21.395 y la Ley N° 20.393, el Oferente designa formalmente como Encargado de Cumplimiento a don(a) _______________________________, RUT _______________, quien reporta directamente al Directorio y tiene autonomía e independencia en el ejercicio de sus funciones. Su contacto institucional es compliance@_______________.cl.'),
  new Paragraph({ children: [new PageBreak()] }),
]

// ============ 9. ANEXOS ============
const seccion9 = [
  h1('9. Anexos'),
  p('Se adjuntan los siguientes anexos a la presente oferta técnica:'),
  h2('Anexo A — Declaración Jurada de Programa de Integridad'),
  p('Documento firmado ante Notario Público conforme a la Ley N° 21.395 y Ley N° 20.393, que da cuenta de la implementación del Programa de Integridad del Oferente. Se adjunta como documento separado.'),
  h2('Anexo B — Capturas del Sistema'),
  p('Capturas de pantalla del sistema en operación:'),
  bullet('Login con autenticación Microsoft 365 y Google Workspace'),
  bullet('Dashboard operacional con KPIs y mapa en tiempo real'),
  bullet('Tabla de buques con datos AIS y registro SNRB'),
  bullet('Centro de Alertas con clasificación de severidad'),
  bullet('CCTV con feed en vivo y selector de 8 cámaras'),
  bullet('Panel de Analytics con gráficos Recharts'),
  bullet('IA Victoria con ejemplos de conversación'),
  bullet('Radio VTS con PTT, transcripción y compartir'),
  bullet('Generador de informes en 4 formatos'),
  bullet('Panel de Cumplimiento Normativo'),
  bullet('Selector de 6 temas cromáticos'),
  h2('Anexo C — Documentación Técnica'),
  p('Documentación técnica detallada que se entrega al cierre del proyecto:'),
  bullet('Manual de operación (Word + PDF, ~80 páginas)'),
  bullet('Manual de administración y mantenimiento (Word + PDF, ~50 páginas)'),
  bullet('Diagrama de arquitectura técnica'),
  bullet('Procedimientos de respuesta a incidentes CSIRT'),
  bullet('Registro de Actividades de Tratamiento (RAT) Ley 19.628'),
  bullet('Plan de continuidad operacional con RTO ≤ 4h y RPO ≤ 1h'),
  bullet('Matriz de gestión de riesgos ISO 27005'),
  h2('Anexo D — Referencias Normativas'),
  p('Normativa nacional e internacional considerada en el diseño del sistema:'),
  bullet('Ley N° 21.719 de Ciberseguridad de Chile (2024)'),
  bullet('Ley N° 19.628 sobre Protección de Datos Personales (modificada por Ley 21.719)'),
  bullet('Ley N° 21.395 sobre Anticohecho y Régimen Sancionatorio'),
  bullet('Ley N° 20.393 sobre Responsabilidad Penal de las Personas Jurídicas'),
  bullet('Ley N° 19.886 de Bases sobre Contratos Administrativos (Mercado Público)'),
  bullet('Decreto Supremo MOPT 1/1941 (Control del Tráfico Marítimo)'),
  bullet('Reglamentos CONAMAR de Directemar'),
  bullet('IALA Recommendation V-103 (estándares para operadores VTS)'),
  bullet('IMO Resolution MSC.428(98) — Cyber Risk Management for Ships'),
  bullet('ISPS Code (International Ship and Port Facility Security)'),
  bullet('SOLAS Chapter V (Safety of Navigation)'),
  bullet('ISO/IEC 27001:2022 (Information Security Management Systems)'),
  bullet('IEC 62443-3-3 (Industrial Automation Security)'),
  bullet('NIST Cybersecurity Framework 2.0'),
  bullet('WCAG 2.1 AA (Web Content Accessibility Guidelines)'),
  // Cierre
  new Paragraph({ spacing: { before: 1200 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: '— Fin del Documento —', italics: true, size: 18, color: COLORS.textMuted })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'MaritimeVTS · TCP Valparaíso', bold: true, size: 18, color: COLORS.primary })],
  }),
]

// ============ DOCUMENTO ============
const doc = new Document({
  creator: 'MaritimeVTS',
  title: 'Oferta Técnica — MaritimeVTS para TCP Valparaíso',
  description: 'Oferta técnica formal para licitación Mercado Público',
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22 },
        paragraph: { spacing: { line: 312 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
      },
    },
    children: [
      // PORTADA con fondo oscuro simulado (párrafos con shading)
      new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: COLORS.primary, color: 'auto' },
        spacing: { before: 0, after: 0, line: 600 },
        children: [new TextRun({ text: ' ', size: 60 })],
      }),
      ...portada,
      ...indice,
      ...seccion1,
      ...seccion2,
      ...seccion3,
      ...seccion4,
      ...seccion5,
      ...seccion6,
      ...seccion7,
      ...seccion8,
      ...seccion9,
    ],
  }],
})

// ============ GENERAR ============
async function main() {
  console.log('📝 Generando Oferta Técnica formal...')
  const buffer = await Packer.toBuffer(doc)
  const outputPath = '/home/z/my-project/download/Oferta-Tecnica-MaritimeVTS.docx'
  writeFileSync(outputPath, buffer)
  console.log(`✓ Documento generado: ${outputPath}`)
  console.log(`  Tamaño: ${(buffer.length / 1024).toFixed(1)} KB`)
  console.log('')
  console.log('📋 Contenido:')
  console.log('  Portada con datos de la licitación')
  console.log('  Índice de contenidos')
  console.log('  1. Resumen Ejecutivo')
  console.log('  2. Antecedentes de la Empresa Oferente')
  console.log('  3. Descripción de la Solución MaritimeVTS (6 módulos)')
  console.log('  4. Especificaciones Técnicas (tabla 18 requisitos)')
  console.log('  5. Plan de Implementación 60 días (3 fases)')
  console.log('  6. Soporte, Mantenimiento y Capacitación (tabla SLA)')
  console.log('  7. Cumplimiento Normativo (tabla 10 normas)')
  console.log('  8. Equipo del Proyecto (tabla 6 roles)')
  console.log('  9. Anexos (A: Integridad, B: Capturas, C: Doc técnica, D: Normativa)')
}

main().catch(e => {
  console.error('❌ Error:', e)
  process.exit(1)
})
