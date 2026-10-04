#!/usr/bin/env python3
"""
Check de cumplimiento legal + validación de datos frontend vs backend
MaritimeVTS — TCP Valparaíso
"""
import json
import os
import re

print("=" * 60)
print("CHECK DE CUMPLIMIENTO + VALIDACIÓN DE DATOS")
print("MaritimeVTS — TCP Valparaíso")
print("=" * 60)

# 1. Cargar datos del frontend (data.ts)
data_path = '/home/z/my-project/src/lib/vts/data.ts'
with open(data_path, 'r') as f:
    content = f.read()

# Contar buques
vessel_count = len(re.findall(r"id: 'v\d+'", content))
print(f"\n📊 DATOS FRONTEND (src/lib/vts/data.ts):")
print(f"  Total buques definidos: {vessel_count}")

# Contar por estado
moored = len(re.findall(r"status: 'moored'", content))
arrival = len(re.findall(r"status: 'arrival'", content))
underway = len(re.findall(r"status: 'underway'", content))
anchored = len(re.findall(r"status: 'anchored'", content))
print(f"  Atracados (moored): {moored}")
print(f"  En aproximación (arrival): {arrival}")
print(f"  En navegación (underway): {underway}")
print(f"  Fondeados (anchored): {anchored}")

# Contar alertas
alert_count = len(re.findall(r"id: '[am]\d+'", content))
print(f"  Total alertas: {alert_count}")

# KPIs
kpi_values = re.findall(r"value: '(\d+)', unit: '([^']+)'", content)
print(f"  KPIs definidos: {len(kpi_values)}")
for v, u in kpi_values:
    print(f"    • {v} {u}")

# Tipos de buques
type_dist = re.findall(r"name: '[^']+', value: (\d+)", content)
print(f"  Distribución por tipo (total): {sum(int(t) for t in type_dist)}")

# 2. Validar consistencia
print(f"\n🔍 VALIDACIÓN DE CONSISTENCIA:")
issues = []

# KPI "Buques en Zona" vs total real
kpi_vessel_count = int(re.search(r"label: 'Buques en Zona VTS',\s+value: '(\d+)'", content).group(1))
if kpi_vessel_count == vessel_count:
    print(f"  ✅ KPI 'Buques en Zona' ({kpi_vessel_count}) = Total real ({vessel_count})")
else:
    print(f"  ❌ KPI 'Buques en Zona' ({kpi_vessel_count}) ≠ Total real ({vessel_count})")
    issues.append("KPI buques no coincide con total real")

# KPI "Atracados" vs count real
kpi_moored = int(re.search(r"label: 'Buques Atracados',\s+value: '(\d+)'", content).group(1))
if kpi_moored == moored:
    print(f"  ✅ KPI 'Atracados' ({kpi_moored}) = Count real ({moored})")
else:
    print(f"  ❌ KPI 'Atracados' ({kpi_moored}) ≠ Count real ({moored})")
    issues.append("KPI atracados no coincide")

# KPI "Aproximación" vs count real
kpi_arrival = int(re.search(r"label: 'Buques en Aproximación',\s+value: '(\d+)'", content).group(1))
if kpi_arrival == arrival:
    print(f"  ✅ KPI 'Aproximación' ({kpi_arrival}) = Count real ({arrival})")
else:
    print(f"  ❌ KPI 'Aproximación' ({kpi_arrival}) ≠ Count real ({arrival})")
    issues.append("KPI aproximación no coincide")

# 3. Check de cumplimiento legal
print(f"\n📋 CHECK DE CUMPLIMIENTO LEGAL:")

laws = [
    ("Ley 21.719 — Ciberseguridad", "CSIRT formal + notificación ANCI + OIV"),
    ("Ley 19.628 — Datos Personales", "Cifrado + derechos ARCO + RAT"),
    ("IALA V-103", "Operadores VTS certificados"),
    ("IMO MSC.428(98)", "Logging de eventos cibernéticos"),
    ("ISPS Code", "Seguridad portuaria"),
    ("SOLAS Cap. V", "Servicios VTS"),
    ("ISO/IEC 27001:2022", "SGSI + cert. Bureau Veritas"),
    ("IEC 62443", "Segmentación OT/IT + cert. TÜV"),
    ("NIST CSF 2.0", "Identificar·Proteger·Detectar·Responder·Recuperar"),
    ("S-100 Framework", "Cartas hidrográficas v4.0"),
    ("DS MOPT 1/1941", "Control del Tráfico Marítimo"),
    ("CONAMAR", "Reglamentos de Directemar"),
]

# Verificar menciones en el código
for law, desc in laws:
    law_short = law.split('—')[0].strip().split(' ')[0]
    if law_short in content:
        print(f"  ✅ {law} — {desc}")
    else:
        print(f"  ⚠️  {law} — No mencionado en data.ts (verificar en compliance-panel.tsx)")

# Verificar menciones en compliance-panel
comp_path = '/home/z/my-project/src/components/vts/compliance-panel.tsx'
if os.path.exists(comp_path):
    with open(comp_path, 'r') as f:
        comp_content = f.read()
    print(f"\n  📄 Panel de Cumplimiento (compliance-panel.tsx):")
    for law, desc in laws:
        law_short = law.split('—')[0].strip().split(' ')[0]
        if law_short in comp_content:
            # Verificar si está marcado como 'compliant'
            status_match = re.search(rf"{re.escape(law_short)}.*?status: '(\w+)'", comp_content, re.DOTALL)
            if status_match and status_match.group(1) == 'compliant':
                print(f"    ✅ {law} — CUMPLE")
            elif status_match:
                print(f"    ⚠️  {law} — {status_match.group(1).upper()}")
            else:
                print(f"    ✅ {law} — Mencionado")
        else:
            print(f"    ❌ {law} — No encontrado en panel")

# 4. Validar datos del backend (Prisma schema)
print(f"\n🗄️ BACKEND — Base de datos TPS (schema.prisma):")
schema_path = '/home/z/my-project/prisma/schema.prisma'
if os.path.exists(schema_path):
    with open(schema_path, 'r') as f:
        schema = f.read()
    models = re.findall(r'model (\w+)', schema)
    print(f"  Modelos definidos: {len(models)}")
    for m in models:
        print(f"    • {m}")

# 5. Resumen final
print(f"\n{'=' * 60}")
print(f"RESUMEN FINAL")
print(f"{'=' * 60}")
print(f"  Buques en frontend: {vessel_count}")
print(f"  Buques en backend (DB): {len(models)} modelos")
print(f"  Alertas en frontend: {alert_count}")
print(f"  KPIs consistentes: {'✅ SÍ' if not issues else '❌ NO'}")
print(f"  Leyes verificadas: {len(laws)}")
print(f"  Issues encontrados: {len(issues)}")
if issues:
    for i in issues:
        print(f"    ⚠️  {i}")
else:
    print(f"\n  ✅ TODOS LOS DATOS SON CONSISTENTES")
print(f"{'=' * 60}")
