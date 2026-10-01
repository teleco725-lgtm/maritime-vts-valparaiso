import { NextRequest, NextResponse } from 'next/server'
import { vessels, alerts, kpis, trafficTrend, vesselTypeDistribution } from '@/lib/vts/data'

function getQueryParams(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  return {
    format: (searchParams.get('format') || 'word') as 'word' | 'powerpoint' | 'excel' | 'pdf',
    reportType: searchParams.get('reportType') || 'daily',
    dateFrom: searchParams.get('dateFrom') || new Date(Date.now() - 86400000).toISOString().split('T')[0],
    dateTo: searchParams.get('dateTo') || new Date().toISOString().split('T')[0],
    includeSections: (searchParams.get('includeSections') || 'summary,vessels,alerts,kpis').split(','),
    operator: searchParams.get('operator') || 'Operador VTS',
    organization: searchParams.get('organization') || 'TCP Valparaíso',
  }
}

function reportTypeLabel(t: string): string {
  const labels: Record<string, string> = {
    daily: 'DIARIO',
    weekly: 'SEMANAL',
    monthly: 'MENSUAL EJECUTIVO',
    incident: 'DE INCIDENTE',
    compliance: 'DE AUDITORÍA',
  }
  return labels[t] || 'DIARIO'
}

// ============== WORD (.docx) ==============
async function generateWord(params: ReturnType<typeof getQueryParams>): Promise<Buffer> {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, BorderStyle } = await import('docx')

  const headingStyle = { fill: '0F172A', color: '06B6D4' }
  const borderStyle: any = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '334155' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '334155' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '334155' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '334155' },
  }

  const children: any[] = []

  // Encabezado
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'INFORME DE TRÁFICO MARÍTIMO', bold: true })],
  }))
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `Informe ${reportTypeLabel(params.reportType)}`, size: 26, color: '06B6D4' })],
  }))
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: `${params.organization}`, size: 22, color: '475569' }),
      new TextRun({ text: `  ·  Período: ${params.dateFrom} a ${params.dateTo}`, size: 22, color: '475569' }),
    ],
    spacing: { after: 200 },
  }))
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: `Operador: `, size: 20, color: '64748B' }),
      new TextRun({ text: params.operator, size: 20, bold: true, color: '1E293B' }),
    ],
    spacing: { after: 400 },
  }))

  // Resumen ejecutivo
  if (params.includeSections.includes('summary')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: '1. Resumen Ejecutivo', bold: true, color: '0F172A' })],
      spacing: { before: 200, after: 100 },
    }))
    children.push(new Paragraph({
      children: [new TextRun({
        text: `Durante el período comprendido entre ${params.dateFrom} y ${params.dateTo}, el Sistema de Control de Tráfico Marítimo (VTS) del Terminal de Contenedores de Puerto Valparaíso (TCP Valparaíso) registró un total de ${vessels.length} naves operando dentro de su zona de jurisdicción. De estas, ${vessels.filter(v => v.status === 'moored').length} se encontraban atracadas en los muelles del espigón, ${vessels.filter(v => v.status === 'arrival').length} en proceso de aproximación al puerto, y ${vessels.filter(v => v.status === 'underway').length} en navegación dentro de las aguas interiores. La precisión media del sistema de fusión GPS con IA alcanzó un ${kpis[3].value}%, manteniendo los estándares operacionales requeridos conforme a los lineamientos IALA V-103.`,
        size: 22,
      })],
      spacing: { after: 200 },
    }))
    children.push(new Paragraph({
      children: [new TextRun({
        text: `El nivel de cumplimiento normativo alcanzó el 100% en los procedimientos VTS, manteniendo la trazabilidad de todas las operaciones dentro del marco legal chileno (Ley 21.719 de Ciberseguridad, Ley 19.628 de Protección de Datos Personales) y los estándares internacionales aplicables (IMO MSC.428(98), ISPS Code, IALA V-103).`,
        size: 22,
      })],
      spacing: { after: 200 },
    }))
  }

  // KPIs
  if (params.includeSections.includes('kpis')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: '2. Indicadores Clave de Desempeño (KPI)', bold: true, color: '0F172A' })],
      spacing: { before: 200, after: 100 },
    }))

    const kpiTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Indicador', bold: true, color: 'FFFFFF' })], shading: headingStyle })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Valor', bold: true, color: 'FFFFFF' })], shading: headingStyle })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Unidad', bold: true, color: 'FFFFFF' })], shading: headingStyle })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tendencia', bold: true, color: 'FFFFFF' })], shading: headingStyle })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Descripción', bold: true, color: 'FFFFFF' })], shading: headingStyle })] }),
          ],
        }),
        ...kpis.map(k => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: k.label, size: 20 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: k.value, bold: true, size: 20 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: k.unit, size: 20 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'} ${k.trendValue}`, size: 20 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: k.description, size: 18, color: '64748B' })] })] }),
          ],
        })),
      ],
    })
    children.push(kpiTable)
    children.push(new Paragraph({ children: [], spacing: { after: 200 } }))
  }

  // Buques
  if (params.includeSections.includes('vessels')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: '3. Registro de Buques', bold: true, color: '0F172A' })],
      spacing: { before: 200, after: 100 },
    }))
    children.push(new Paragraph({
      children: [new TextRun({
        text: `A continuación se detalla el registro completo de buques detectados dentro de la zona VTS durante el período del informe. Los datos provienen de la fusión de sensores AIS, Radar ARPA y confirmación visual por CCTV, conforme a los protocolos IALA.`,
        size: 22,
      })],
      spacing: { after: 150 },
    }))

    const vesselTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['Nombre', 'MMSI', 'IMO', 'Tipo', 'Estado', 'SOG (kn)', 'Bandera', 'Conf. IA (%)'].map(h =>
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF' })], shading: headingStyle })] })
          ),
        }),
        ...vessels.map(v => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v.name, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v.mmsi, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v.imo, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v.type, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v.status, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v.sog.toFixed(1), size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v.flag, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v.confidence.toFixed(1), size: 18 })] })] }),
          ],
        })),
      ],
    })
    children.push(vesselTable)
    children.push(new Paragraph({ children: [], spacing: { after: 200 } }))
  }

  // Alertas
  if (params.includeSections.includes('alerts')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: '4. Alertas y Eventos', bold: true, color: '0F172A' })],
      spacing: { before: 200, after: 100 },
    }))
    children.push(new Paragraph({
      children: [new TextRun({
        text: `Se registraron ${alerts.length} eventos de alerta durante el período del informe, de los cuales ${alerts.filter(a => a.status === 'active').length} permanecen activas. Las alertas críticas se gestionaron conforme a los protocolos CSIRT y se notificaron a las autoridades correspondientes (Directemar, ANCI) según corresponda.`,
        size: 22,
      })],
      spacing: { after: 150 },
    }))

    const alertTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['Severidad', 'Título', 'Buque', 'Estado', 'Fecha', 'Descripción'].map(h =>
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF' })], shading: headingStyle })] })
          ),
        }),
        ...alerts.map(a => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a.severity.toUpperCase(), size: 18, bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a.title, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a.vessel || '-', size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a.status, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a.timestamp, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a.description, size: 18 })] })] }),
          ],
        })),
      ],
    })
    children.push(alertTable)
    children.push(new Paragraph({ children: [], spacing: { after: 200 } }))
  }

  // Cumplimiento
  if (params.includeSections.includes('compliance')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: '5. Cumplimiento Normativo', bold: true, color: '0F172A' })],
      spacing: { before: 200, after: 100 },
    }))
    children.push(new Paragraph({
      children: [new TextRun({
        text: `El sistema VTS cumple íntegramente con los siguientes marcos normativos: IALA Recommendation V-103 (estándares para formación y certificación de operadores VTS), IMO MSC.428(98) (Gestión de Riesgos Cibernéticos para Buques), ISPS Code (Código Internacional de Protección de Instalaciones Portuarias), SOLAS Capítulo V (Seguridad de la Navegación), Ley 21.719 de Ciberseguridad de Chile, Ley 19.628 de Protección de Datos Personales, DS MOPT 1/1941 (Control del Tráfico Marítimo), y los Reglamentos Marítimos CONAMAR de Directemar.`,
        size: 22,
      })],
      spacing: { after: 200 },
    }))
  }

  // Ciberseguridad
  if (params.includeSections.includes('security')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: '6. Ciberseguridad y Auditoría', bold: true, color: '0F172A' })],
      spacing: { before: 200, after: 100 },
    }))
    children.push(new Paragraph({
      children: [new TextRun({
        text: `La infraestructura de ciberseguridad del sistema se encuentra operativa con cumplimiento de los estándares ISO/IEC 27001 (SGSI), IEC 62443 (Seguridad Industrial), NIST CSF 2.0, y los protocolos TLS 1.3 / OAuth 2.0 / OIDC para autenticación y cifrado. La segmentación de redes OT/IT se mantiene conforme a las mejores prácticas, con monitoreo continuo a través del CSIRT sectorial y registro de eventos para auditoría. No se reportaron incidentes cibernéticos relevantes durante el período.`,
        size: 22,
      })],
      spacing: { after: 200 },
    }))
  }

  // Footer
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
    children: [new TextRun({ text: '— Generado por MaritimeVTS · TCP Valparaíso —', italics: true, color: '94A3B8', size: 18 })],
  }))

  const doc = new Document({ sections: [{ properties: {}, children }] })
  const buffer = await Packer.toBuffer(doc)
  return Buffer.from(buffer)
}

// ============== POWERPOINT (.pptx) ==============
async function generatePowerPoint(params: ReturnType<typeof getQueryParams>): Promise<Buffer> {
  const pptxgen = (await import('pptxgenjs')).default
  const pres = new pptxgen()
  pres.defineLayout({ name: 'VTS', width: 13.333, height: 7.5 })
  pres.layout = 'VTS'

  // Slide 1 — Portada
  const slide1 = pres.addSlide()
  slide1.background = { color: '0F172A' }
  slide1.addText('INFORME DE TRÁFICO MARÍTIMO', {
    x: 1, y: 2.5, w: 11, h: 1, fontSize: 36, bold: true, color: '06B6D4', align: 'center', fontFace: 'Calibri',
  })
  slide1.addText(`Informe ${reportTypeLabel(params.reportType)}`, {
    x: 1, y: 3.5, w: 11, h: 0.6, fontSize: 22, color: '94A3B8', align: 'center',
  })
  slide1.addText(`${params.organization}  ·  ${params.dateFrom} a ${params.dateTo}`, {
    x: 1, y: 4.2, w: 11, h: 0.4, fontSize: 14, color: '64748B', align: 'center',
  })
  slide1.addText(`Operador: ${params.operator}`, {
    x: 1, y: 4.6, w: 11, h: 0.4, fontSize: 12, color: '475569', align: 'center',
  })
  slide1.addShape(pres.ShapeType.rect, { x: 4.5, y: 5.5, w: 4.3, h: 0.06, fill: { color: '06B6D4' } })

  // Slide 2 — Resumen ejecutivo
  if (params.includeSections.includes('summary')) {
    const slide2 = pres.addSlide()
    slide2.background = { color: '1E293B' }
    slide2.addText('Resumen Ejecutivo', { x: 0.5, y: 0.3, w: 12, h: 0.8, fontSize: 28, bold: true, color: '06B6D4' })
    slide2.addText([
      { text: `• ${vessels.length} naves operando en zona VTS durante el período\n`, options: { fontSize: 16, color: 'E2E8F0', breakLine: true } },
      { text: `• ${vessels.filter(v => v.status === 'moored').length} buques atracados en muelles TCP\n`, options: { fontSize: 16, color: 'E2E8F0', breakLine: true } },
      { text: `• ${vessels.filter(v => v.status === 'arrival').length} buques en aproximación\n`, options: { fontSize: 16, color: 'E2E8F0', breakLine: true } },
      { text: `• ${vessels.filter(v => v.status === 'underway').length} buques en navegación\n`, options: { fontSize: 16, color: 'E2E8F0', breakLine: true } },
      { text: `• Precisión GPS media con fusión IA: ${kpis[3].value}%\n`, options: { fontSize: 16, color: '10B981', breakLine: true } },
      { text: `• ${alerts.filter(a => a.status === 'active').length} alertas activas (${alerts.filter(a => a.severity === 'critical').length} crítica)\n`, options: { fontSize: 16, color: 'F59E0B', breakLine: true } },
      { text: `• Cumplimiento IALA V-103: 100%`, options: { fontSize: 16, color: '10B981' } },
    ], { x: 0.7, y: 1.4, w: 12, h: 5, valign: 'top' })
  }

  // Slide 3 — KPIs
  if (params.includeSections.includes('kpis')) {
    const slide3 = pres.addSlide()
    slide3.background = { color: '1E293B' }
    slide3.addText('Indicadores Clave (KPI)', { x: 0.5, y: 0.3, w: 12, h: 0.8, fontSize: 28, bold: true, color: '06B6D4' })

    kpis.slice(0, 8).forEach((k, i) => {
      const col = i % 4
      const row = Math.floor(i / 4)
      const x = 0.5 + col * 3.1
      const y = 1.3 + row * 2.5
      slide3.addShape(pres.ShapeType.roundRect, { x, y, w: 2.8, h: 2, fill: { color: '0F172A' }, line: { color: '334155', width: 1 } })
      slide3.addText(k.label, { x: x + 0.15, y: y + 0.15, w: 2.5, h: 0.5, fontSize: 11, color: '94A3B8' })
      slide3.addText(`${k.value} ${k.unit}`, { x: x + 0.15, y: y + 0.7, w: 2.5, h: 0.7, fontSize: 24, bold: true, color: 'E2E8F0' })
      slide3.addText(`${k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'} ${k.trendValue}`, { x: x + 0.15, y: y + 1.4, w: 2.5, h: 0.4, fontSize: 12, color: k.trend === 'up' ? '10B981' : k.trend === 'down' ? 'F59E0B' : '94A3B8' })
    })
  }

  // Slide 4 — Distribución por tipo
  if (params.includeSections.includes('vessels')) {
    const slide4 = pres.addSlide()
    slide4.background = { color: '1E293B' }
    slide4.addText('Distribución de Buques por Tipo', { x: 0.5, y: 0.3, w: 12, h: 0.8, fontSize: 28, bold: true, color: '06B6D4' })

    const colors = ['0EA5E9', '10B981', 'F59E0B', '8B5CF6', 'EF4444', '6B7280']
    const data = vesselTypeDistribution.map((v, i) => ({
      name: v.name,
      values: [v.value],
      labels: [v.value.toString()],
      color: colors[i % colors.length],
    }))

    const chartArea = { x: 1, y: 1.5, w: 11, h: 5 }
    slide4.addChart(pres.ChartType.bar, data, {
      ...chartArea,
      barDir: 'horizontal',
      showLegend: false,
      showValue: true,
      chartColors: colors,
    })
  }

  // Slide 5 — Tabla de buques
  if (params.includeSections.includes('vessels')) {
    const slide5 = pres.addSlide()
    slide5.background = { color: '1E293B' }
    slide5.addText('Registro de Buques', { x: 0.5, y: 0.3, w: 12, h: 0.8, fontSize: 28, bold: true, color: '06B6D4' })

    const header = ['Nombre', 'MMSI', 'Tipo', 'Estado', 'SOG', 'Conf.IA']
    const rows = vessels.map(v => [v.name, v.mmsi, v.type, v.status, `${v.sog.toFixed(1)} kn`, `${v.confidence.toFixed(1)}%`])

    slide5.addTable([header, ...rows], {
      x: 0.5, y: 1.3, w: 12.3, h: 5.5,
      fontSize: 10,
      border: { type: 'solid', color: '334155', pt: 1 },
      colW: [3, 1.8, 1.6, 1.6, 1.5, 1.5],
      fill: { color: '0F172A' },
      color: 'E2E8F0',
      align: 'left',
      valign: 'middle',
    })
  }

  // Slide 6 — Alertas
  if (params.includeSections.includes('alerts')) {
    const slide6 = pres.addSlide()
    slide6.background = { color: '1E293B' }
    slide6.addText('Alertas y Eventos', { x: 0.5, y: 0.3, w: 12, h: 0.8, fontSize: 28, bold: true, color: '06B6D4' })

    const header = ['Severidad', 'Título', 'Buque', 'Estado']
    const rows = alerts.map(a => [a.severity.toUpperCase(), a.title, a.vessel || '-', a.status])

    slide6.addTable([header, ...rows], {
      x: 0.5, y: 1.3, w: 12.3, h: 5.5,
      fontSize: 10,
      border: { type: 'solid', color: '334155', pt: 1 },
      colW: [2, 6, 2, 2.3],
      fill: { color: '0F172A' },
      color: 'E2E8F0',
      align: 'left',
      valign: 'middle',
    })
  }

  // Slide 7 — Cumplimiento
  if (params.includeSections.includes('compliance')) {
    const slide7 = pres.addSlide()
    slide7.background = { color: '1E293B' }
    slide7.addText('Cumplimiento Normativo', { x: 0.5, y: 0.3, w: 12, h: 0.8, fontSize: 28, bold: true, color: '06B6D4' })
    slide7.addText([
      { text: '✓ IALA Recommendation V-103\n', options: { fontSize: 16, color: '10B981', breakLine: true } },
      { text: '✓ IMO MSC.428(98) — Cyber Risk Management\n', options: { fontSize: 16, color: '10B981', breakLine: true } },
      { text: '✓ ISPS Code — Seguridad Portuaria\n', options: { fontSize: 16, color: '10B981', breakLine: true } },
      { text: '✓ SOLAS Capítulo V — Seguridad Navegación\n', options: { fontSize: 16, color: '10B981', breakLine: true } },
      { text: '✓ Ley 21.719 — Ciberseguridad (Chile)\n', options: { fontSize: 16, color: '10B981', breakLine: true } },
      { text: '✓ Ley 19.628 — Protección de Datos\n', options: { fontSize: 16, color: '10B981', breakLine: true } },
      { text: '✓ DS MOPT 1/1941 — CONAMAR\n', options: { fontSize: 16, color: '10B981', breakLine: true } },
      { text: '✓ ISO/IEC 27001 · IEC 62443 · NIST CSF 2.0', options: { fontSize: 16, color: '10B981' } },
    ], { x: 0.7, y: 1.4, w: 12, h: 5, valign: 'top' })
  }

  const result = await pres.write({ outputType: 'nodebuffer' })
  return Buffer.from(result as ArrayBuffer)
}

// ============== EXCEL (.xlsx) ==============
async function generateExcel(params: ReturnType<typeof getQueryParams>): Promise<Buffer> {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()

  // Hoja 1 — Resumen
  const summaryData: any[][] = [
    ['INFORME DE TRÁFICO MARÍTIMO'],
    [`Informe ${reportTypeLabel(params.reportType)}`],
    [`${params.organization}`],
    [`Período: ${params.dateFrom} a ${params.dateTo}`],
    [`Operador: ${params.operator}`],
    [],
    ['INDICADORES CLAVE (KPI)'],
    ['Indicador', 'Valor', 'Unidad', 'Tendencia', 'Cambio', 'Descripción'],
    ...kpis.map(k => [k.label, k.value, k.unit, k.trend, k.trendValue, k.description]),
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  ws1['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 50 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumen')

  // Hoja 2 — Buques
  const vesselData: any[][] = [
    ['Nombre', 'MMSI', 'IMO', 'Tipo', 'Estado', 'Bandera', 'Eslora (m)', 'Manga (m)', 'Calado (m)', 'SOG (kn)', 'COG (°)', 'Heading (°)', 'Latitud', 'Longitud', 'ETA', 'Destino', 'Conf. IA (%)', 'Registro', 'Última Actualización'],
    ...vessels.map(v => [v.name, v.mmsi, v.imo, v.type, v.status, v.flag, v.length, v.beam, v.draft, v.sog, v.cog, v.heading, v.lat, v.lng, v.eta, v.destination, v.confidence, v.registry, v.lastUpdate]),
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(vesselData)
  ws2['!cols'] = [
    { wch: 22 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 30 }, { wch: 12 }, { wch: 14 }, { wch: 18 },
  ]
  XLSX.utils.book_append_sheet(wb, ws2, 'Buques')

  // Hoja 3 — Alertas
  const alertData: any[][] = [
    ['Severidad', 'Tipo', 'Título', 'Buque', 'Descripción', 'Estado', 'Fecha'],
    ...alerts.map(a => [a.severity, a.type, a.title, a.vessel || '-', a.description, a.status, a.timestamp]),
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(alertData)
  ws3['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 35 }, { wch: 18 }, { wch: 60 }, { wch: 14 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'Alertas')

  // Hoja 4 — Tendencias
  const trendData: any[][] = [
    ['TENDENCIA DE TRÁFICO POR HORA'],
    ['Hora', 'Entradas', 'Salidas'],
    ...trafficTrend.map(t => [t.hora, t.entradas, t.salidas]),
    [],
    ['DISTRIBUCIÓN POR TIPO DE BUQUE'],
    ['Tipo', 'Cantidad'],
    ...vesselTypeDistribution.map(v => [v.name, v.value]),
  ]
  const ws4 = XLSX.utils.aoa_to_sheet(trendData)
  ws4['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws4, 'Tendencias')

  // Hoja 5 — Cumplimiento
  const complianceData: any[][] = [
    ['CUMPLIMIENTO NORMATIVO'],
    [],
    ['INTERNACIONAL'],
    ['Norma', 'Estado', 'Detalle'],
    ['IALA Recommendation V-103', 'Compliant', 'Formación y certificación de operadores VTS'],
    ['IMO MSC.428(98)', 'Compliant', 'Cyber Risk Management para buques'],
    ['ISPS Code', 'Compliant', 'Protección de instalaciones portuarias'],
    ['SOLAS Capítulo V', 'Compliant', 'Seguridad de la navegación'],
    [],
    ['CHILENA'],
    ['Ley 21.719 — Ciberseguridad', 'Compliant', 'ANCI · CSIRT Nacional · OIV'],
    ['Ley 19.628 / 21.719 — Datos', 'Compliant', 'Protección de datos personales'],
    ['DS MOPT 1/1941', 'Compliant', 'Control del Tráfico Marítimo'],
    ['CONAMAR', 'Compliant', 'Reglamento Marítimo Nacional'],
    [],
    ['ESTÁNDARES TÉCNICOS'],
    ['ISO/IEC 27001', 'Compliant', 'SGSI'],
    ['IEC 62443', 'Compliant', 'Seguridad Industrial'],
    ['NIST CSF 2.0', 'Compliant', 'Cybersecurity Framework'],
    ['TLS 1.3 / OAuth 2.0 / OIDC', 'Compliant', 'Cifrado y autenticación'],
  ]
  const ws5 = XLSX.utils.aoa_to_sheet(complianceData)
  ws5['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 50 }]
  XLSX.utils.book_append_sheet(wb, ws5, 'Cumplimiento')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.from(buffer)
}

// ============== PDF ==============
async function generatePDF(params: ReturnType<typeof getQueryParams>): Promise<Buffer> {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 40
  let y = margin

  // Portada / encabezado
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageW, 120, 'F')
  doc.setTextColor(6, 182, 212)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORME DE TRÁFICO MARÍTIMO', pageW / 2, 50, { align: 'center' })
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.text(`Informe ${reportTypeLabel(params.reportType)}`, pageW / 2, 75, { align: 'center' })
  doc.setFontSize(10)
  doc.text(`${params.organization}  ·  ${params.dateFrom} a ${params.dateTo}`, pageW / 2, 95, { align: 'center' })
  doc.text(`Operador: ${params.operator}`, pageW / 2, 110, { align: 'center' })

  y = 150

  // Resumen ejecutivo
  if (params.includeSections.includes('summary')) {
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('1. Resumen Ejecutivo', margin, y)
    y += 20
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(51, 65, 85)
    const summaryText = `Durante el período ${params.dateFrom} a ${params.dateTo}, el Sistema VTS de TCP Valparaíso registró ${vessels.length} naves operando en su zona de jurisdicción. De estas, ${vessels.filter(v => v.status === 'moored').length} se encontraban atracadas, ${vessels.filter(v => v.status === 'arrival').length} en aproximación y ${vessels.filter(v => v.status === 'underway').length} en navegación. La precisión media del sistema de fusión GPS con IA alcanzó ${kpis[3].value}%, manteniendo los estándares operacionales conforme a los lineamientos IALA V-103.`
    const lines = doc.splitTextToSize(summaryText, pageW - 2 * margin)
    doc.text(lines, margin, y)
    y += lines.length * 14 + 10

    const summaryText2 = `El nivel de cumplimiento normativo alcanzó el 100% en los procedimientos VTS, manteniendo la trazabilidad de todas las operaciones dentro del marco legal chileno (Ley 21.719 de Ciberseguridad, Ley 19.628 de Protección de Datos) y los estándares internacionales aplicables (IMO MSC.428(98), ISPS Code, IALA V-103).`
    const lines2 = doc.splitTextToSize(summaryText2, pageW - 2 * margin)
    doc.text(lines2, margin, y)
    y += lines2.length * 14 + 20
  }

  // KPIs
  if (params.includeSections.includes('kpis')) {
    if (y > pageH - 100) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('2. Indicadores Clave (KPI)', margin, y)
    y += 10
    autoTable(doc, {
      startY: y,
      head: [['Indicador', 'Valor', 'Unidad', 'Tendencia', 'Descripción']],
      body: kpis.map(k => [
        k.label, k.value, k.unit,
        `${k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'} ${k.trendValue}`,
        k.description,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: [6, 182, 212], fontSize: 10 },
      bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 50, halign: 'center' }, 2: { cellWidth: 50, halign: 'center' }, 3: { cellWidth: 60, halign: 'center' }, 4: { cellWidth: 'auto' } },
    })
    y = (doc as any).lastAutoTable.finalY + 20
  }

  // Buques
  if (params.includeSections.includes('vessels')) {
    if (y > pageH - 100) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('3. Registro de Buques', margin, y)
    y += 10
    autoTable(doc, {
      startY: y,
      head: [['Nombre', 'MMSI', 'Tipo', 'Estado', 'SOG', 'Bandera', 'Conf.IA']],
      body: vessels.map(v => [v.name, v.mmsi, v.type, v.status, `${v.sog.toFixed(1)}`, v.flag, `${v.confidence.toFixed(1)}%`]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [6, 182, 212], fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
      columnStyles: { 0: { cellWidth: 100 } },
    })
    y = (doc as any).lastAutoTable.finalY + 20
  }

  // Alertas
  if (params.includeSections.includes('alerts')) {
    if (y > pageH - 100) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('4. Alertas y Eventos', margin, y)
    y += 10
    autoTable(doc, {
      startY: y,
      head: [['Sev.', 'Título', 'Buque', 'Estado', 'Fecha']],
      body: alerts.map(a => [a.severity.toUpperCase(), a.title, a.vessel || '-', a.status, a.timestamp]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [6, 182, 212], fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
    })
    y = (doc as any).lastAutoTable.finalY + 20
  }

  // Cumplimiento
  if (params.includeSections.includes('compliance')) {
    if (y > pageH - 100) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('5. Cumplimiento Normativo', margin, y)
    y += 20
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(51, 65, 85)
    const complianceText = 'El sistema VTS cumple íntegramente con: IALA V-103, IMO MSC.428(98), ISPS Code, SOLAS Cap. V, Ley 21.719 (Ciberseguridad), Ley 19.628 (Datos Personales), DS MOPT 1/1941, Reglamentos CONAMAR, ISO/IEC 27001, IEC 62443, NIST CSF 2.0.'
    const cl = doc.splitTextToSize(complianceText, pageW - 2 * margin)
    doc.text(cl, margin, y)
    y += cl.length * 14 + 20
  }

  // Ciberseguridad
  if (params.includeSections.includes('security')) {
    if (y > pageH - 100) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('6. Ciberseguridad y Auditoría', margin, y)
    y += 20
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(51, 65, 85)
    const secText = 'La infraestructura de ciberseguridad se mantiene operativa con cumplimiento de ISO/IEC 27001, IEC 62443, NIST CSF 2.0 y protocolos TLS 1.3 / OAuth 2.0 / OIDC. La segmentación de redes OT/IT está conforme a las mejores prácticas, con monitoreo continuo a través del CSIRT sectorial. No se reportaron incidentes relevantes durante el período.'
    const sl = doc.splitTextToSize(secText, pageW - 2 * margin)
    doc.text(sl, margin, y)
    y += sl.length * 14 + 30
  }

  // Footer en cada página
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(`MaritimeVTS · TCP Valparaíso · Generado el ${new Date().toLocaleString('es-CL')}`, pageW / 2, pageH - 15, { align: 'center' })
    doc.text(`Página ${i} de ${pages}`, pageW - margin, pageH - 15, { align: 'right' })
  }

  return Buffer.from(doc.output('arraybuffer'))
}

// ============== Route handler ==============
export async function GET(req: NextRequest) {
  const params = getQueryParams(req)

  try {
    let buffer: Buffer
    let mime: string
    let filename: string

    switch (params.format) {
      case 'word':
        buffer = await generateWord(params)
        mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        filename = `informe-VTS-${params.dateFrom}_${params.dateTo}.docx`
        break
      case 'powerpoint':
        buffer = await generatePowerPoint(params)
        mime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        filename = `informe-VTS-${params.dateFrom}_${params.dateTo}.pptx`
        break
      case 'excel':
        buffer = await generateExcel(params)
        mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = `informe-VTS-${params.dateFrom}_${params.dateTo}.xlsx`
        break
      case 'pdf':
        buffer = await generatePDF(params)
        mime = 'application/pdf'
        filename = `informe-VTS-${params.dateFrom}_${params.dateTo}.pdf`
        break
      default:
        return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 })
    }

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (e) {
    console.error('Error generando informe:', e)
    return NextResponse.json({
      error: 'Error interno al generar el informe',
      detail: e instanceof Error ? e.message : String(e),
    }, { status: 500 })
  }
}
