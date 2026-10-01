# 🚢 MaritimeVTS — TCP Valparaíso

Sistema de Control de Tráfico Marítimo (VTS) para el Terminal de Contenedores de Puerto Valparaíso (TCP), operado por TPS (Terminal Pacífico Sur).

![License](https://img.shields.io/badge/license-MIT-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/TailwindCSS-4-38bdf8)

## 📋 Características

### Dashboard Operacional en Tiempo Real
- **Mapa VTS en vivo** con sweep radar animado y buques que se mueven en tiempo real (actualización cada 2s)
- **Tabla de Buques** con datos AIS (MMSI, IMO, SOG, COG, ETA) y registro SNRB/SERNAPESCA
- **KPIs ejecutivos** (8 indicadores: buques en zona, atracados, en aproximación, precisión GPS, ocupación de muelle, alertas activas, tiempo de espera, cumplimiento IALA)
- **Centro de Alertas** con severidad clasificada (crítica/alta/media/baja) según ICS/SMCP
- **CCTV** con 8 cámaras (PTZ/Fija/Térmica) y feed simulado con HUD
- **Analytics** con gráficos (PieChart, BarChart, LineChart) usando Recharts

### 🤖 Asistente IA "Victoria"
- Chat con acceso simultáneo a 3 fuentes:
  1. **Internet** (búsqueda web en tiempo real)
  2. **Base de datos TPS** (Prisma + SQLite: buques, muelles, arribos, contenedores)
  3. **Dashboard en vivo** (datos operacionales actuales)
- 12 sugerencias de auditoría de ciberseguridad + 6 operacionales
- Cumplimiento Ley 21.719 / 19.628 / IALA V-103 / ISO 27001

### 📻 Radio VTS — Walkie-Talkie Virtual con IA
- **PTT (Push-to-Talk)** con botón grande o tecla Espacio
- Grabación con `MediaRecorder API` (Opus codec, echoCancellation, noiseSuppression)
- **Transcripción automática con IA** vía z-ai-web-dev-sdk ASR
- 6 frases SMCP pre-codificadas (IMO Standard Marine Communication Phrases)
- Historial de mensajes con timestamp y destinatario
- Auditoría: grabación + transcripción guardadas en `OperationLog` (Ley 19.628 / IMO MSC.428(98))

### 📤 Compartir transcripción
- Modal con 6 contactos pre-cargados (prácticos, capitanes, Directemar, TPS, CSIRT ANCI)
- 5 canales de envío:
  - **WhatsApp** → `wa.me/<número>?text=<mensaje>`
  - **Telegram** → `t.me/share/url`
  - **SMS** → `sms:<número>?body=<mensaje>`
  - **Email** → `mailto:<email>?subject=...&body=...`
  - **Copiar al portapapeles**
- Buscador de contactos por nombre/rol/buque

### 📋 Informes Ejecutivos
- Generación en 4 formatos: **Word (.docx), PowerPoint (.pptx), Excel (.xlsx), PDF**
- Selector de tipo (diario/semanal/mensual/incidente/auditoría)
- Rango de fechas personalizable
- Secciones seleccionables (resumen, buques, alertas, KPIs, cumplimiento, ciberseguridad)

### 🛡️ Cumplimiento Normativo
- Cumplimiento Ley 21.719 (Ciberseguridad Chile)
- Cumplimiento Ley 19.628 (Protección de Datos Personales)
- OWASP Top 10 / ISO/IEC 27001 / IEC 62443 / NIST CSF 2.0 / IMO MSC.428(98)
- Postura de seguridad (Confidencialidad/Integridad/Disponibilidad/Trazabilidad)
- Auditoría formal con Directemar, ANCI, Bureau Veritas, SHOA

### 🎨 Selector de Temas
- 6 temas preconfigurados: Azul Aqua, Azul Marino, Verde Esmeralda, Violeta Tech, Naranja Atardecer, Gris Grafito
- Cambio funcional en tiempo real vía variables CSS
- Persistencia en localStorage
- Estándar IALA · WCAG AA · Optimizado para turnos operacionales de 12h

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 + App Router
- **Lenguaje**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York)
- **Database**: Prisma ORM + SQLite
- **Auth**: NextAuth.js v4 (mock Microsoft 365 / Google Workspace)
- **State**: Zustand (auth, theme, radio) con persistencia
- **Charts**: Recharts
- **Animaciones**: Framer Motion
- **Icons**: Lucide React
- **IA SDK**: z-ai-web-dev-sdk (LLM + Web Search + ASR + VLM)
- **Reportes**: docx, pptxgenjs, xlsx (SheetJS), jsPDF + jspdf-autotable
- **Toasts**: Sonner + shadcn/ui

## 📁 Estructura

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # IA Victoria (LLM + Web Search + DB + Dashboard)
│   │   ├── radio/transcribe/     # Walkie-Talkie + ASR
│   │   └── reports/              # Generación Word/PPT/Excel/PDF
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                       # shadcn/ui component library
│   └── vts/                      # Componentes del sistema VTS
│       ├── dashboard.tsx
│       ├── vessel-map.tsx        # Mapa SVG en tiempo real
│       ├── vessel-table.tsx
│       ├── vessel-detail.tsx
│       ├── kpi-panel.tsx
│       ├── alerts-panel.tsx
│       ├── camera-panel.tsx
│       ├── analytics-panel.tsx
│       ├── radio-vts-panel.tsx   # Walkie-Talkie con IA
│       ├── share-transcription-modal.tsx
│       ├── reports-panel.tsx
│       ├── compliance-panel.tsx
│       ├── ai-chat-panel.tsx     # Chat Victoria
│       ├── theme-picker.tsx     # Selector de temas
│       ├── header.tsx
│       └── login-view.tsx
├── store/
│   ├── auth-store.ts             # Login Microsoft/Google (mock)
│   ├── theme-store.ts            # 6 temas preconfigurados
│   └── radio-store.ts            # Estado PTT + contactos
├── lib/
│   ├── vts/data.ts               # Datos simulados de buques, alertas, KPIs
│   ├── db.ts                     # Cliente Prisma
│   └── utils.ts
├── hooks/
│   ├── use-realtime-vessels.ts   # Hook de movimiento en tiempo real
│   ├── use-has-hydrated.ts
│   ├── use-mobile.ts
│   └── use-toast.ts
└── prisma/
    └── schema.prisma             # Buques, muelles, arribos, contenedores, logs
```

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/teleco725-lgtm/maritime-vts-valparaiso.git
cd maritime-vts-valparaiso

# 2. Instalar dependencias
bun install

# 3. Configurar base de datos
echo "DATABASE_URL=file:./db/custom.db" > .env
bun run db:push

# 4. (Opcional) Seed con datos de ejemplo
bun run scripts/seed-tps.ts

# 5. Iniciar servidor de desarrollo
bun run dev
```

Abrir http://localhost:3000

## 🔐 Seguridad

### Auditoría incluida
El proyecto incluye un script de auditoría de seguridad que verifica:
- Headers HTTP de seguridad (CSP, HSTS, X-Frame-Options, etc.)
- Secretos hardcodeados en código
- Funciones peligrosas (eval, innerHTML, document.write)
- Autenticación y gestión de sesión
- Seguridad de APIs (auth + rate limiting)
- Cumplimiento Ley 19.628 (datos personales)
- Cumplimiento Ley 21.719 (ciberseguridad)
- Análisis de dependencias (SCA)

```bash
# Ejecutar auditoría
bun run scripts/security-audit.ts

# Generar informe PDF
python3 scripts/generate-audit-pdf.py
```

### ⚠️ Para producción
Antes de desplegar en producción, resolver:
1. Implementar NextAuth.js real con Azure AD + Google OAuth
2. Middleware de auth en todas las rutas `/api/*`
3. Rate limiting (60 req/min operacional, 10 req/min para LLM)
4. HTTPS + HSTS con certificado válido
5. Cifrado en reposo de la base de datos
6. Canal de notificación a ANCI conforme Art. 16 Ley 21.719
7. CSIRT formal con procedimientos RACI
8. Auditoría ISO/IEC 27001 con entidad acreditada

## 📜 Cumplimiento Normativo

| Norma | Estado |
|-------|--------|
| Ley 21.719 (Ciberseguridad Chile) | Parcial — prototipo demostrativo |
| Ley 19.628 (Datos Personales) | Parcial — logging implementado |
| IALA V-103 (Operadores VTS) | Documentado |
| IMO MSC.428(98) (Cyber Risk) | Logging y auditoría implementados |
| ISPS Code | Documentado |
| ISO/IEC 27001 (SGSI) | En proceso |
| IEC 62443 (Industrial) | Documentado |
| NIST CSF 2.0 | Documentado |

## 📄 Licencia

MIT License — ver [LICENSE](LICENSE)

## 🏢 Contexto

**TCP Valparaíso** — Terminal de Contenedores de Puerto Valparaíso, operado por **TPS (Terminal Pacífico Sur)**, filial del grupo **Ultraport**.

Este es un prototipo demostrativo. Para uso en producción requiere certificación formal ante Directemar, ANCI y entidad acreditada ISO 27001.

## 🤝 Contribuciones

Issues y PRs bienvenidos en https://github.com/teleco725-lgtm/maritime-vts-valparaiso/issues
