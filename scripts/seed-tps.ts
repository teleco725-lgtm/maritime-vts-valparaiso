// Seed para la base de datos TPS - simula datos reales de TCP Valparaíso
import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Iniciando seed TPS Valparaíso...')

  // 1. Muelles
  const berths = [
    { berthCode: 'M1', lengthM: 220, maxDraftM: 11.5, status: 'operational', operator: 'TPS', cranesCount: 2 },
    { berthCode: 'M3', lengthM: 280, maxDraftM: 13.0, status: 'operational', operator: 'TPS', cranesCount: 3 },
    { berthCode: 'M5', lengthM: 350, maxDraftM: 14.5, status: 'operational', operator: 'TPS', cranesCount: 4 },
    { berthCode: 'M7', lengthM: 300, maxDraftM: 13.5, status: 'operational', operator: 'TPS', cranesCount: 3 },
  ]
  for (const b of berths) {
    await db.berth.create({ data: b })
  }
  console.log(`✓ ${berths.length} muelles creados`)

  // 2. Buques (registros TPS)
  const vessels = [
    {
      mmsi: '725003500', imo: '9773742', name: 'MSC ISABELLA',
      flag: 'Panamá', type: 'container', lengthM: 366, beamM: 51, draftM: 14.5,
      grossTonnage: 176000, netTonnage: 110000, yearBuilt: 2015,
      operator: 'MSC Mediterranean Shipping Co.', registry: 'IMO', lastPort: 'Callao, PE',
    },
    {
      mmsi: '636019825', imo: '9483728', name: 'EVER GIVEN',
      flag: 'Liberia', type: 'container', lengthM: 400, beamM: 59, draftM: 15.8,
      grossTonnage: 219000, netTonnage: 138000, yearBuilt: 2018,
      operator: 'Evergreen Line', registry: 'IMO', lastPort: 'San Antonio, CL',
    },
    {
      mmsi: '538008764', imo: '9738271', name: 'CMA CGM JACQUES',
      flag: 'Marshall Is.', type: 'container', lengthM: 350, beamM: 48, draftM: 13.2,
      grossTonnage: 152000, netTonnage: 95000, yearBuilt: 2014,
      operator: 'CMA CGM Group', registry: 'IMO', lastPort: 'Buenos Aires, AR',
    },
    {
      mmsi: '725004200', imo: '9302456', name: 'SAN ANTONIO EXPRESS',
      flag: 'Panamá', type: 'container', lengthM: 280, beamM: 32, draftM: 11.0,
      grossTonnage: 78000, netTonnage: 49000, yearBuilt: 2010,
      operator: 'Hapag-Lloyd', registry: 'IMO', lastPort: 'Coronel, CL',
    },
    {
      mmsi: '725005900', imo: '9492034', name: 'MAERSK HALIFAX',
      flag: 'Panamá', type: 'container', lengthM: 353, beamM: 53, draftM: 14.0,
      grossTonnage: 165000, netTonnage: 103000, yearBuilt: 2016,
      operator: 'Maersk Line', registry: 'IMO', lastPort: 'Hong Kong, CN',
    },
    {
      mmsi: '477255400', imo: '9801234', name: 'COSCO SHIPPING',
      flag: 'China', type: 'container', lengthM: 370, beamM: 48, draftM: 14.2,
      grossTonnage: 190000, netTonnage: 118000, yearBuilt: 2017,
      operator: 'COSCO Shipping Lines', registry: 'IMO', lastPort: 'Shanghai, CN',
    },
    {
      mmsi: '636099728', imo: '9305521', name: 'NORDIC BREEZE',
      flag: 'Liberia', type: 'bulk', lengthM: 200, beamM: 32, draftM: 11.5,
      grossTonnage: 58000, netTonnage: 36000, yearBuilt: 2011,
      operator: 'Gearbulk Holding', registry: 'IMO', lastPort: 'Tubarão, BR',
    },
    {
      mmsi: '369928000', imo: '9418923', name: 'PACIFIC STAR',
      flag: 'EEUU', type: 'tanker', lengthM: 245, beamM: 42, draftM: 12.8,
      grossTonnage: 67000, netTonnage: 42000, yearBuilt: 2013,
      operator: 'Chevron Shipping', registry: 'IMO', lastPort: 'Long Beach, US',
    },
  ]

  for (const v of vessels) {
    await db.vesselRecord.create({ data: v })
  }
  console.log(`✓ ${vessels.length} buques registrados`)

  // 3. Arribos / Operaciones
  const now = new Date()
  const arrivals = [
    { vesselMmsi: '725003500', berthCode: 'M5', eta: new Date(now.getTime() + 2 * 3600000), status: 'arriving', cargoType: 'import', teu: 4200, pilotName: 'P. González', tugCount: 2, notes: 'Operación de descarga completa programada' },
    { vesselMmsi: '636019825', berthCode: 'M3', eta: new Date(now.getTime() - 4 * 3600000), ata: new Date(now.getTime() - 4 * 3600000), status: 'alongside', cargoType: 'transhipment', teu: 3800, pilotName: 'P. Soto', tugCount: 2, notes: 'Carguío en progreso, 60% completado' },
    { vesselMmsi: '538008764', berthCode: null, eta: new Date(now.getTime() + 5 * 3600000), status: 'scheduled', cargoType: 'import', teu: 2500, notes: 'Atraque pendiente asignación de muelle' },
    { vesselMmsi: '725004200', berthCode: 'M1', eta: new Date(now.getTime() - 12 * 3600000), ata: new Date(now.getTime() - 12 * 3600000), atd: new Date(now.getTime() - 6 * 3600000), status: 'completed', cargoType: 'export', teu: 1800, pilotName: 'P. Vergara', tugCount: 2 },
    { vesselMmsi: '725005900', berthCode: 'M7', eta: new Date(now.getTime() - 6 * 3600000), ata: new Date(now.getTime() - 6 * 3600000), status: 'alongside', cargoType: 'transhipment', teu: 4100, pilotName: 'P. Lagos', tugCount: 2, notes: 'Operación normal' },
    { vesselMmsi: '477255400', berthCode: null, eta: new Date(now.getTime() + 28 * 3600000), status: 'scheduled', cargoType: 'import', teu: 5800, notes: 'Bucle Asia-Sudamérica' },
    { vesselMmsi: '636099728', berthCode: null, eta: new Date(now.getTime() - 24 * 3600000), status: 'completed', cargoType: 'import', teu: 0, notes: 'Descarga de granel — Terminado' },
    { vesselMmsi: '369928000', berthCode: null, eta: new Date(now.getTime() + 8 * 3600000), status: 'scheduled', cargoType: 'import', teu: 0, notes: 'Atraque monoboya EVL-Enap' },
  ]

  for (const a of arrivals) {
    const vessel = await db.vesselRecord.findUnique({ where: { mmsi: a.vesselMmsi } })
    const berth = a.berthCode ? await db.berth.findUnique({ where: { berthCode: a.berthCode } }) : null
    if (!vessel) continue
    await db.arrivals.create({
      data: {
        vesselId: vessel.id,
        berthId: berth?.id || null,
        eta: a.eta,
        atd: a.atd || null,
        ata: a.ata || null,
        status: a.status,
        cargoType: a.cargoType,
        teu: a.teu,
        pilotName: a.pilotName || null,
        tugCount: a.tugCount || 0,
        notes: a.notes || null,
      },
    })
  }
  console.log(`✓ ${arrivals.length} arribos registrados`)

  // 4. Contenedores de muestra
  const containerTypes = [
    { code: '22G1', iso: '22G1', type: 'GP', weightKg: 22000, dangerous: false, reefer: false },
    { code: '42G1', iso: '42G1', type: 'GP', weightKg: 28500, dangerous: false, reefer: false },
    { code: '45G1', iso: '45G1', type: 'GP', weightKg: 30500, dangerous: false, reefer: false },
    { code: '22R1', iso: '22R1', type: 'RF', weightKg: 24800, dangerous: false, reefer: true },
    { code: '42R1', iso: '42R1', type: 'RF', weightKg: 29200, dangerous: false, reefer: true },
    { code: '22T1', iso: '22T1', type: 'TK', weightKg: 31000, dangerous: true, reefer: false },
  ]
  const shippingLines = ['MSCU', 'CMAU', 'TGHU', 'MAEU', 'COSU', 'ECMU', 'HLCU', 'ONEU', 'EVER']
  const pods = ['CALLAO', 'BUENOS AIRES', 'SAN ANTONIO', 'CORONEL', 'LIMA', 'GUAYAQUIL', 'VALPARAISO']
  const pols = ['SHANGHAI', 'NINGBO', 'SINGAPORE', 'BUSAN', 'HONG KONG', 'LOS ANGELES', 'ROTTERDAM']
  const statuses = ['in_transit', 'discharged', 'loaded', 'gate_in', 'gate_out']

  const isabella = await db.vesselRecord.findUnique({ where: { mmsi: '725003500' } })
  const ever = await db.vesselRecord.findUnique({ where: { mmsi: '636019825' } })
  const maersk = await db.vesselRecord.findUnique({ where: { mmsi: '725005900' } })
  const cosco = await db.vesselRecord.findUnique({ where: { mmsi: '477255400' } })

  let counter = 0
  for (let i = 0; i < 60; i++) {
    const t = containerTypes[Math.floor(Math.random() * containerTypes.length)]
    const line = shippingLines[Math.floor(Math.random() * shippingLines.length)]
    const num = Math.floor(100000 + Math.random() * 900000).toString()
    const vesselPool = [isabella, ever, maersk, cosco].filter(Boolean)
    const vessel = Math.random() > 0.3 ? vesselPool[Math.floor(Math.random() * vesselPool.length)] : null

    await db.container.create({
      data: {
        containerCode: `${line}${num}`,
        isoCode: t.iso,
        type: t.type,
        weightKg: t.weightKg + Math.random() * 2000,
        vesselId: vessel?.id || null,
        pod: pods[Math.floor(Math.random() * pods.length)],
        pol: pols[Math.floor(Math.random() * pols.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        dangerous: t.dangerous,
        reefer: t.reefer,
      },
    })
    counter++
  }
  console.log(`✓ ${counter} contenedores registrados`)

  // 5. Operation log — entradas de auditoría
  const logs = [
    { type: 'arrival', severity: 'info', description: 'MSC ISABELLA (IMO 9773742) ingresando canal de acceso. ETA muelle M5: 14:30 CLT.', operator: 'VTS-OP-001' },
    { type: 'alert', severity: 'warning', description: 'COSCO SHIPPING con SOG 18.2 kn en zona de aproximación — excede límite recomendado (14 kn).', operator: 'VTS-OP-002' },
    { type: 'alert', severity: 'critical', description: 'CSIRT detectó 3 intentos de login no autorizado en API VTS. IP origen: 190.234.x.x. Firewall bloqueó.', operator: 'system' },
    { type: 'container_move', severity: 'info', description: 'Descargados 240 TEUs de MSC ISABELLA en muelle M5. Promedio: 28 mov/hora.', operator: 'TPS-PATIO' },
    { type: 'pilot_embark', severity: 'info', description: 'Práctico P. González embarcado en MSC ISABELLA. Hora: 13:42 CLT.', operator: 'PRACTICO-CTRL' },
    { type: 'departure', severity: 'info', description: 'SAN ANTONIO EXPRESS zarpó muelle M1 a las 06:15. Destino: Coronel.', operator: 'VTS-OP-001' },
    { type: 'alert', severity: 'warning', description: 'Niebla costera reportada en aproximación SW. Visibilidad 1.2 mn. Recomendación: cámara térmica.', operator: 'MET-OCEAN' },
    { type: 'container_move', severity: 'info', description: 'Cargados 1,820 TEUs en EVER GIVEN para transbordo a Buenos Aires.', operator: 'TPS-PATIO' },
  ]
  for (const log of logs) {
    await db.operationLog.create({
      data: {
        type: log.type,
        severity: log.severity,
        description: log.description,
        operator: log.operator,
        metadata: JSON.stringify({ source: 'seed', zone: 'valparaiso' }),
      },
    })
  }
  console.log(`✓ ${logs.length} entradas de auditoría registradas`)

  console.log('🎉 Seed TPS completado exitosamente')
  console.log(`   - Muelles: ${await db.berth.count()}`)
  console.log(`   - Buques: ${await db.vesselRecord.count()}`)
  console.log(`   - Arribos: ${await db.arrivals.count()}`)
  console.log(`   - Contenedores: ${await db.container.count()}`)
  console.log(`   - Logs: ${await db.operationLog.count()}`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
