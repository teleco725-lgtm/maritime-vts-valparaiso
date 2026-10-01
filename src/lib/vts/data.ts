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
    timestamp: 'hace 8 min', status: 'resolved',
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
    value: '12', unit: 'naves', trend: 'up', trendValue: '+2',
    description: 'Operando dentro del mar territorial de Valparaíso',
  },
  {
    label: 'Buques Atracados',
    value: '4', unit: 'naves', trend: 'stable', trendValue: '0',
    description: 'En muelles TCP 1, 3, 5 y 7',
  },
  {
    label: 'Buques en Aproximación',
    value: '3', unit: 'naves', trend: 'up', trendValue: '+1',
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
    value: '5', unit: 'ev', trend: 'down', trendValue: '-2',
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
  { name: 'Portacontenedores', value: 6, color: '#0ea5e9' },
  { name: 'Remolcador', value: 2, color: '#10b981' },
  { name: 'Pesquero', value: 1, color: '#f59e0b' },
  { name: 'Granelero', value: 1, color: '#8b5cf6' },
  { name: 'Tanquero', value: 1, color: '#ef4444' },
  { name: 'Otros', value: 1, color: '#6b7280' },
]

export const flagDistribution = [
  { flag: '🇨🇱 Chile', count: 3 },
  { flag: '🇵🇦 Panamá', count: 4 },
  { flag: '🇱🇷 Liberia', count: 2 },
  { flag: '🇨🇳 China', count: 1 },
  { flag: '🇺🇸 EEUU', count: 1 },
  { flag: '🇸🇬 Singapur', count: 1 },
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
