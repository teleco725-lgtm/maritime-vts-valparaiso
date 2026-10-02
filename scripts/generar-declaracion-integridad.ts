/**
 * Genera la Declaración Jurada de Programa de Integridad
 * Lista para imprimir, firmar ante notario y subir a Mercado Público.
 *
 * Cumple con:
 * - Ley 21.395 (Anticohecho y Régimen Sancionatorio para Proveedores del Estado)
 * - Ley 20.393 (Responsabilidad Penal Empresarial)
 * - Ley 19.080 (Ley de Compras Públicas)
 * - Bases Estándar ChileCompra / Mercado Público
 */
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle, Table, TableRow, TableCell, WidthType, PageBreak } from 'docx'
import { writeFileSync } from 'fs'

// ============ DATOS DE LA EMPRESA (editable) ============
const empresa = {
  razonSocial: '_______________________________',  // ⚠️ Rellenar con RUT de la empresa
  rut: '_______________',
  representanteLegal: '_______________________________',
  rutRepresentante: '_______________',
  domicilio: '_______________________________',
  comuna: '_______________________________',
  ciudad: '_______________________________',
  email: '_______________________________',
  telefono: '_______________________________',
  encargadoCumplimiento: '_______________________________',
  fechaLicitacion: '_______________________________',
  codigoLicitacion: '_______________________________',
  organismoComprador: '_______________________________',
  fechaFirma: new Date().toLocaleDateString('es-CL'),
}

// ============ ESTILOS ============
const titleStyle = { bold: true, size: 32, color: '0F172A' }
const headingStyle = { bold: true, size: 24, color: '1E40AF' }
const bodyStyle = { size: 22, color: '0F172A' }
const boldStyle = { bold: true, size: 22, color: '0F172A' }
const smallStyle = { size: 18, color: '475569', italics: true }
const firmaStyle = { size: 22, color: '0F172A' }

// ============ ENCABEZADO ============
const encabezado = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: 'DECLARACIÓN JURADA', ...titleStyle })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: 'PROGRAMA DE INTEGRIDAD', bold: true, size: 26, color: '1E40AF' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({
      text: 'Conforme a la Ley N° 21.395, Ley N° 20.393 y Bases Administrativas de la Licitación',
      ...smallStyle,
    })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    border: {
      bottom: { color: '1E40AF', space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
    children: [new TextRun({
      text: `Licitación: ${empresa.codigoLicitacion} — ${empresa.organismoComprador}`,
      bold: true, size: 20, color: '475569',
    })],
  }),
]

// ============ IDENTIFICACIÓN DE LA EMPRESA ============
const identificacion = [
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: 'I. IDENTIFICACIÓN DEL OFERENTE', ...headingStyle })],
  }),
  new Paragraph({
    spacing: { after: 200, line: 312 },
    alignment: AlignmentType.JUSTIFIED,
    children: [
      new TextRun({ text: 'El suscrito, en representación de ', ...bodyStyle }),
      new TextRun({ text: empresa.razonSocial, ...boldStyle }),
      new TextRun({ text: ', RUT ', ...bodyStyle }),
      new TextRun({ text: empresa.rut, ...boldStyle }),
      new TextRun({ text: ', con domicilio en ', ...bodyStyle }),
      new TextRun({ text: empresa.domicilio, ...boldStyle }),
      new TextRun({ text: ', comuna de ', ...bodyStyle }),
      new TextRun({ text: empresa.comuna, ...boldStyle }),
      new TextRun({ text: ', ciudad de ', ...bodyStyle }),
      new TextRun({ text: empresa.ciudad, ...boldStyle }),
      new TextRun({ text: ', representado legalmente por don(a) ', ...bodyStyle }),
      new TextRun({ text: empresa.representanteLegal, ...boldStyle }),
      new TextRun({ text: ', C.I. ', ...bodyStyle }),
      new TextRun({ text: empresa.rutRepresentante, ...boldStyle }),
      new TextRun({ text: ', en adelante "el Oferente", declara bajo juramento que cuenta con un Programa de Integridad vigente, conforme a los requisitos establecidos en la Ley N° 21.395 que modifica la Ley N° 19.886 de Bases sobre Contratos Administrativos de Suministro y Prestación de Servicios, y la Ley N° 20.393 sobre Responsabilidad Penal de las Personas Jurídicas.', ...bodyStyle }),
    ],
  }),
]

// ============ DECLARACIONES ============
const declaraciones = [
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 200 },
    children: [new TextRun({ text: 'II. DECLARACIONES JURADAS', ...headingStyle })],
  }),
  new Paragraph({
    spacing: { after: 200, line: 312 },
    alignment: AlignmentType.JUSTIFIED,
    children: [
      new TextRun({ text: 'El Oferente declara, bajo juramento y con expresa referencia al artículo 154 del Código de Procedimiento Civil y al artículo 235 de la Ley N° 18.046 sobre Sociedades Anónimas, que:', ...bodyStyle }),
    ],
  }),
]

// Cada declaración como artículo numerado
const articulos = [
  {
    titulo: 'Artículo 1°. Existencia y Vigencia del Programa de Integridad',
    cuerpo: 'El Oferente declara que cuenta con un Programa de Integridad implementado, vigente y formalmente documentado, que cumple con los requisitos establecidos en el artículo 3° de la Ley N° 20.393 sobre Responsabilidad Penal de las Personas Jurídicas, modificado por la Ley N° 21.395, y demás normativa aplicable. Dicho programa ha sido aprobado por el órgano de administración de la empresa y se encuentra en plena vigencia a la fecha de esta declaración.',
  },
  {
    titulo: 'Artículo 2°. Código de Ética y Conducta',
    cuerpo: 'El Oferente declara que cuenta con un Código de Ética y Conducta documentado, difundido entre todos sus colaboradores, contratistas y subcontratistas, que regula los principios y valores éticos aplicables a la actividad empresarial, incluyendo obligaciones específicas en materia de transparencia, integridad, no discriminación, confidencialidad, y respeto a los derechos humanos. El mencionado Código se encuentra publicado en el sitio web institucional y es de conocimiento general en la organización.',
  },
  {
    titulo: 'Artículo 3°. Encargado de Cumplimiento (Compliance Officer)',
    cuerpo: 'El Oferente declara que ha designado formalmente un Encargado de Cumplimiento, en adelante "Compliance Officer", con autonomía e independencia en el ejercicio de sus funciones, dotado de los recursos materiales y humanos suficientes para el adecuado desempeño de su labor. El Encargado de Cumplimiento designado es don(a) ' + empresa.encargadoCumplimiento + ', quien reporta directamente al órgano de administración de la empresa y tiene a su cargo la implementación, supervisión y mejora continua del Programa de Integridad.',
  },
  {
    titulo: 'Artículo 4°. Canal de Denuncias (Whistleblower)',
    cuerpo: 'El Oferente declara que cuenta con un Canal de Denuncias interno, formalmente establecido, confidencial y accesible, a través del cual cualquier persona —sea colaborador, contratista, proveedor, cliente o tercero— pueda reportar, de forma anónima o nominada, cualquier conducta que pudiera constituir un ilícito, irregularidad o infracción al Código de Ética o al Programa de Integridad. El Canal de Denuncias cumple con los estándares de confidencialidad y no represalia establecidos en la Ley N° 21.029 (Ley Delator) y la Ley N° 20.393.',
  },
  {
    titulo: 'Artículo 5°. Política Anti-Corrupción y Anti-Cohecho',
    cuerpo: 'El Oferente declara que cuenta con una Política Anti-Corrupción y Anti-Cohecho formalmente aprobada y difundida, que prohíbe expresamente cualquier acto de corrupción, cohecho (activo o pasivo), soborno transnacional, tráfico de influencias, pago de facilitación, y cualquier otra conducta que pudiera configurar los delitos previstos en los artículos 248 bis y siguientes del Código Penal, así como en la Ley N° 20.393. La política aplica a todos los niveles de la organización, incluyendo directores, ejecutivos, empleados, contratistas y proveedores.',
  },
  {
    titulo: 'Artículo 6°. Política de Conflictos de Interés',
    cuerpo: 'El Oferente declara que cuenta con una Política de Conflictos de Interés que establece la obligación de todo colaborador, directivo y contratista de declarar oportunamente cualquier situación real, potencial o aparente de conflicto de interés, especialmente respecto de interacciones con funcionarios públicos y autoridades del Estado. La política establece procedimientos claros de declaración, evaluación, manejo y documentación de conflictos, así como las sanciones aplicables por incumplimiento.',
  },
  {
    titulo: 'Artículo 7°. Capacitación y Difusión',
    cuerpo: 'El Oferente declara que implementa un programa de capacitación periódica en materia de integridad, ética y prevención de delitos, dirigido a todos los niveles de la organización. Esta capacitación se realiza al menos una vez al año calendario y queda debidamente registrada. Los nuevos ingresos reciben capacitación inicial dentro de los primeros 30 días desde su contratación.',
  },
  {
    titulo: 'Artículo 8°. Evaluación de Riesgos',
    cuerpo: 'El Oferente declara que realiza evaluaciones periódicas de riesgo en materia de prevención de delitos, conforme a los artículos 3° y 4° de la Ley N° 20.393, identificando los riesgos de comisión de delitos en el ámbito de su actividad empresarial y estableciendo los controles y procedimientos adecuados para mitigarlos. Estas evaluaciones se realizan al menos cada 12 meses o cuando se produzcan cambios significativos en la estructura o actividad de la empresa.',
  },
  {
    titulo: 'Artículo 9°. Cumplimiento de la Ley N° 21.395',
    cuerpo: 'El Oferente declara que ha implementado todas las medidas previstas en la Ley N° 21.395 que modifica la Ley N° 19.886 sobre Contratos Administrativos de Suministro y Prestación de Servicios, particularmente lo referido al Sistema de Integridad para proveedores del Estado exigido por la normativa vigente, y que se encuentra habilitado para contratar con el Estado conforme al Registro de Proveedores de ChileCompra.',
  },
  {
    titulo: 'Artículo 10°. Sanciones y Antecedentes',
    cuerpo: 'El Oferente declara que NO se encuentra inhabilitado para contratar con el Estado, ni tiene sanciones vigentes en el Registro de Proveedores de Mercado Público (www.mercadopublico.cl), ni está sujeto a investigaciones penales por delitos relacionados con corrupción, cohecho, fraude al Fisco, negociación incompatible, tráfico de influencias o cualquier otro delito que afecte su honor o probidad. Tampoco ha sido sancionado en virtud del Pacto de Integridad o cualquier otro documento análogo.',
  },
  {
    titulo: 'Artículo 11°. Compromiso de Cumplimiento de las Bases',
    cuerpo: 'El Oferente declara que conoce y acepta íntegramente las Bases Administrativas y Técnicas de la Licitación ' + empresa.codigoLicitacion + ' convocada por ' + empresa.organismoComprador + ', y se compromete a cumplir todas las obligaciones establecidas en ellas, así como la normativa legal y reglamentaria aplicable a los contratos administrativos de suministro y prestación de servicios.',
  },
  {
    titulo: 'Artículo 12°. Subcontratación',
    cuerpo: 'En caso de subcontratar total o parcialmente la ejecución de los servicios licitados, el Oferente declara que exigirá a sus subcontratistas la suscripción de un Pacto de Integridad equivalente al aquí declarado, así como la inclusión de cláusulas de cumplimiento de la normativa anti-corrupción aplicable, conforme a lo dispuesto en la Ley N° 21.395.',
  },
  {
    titulo: 'Artículo 13°. Veracidad de la Declaración',
    cuerpo: 'El Oferente declara que toda la información contenida en esta Declaración Jurada es veraz, completa y fidedigna. Acepta que la falsedad, ocultamiento o inexactitud de cualquiera de las declaraciones efectuadas hará responsable al Oferente de las consecuencias civiles, penales y administrativas correspondientes, incluyendo la descalificación de la oferta, la resciliación del contrato si llegare a celebrarse, y las sanciones previstas en la Ley N° 21.395, así como en la normativa sobre responsabilidad penal empresarial (Ley N° 20.393).',
  },
]

articulos.forEach((art) => {
  declaraciones.push(
    new Paragraph({
      spacing: { before: 200, after: 100, line: 312 },
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: art.titulo, bold: true, size: 22, color: '1E40AF' })],
    }),
    new Paragraph({
      spacing: { after: 200, line: 312 },
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: 480 },
      children: [new TextRun({ text: art.cuerpo, ...bodyStyle })],
    })
  )
})

// ============ FIRMA ============
const firma = [
  new Paragraph({
    spacing: { before: 400, after: 100 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `Para constancia y en fe de lo cual, firman la presente Declaración Jurada en ${empresa.ciudad}, a ${empresa.fechaFirma}.`, ...bodyStyle, italics: true })],
  }),
  new Paragraph({
    spacing: { before: 800, after: 50 },
    alignment: AlignmentType.CENTER,
    border: { top: { color: '0F172A', space: 1, style: BorderStyle.SINGLE, size: 6 } },
    children: [new TextRun({ text: '_______________________________________', ...firmaStyle })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 50 },
    children: [new TextRun({ text: empresa.representanteLegal, bold: true, size: 22, color: '0F172A' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: 'Representante Legal', ...smallStyle })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 50 },
    children: [new TextRun({ text: empresa.razonSocial, bold: true, size: 22, color: '0F172A' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: `RUT: ${empresa.rut}`, ...firmaStyle })],
  }),
]

// ============ NOTA LEGAL ============
const notaLegal = [
  new Paragraph({
    spacing: { before: 600, after: 100 },
    border: { top: { color: '94A3B8', space: 1, style: BorderStyle.SINGLE, size: 4 } },
    children: [new TextRun({
      text: 'NOTA LEGAL',
      bold: true, size: 18, color: '475569',
    })],
  }),
  new Paragraph({
    spacing: { after: 100, line: 280 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({
      text: 'Esta Declaración Jurada debe ser: (1) impresa en papel con membrete de la empresa; (2) firmada en presencia de Notario Público o Notario Mayor; (3) acompañada de copia digital (PDF) al momento de subir la oferta a Mercado Público. La falsedad de esta declaración expone al oferente a las sanciones penales y administrativas contempladas en la Ley N° 21.395, Ley N° 20.393 y Ley N° 19.080.',
      ...smallStyle,
    })],
  }),
]

// ============ DOCUMENTO ============
const doc = new Document({
  creator: 'MaritimeVTS',
  title: 'Declaración Jurada Programa de Integridad',
  description: 'Documento formal conforme a Ley 21.395 y Ley 20.393',
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
        margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 }, // 2cm
      },
    },
    children: [
      ...encabezado,
      ...identificacion,
      ...declaraciones,
      ...firma,
      ...notaLegal,
    ],
  }],
})

// ============ GENERAR ============
async function main() {
  console.log('📝 Generando Declaración Jurada de Programa de Integridad...')
  const buffer = await Packer.toBuffer(doc)
  const outputPath = '/home/z/my-project/download/Declaracion-Jurada-Programa-Integridad.docx'
  writeFileSync(outputPath, buffer)
  console.log(`✓ Documento generado: ${outputPath}`)
  console.log(`  Tamaño: ${(buffer.length / 1024).toFixed(1)} KB`)
  console.log('')
  console.log('📋 Instrucciones:')
  console.log('  1. Abre el archivo .docx en Word/LibreOffice')
  console.log('  2. Rellena los campos con guiones bajos (____) con los datos de tu empresa')
  console.log('  3. Imprime en papel con membrete')
  console.log('  4. Firma ante Notario Público')
  console.log('  5. Escanea como PDF')
  console.log('  6. Sube el PDF a Mercado Público junto con tu oferta')
}

main().catch(e => {
  console.error('❌ Error:', e)
  process.exit(1)
})
