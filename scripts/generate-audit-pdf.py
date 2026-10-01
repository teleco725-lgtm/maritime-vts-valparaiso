#!/usr/bin/env python3
"""
Genera el Informe PDF de Auditoría de Seguridad MaritimeVTS
Ley 21.719 (Ciberseguridad) · Ley 19.628 (Datos Personales)
"""
import json
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, Image, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ============ FONTS ============
FONT_PATHS = {
    'NotoSans': '/usr/share/fonts/truetype/chinese/NotoSansSC-Regular.ttf',
    'NotoSansBold': '/usr/share/fonts/truetype/chinese/NotoSansSC-Bold.ttf',
    'DejaVu': '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    'DejaVuBold': '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
}
for name, path in FONT_PATHS.items():
    if os.path.exists(path):
        try:
            pdfmetrics.registerFont(TTFont(name, path))
        except Exception as e:
            print(f"Could not register font {name}: {e}")

# Use DejaVu as fallback
BODY_FONT = 'DejaVu' if os.path.exists(FONT_PATHS['DejaVu']) else 'Helvetica'
BODY_BOLD = 'DejaVuBold' if os.path.exists(FONT_PATHS['DejaVuBold']) else 'Helvetica-Bold'

# ============ COLORS ============
C_BG_DARK = HexColor('#0f172a')
C_PRIMARY = HexColor('#06b6d4')
C_ACCENT = HexColor('#2563eb')
C_BG_CARD = HexColor('#1e293b')

C_TEXT = HexColor('#1e293b')
C_TEXT_MUTED = HexColor('#64748b')
C_BG_LIGHT = HexColor('#f8fafc')
C_BG_TABLE_HEAD = HexColor('#0f172a')
C_BG_TABLE_ALT = HexColor('#f1f5f9')

C_CRIT = HexColor('#dc2626')
C_HIGH = HexColor('#ea580c')
C_MED = HexColor('#ca8a04')
C_LOW = HexColor('#0891b2')
C_INFO = HexColor('#16a34a')

C_COMPLY = HexColor('#16a34a')
C_NON_COMPLY = HexColor('#dc2626')
C_PARTIAL = HexColor('#ca8a04')

# ============ LOAD FINDINGS ============
JSON_PATH = '/home/z/my-project/download/audit-findings.json'
with open(JSON_PATH, 'r', encoding='utf-8') as f:
    REPORT = json.load(f)

FINDINGS = REPORT['findings']
SUMMARY = REPORT['summary']
SCORE = REPORT['complianceScore']
AUDIT = REPORT['audit']

# ============ STYLES ============
styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    'CustomTitle',
    parent=styles['Title'],
    fontName=BODY_BOLD,
    fontSize=28,
    textColor=white,
    alignment=TA_CENTER,
    spaceAfter=12,
    leading=34,
)
style_subtitle = ParagraphStyle(
    'CustomSubtitle',
    parent=styles['Normal'],
    fontName=BODY_FONT,
    fontSize=14,
    textColor=HexColor('#94a3b8'),
    alignment=TA_CENTER,
    spaceAfter=8,
    leading=18,
)
style_h1 = ParagraphStyle(
    'H1',
    parent=styles['Heading1'],
    fontName=BODY_BOLD,
    fontSize=18,
    textColor=C_PRIMARY,
    spaceBefore=20,
    spaceAfter=10,
    leading=22,
)
style_h2 = ParagraphStyle(
    'H2',
    parent=styles['Heading2'],
    fontName=BODY_BOLD,
    fontSize=14,
    textColor=C_TEXT,
    spaceBefore=14,
    spaceAfter=6,
    leading=18,
)
style_body = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontName=BODY_FONT,
    fontSize=10,
    textColor=C_TEXT,
    alignment=TA_JUSTIFY,
    spaceAfter=6,
    leading=14,
)
style_body_small = ParagraphStyle(
    'BodySmall',
    parent=style_body,
    fontSize=9,
    leading=12,
)
style_code = ParagraphStyle(
    'Code',
    parent=styles['Code'],
    fontName='Courier',
    fontSize=8,
    textColor=C_TEXT_MUTED,
    leftIndent=10,
    spaceAfter=6,
)
style_legal = ParagraphStyle(
    'LegalRef',
    parent=styles['Normal'],
    fontName=BODY_FONT,
    fontSize=8,
    textColor=C_TEXT_MUTED,
    alignment=TA_LEFT,
    leading=10,
    spaceAfter=4,
)
style_footer = ParagraphStyle(
    'Footer',
    parent=styles['Normal'],
    fontName=BODY_FONT,
    fontSize=8,
    textColor=C_TEXT_MUTED,
    alignment=TA_CENTER,
    leading=10,
)

# ============ COVER PAGE ============
def draw_cover_page(canv, doc):
    """Cover page with dark background and gradient effect."""
    canv.saveState()
    # Dark gradient background
    canv.setFillColor(C_BG_DARK)
    canv.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)

    # Cyan stripe top
    canv.setFillColor(C_PRIMARY)
    canv.rect(0, A4[1] - 8*mm, A4[0], 8*mm, fill=1, stroke=0)

    # Brand logo area
    canv.setFillColor(C_PRIMARY)
    canv.setFont(BODY_BOLD, 32)
    canv.drawCentredString(A4[0]/2, A4[1] - 70*mm, "MaritimeVTS")

    canv.setFillColor(HexColor('#94a3b8'))
    canv.setFont(BODY_FONT, 11)
    canv.drawCentredString(A4[0]/2, A4[1] - 82*mm, "TCP Valparaíso · Terminal Pacífico Sur")

    # Decorative line
    canv.setStrokeColor(C_PRIMARY)
    canv.setLineWidth(2)
    canv.line(A4[0]/2 - 30*mm, A4[1] - 95*mm, A4[0]/2 + 30*mm, A4[1] - 95*mm)

    # Main title
    canv.setFillColor(white)
    canv.setFont(BODY_BOLD, 22)
    canv.drawCentredString(A4[0]/2, A4[1] - 130*mm, "INFORME DE AUDITORÍA")
    canv.drawCentredString(A4[0]/2, A4[1] - 148*mm, "DE SEGURIDAD")

    # Subtitle
    canv.setFillColor(C_PRIMARY)
    canv.setFont(BODY_BOLD, 12)
    canv.drawCentredString(A4[0]/2, A4[1] - 168*mm, "Cumplimiento Normativo · Prototipo VTS")

    # Compliance badges
    badges = [
        ("Ley 21.719", "Ciberseguridad"),
        ("Ley 19.628", "Datos Personales"),
        ("OWASP Top 10", "Web Security"),
        ("ISO 27001", "SGSI"),
        ("IEC 62443", "Industrial"),
        ("NIST CSF 2.0", "Cybersecurity"),
        ("IMO MSC.428(98)", "Maritime Cyber"),
    ]
    bx = 25*mm
    by = A4[1] - 195*mm
    for i, (b1, b2) in enumerate(badges):
        col = i % 2
        row = i // 2
        x = 25*mm + col * 80*mm
        y = by - row * 12*mm
        canv.setFillColor(HexColor('#1e293b'))
        canv.setStrokeColor(C_PRIMARY)
        canv.setLineWidth(0.5)
        canv.roundRect(x, y, 75*mm, 9*mm, 2, fill=1, stroke=1)
        canv.setFillColor(C_PRIMARY)
        canv.setFont(BODY_BOLD, 9)
        canv.drawString(x + 4*mm, y + 4*mm, b1)
        canv.setFillColor(HexColor('#cbd5e1'))
        canv.setFont(BODY_FONT, 7)
        canv.drawString(x + 4*mm, y + 1*mm, b2)

    # Score box
    score_color = C_NON_COMPLY if SCORE < 50 else C_PARTIAL if SCORE < 80 else C_COMPLY
    canv.setFillColor(HexColor('#1e293b'))
    canv.setStrokeColor(score_color)
    canv.setLineWidth(1.5)
    canv.roundRect(A4[0]/2 - 50*mm, 60*mm, 100*mm, 40*mm, 4, fill=1, stroke=1)
    canv.setFillColor(HexColor('#94a3b8'))
    canv.setFont(BODY_FONT, 9)
    canv.drawCentredString(A4[0]/2, 90*mm, "PUNTUACIÓN DE CUMPLIMIENTO")
    canv.setFillColor(score_color)
    canv.setFont(BODY_BOLD, 36)
    canv.drawCentredString(A4[0]/2, 70*mm, f"{SCORE}%")
    canv.setFillColor(HexColor('#cbd5e1'))
    canv.setFont(BODY_FONT, 9)
    canv.drawCentredString(A4[0]/2, 64*mm,
        f"{SUMMARY['non_compliant']} no cumplen · {SUMMARY['partial']} parciales · {SUMMARY['compliant']} cumplen")

    # Audit metadata footer
    canv.setFillColor(HexColor('#475569'))
    canv.setFont(BODY_FONT, 9)
    canv.drawCentredString(A4[0]/2, 35*mm, f"Objetivo auditado: {AUDIT['target']}")
    canv.drawCentredString(A4[0]/2, 30*mm, f"Fecha: {AUDIT['date']}")
    canv.drawCentredString(A4[0]/2, 25*mm, f"Auditor: {AUDIT['auditor']}")

    # Bottom bar
    canv.setFillColor(C_PRIMARY)
    canv.rect(0, 0, A4[0], 5*mm, fill=1, stroke=0)
    canv.restoreState()


def draw_body_page(canv, doc):
    """Body pages with footer."""
    canv.saveState()
    # Footer line
    canv.setStrokeColor(HexColor('#cbd5e1'))
    canv.setLineWidth(0.5)
    canv.line(20*mm, 15*mm, A4[0] - 20*mm, 15*mm)
    # Footer text
    canv.setFillColor(C_TEXT_MUTED)
    canv.setFont(BODY_FONT, 8)
    canv.drawString(20*mm, 10*mm, "MaritimeVTS · Informe de Auditoría de Seguridad")
    canv.drawCentredString(A4[0]/2, 10*mm, f"Página {doc.page}")
    canv.drawRightString(A4[0] - 20*mm, 10*mm, AUDIT['date'][:10])
    # Header line
    canv.setFillColor(C_PRIMARY)
    canv.rect(0, A4[1] - 3*mm, A4[0], 3*mm, fill=1, stroke=0)
    canv.restoreState()


# ============ BUILD STORY ============
story = []

# Page 2 - Executive Summary
story.append(Paragraph("1. Resumen Ejecutivo", style_h1))

summary_text = (
    f"Este informe documenta los resultados de la auditoría de seguridad realizada al prototipo del "
    f"Sistema de Control de Tráfico Marítimo (MaritimeVTS) del Terminal de Contenedores de Puerto "
    f"Valparaíso (TCP Valparaíso). La auditoría evaluó el cumplimiento normativo respecto a la "
    f"<b>Ley 21.719 de Ciberseguridad</b> de Chile, la <b>Ley 19.628 de Protección de Datos Personales</b>, "
    f"el estándar internacional <b>OWASP Top 10</b>, <b>ISO/IEC 27001</b>, <b>IEC 62443</b>, <b>NIST CSF 2.0</b> "
    f"y la resolución <b>IMO MSC.428(98)</b> sobre gestión de riesgos cibernéticos en buques."
)
story.append(Paragraph(summary_text, style_body))

summary_text2 = (
    f"Se identificaron <b>{SUMMARY['total']} hallazgos</b> distribuidos en los siguientes niveles de severidad: "
    f"<b><font color='#dc2626'>{SUMMARY['critical']} críticos</font></b>, "
    f"<b><font color='#ea580c'>{SUMMARY['high']} altos</font></b>, "
    f"<b><font color='#ca8a04'>{SUMMARY['medium']} medios</font></b>, "
    f"<b><font color='#0891b2'>{SUMMARY['low']} bajos</font></b> "
    f"y <b><font color='#16a34a'>{SUMMARY['info']} informativos</font></b>. "
    f"El índice global de cumplimiento alcanzado es del <b>{SCORE}%</b>, lo que indica que el sistema "
    f"se encuentra en <b>estado de prototipo demostrativo</b> y <b>requiere trabajo significativo</b> "
    f"antes de su despliegue en un entorno operacional real o ante auditorías formales de Directemar o ANCI."
)
story.append(Paragraph(summary_text2, style_body))

summary_text3 = (
    f"El análisis cubrió <b>ocho dimensiones</b>: (1) headers HTTP de seguridad, (2) secretos hardcodeados en "
    f"código, (3) funciones peligrosas en código fuente, (4) autenticación y gestión de sesión, (5) seguridad "
    f"de APIs, (6) protección de datos personales conforme a la Ley 19.628, (7) cumplimiento de la Ley 21.719 "
    f"de Ciberseguridad incluyendo capacidad de respuesta a incidentes, y (8) análisis de vulnerabilidades "
    f"en dependencias de terceros (SCA — Software Composition Analysis)."
)
story.append(Paragraph(summary_text3, style_body))

# Findings summary table
story.append(Paragraph("1.1 Distribución de Hallazgos por Severidad", style_h2))

sev_data = [
    ['Severidad', 'Cantidad', 'Estado'],
    ['Crítica', str(SUMMARY['critical']), 'Acción inmediata requerida'],
    ['Alta', str(SUMMARY['high']), 'Resolver antes de producción'],
    ['Media', str(SUMMARY['medium']), 'Plan de remediación a 30 días'],
    ['Baja', str(SUMMARY['low']), 'Plan de remediación a 90 días'],
    ['Informativa', str(SUMMARY['info']), 'Documentar, sin acción'],
    ['Total', str(SUMMARY['total']), '—'],
]
sev_table = Table(sev_data, colWidths=[40*mm, 30*mm, 100*mm])
sev_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), C_BG_TABLE_HEAD),
    ('TEXTCOLOR', (0,0), (-1,0), C_PRIMARY),
    ('FONTNAME', (0,0), (-1,0), BODY_BOLD),
    ('FONTSIZE', (0,0), (-1,0), 10),
    ('FONTNAME', (0,1), (-1,-1), BODY_FONT),
    ('FONTSIZE', (0,1), (-1,-1), 9),
    ('ALIGN', (1,0), (1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0,1), (-1,-2), [white, C_BG_TABLE_ALT]),
    ('BACKGROUND', (0,-1), (-1,-1), HexColor('#e2e8f0')),
    ('FONTNAME', (0,-1), (-1,-1), BODY_BOLD),
    ('GRID', (0,0), (-1,-1), 0.5, HexColor('#cbd5e1')),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
]))
story.append(sev_table)
story.append(Spacer(1, 10))

story.append(Paragraph("1.2 Resumen de Cumplimiento Normativo", style_h2))

comp_data = [
    ['Norma / Estándar', 'Estado', 'Hallazgos'],
    ['Ley 21.719 (Ciberseguridad Chile)', f'{(SCORE)}% cumplido', f"{len([f for f in FINDINGS if 'Ley 21.719' in str(f['legalReference'])])}"],
    ['Ley 19.628 (Datos Personales)', f'Parcial', f"{len([f for f in FINDINGS if 'Ley 19.628' in str(f['legalReference'])])}"],
    ['OWASP Top 10 (2021)', f'Parcial', f"{len([f for f in FINDINGS if 'OWASP' in str(f['legalReference'])])}"],
    ['ISO/IEC 27001 (SGSI)', f'Parcial', f"{len([f for f in FINDINGS if 'ISO' in str(f['legalReference'])])}"],
    ['IEC 62443 (Industrial)', f'Parcial', f"{len([f for f in FINDINGS if 'IEC' in str(f['legalReference'])])}"],
    ['NIST CSF 2.0', f'Parcial', f"{len([f for f in FINDINGS if 'NIST' in str(f['legalReference'])])}"],
    ['IMO MSC.428(98)', f'Parcial', f"{len([f for f in FINDINGS if 'IMO' in str(f['legalReference'])])}"],
]
comp_table = Table(comp_data, colWidths=[80*mm, 40*mm, 50*mm])
comp_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), C_BG_TABLE_HEAD),
    ('TEXTCOLOR', (0,0), (-1,0), C_PRIMARY),
    ('FONTNAME', (0,0), (-1,0), BODY_BOLD),
    ('FONTSIZE', (0,0), (-1,0), 10),
    ('FONTNAME', (0,1), (-1,-1), BODY_FONT),
    ('FONTSIZE', (0,1), (-1,-1), 9),
    ('ALIGN', (1,0), (-1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, C_BG_TABLE_ALT]),
    ('GRID', (0,0), (-1,-1), 0.5, HexColor('#cbd5e1')),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
]))
story.append(comp_table)

story.append(PageBreak())

# Page 3+ - Detailed Findings
story.append(Paragraph("2. Hallazgos Detallados", style_h1))

intro = (
    f"A continuación se documentan los {SUMMARY['total']} hallazgos identificados durante la auditoría, "
    f"ordenados por nivel de severidad (crítico → alto → medio → bajo → informativo). Cada hallazgo incluye "
    f"descripción técnica, evidencia, recomendación de remediación y referencia normativa aplicable."
)
story.append(Paragraph(intro, style_body))

# Sort findings by severity
sev_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3, 'info': 4}
sorted_findings = sorted(FINDINGS, key=lambda f: (sev_order[f['severity']], f['id']))

sev_colors = {
    'critical': C_CRIT, 'high': C_HIGH, 'medium': C_MED, 'low': C_LOW, 'info': C_INFO
}
sev_labels = {
    'critical': 'CRÍTICA', 'high': 'ALTA', 'medium': 'MEDIA',
    'low': 'BAJA', 'info': 'INFO'
}
status_labels = {
    'compliant': 'CUMPLE', 'non_compliant': 'NO CUMPLE',
    'partial': 'PARCIAL', 'not_applicable': 'N/A'
}

for i, f in enumerate(sorted_findings, 1):
    color = sev_colors[f['severity']]
    label = sev_labels[f['severity']]
    status = status_labels[f['status']]

    # Header bar for each finding
    header_data = [[
        Paragraph(f"<b>#{i:02d}</b> <b>{f['id']}</b>", ParagraphStyle('fh', fontName=BODY_BOLD, fontSize=10, textColor=white)),
        Paragraph(f"<b>{label}</b>", ParagraphStyle('fh2', fontName=BODY_BOLD, fontSize=9, textColor=white, alignment=TA_CENTER)),
        Paragraph(f"<b>{status}</b>", ParagraphStyle('fh3', fontName=BODY_BOLD, fontSize=9, textColor=white, alignment=2)),
    ]]
    header = Table(header_data, colWidths=[100*mm, 35*mm, 35*mm])
    header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))

    title_p = Paragraph(f"<b>{f['title']}</b>", ParagraphStyle(
        'ft', fontName=BODY_BOLD, fontSize=11, textColor=C_TEXT,
        spaceBefore=6, spaceAfter=4, leading=14
    ))

    cat_p = Paragraph(f"<i>Categoría:</i> {f['category']}", style_body_small)

    desc_p = Paragraph(f"<b>Descripción:</b> {f['description']}", style_body_small)

    ev_text = f['evidence'].replace('\n', '<br/>')
    ev_p = Paragraph(f"<b>Evidencia:</b><br/><font face='Courier' size='8'>{ev_text}</font>", style_body_small)

    rec_p = Paragraph(f"<b>Recomendación:</b> {f['recommendation']}", style_body_small)

    legal_text = ' · '.join(f['legalReference'])
    legal_p = Paragraph(f"<b>Referencia normativa:</b> {legal_text}", style_legal)

    if f.get('cwe'):
        cwe_p = Paragraph(f"<b>CWE:</b> {f['cwe']}", style_legal)
    else:
        cwe_p = Paragraph("")

    block = KeepTogether([
        header,
        title_p,
        cat_p,
        Spacer(1, 4),
        desc_p,
        ev_p,
        rec_p,
        Spacer(1, 4),
        legal_p,
        cwe_p,
        Spacer(1, 12),
    ])
    story.append(block)

# Remediation Plan
story.append(PageBreak())
story.append(Paragraph("3. Plan de Remediación Priorizado", style_h1))

intro2 = (
    "El siguiente plan de remediación organiza los hallazgos por prioridad de acción, "
    "considerando la severidad y la dependencia técnica entre soluciones. Las acciones "
    "están agrupadas en tres horizontes temporales: inmediato (≤7 días), corto plazo "
    "(≤30 días) y mediano plazo (≤90 días)."
)
story.append(Paragraph(intro2, style_body))

# Immediate actions
story.append(Paragraph("3.1 Acciones Inmediatas (≤ 7 días)", style_h2))

immediate = [
    "Implementar autenticación real OAuth 2.0 con NextAuth.js (providers Microsoft Azure AD y Google Workspace) — elimina el hallazgo AUTH_REAL_OAUTH (crítico).",
    "Agregar middleware de Next.js que valide sesión en TODAS las rutas /api/* excepto /api/auth — cierra los hallazgos API_REPORTS_NO_AUTH y API_CHAT_NO_AUTH (altos).",
    "Implementar rate limiting en APIs con upstash/ratelimit (60 req/min operacional, 10 req/min para LLM) — cierra API_NO_RATE_LIMIT (alto).",
    "Configurar HTTPS con certificado válido (Let's Encrypt o EV) en producción, con redirección HTTP→HTTPS obligatoria — cierra DATA_TLS (alto).",
    "Establecer canal de notificación a ANCI conforme al Art. 16 de la Ley 21.719 (3 horas máximo desde detección) — cierra CS_INCIDENT_NOTIFICATION (crítico).",
    "Cifrar la base de datos: migrar a PostgreSQL con pgcrypto para datos sensibles + LUKS en disco — cierra DATA_ENCRYPTION_AT_REST (alto).",
]
for item in immediate:
    story.append(Paragraph(f"<b>•</b> {item}", style_body))
story.append(Spacer(1, 8))

# Short-term actions
story.append(Paragraph("3.2 Acciones a Corto Plazo (≤ 30 días)", style_h2))

short_term = [
    "Configurar TODOS los headers HTTP de seguridad en next.config.ts: Content-Security-Policy, Strict-Transport-Security (max-age=63072000, includeSubDomains), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy restrictivo.",
    "Implementar gestión formal de secretos con variables de entorno + rotation policy. Verificar con pre-commit hooks (gitleaks/trufflehog) que ningún secreto se cometa al repositorio.",
    "Establecer procedimiento formal de respuesta a incidentes (CSIRT) con roles RACI: Incident Commander, SOC Analyst, Comunicaciones, Legal, Directemar liaison.",
    "Realizar evaluación formal de riesgos cibernéticos (ISO 27005 / NIST SP 800-30): inventario de activos, matriz de amenazas, cálculo probabilidad × impacto.",
    "Implementar backups automatizados: DB snapshots diarios (retención 30 días) + replicación geográfica + pruebas trimestrales de restauración. RTO ≤ 4h, RPO ≤ 1h.",
    "Implementar segmentación de redes OT/IT con firewall industrial. Deny-by-default. Solo NTP/SNMPv3/RTSP permitidos entre zona OT y VTS.",
    "Documentar el Registro de Actividades de Tratamiento (RAT) conforme a la Ley 19.628: datos personales procesados, base legal, retención, destinatarios.",
    "Configurar SIEM (Wazuh o Elastic SIEM) para correlación de eventos de seguridad y alertas en tiempo real.",
]
for item in short_term:
    story.append(Paragraph(f"<b>•</b> {item}", style_body))
story.append(Spacer(1, 8))

# Medium-term actions
story.append(Paragraph("3.3 Acciones a Mediano Plazo (≤ 90 días)", style_h2))

medium_term = [
    "Implementar derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) mediante endpoints /api/privacy/* con autenticación obligatoria.",
    "Nombrar formalmente un Encargado de Protección de Datos (DPO) y registrarlo ante la CPPD si se superan los umbrales de la Ley 19.628.",
    "Realizar auditoría formal ISO/IEC 27001 con entidad acreditada (Bureau Veritas, SGS, TÜV) para obtener certificación.",
    "Realizar auditoría IEC 62443 con foco en sistemas industriales (radares, AIS, cámaras IP).",
    "Establecer ejercicios simulacros de incidente cibernético al menos 2 veces al año, con participación de Directemar y ANCI.",
    "Implementar SCA (Software Composition Analysis) automatizado con Snyk o Dependabot en CI/CD para detectar vulnerabilidades en dependencias.",
    "Obtener calificación A+ en SSL Labs para la configuración TLS del dominio.",
    "Documentar y certificar formalmente ante Directemar el cumplimiento de los Reglamentos CONAMAR y el DS MOPT 1/1941.",
]
for item in medium_term:
    story.append(Paragraph(f"<b>•</b> {item}", style_body))

# Final page - Conclusions
story.append(PageBreak())
story.append(Paragraph("4. Conclusiones y Recomendaciones Finales", style_h1))

conclusion1 = (
    f"El prototipo del sistema MaritimeVTS para TCP Valparaíso, en su estado actual, alcanza un "
    f"<b>índice de cumplimiento del {SCORE}%</b> respecto al conjunto normativo evaluado "
    f"(Ley 21.719, Ley 19.628, OWASP Top 10, ISO 27001, IEC 62443, NIST CSF 2.0, IMO MSC.428(98)). "
    f"Este nivel es <b>consistente con un prototipo en fase de demostración</b>, donde se priorizó "
    f"la validación de conceptos operacionales (fusión AIS/Radar/CCTV con IA, dashboard ejecutivo, "
    f"generación de informes en múltiples formatos, asistente IA con triple fuente de información) "
    f"por encima de la madurez de seguridad."
)
story.append(Paragraph(conclusion1, style_body))

conclusion2 = (
    f"Sin embargo, antes de cualquier despliegue en un entorno operacional real, incluyendo pruebas "
    f"piloto con Directemar, <b>deben resolverse obligatoriamente</b> los hallazgos de severidad "
    f"<b><font color='#dc2626'>crítica</font></b> y "
    f"<b><font color='#ea580c'>alta</font></b>, dado que representan violaciones directas "
    f"a la normativa chilena vigente y expondrían al operador del puerto y a la Autoridad Marítima "
    f"a riesgos legales, operacionales y reputacionales."
)
story.append(Paragraph(conclusion2, style_body))

conclusion3 = (
    f"Las <b>fortalezas identificadas</b> en el prototipo incluyen: (1) ausencia de secretos hardcodeados "
    f"en el código fuente, (2) ausencia de funciones peligrosas como <font face='Courier' size='9'>eval()</font> "
    f"o <font face='Courier' size='9'>innerHTML</font>, (3) implementación del modelo OperationLog para "
    f"trazabilidad de eventos (cumplimiento parcial ISO 27001 A.12.4), y (4) uso consistente de TypeScript "
    f"con ESLint para reducir clases de bugs. Estas prácticas deben mantenerse y reforzarse en el desarrollo "
    f"del producto real."
)
story.append(Paragraph(conclusion3, style_body))

conclusion4 = (
    f"<b>Recomendación final</b>: antes de avanzar a producción, ejecutar una segunda auditoría "
    f"independiente con una firma especializada (Bureau Veritas, EY, PwC, KPMG o similar) y obtener "
    f"certificación formal ISO/IEC 27001:2022 y, en paralelo, iniciar el proceso de declaración como "
    f"<b>Operador de Importancia Vital (OIV)</b> ante la Agencia Nacional de Ciberseguridad (ANCI) "
    f"conforme al Art. 16 de la Ley 21.719. Esto posicionará al sistema VTS de TCP Valparaíso como "
    f"referente regional en gestión de tráfico marítimo con cumplimiento normativo de clase mundial."
)
story.append(Paragraph(conclusion4, style_body))

story.append(Spacer(1, 30))

# Sign-off
story.append(Paragraph("Documento generado automáticamente por el script de auditoría", style_footer))
story.append(Paragraph(f"MaritimeVTS Security Audit Script v1.0 · {AUDIT['date']}", style_footer))
story.append(Paragraph(f"Objetivo: {AUDIT['target']}", style_footer))

# ============ BUILD PDF ============
output_path = '/home/z/my-project/download/Informe-Auditoria-Seguridad-MaritimeVTS.pdf'

doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=20*mm,
    rightMargin=20*mm,
    topMargin=20*mm,
    bottomMargin=20*mm,
    title="Informe de Auditoría de Seguridad — MaritimeVTS",
    author="MaritimeVTS Security Audit Script",
    subject="Auditoría de cumplimiento Ley 21.719 / Ley 19.628 / OWASP / ISO 27001",
    creator="MaritimeVTS",
)

# Cover page (page 1)
def first_page(canv, doc):
    draw_cover_page(canv, doc)

# Body pages (page 2+)
def later_pages(canv, doc):
    draw_body_page(canv, doc)

doc.build(story, onFirstPage=first_page, onLaterPages=later_pages)

print(f"✓ Informe PDF generado: {output_path}")
import os
size_kb = os.path.getsize(output_path) / 1024
print(f"  Tamaño: {size_kb:.1f} KB")
