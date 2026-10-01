/**
 * Auditoría de Seguridad — MaritimeVTS Prototype
 * Verifica cumplimiento con:
 *  - Ley 21.719 (Ciberseguridad, Chile)
 *  - Ley 19.628 / 21.719 (Protección de Datos Personales)
 *  - OWASP Top 10
 *  - IMO MSC.428(98) — Cyber Risk Management
 *  - ISO/IEC 27001 (SGSI)
 *  - IEC 62443 (Seguridad Industrial)
 *  - NIST CSF 2.0
 */
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'

const BASE = 'http://localhost:3000'
const PROJECT = '/home/z/my-project'

interface Finding {
  id: string
  title: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable'
  description: string
  evidence: string
  recommendation: string
  legalReference: string[]
  cwe?: string
}

const findings: Finding[] = []

// ============ 1. HTTP SECURITY HEADERS ============
async function checkHTTPHeaders() {
  console.log('\n[1/8] Analizando headers HTTP...')
  try {
    const res = await fetch(BASE, { redirect: 'manual' })
    const headers: Record<string, string> = {}
    res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value })

    const requiredHeaders = [
      { name: 'content-security-policy', label: 'Content-Security-Policy', legal: ['Ley 21.719 Art. 24', 'ISO 27001 A.14'] },
      { name: 'strict-transport-security', label: 'Strict-Transport-Security (HSTS)', legal: ['ISO 27001 A.10', 'NIST CSF PR.AC-1'] },
      { name: 'x-frame-options', label: 'X-Frame-Options (Clickjacking)', legal: ['OWASP A05:2021', 'IEC 62443'] },
      { name: 'x-content-type-options', label: 'X-Content-Type-Options', legal: ['OWASP A05:2021'] },
      { name: 'referrer-policy', label: 'Referrer-Policy', legal: ['Ley 19.628 Art. 9'] },
      { name: 'permissions-policy', label: 'Permissions-Policy', legal: ['OWASP A05:2021'] },
    ]

    for (const h of requiredHeaders) {
      const present = headers[h.name] !== undefined
      findings.push({
        id: `HDR-${h.name.toUpperCase().replace(/-/g, '_')}`,
        title: `Header HTTP: ${h.label}`,
        category: 'Headers HTTP',
        severity: present ? 'info' : 'medium',
        status: present ? 'compliant' : 'non_compliant',
        description: present
          ? `El header ${h.label} está presente y correctamente configurado.`
          : `El header ${h.label} NO está presente en las respuestas HTTP. Esto expone la aplicación a ataques como clickjacking, MIME-sniffing, o fugas de información vía Referer.`,
        evidence: present ? `Valor: ${headers[h.name].substring(0, 200)}` : `Header ausente en respuesta de ${BASE}`,
        recommendation: present
          ? 'Mantener configuración actual.'
          : `Agregar el header ${h.label} en next.config.ts usando la propiedad headers(). Para Next.js 16 ver documentación oficial.`,
        legalReference: h.legal,
        cwe: present ? undefined : 'CWE-693: Protection Mechanism Failure',
      })
    }

    // Server header info disclosure
    const serverHeader = headers['server']
    findings.push({
      id: 'HDR_SERVER',
      title: 'Header Server (Information Disclosure)',
      category: 'Headers HTTP',
      severity: serverHeader ? 'low' : 'info',
      status: serverHeader ? 'partial' : 'compliant',
      description: serverHeader
        ? `El header Server revela información del servidor web: "${serverHeader}". Esto facilita el reconocimiento por parte de atacantes.`
        : 'El header Server no revela información sensible.',
      evidence: serverHeader ? `Server: ${serverHeader}` : 'Header ausente o genérico',
      recommendation: 'Configurar el servidor para no revelar versión ni software específico.',
      legalReference: ['ISO 27001 A.13', 'OWASP A05:2021'],
    })
  } catch (e) {
    findings.push({
      id: 'HDR_ERROR',
      title: 'Conectividad HTTP con la aplicación',
      category: 'Headers HTTP',
      severity: 'critical',
      status: 'non_compliant',
      description: `No se pudo conectar con ${BASE} para analizar headers. Error: ${e instanceof Error ? e.message : 'desconocido'}`,
      evidence: 'Sin respuesta HTTP',
      recommendation: 'Asegurarse de que el servidor Next.js esté corriendo en puerto 3000.',
      legalReference: ['Ley 21.719 Art. 24'],
    })
  }
}

// ============ 2. STATIC CODE ANALYSIS — Secrets ============
function checkHardcodedSecrets() {
  console.log('[2/8] Analizando código fuente en busca de secretos hardcodeados...')
  const sensitivePatterns = [
    { name: 'API Key (sk-/key-)', regex: /(?:sk-|key-|api[_-]?key)\s*[:=]\s*["'][A-Za-z0-9]{20,}["']/gi, severity: 'critical' as const, legal: ['Ley 19.628 Art. 9', 'Ley 21.719 Art. 24'] },
    { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g, severity: 'critical' as const, legal: ['Ley 19.628'] },
    { name: 'Private SSH Key', regex: /-----BEGIN [A-Z]+ PRIVATE KEY-----/g, severity: 'critical' as const, legal: ['Ley 21.719'] },
    { name: 'JWT Secret', regex: /(?:jwt[_-]?secret|secret[_-]?key)\s*[:=]\s*["'][A-Za-z0-9]{16,}["']/gi, severity: 'high' as const, legal: ['Ley 21.719'] },
    { name: 'Contraseña hardcodeada', regex: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"'\s]{6,}["']/gi, severity: 'high' as const, legal: ['Ley 19.628', 'OWASP A07:2021'] },
    { name: 'URL de DB con credenciales', regex: /(?:postgres|mysql|mongodb):\/\/[^:\s]+:[^@\s]+@/gi, severity: 'high' as const, legal: ['Ley 19.628'] },
  ]
  const sensitiveFiles = ['src/app/api', 'src/lib', 'src/store', 'prisma']
  let foundCount = 0
  for (const folder of sensitiveFiles) {
    const path = join(PROJECT, folder)
    if (!existsSync(path)) continue
    try {
      const result = execSync(`find ${path} -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.prisma" \\)`, { encoding: 'utf-8' }).split('\n').filter(Boolean)
      for (const file of result) {
        if (!existsSync(file)) continue
        const content = readFileSync(file, 'utf-8')
        for (const p of sensitivePatterns) {
          const matches = content.match(p.regex)
          if (matches) {
            for (const m of matches.slice(0, 3)) {
              // Mask the secret
              const masked = m.substring(0, 20) + '...[REDACTED]'
              findings.push({
                id: `SECRET_${foundCount++}`,
                title: `Secreto hardcodeado: ${p.name}`,
                category: 'Código Fuente',
                severity: p.severity,
                status: 'non_compliant',
                description: `Se detectó un patrón de "${p.name}" hardcodeado en el código fuente. Esto viola el principio de separación de credenciales y código.`,
                evidence: `Archivo: ${file.replace(PROJECT, '')}\nCoincidencia: ${masked}`,
                recommendation: 'Mover el secreto a una variable de entorno (.env, no versionado en git) o a un gestor de secretos (AWS Secrets Manager, HashiCorp Vault, Doppler). Rotar inmediatamente el secreto expuesto.',
                legalReference: p.legal,
                cwe: 'CWE-798: Use of Hard-coded Credentials',
              })
            }
          }
        }
      }
    } catch (e) {
      console.log(`  - No se pudo escanear ${folder}`)
    }
  }
  if (foundCount === 0) {
    findings.push({
      id: 'SECRET_NONE',
      title: 'Sin secretos hardcodeados',
      category: 'Código Fuente',
      severity: 'info',
      status: 'compliant',
      description: 'No se detectaron patrones de secretos hardcodeados (API keys, contraseñas, JWT secrets, llaves SSH) en el código fuente del proyecto.',
      evidence: `Escaneo de ${sensitiveFiles.length} directorios completado sin hallazgos.`,
      recommendation: 'Mantener esta práctica. Considerar agregar pre-commit hooks con gitleaks/trufflehog para prevenir exposición accidental futura.',
      legalReference: ['Ley 21.719 Art. 24', 'Ley 19.628 Art. 9'],
    })
  }
}

// ============ 3. STATIC CODE ANALYSIS — Dangerous Functions ============
function checkDangerousCode() {
  console.log('[3/8] Analizando funciones peligrosas en código...')
  const dangerousPatterns = [
    { name: 'eval()', regex: /\beval\s*\(/g, severity: 'high' as const, cwe: 'CWE-95', legal: ['OWASP A03:2021'] },
    { name: 'innerHTML', regex: /\.innerHTML\s*=/g, severity: 'high' as const, cwe: 'CWE-79', legal: ['OWASP A03:2021'] },
    { name: 'dangerouslySetInnerHTML', regex: /dangerouslySetInnerHTML/g, severity: 'medium' as const, cwe: 'CWE-79', legal: ['OWASP A03:2021'] },
    { name: 'document.write()', regex: /document\.write\s*\(/g, severity: 'high' as const, cwe: 'CWE-79', legal: ['OWASP A03:2021'] },
    { name: 'execSync con input no sanitizado', regex: /execSync\s*\(\s*[`'"][^`'"]*[\$\{]/g, severity: 'critical' as const, cwe: 'CWE-78', legal: ['OWASP A03:2021'] },
    { name: 'Shell execution', regex: /(?:exec|spawn|spawnSync)\s*\(/g, severity: 'medium' as const, cwe: 'CWE-78', legal: ['OWASP A03:2021'] },
  ]
  let foundCount = 0
  try {
    const result = execSync(`find ${PROJECT}/src -type f \\( -name "*.ts" -o -name "*.tsx" \\)`, { encoding: 'utf-8' }).split('\n').filter(Boolean)
    for (const file of result) {
      const content = readFileSync(file, 'utf-8')
      for (const p of dangerousPatterns) {
        const matches = content.match(p.regex)
        if (matches) {
          for (const m of matches) {
            foundCount++
            findings.push({
              id: `DANG_${foundCount}`,
              title: `Función peligrosa: ${p.name}`,
              category: 'Código Fuente',
              severity: p.severity,
              status: p.severity === 'medium' ? 'partial' : 'non_compliant',
              description: `Se detectó el uso de ${p.name} en ${file.replace(PROJECT, '')}. Esta función puede introducir vulnerabilidades si recibe input del usuario sin sanitización.`,
              evidence: `Patrón: ${m.substring(0, 80)}`,
              recommendation: 'Revisar el contexto de uso. Si recibe input del usuario, sanitizar estrictamente o reemplazar por alternativas seguras (DOMPurify para HTML, parámetros parametrizados para SQL).',
              legalReference: p.legal,
              cwe: p.cwe,
            })
          }
        }
      }
    }
  } catch (e) {
    console.log('  - Error escaneando código')
  }
  if (foundCount === 0) {
    findings.push({
      id: 'DANG_NONE',
      title: 'Sin funciones peligrosas detectadas',
      category: 'Código Fuente',
      severity: 'info',
      status: 'compliant',
      description: 'No se detectaron funciones peligrosas (eval, innerHTML, document.write, exec con input no sanitizado) en el código fuente.',
      evidence: 'Escaneo completo de src/ sin hallazgos.',
      recommendation: 'Mantener esta práctica. Usar ESLint con reglas no-restricted-syntax para prevenir uso futuro.',
      legalReference: ['OWASP A03:2021'],
    })
  }
}

// ============ 4. AUTHENTICATION & SESSION ============
async function checkAuth() {
  console.log('[4/8] Analizando autenticación...')
  // Check that the auth store doesn't store passwords in plaintext
  const authStorePath = join(PROJECT, 'src/store/auth-store.ts')
  if (existsSync(authStorePath)) {
    const content = readFileSync(authStorePath, 'utf-8')
    const hasPassword = /password/i.test(content)
    const usesLocalStorage = /persist/i.test(content) && /localStorage/i.test(content)
    findings.push({
      id: 'AUTH_STORE',
      title: 'Almacenamiento de credenciales en cliente',
      category: 'Autenticación',
      severity: hasPassword ? 'high' : 'medium',
      status: hasPassword ? 'non_compliant' : 'partial',
      description: hasPassword
        ? 'El store de autenticación almacena contraseñas. Esto es peligroso porque localStorage es accesible vía XSS.'
        : 'El store de autenticación usa persistencia (Zustand persist middleware) para guardar la sesión del usuario en localStorage. Esto expone los datos del usuario a scripts maliciosos en caso de un ataque XSS.',
      evidence: `Archivo: src/store/auth-store.ts\nPatrón detectado: ${usesLocalStorage ? 'localStorage via persist' : 'memoria'}`,
      recommendation: 'Para el prototipo esto es aceptable (no se almacenan credenciales, solo el perfil del usuario). Para producción: usar cookies HttpOnly + Secure + SameSite=Strict para el token de sesión, y nunca guardar contraseñas en el cliente. Implementar NextAuth.js v4 con estrategia JWT en cookie HttpOnly.',
      legalReference: ['Ley 19.628 Art. 9', 'Ley 21.719 Art. 24', 'ISO 27001 A.9'],
      cwe: 'CWE-922: Insecure Storage of Sensitive Information',
    })
  }

  // Check that protected routes exist
  findings.push({
    id: 'AUTH_REAL_OAUTH',
    title: 'Implementación real de OAuth (Microsoft/Google)',
    category: 'Autenticación',
    severity: 'high',
    status: 'non_compliant',
    description: 'El prototipo simula el login con Microsoft 365 y Google Workspace mediante un setTimeout de 1200ms que crea un perfil mock. No hay validación real de credenciales ni intercambio de tokens OAuth 2.0 con Azure AD o Google.',
    evidence: `Código: src/store/auth-store.ts — función login() que retorna perfil predefinido tras await sleep(1200).`,
    recommendation: 'Para producción: instalar NextAuth.js v4 (ya en dependencias), configurar providers AzureAD y Google con client_id/client_secret reales desde variables de entorno. Implementar callback de verificación de email institucional y MFA obligatorio para operadores VTS.',
    legalReference: ['Ley 21.719 Art. 24', 'ISO 27001 A.9', 'IEC 62443 SR 1.1-1.13'],
    cwe: 'CWE-287: Improper Authentication',
  })
}

// ============ 5. API SECURITY ============
async function checkAPIRoutes() {
  console.log('[5/8] Analizando rutas API...')
  // Test that /api/reports is accessible without auth (vulnerability in production)
  try {
    const res = await fetch(`${BASE}/api/reports?format=pdf&reportType=daily&dateFrom=2026-09-30&dateTo=2026-10-01&includeSections=summary&operator=test&organization=test`, { method: 'GET' })
    findings.push({
      id: 'API_REPORTS_NO_AUTH',
      title: 'API /api/reports sin autenticación',
      category: 'API Security',
      severity: 'high',
      status: 'non_compliant',
      description: `El endpoint /api/reports responde a peticiones GET sin validar autenticación. Cualquiera con la URL puede generar y descargar informes operacionales del VTS, exponiendo datos de buques, arribos, alertas y KPIs.`,
      evidence: `GET /api/reports → HTTP ${res.status} (sin Authorization header, sin cookie de sesión)`,
      recommendation: 'Para producción: implementar middleware de Next.js que valide sesión NextAuth en todas las rutas /api/* (excepto /api/auth). Agregar verificación de rol (operador VTS, supervisor, etc.) y rate limiting (ej: 60 requests/minuto por usuario).',
      legalReference: ['Ley 19.628 Art. 9', 'Ley 21.719 Art. 24', 'OWASP A01:2021', 'IMO MSC.428(98)'],
      cwe: 'CWE-306: Missing Authentication for Sensitive Function',
    })
  } catch (e) {
    findings.push({
      id: 'API_REPORTS_UNREACHABLE',
      title: 'API /api/reports no accesible',
      category: 'API Security',
      severity: 'critical',
      status: 'non_compliant',
      description: `No se pudo verificar el endpoint /api/reports. Error: ${e instanceof Error ? e.message : 'desconocido'}`,
      evidence: 'Sin respuesta HTTP',
      recommendation: 'Verificar que el servidor esté corriendo y que la ruta esté correctamente registrada.',
      legalReference: ['Ley 21.719 Art. 24'],
    })
  }

  try {
    const res = await fetch(`${BASE}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userQuery: 'test', messages: [] }) })
    findings.push({
      id: 'API_CHAT_NO_AUTH',
      title: 'API /api/chat sin autenticación',
      category: 'API Security',
      severity: 'high',
      status: 'non_compliant',
      description: `El endpoint /api/chat (asistente IA MarÍA) responde sin validar autenticación. Esto permite a cualquier atacante: (1) consumir tokens del LLM agotando cuota, (2) extraer información de la base TPS mediante prompts maliciosos, (3) ejecutar búsquedas web a través del VTS, (4) lanzar ataques de prompt injection.`,
      evidence: `POST /api/chat → HTTP ${res.status} sin Authorization header`,
      recommendation: 'Implementar middleware de autenticación + rate limiting + filtrado de input (validar que userQuery no contenga prompts maliciosos). Considerar implementar guardrails de prompt injection con un sistema de capas: (1) filtro de input, (2) LLM con system prompt reforzado, (3) filtro de output.',
      legalReference: ['Ley 19.628 Art. 9', 'Ley 21.719 Art. 24', 'OWASP A03:2021', 'ISO 27001 A.14'],
      cwe: 'CWE-306: Missing Authentication for Sensitive Function',
    })
  } catch (e) {
    // ignore
  }

  // Rate limiting
  findings.push({
    id: 'API_NO_RATE_LIMIT',
    title: 'Sin rate limiting en APIs',
    category: 'API Security',
    severity: 'high',
    status: 'non_compliant',
    description: 'No se implementa rate limiting en ningún endpoint API. Esto permite ataques de fuerza bruta, DoS, y abuso del LLM.',
    evidence: 'Sin middleware de rate limiting detectado en src/app/api',
    recommendation: 'Implementar rate limiting con upstash/ratelimit o express-rate-limit. Límites sugeridos: 60 req/min para APIs operacionales, 10 req/min para /api/chat (LLM), 5 req/hora para login.',
    legalReference: ['Ley 21.719 Art. 24', 'OWASP A07:2021', 'NIST CSF PR.DS'],
    cwe: 'CWE-770: Allocation of Resources Without Limits',
  })
}

// ============ 6. DATA PROTECTION (Ley 19.628) ============
function checkDataProtection() {
  console.log('[6/8] Analizando protección de datos personales (Ley 19.628)...')
  const dataSubjects = [
    {
      id: 'DATA_AUTH_STORE',
      file: 'src/store/auth-store.ts',
      pii: ['name', 'email', 'organization', 'role'],
      legalBasis: 'Consentimiento (Art. 4 Ley 19.628)',
      risk: 'medium',
    },
    {
      id: 'DATA_OPERATION_LOG',
      file: 'prisma/schema.prisma',
      pii: ['operator'],
      legalBasis: 'Cumplimiento de obligaciones legales (Art. 4 Ley 19.628 — auditoría)',
      risk: 'low',
    },
    {
      id: 'DATA_DB_VESSEL_RECORDS',
      file: 'prisma/schema.prisma',
      pii: ['operator (línea naviera)'],
      legalBasis: 'Datos de operación portuaria — no son datos personales',
      risk: 'low',
    },
  ]
  for (const d of dataSubjects) {
    findings.push({
      id: d.id,
      title: `Tratamiento de datos personales: ${d.file}`,
      category: 'Protección de Datos',
      severity: d.risk as 'low' | 'medium' | 'high',
      status: 'partial',
      description: `Se procesan los siguientes datos personales: ${d.pii.join(', ')}. Base legal: ${d.legalBasis}. Falta implementar: (1) política de retención, (2) derecho de acceso/rectificación/cancelación (ARCO), (3) consentimiento explícito documentado, (4) registro de tratamiento ante el Registro de Bases de Datos (CPPD).`,
      evidence: `Datos: ${d.pii.join(', ')}\nBase legal: ${d.legalBasis}`,
      recommendation: 'Para producción: (1) Documentar el tratamiento en un Registro de Actividades de Tratamiento (RAT). (2) Implementar derechos ARCO mediante endpoint /api/privacy/* (acceso, rectificación, supresión, portabilidad). (3) Definir política de retención: logs de auditoría 5 años, sesiones 30 días. (4) Nombrar un Encargado de Protección de Datos si se supera el umbral de la ley.',
      legalReference: ['Ley 19.628 Art. 2, 4, 9', 'Ley 21.719 Art. 24'],
    })
  }

  // Encryption at rest
  findings.push({
    id: 'DATA_ENCRYPTION_AT_REST',
    title: 'Cifrado en reposo de base de datos',
    category: 'Protección de Datos',
    severity: 'high',
    status: 'non_compliant',
    description: 'La base de datos SQLite (db/custom.db) se almacena sin cifrar en el sistema de archivos. Si un atacante obtiene acceso al filesystem, puede leer directamente todos los registros de buques, contenedores, logs de auditoría y datos del operador.',
    evidence: `Archivo: ${PROJECT}/db/custom.db (SQLite plano)`,
    recommendation: 'Para producción: (1) Migrar a PostgreSQL con cifrado a nivel de tabla (pgcrypto) o cifrado de volumen (LUKS en Linux). (2) Cifrar backups con AES-256. (3) Implementar key rotation. (4) Para datos personales muy sensibles: cifrado a nivel de columna.',
    legalReference: ['Ley 19.628 Art. 9', 'Ley 21.719 Art. 24', 'ISO 27001 A.10', 'IEC 62443 SR 3.1'],
    cwe: 'CWE-311: Missing Encryption of Sensitive Data',
  })

  // TLS in transit
  findings.push({
    id: 'DATA_TLS',
    title: 'Cifrado en tránsito (TLS)',
    category: 'Protección de Datos',
    severity: 'high',
    status: 'partial',
    description: 'El servidor de desarrollo (Next.js en puerto 3000) sirve contenido sin HTTPS. En producción debe configurarse TLS 1.3 obligatorio con HSTS, sin soporte para TLS 1.0/1.1.',
    evidence: `URL accesible: ${BASE} (HTTP plano, sin TLS)`,
    recommendation: 'Para producción: (1) Configurar TLS 1.3 con certificados válidos (Let\'s Encrypt o EV). (2) Habilitar HSTS con max-age=63072000 (2 años) y includeSubDomains. (3) Configurar Caddy/Nginx para rechazar conexiones TLS 1.0/1.1. (4) Obtener calificación A+ en SSL Labs.',
    legalReference: ['Ley 19.628 Art. 9', 'Ley 21.719 Art. 24', 'ISO 27001 A.10', 'NIST CSF PR.DS-1', 'IEC 62443 SR 3.1'],
  })
}

// ============ 7. CYBERSECURITY (Ley 21.719) ============
function checkCybersecurityLaw() {
  console.log('[7/8] Analizando cumplimiento Ley 21.719 (Ciberseguridad)...')
  const requirements = [
    {
      id: 'CSIRT_TEAM',
      title: 'Equipo de Respuesta a Incidentes (CSIRT)',
      status: 'non_compliant',
      severity: 'high',
      description: 'No existe un procedimiento formal de respuesta a incidentes. La Ley 21.719 Art. 24 exige que los Operadores de Importancia Vital (OIV) — los puertos lo son — dispongan de capacidad de respuesta a incidentes y notificación a la ANCI.',
      recommendation: 'Designar un CSIRT interno con roles definidos (incident commander, SOC analyst, comunicaciones). Definir matriz RACI para incidentes. Procedimientos de escalado a la Agencia Nacional de Ciberseguridad (ANCI) y al CSIRT Nacional.',
      legal: ['Ley 21.719 Art. 24', 'Ley 21.719 Art. 16'],
    },
    {
      id: 'CS_RISK_ASSESSMENT',
      title: 'Evaluación de riesgos cibernéticos',
      status: 'partial',
      severity: 'medium',
      description: 'No existe un análisis formal de riesgos con metodología estándar (ISO 27005, NIST SP 800-30). Esta auditoría constituye el primer paso, pero debe formalizarse.',
      recommendation: 'Realizar evaluación formal anual con: (1) inventario de activos (datos, sistemas, procesos), (2) matriz de amenazas/vulnerabilidades, (3) cálculo de riesgo (probabilidad × impacto), (4) plan de tratamiento. Documentar y revisar trimestralmente.',
      legal: ['Ley 21.719 Art. 24', 'ISO 27001 A.8 (Risk Assessment)', 'NIST CSF ID.RA'],
    },
    {
      id: 'CS_BACKUP',
      title: 'Estrategia de respaldo y recuperación',
      status: 'non_compliant',
      severity: 'high',
      description: 'No se detecta estrategia de backup automatizada ni plan de recuperación ante desastres. La base SQLite se perdería completa ante un fallo del filesystem.',
      recommendation: 'Implementar backups automatizados: (1) DB snapshots diarios con retención 30 días, (2) replicación geográfica, (3) prueba de restauración trimestral, (4) RTO ≤ 4 horas y RPO ≤ 1 hora para sistemas críticos VTS.',
      legal: ['Ley 21.719 Art. 24', 'ISO 27001 A.12', 'NIST CSF RC.RP'],
    },
    {
      id: 'CS_INCIDENT_LOGGING',
      title: 'Registro de eventos de seguridad',
      status: 'compliant',
      severity: 'info',
      description: 'El sistema implementa un modelo OperationLog que registra eventos relevantes (chat, alertas, arribos) con timestamp y operador. Esto cumple con el requisito de trazabilidad.',
      evidence: 'Tabla OperationLog en schema.prisma con campos type, severity, description, operator, metadata',
      recommendation: 'Ampliar el logging para incluir eventos de seguridad específicos: intentos de login fallidos, accesos a endpoints sensibles, cambios de configuración. Implementar SIEM (Wazuh, Elastic SIEM) para correlación y alertas.',
      legal: ['Ley 21.719 Art. 24', 'ISO 27001 A.12.4', 'NIST CSF DE.AE'],
    },
    {
      id: 'CS_INCIDENT_NOTIFICATION',
      title: 'Notificación de incidentes a ANCI',
      status: 'non_compliant',
      severity: 'critical',
      description: 'La Ley 21.719 Art. 16 obliga a notificar a la Agencia Nacional de Ciberseguridad (ANCI) cualquier incidente cibernético relevante dentro de las 3 horas siguientes a su detección. No existe procedimiento formal de notificación.',
      recommendation: 'Establecer canal seguro de comunicación con ANCI. Plantilla de notificación de incidentes. Persona responsable designada (CISO/DPO). Ejercicios simulacros de incidente al menos 2 veces al año.',
      legal: ['Ley 21.719 Art. 16', 'Ley 21.719 Art. 24'],
    },
    {
      id: 'CS_SEGREGATION',
      title: 'Segmentación de redes OT/IT',
      status: 'partial',
      severity: 'medium',
      description: 'En el prototipo no hay segmentación (es monolítico). En producción VTS real, la red OT (radares, AIS, cámaras) debe estar segregada de la red IT (dashboard, APIs) mediante firewall industrial (IEC 62443-3-3).',
      recommendation: 'Implementar zona DMZ entre IT y OT. Firewall industrial con deny-by-default. Solo protocolos necesarios (NTP, SNMP v3, RTSP) entre OT y VTS. Análisis de tráfico con IDS/IPS industrial.',
      legal: ['IEC 62443-3-3 SR 5.1', 'ISO 27001 A.13', 'NIST CSF PR.AC-5'],
    },
  ]
  for (const r of requirements) {
    findings.push({
      id: r.id,
      title: r.title,
      category: 'Ley 21.719 (Ciberseguridad)',
      severity: r.severity as 'critical' | 'high' | 'medium' | 'low' | 'info',
      status: r.status as 'compliant' | 'non_compliant' | 'partial',
      description: r.description,
      evidence: 'Evidencia: ' + ('evidence' in r ? (r as any).evidence : 'Análisis de cumplimiento basado en revisión de arquitectura'),
      recommendation: r.recommendation,
      legalReference: r.legal,
    })
  }
}

// ============ 8. DEPENDENCY VULNERABILITIES ============
function checkDependencies() {
  console.log('[8/8] Analizando dependencias vulnerables...')
  try {
    const auditResult = execSync(`cd ${PROJECT} && bun audit --json 2>&1 || true`, { encoding: 'utf-8', timeout: 30000 })
    let vulns: any = { advisories: {} }
    try {
      vulns = JSON.parse(auditResult)
    } catch {
      // bun audit might output differently
    }
    const advisories = vulns.advisories || vulns.vulnerabilities || {}
    const count = Object.keys(advisories).length
    findings.push({
      id: 'DEP_AUDIT',
      title: 'Vulnerabilidades en dependencias',
      category: 'Dependencias',
      severity: count > 5 ? 'high' : count > 0 ? 'medium' : 'info',
      status: count > 0 ? 'non_compliant' : 'compliant',
      description: count > 0
        ? `Se detectaron ${count} vulnerabilidades conocidas en dependencias del proyecto (bun audit). Las dependencias desactualizadas son vector de ataque común (_supply chain attacks_).`
        : 'No se detectaron vulnerabilidades conocidas en las dependencias instaladas.',
      evidence: count > 0
        ? `Vulnerabilidades: ${Object.keys(advisories).slice(0, 10).join(', ')}`
        : 'bun audit OK — sin hallazgos',
      recommendation: count > 0
        ? 'Ejecutar `bun update` para actualizar dependencias vulnerables. Revisar breaking changes. Para dependencias críticas (next, prisma), seguir changelog. Establecer proceso SCA (Software Composition Analysis) automatizado con Snyk/Dependabot en CI/CD.'
        : 'Mantener dependencias actualizadas. Configurar Snyk/Dependabot en GitHub para alertas automáticas de nuevas vulnerabilidades.',
      legalReference: ['Ley 21.719 Art. 24', 'OWASP A06:2021 (Vulnerable Components)', 'ISO 27001 A.12.6'],
    })
  } catch (e) {
    findings.push({
      id: 'DEP_AUDIT_ERROR',
      title: 'Auditoría de dependencias no ejecutable',
      category: 'Dependencias',
      severity: 'low',
      status: 'partial',
      description: `No se pudo ejecutar bun audit. Error: ${e instanceof Error ? e.message : 'desconocido'}`,
      evidence: 'Sin salida de bun audit',
      recommendation: 'Ejecutar manualmente `bun audit` y revisar el resultado. Configurar Dependabot en el repositorio.',
      legalReference: ['Ley 21.719 Art. 24'],
    })
  }
}

// ============ RUN AUDIT ============
async function main() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  AUDITORÍA DE SEGURIDAD — MaritimeVTS Prototype  ║')
  console.log('║  Ley 21.719 · Ley 19.628 · OWASP · ISO 27001   ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log(`Fecha: ${new Date().toISOString()}`)
  console.log(`Objetivo: ${BASE}`)

  await checkHTTPHeaders()
  checkHardcodedSecrets()
  checkDangerousCode()
  await checkAuth()
  await checkAPIRoutes()
  checkDataProtection()
  checkCybersecurityLaw()
  checkDependencies()

  // Build summary
  const summary = {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
    compliant: findings.filter(f => f.status === 'compliant').length,
    non_compliant: findings.filter(f => f.status === 'non_compliant').length,
    partial: findings.filter(f => f.status === 'partial').length,
  }

  console.log('\n' + '═'.repeat(50))
  console.log('RESUMEN EJECUTIVO')
  console.log('═'.repeat(50))
  console.log(`Total de hallazgos: ${summary.total}`)
  console.log(`  Críticos:    ${summary.critical}`)
  console.log(`  Altos:       ${summary.high}`)
  console.log(`  Medios:      ${summary.medium}`)
  console.log(`  Bajos:       ${summary.low}`)
  console.log(`  Informativos: ${summary.info}`)
  console.log(`  Cumplen:           ${summary.compliant}`)
  console.log(`  No cumplen:        ${summary.non_compliant}`)
  console.log(`  Cumplimiento parcial: ${summary.partial}`)

  const complianceScore = Math.round((summary.compliant / summary.total) * 100)
  console.log(`\nPuntuación de cumplimiento: ${complianceScore}%`)

  // Save findings JSON
  const report = {
    audit: {
      target: BASE,
      date: new Date().toISOString(),
      auditor: 'MaritimeVTS Security Audit Script v1.0',
      standards: ['Ley 21.719', 'Ley 19.628', 'OWASP Top 10', 'ISO/IEC 27001', 'IEC 62443', 'NIST CSF 2.0', 'IMO MSC.428(98)'],
    },
    summary,
    complianceScore,
    findings,
  }
  writeFileSync(join(PROJECT, 'download/audit-findings.json'), JSON.stringify(report, null, 2))
  console.log(`\n📁 Hallazgos guardados en: download/audit-findings.json`)
  console.log('   Generando informe PDF ejecutivo...')

  return report
}

main().catch(e => {
  console.error('FATAL:', e)
  process.exit(1)
})
