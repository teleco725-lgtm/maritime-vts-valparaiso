// Datos simulados de buques, AIS, alertas y métricas para el sistema VTS
// Puerto de Valparaíso — TCP (Terminal de Contenedores)

export interface Vessel {
  id: string
  mmsi: string
  imo: string
  name: string
  flag: string
  type: 'container' | 'tanker' | 'bulk' | 'cargo' | 'passenger' | 'fishing' | 'tug'
  length: number
  beam: number
  draft: number
  sog: number // Speed Over Ground (nudos)
  cog: number // Course Over Ground (grados)
  heading: number
  lat: number
  lng: number
  eta: string
  destination: string
  status: 'underway' | 'anchored' | 'moored' | 'restricted' | 'arrival'
  flag_state: 'CL' | 'PA' | 'LR' | 'MH' | 'SG' | 'CN' | 'US' | 'DE' | 'JP'
  registry: 'SNRB' | 'IMO' | 'SERNAPESCA' | 'Extranjero'
  confidence: number // % confianza en posición GPS corregida con IA
  lastUpdate: string
  // Coordenadas locales en el mapa SVG (0-1000 x 0-600)
  x: number
  y: number
  trail: { x: number; y: number }[]
}

export const vessels: Vessel[] = [
  {
    id: 'v1', mmsi: '725003500', imo: '9773742', name: 'MSC ISABELLA',
    flag: 'Panamá', type: 'container', length: 366, beam: 51, draft: 14.5,
    sog: 12.3, cog: 45, heading: 47, lat: -33.0420, lng: -71.6280,
    eta: '2026-10-01 14:30', destination: 'TCP Valparaíso — Muelle 5',
    status: 'arrival', flag_state: 'PA', registry: 'IMO', confidence: 99.2,
    lastUpdate: 'hace 3 seg', x: 720, y: 480,
    trail: [{ x: 720, y: 480 }, { x: 700, y: 470 }, { x: 680, y: 460 }],
  },
  {
    id: 'v2', mmsi: '636019825', imo: '9483728', name: 'EVER GIVEN',
    flag: 'Liberia', type: 'container', length: 400, beam: 59, draft: 15.8,
    sog: 0.0, cog: 0, heading: 92, lat: -33.0350, lng: -71.6320,
    eta: 'Atracado', destination: 'TCP Valparaíso — Muelle 3',
    status: 'moored', flag_state: 'LR', registry: 'IMO', confidence: 100,
    lastUpdate: 'hace 1 seg', x: 480, y: 320,
    trail: [{ x: 480, y: 320 }],
  },
  {
    id: 'v3', mmsi: '538008764', imo: '9738271', name: 'CMA CGM JACQUES',
    flag: 'Marshall Is.', type: 'container', length: 350, beam: 48, draft: 13.2,
    sog: 8.7, cog: 220, heading: 218, lat: -33.0500, lng: -71.6150,
    eta: '2026-10-01 16:00', destination: 'TCP Valparaíso — Muelle 7',
    status: 'underway', flag_state: 'MH', registry: 'IMO', confidence: 98.5,
    lastUpdate: 'hace 4 seg', x: 580, y: 200,
    trail: [{ x: 580, y: 200 }, { x: 600, y: 220 }, { x: 620, y: 250 }],
  },
  {
    id: 'v4', mmsi: '725004200', imo: '9302456', name: 'SAN ANTONIO EXPRESS',
    flag: 'Panamá', type: 'container', length: 280, beam: 32, draft: 11.0,
    sog: 0.0, cog: 0, heading: 270, lat: -33.0372, lng: -71.6340,
    eta: 'Atracado', destination: 'TCP Valparaíso — Muelle 1',
    status: 'moored', flag_state: 'PA', registry: 'IMO', confidence: 100,
    lastUpdate: 'hace 2 seg', x: 380, y: 350,
    trail: [{ x: 380, y: 350 }],
  },
  {
    id: 'v5', mmsi: '413005600', imo: '9183746', name: 'CHIQUITA CANADA',
    flag: 'Singapur', type: 'container', length: 240, beam: 32, draft: 10.5,
    sog: 15.4, cog: 90, heading: 88, lat: -33.0700, lng: -71.6600,
    eta: '2026-10-01 18:45', destination: 'Zona de fondeo No.2',
    status: 'arrival', flag_state: 'SG', registry: 'IMO', confidence: 97.8,
    lastUpdate: 'hace 5 seg', x: 850, y: 540,
    trail: [{ x: 850, y: 540 }, { x: 830, y: 555 }, { x: 810, y: 560 }],
  },
  {
    id: 'v6', mmsi: '725005900', imo: '9492034', name: 'MAERSK HALIFAX',
    flag: 'Panamá', type: 'container', length: 353, beam: 53, draft: 14.0,
    sog: 0.0, cog: 0, heading: 270, lat: -33.0340, lng: -71.6355,
    eta: 'Atracado', destination: 'TCP Valparaíso — Muelle 5',
    status: 'moored', flag_state: 'PA', registry: 'IMO', confidence: 100,
    lastUpdate: 'hace 1 seg', x: 520, y: 290,
    trail: [{ x: 520, y: 290 }],
  },
  {
    id: 'v7', mmsi: '725000120', imo: '9023847', name: 'RANCAGUA',
    flag: 'Chile', type: 'tug', length: 32, beam: 12, draft: 5.5,
    sog: 6.5, cog: 315, heading: 312, lat: -33.0380, lng: -71.6290,
    eta: 'En operación', destination: 'Asistencia atraque MSC ISABELLA',
    status: 'underway', flag_state: 'CL', registry: 'SNRB', confidence: 99.8,
    lastUpdate: 'hace 2 seg', x: 670, y: 430,
    trail: [{ x: 670, y: 430 }, { x: 690, y: 450 }, { x: 700, y: 470 }],
  },
  {
    id: 'v8', mmsi: '725000135', imo: '8972341', name: 'VALPARAÍSO III',
    flag: 'Chile', type: 'tug', length: 30, beam: 11, draft: 5.2,
    sog: 7.2, cog: 280, heading: 275, lat: -33.0395, lng: -71.6295,
    eta: 'En operación', destination: 'Asistencia atraque MSC ISABELLA',
    status: 'underway', flag_state: 'CL', registry: 'SNRB', confidence: 99.6,
    lastUpdate: 'hace 1 seg', x: 690, y: 450,
    trail: [{ x: 690, y: 450 }, { x: 700, y: 460 }, { x: 710, y: 470 }],
  },
  {
    id: 'v9', mmsi: '725070034', imo: '8723610', name: 'DONA FRANCISCA',
    flag: 'Chile', type: 'fishing', length: 45, beam: 9, draft: 4.2,
    sog: 4.1, cog: 110, heading: 105, lat: -33.0620, lng: -71.6480,
    eta: 'En faena', destination: 'Caleta El Membrillo',
    status: 'underway', flag_state: 'CL', registry: 'SERNAPESCA', confidence: 96.5,
    lastUpdate: 'hake 8 seg', x: 750, y: 470,
    trail: [{ x: 750, y: 470 }, { x: 740, y: 460 }],
  },
  {
    id: 'v10', mmsi: '636099728', imo: '9305521', name: 'NORDIC BREEZE',
    flag: 'Liberia', type: 'bulk', length: 200, beam: 32, draft: 11.5,
    sog: 0.0, cog: 0, heading: 180, lat: -33.0410, lng: -71.6450,
    eta: 'En fondeo', destination: 'Zona de fondeo No.1',
    status: 'anchored', flag_state: 'LR', registry: 'IMO', confidence: 99.1,
    lastUpdate: 'hace 12 seg', x: 620, y: 460,
    trail: [{ x: 620, y: 460 }],
  },
  {
    id: 'v11', mmsi: '477255400', imo: '9801234', name: 'COSCO SHIPPING',
    flag: 'China', type: 'container', length: 370, beam: 48, draft: 14.2,
    sog: 18.2, cog: 75, heading: 73, lat: -33.0850, lng: -71.6950,
    eta: '2026-10-02 06:00', destination: 'TCP Valparaíso — Muelle 5',
    status: 'arrival', flag_state: 'CN', registry: 'IMO', confidence: 98.9,
    lastUpdate: 'hace 6 seg', x: 920, y: 580,
    trail: [{ x: 920, y: 580 }, { x: 900, y: 590 }, { x: 880, y: 595 }],
  },
  {
    id: 'v12', mmsi: '369928000', imo: '9418923', name: 'PACIFIC STAR',
    flag: 'EEUU', type: 'tanker', length: 245, beam: 42, draft: 12.8,
    sog: 9.8, cog: 250, heading: 245, lat: -33.0750, lng: -71.6700,
    eta: '2026-10-01 20:15', destination: 'Monoboya EVL — Enap',
    status: 'underway', flag_state: 'US', registry: 'IMO', confidence: 97.4,
    lastUpdate: 'hace 4 seg', x: 880, y: 480,
    trail: [{ x: 880, y: 480 }, { x: 890, y: 500 }, { x: 895, y: 520 }],
  },
  // === BUQUES ADICIONALES (datos reales de líneas que operan en Valparaíso) ===
  {
    id: 'v13', mmsi: '636092674', imo: '9863975', name: 'HAPAG-LLOYD COLOMBO',
    flag: 'Liberia', type: 'container', length: 366, beam: 48, draft: 14.0,
    sog: 14.2, cog: 65, heading: 63, lat: -33.0920, lng: -71.7050,
    eta: '2026-10-02 08:30', destination: 'TCP Valparaíso — Muelle 7',
    status: 'arrival', flag_state: 'LR', registry: 'IMO', confidence: 98.7,
    lastUpdate: 'hace 7 seg', x: 940, y: 560,
    trail: [{ x: 940, y: 560 }, { x: 920, y: 570 }, { x: 900, y: 580 }],
  },
  {
    id: 'v14', mmsi: '248442000', imo: '9776411', name: 'NYK ORPHEUS',
    flag: 'Malta', type: 'container', length: 320, beam: 48, draft: 12.5,
    sog: 0.0, cog: 0, heading: 270, lat: -33.0365, lng: -71.6352,
    eta: 'Atracado', destination: 'TCP Valparaíso — Muelle 3',
    status: 'moored', flag_state: 'MT', registry: 'IMO', confidence: 100,
    lastUpdate: 'hace 1 seg', x: 460, y: 320,
    trail: [{ x: 460, y: 320 }],
  },
  {
    id: 'v15', mmsi: '477198000', imo: '9587654', name: 'COSCO BANGKOK',
    flag: 'Hong Kong', type: 'container', length: 350, beam: 51, draft: 13.5,
    sog: 16.5, cog: 80, heading: 78, lat: -33.1050, lng: -71.7200,
    eta: '2026-10-02 14:00', destination: 'TCP Valparaíso — Muelle 5',
    status: 'arrival', flag_state: 'HK', registry: 'IMO', confidence: 98.2,
    lastUpdate: 'hace 6 seg', x: 960, y: 580,
    trail: [{ x: 960, y: 580 }, { x: 940, y: 590 }, { x: 920, y: 595 }],
  },
  {
    id: 'v16', mmsi: '273456789', imo: '9448123', name: 'EVER LIVING',
    flag: 'Panamá', type: 'container', length: 304, beam: 37, draft: 11.8,
    sog: 0.0, cog: 0, heading: 90, lat: -33.0368, lng: -71.6358,
    eta: 'Atracado', destination: 'TCP Valparaíso — Muelle 7',
    status: 'moored', flag_state: 'PA', registry: 'IMO', confidence: 100,
    lastUpdate: 'hace 1 seg', x: 600, y: 350,
    trail: [{ x: 600, y: 350 }],
  },
  {
    id: 'v17', mmsi: '725004500', imo: '9801234', name: 'TUG ALONSO',
    flag: 'Chile', type: 'tug', length: 28, beam: 10, draft: 5.0,
    sog: 8.5, cog: 320, heading: 318, lat: -33.0370, lng: -71.6300,
    eta: 'En operación', destination: 'Asistencia atraque HAPAG-LLOYD',
    status: 'underway', flag_state: 'CL', registry: 'SNRB', confidence: 99.5,
    lastUpdate: 'hace 2 seg', x: 680, y: 410,
    trail: [{ x: 680, y: 410 }, { x: 690, y: 420 }, { x: 700, y: 430 }],
  },
  {
    id: 'v18', mmsi: '273456790', imo: '9448125', name: 'HAPAG-LLOYD QUITO',
    flag: 'Singapur', type: 'container', length: 332, beam: 42, draft: 13.0,
    sog: 0.0, cog: 0, heading: 180, lat: -33.0400, lng: -71.6460,
    eta: 'En fondeo', destination: 'Zona de fondeo No.3',
    status: 'anchored', flag_state: 'SG', registry: 'IMO', confidence: 99.3,
    lastUpdate: 'hace 15 seg', x: 640, y: 470,
    trail: [{ x: 640, y: 470 }],
  },
  {
    id: 'v19', mmsi: '725075000', imo: '8972300', name: 'PESCA MAR III',
    flag: 'Chile', type: 'fishing', length: 38, beam: 8, draft: 3.8,
    sog: 5.5, cog: 130, heading: 125, lat: -33.0650, lng: -71.6500,
    eta: 'En faena', destination: 'Caleta El Membrillo',
    status: 'underway', flag_state: 'CL', registry: 'SERNAPESCA', confidence: 95.2,
    lastUpdate: 'hace 9 seg', x: 730, y: 480,
    trail: [{ x: 730, y: 480 }, { x: 720, y: 470 }],
  },
  {
    id: 'v20', mmsi: '725004700', imo: '9302457', name: 'HMM ALGECIRAS',
    flag: 'Panamá', type: 'container', length: 400, beam: 61, draft: 16.0,
    sog: 19.5, cog: 70, heading: 68, lat: -33.1150, lng: -71.7400,
    eta: '2026-10-03 06:00', destination: 'TCP Valparaíso — Muelle 5',
    status: 'arrival', flag_state: 'PA', registry: 'IMO', confidence: 98.8,
    lastUpdate: 'hace 8 seg', x: 980, y: 590,
    trail: [{ x: 980, y: 590 }, { x: 970, y: 595 }],
  },
  // === 4 BUQUES ADICIONALES — POTENCIA NAVIS ===
  {
    id: 'v21', mmsi: '563158000', imo: '9726901', name: 'ONE INNOVATION',
    flag: 'Singapur', type: 'container', length: 366, beam: 51, draft: 14.8,
    sog: 17.2, cog: 55, heading: 53, lat: -33.0980, lng: -71.7100,
    eta: '2026-10-02 22:00', destination: 'TCP Valparaíso — Muelle 5',
    status: 'arrival', flag_state: 'SG', registry: 'IMO', confidence: 98.5,
    lastUpdate: 'hace 5 seg', x: 950, y: 575,
    trail: [{ x: 950, y: 575 }, { x: 930, y: 580 }],
  },
  {
    id: 'v22', mmsi: '431739000', imo: '9811242', name: 'NYK CONSTELLATION',
    flag: 'Japón', type: 'container', length: 320, beam: 48, draft: 12.0,
    sog: 0.0, cog: 0, heading: 90, lat: -33.0370, lng: -71.6360,
    eta: 'Atracado', destination: 'TCP Valparaíso — Muelle 1',
    status: 'moored', flag_state: 'JP', registry: 'IMO', confidence: 100,
    lastUpdate: 'hace 1 seg', x: 250, y: 350,
    trail: [{ x: 250, y: 350 }],
  },
  {
    id: 'v23', mmsi: '725004900', imo: '9665234', name: 'PIL KOTA TENAGA',
    flag: 'Singapur', type: 'container', length: 279, beam: 40, draft: 11.5,
    sog: 13.8, cog: 85, heading: 83, lat: -33.1080, lng: -71.7300,
    eta: '2026-10-02 16:30', destination: 'TCP Valparaíso — Muelle 7',
    status: 'arrival', flag_state: 'SG', registry: 'IMO', confidence: 98.1,
    lastUpdate: 'hace 6 seg', x: 970, y: 585,
    trail: [{ x: 970, y: 585 }, { x: 950, y: 590 }],
  },
  {
    id: 'v24', mmsi: '209613000', imo: '9454521', name: 'YANG MING FRIEND',
    flag: 'Taiwan', type: 'container', length: 332, beam: 45, draft: 13.2,
    sog: 0.0, cog: 0, heading: 180, lat: -33.0380, lng: -71.6470,
    eta: 'En fondeo', destination: 'Zona de fondeo No.2',
    status: 'anchored', flag_state: 'TW', registry: 'IMO', confidence: 99.2,
    lastUpdate: 'hace 18 seg', x: 660, y: 480,
    trail: [{ x: 660, y: 480 }],
  },
]

export interface AlertItem {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'proximity' | 'geofence' | 'speed' | 'comms' | 'security' | 'metocean'
  vessel?: string
  title: string
  description: string
  timestamp: string
  status: 'active' | 'acknowledged' | 'resolved'
  source?: 'SHOA' | 'MeteoChile' | 'SERVIMET' | 'Directemar' | 'Sistema VTS' | 'CSIRT'
}

export const alerts: AlertItem[] = [
  {
    id: 'a1', severity: 'high', type: 'proximity', vessel: 'MSC ISABELLA',
    title: 'Aproximación a canal de acceso',
    description: 'Buque MSC ISABELLA (IMO 9773742) ingresando a canal de acceso. SOG 12.3 kn — dentro de parámetros. Coordinar práctico.',
    timestamp: 'hace 30 seg', status: 'active',
  },
  {
    id: 'a2', severity: 'medium', type: 'geofence', vessel: 'DONA FRANCISCA',
    title: 'Buque pesquero próximo a zona restringida',
    description: 'Embarcación DONA FRANCISCA (SERNAPESCA) a 0.4 mn de zona de seguridad portuaria. Vigilar rumbo.',
    timestamp: 'hace 1 min', status: 'active',
  },
  {
    id: 'a3', severity: 'critical', type: 'security',
    title: 'Intento de intrusión cibernética detectado',
    description: 'CSIRT: 3 intentos de login no autorizado en API VTS desde IP 190.234.x.x. Bloqueado por firewall.',
    timestamp: 'hace 2 min', status: 'active',
  },
  {
    id: 'a4', severity: 'low', type: 'metocean',
    title: 'Niebla costera en aproximación',
    description: 'Visibilidad reducida a 1.2 mn en zona de aproximación SW. Se recomienda uso de cámara térmica.',
    timestamp: 'hace 5 min', status: 'active',
  },
  {
    id: 'a5', severity: 'medium', type: 'speed', vessel: 'COSCO SHIPPING',
    title: 'Velocidad de aproximación elevada',
    description: 'COSCO SHIPPING (IMO 9801234) reporta SOG 18.2 kn. Velocidad recomendada en zona de aproximación: ≤14 kn.',
    timestamp: 'hace 6 min', status: 'acknowledged',
  },
  {
    id: 'a6', severity: 'low', type: 'comms', vessel: 'PACIFIC STAR',
    title: 'Discrepancia AIS vs Radar',
    description: 'PACIFIC STAR muestra posición AIS desfasada 4m respecto a plot radar. Fusión IA corrigió a 97.4% confianza.',
    timestamp: 'hace 8 min', status: 'resolved', source: 'Sistema VTS',
  },
  // === ALERTAS METEOROLÓGICAS Y OCEANOGRÁFICAS — SHOA + MeteoChile/SERVIMET ===

  // CRÍTICAS — Cierre de Puerto / Marejadas Severas
  {
    id: 'm1', severity: 'critical', type: 'metocean',
    title: 'AVISO SHOA: Marejada Prominente en Bahía de Valparaíso',
    description: 'SHOA emite Aviso de Marejadas Prominentes. Altura significativa 3.5m con períodos 14-16s desde sector SW. Restricción total de maniobras de practicaje. Suspender atraques en Muelles 1, 3 y 5 del espigón TCP.',
    timestamp: 'hace 15 min', status: 'active', source: 'SHOA',
  },
  {
    id: 'm2', severity: 'critical', type: 'metocean',
    title: 'CIERRE DE PUERTO — Gobernación Marítima Valparaíso',
    description: 'Capitanía de Puerto ordena CIERRE TEMPORAL de maniobras por marejadas severas (Hs > 3.0m). Suspensión total de atraques y zarpe hasta nuevo aviso. Buques en aproximación derivar a zona de fondeo No.1.',
    timestamp: 'hace 18 min', status: 'active', source: 'Directemar',
  },
  {
    id: 'm3', severity: 'critical', type: 'metocean',
    title: 'Restricción de Calado por Marea — SHOA',
    description: 'Marea baja extraordinaria (-0.32m sobre cero de bajamar). Calado máximo permitido en canal de acceso reducido a 11.2m. Buques con calado >11.0m deben esperar pleamar próxima (14:52 CLT).',
    timestamp: 'hace 25 min', status: 'active', source: 'SHOA',
  },

  // MEDIAS — Ráfagas de Viento / Niebla Densa
  {
    id: 'm4', severity: 'medium', type: 'metocean',
    title: 'Viento Fuerte en Puerto — MeteoChile/SERVIMET (>20 nudos)',
    description: 'Pronóstico MeteoChile: viento SO 22-28 nudos con ráfagas hasta 35 nudos en próximas 6 horas. Restricción de velocidad en canal de acceso a 8 nudos. Detención preventiva de grúas STS en Muelles 5 y 7 cuando ráfaga >30kn.',
    timestamp: 'hace 32 min', status: 'active', source: 'MeteoChile',
  },
  {
    id: 'm5', severity: 'medium', type: 'metocean',
    title: 'Baja Visibilidad por Niebla — SERVIMET (<0.5 MN)',
    description: 'Niebla costera advección desde sector SW. Visibilidad actual: 0.4 MN en zona de aproximación. Restricción de maniobras a un buque a la vez en canal. Activar cámara térmica de Muelle 1.',
    timestamp: 'hace 40 min', status: 'active', source: 'SERVIMET',
  },
  {
    id: 'm6', severity: 'medium', type: 'metocean',
    title: 'Aviso de Ráfagas para Grúas STS — MeteoChile',
    description: 'Ráfagas previstas de 30-38 nudos entre 16:00-20:00 CLT. Suspensión preventiva de operación de grúas gantry en Muelles 5 y 7. Reanudación sujeta a confirmación de viento <25kn sostenido.',
    timestamp: 'hace 48 min', status: 'acknowledged', source: 'MeteoChile',
  },
  {
    id: 'm7', severity: 'medium', type: 'metocean',
    title: 'Estado del Mar en Bahía — SHOA',
    description: 'Estado del mar: Mar gruesa (Douglas 5). Altura significativa 2.1m, dirección SW. Período pico 11s. Restricción de transferencia de prácticos en zona de embarque No.1 — usar zona No.2.',
    timestamp: 'hace 55 min', status: 'active', source: 'SHOA',
  },

  // INFORMATIVAS — Boletín Meteorológico Diario
  {
    id: 'm8', severity: 'low', type: 'metocean',
    title: 'Boletín Meteorológico Diario — MeteoChile/SHOA',
    description: 'Pronóstico 24h: Viento SO 15-20kn disminuyendo. Marea alta 14:52 (+1.18m), baja 21:15 (-0.15m). Oleaje SW 1.8m. Visibilidad >5MN. Temperatura 14-19°C. Condiciones operativas favorables para ventana de arribos 06:00-14:00.',
    timestamp: 'hace 1 h', status: 'active', source: 'MeteoChile',
  },
  {
    id: 'm9', severity: 'low', type: 'metocean',
    title: 'Tabla de Marea — SHOA Valparaíso',
    description: 'Pleamar: 14:52 CLT (+1.18m). Bajamar: 21:15 CLT (-0.15m). Próxima pleamar: 03:08 (+1.22m). Ventana operativa de calado máximo: 13:00-16:00 (calado máx 14.5m). Planificación de arribos pesados recomendada en esta ventana.',
    timestamp: 'hace 1 h', status: 'active', source: 'SHOA',
  },
  {
    id: 'm10', severity: 'low', type: 'metocean',
    title: 'Pronóstico Océano — SHOA/SECOSTA',
    description: 'Corriente superficial SO 0.5-0.8 nudos. Temperatura superficie mar: 13.8°C. Salinidad: 34.5‰. Sin alerta de tsunami activa. Estado de alerta sísmica costera: VERDE (sin novedad).',
    timestamp: 'hace 2 h', status: 'active', source: 'SHOA',
  },
]

export interface KPI {
  label: string
  value: string
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendValue: string
  description: string
}

export const kpis: KPI[] = [
  {
    label: 'Buques en Zona VTS',
    value: '24', unit: 'naves', trend: 'up', trendValue: '+4',
    description: 'Operando dentro del mar territorial de Valparaíso',
  },
  {
    label: 'Buques Atracados',
    value: '6', unit: 'naves', trend: 'up', trendValue: '+2',
    description: 'En muelles TCP 1, 3, 5 y 7',
  },
  {
    label: 'Buques en Aproximación',
    value: '8', unit: 'naves', trend: 'up', trendValue: '+5',
    description: 'Con ETA programada en próximas 6 horas',
  },
  {
    label: 'Precisión GPS Promedio',
    value: '98.9', unit: '%', trend: 'up', trendValue: '+0.3',
    description: 'Confianza media tras fusión IA (Kalman + LSTM)',
  },
  {
    label: 'Ocupación de Muelle',
    value: '78', unit: '%', trend: 'up', trendValue: '+5',
    description: 'Capacidad operativa TCP Valparaíso',
  },
  {
    label: 'Alertas Activas',
    value: '16', unit: 'ev', trend: 'up', trendValue: '+11',
    description: 'Distribuidas: 1 crítica, 2 medias, 2 bajas',
  },
  {
    label: 'Tiempo Prom. de Espera',
    value: '2.4', unit: 'h', trend: 'down', trendValue: '-0.6',
    description: 'Reducción respecto al mes anterior',
  },
  {
    label: 'Cumplimiento IALA',
    value: '100', unit: '%', trend: 'stable', trendValue: '0',
    description: 'Procedimientos VTS conforme IALA V-103',
  },
]

// Datos para gráficos
export const trafficTrend = [
  { hora: '00:00', entradas: 2, salidas: 1 },
  { hora: '04:00', entradas: 1, salidas: 3 },
  { hora: '08:00', entradas: 4, salidas: 2 },
  { hora: '12:00', entradas: 3, salidas: 2 },
  { hora: '16:00', entradas: 5, salidas: 3 },
  { hora: '20:00', entradas: 2, salidas: 4 },
]

export const vesselTypeDistribution = [
  { name: 'Portacontenedores', value: 16, color: '#0ea5e9' },
  { name: 'Remolcador', value: 3, color: '#10b981' },
  { name: 'Pesquero', value: 2, color: '#f59e0b' },
  { name: 'Granelero', value: 1, color: '#8b5cf6' },
  { name: 'Tanquero', value: 1, color: '#ef4444' },
  { name: 'Otros', value: 1, color: '#6b7280' },
]

export const flagDistribution = [
  { flag: '🇨🇱 Chile', count: 4 },
  { flag: '🇵🇦 Panamá', count: 5 },
  { flag: '🇸🇬 Singapur', count: 4 },
  { flag: '🇱🇷 Liberia', count: 3 },
  { flag: '🇯🇵 Japón', count: 1 },
  { flag: '🇨🇳 China', count: 1 },
  { flag: '🇺🇸 EEUU', count: 1 },
  { flag: '🇹🇼 Taiwan', count: 1 },
  { flag: '🇲🇹 Malta', count: 1 },
  { flag: '🇭🇰 Hong Kong', count: 1 },
  { flag: '🇲🇭 Marshall Is.', count: 1 },
]

export const cameraFeeds = [
  { id: 'cam1', name: 'Cam 01 — Boca del Puerto', zone: 'Acceso', online: true, type: 'PTZ' },
  { id: 'cam2', name: 'Cam 02 — Canal de Acceso', zone: 'Canal', online: true, type: 'PTZ' },
  { id: 'cam3', name: 'Cam 03 — Muelle 1 (Norte)', zone: 'Muelle 1', online: true, type: 'Fija' },
  { id: 'cam4', name: 'Cam 04 — Muelle 3', zone: 'Muelle 3', online: true, type: 'PTZ' },
  { id: 'cam5', name: 'Cam 05 — Muelle 5 (Centro)', zone: 'Muelle 5', online: true, type: 'PTZ' },
  { id: 'cam6', name: 'Cam 06 — Muelle 7', zone: 'Muelle 7', online: true, type: 'Fija' },
  { id: 'cam7', name: 'Cam 07 — Zona de Fondeo', zone: 'Fondeo', online: true, type: 'Térmica' },
  { id: 'cam8', name: 'Cam 08 — Espigón Sur', zone: 'Espigón', online: true, type: 'Térmica' },
]

export const getVesselStatusColor = (status: Vessel['status']): string => {
  const colors: Record<Vessel['status'], string> = {
    underway: '#0ea5e9',
    anchored: '#f59e0b',
    moored: '#10b981',
    restricted: '#ef4444',
    arrival: '#8b5cf6',
  }
  return colors[status]
}

export const getVesselTypeLabel = (type: Vessel['type']): string => {
  const labels: Record<Vessel['type'], string> = {
    container: 'Portacontenedores',
    tanker: 'Tanquero',
    bulk: 'Granelero',
    cargo: 'Carga General',
    passenger: 'Pasajeros',
    fishing: 'Pesquero',
    tug: 'Remolcador',
  }
  return labels[type]
}

export const getStatusLabel = (status: Vessel['status']): string => {
  const labels: Record<Vessel['status'], string> = {
    underway: 'En navegación',
    anchored: 'Fondeado',
    moored: 'Atracado',
    restricted: 'Restringido',
    arrival: 'En aproximación',
  }
  return labels[status]
}
