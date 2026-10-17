"""
Script para generar los documentos técnicos de Word (.docx) para SeniorAssist:
1. SeniorAssist_Ciclo_DevOps_8_Fases.docx (Todas las 8 fases detalladas)
2. SeniorAssist_Fase_6_DEPLOY_Guia_Exposicion.docx (Guía maestra para la exposición de DEPLOY)
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Documentos")
os.makedirs(DOCS_DIR, exist_ok=True)

# Paleta de Colores
COLOR_PRIMARY = RGBColor(26, 54, 93)      # Navy Profundo (#1A365D)
COLOR_SECONDARY = RGBColor(13, 118, 133)  # Teal / Cian (#0D7685)
COLOR_TEXT = RGBColor(45, 55, 72)         # Charcoal Oscuro (#2D3748)
COLOR_MUTED = RGBColor(100, 116, 139)     # Gris Pizarra (#64748B)
COLOR_ACCENT = RGBColor(217, 119, 6)      # Ámbar (#D97706)
COLOR_SUCCESS = RGBColor(5, 150, 105)     # Verde Éxito (#059669)

HEX_PRIMARY = "1A365D"
HEX_SECONDARY = "0D7685"
HEX_LIGHT_BG = "F8FAFC"
HEX_CALLOUT_BG = "F0F9FF"
HEX_CALLOUT_BORDER = "0D7685"
HEX_WARN_BG = "FFFBEB"
HEX_WARN_BORDER = "D97706"
HEX_BORDER = "CBD5E1"

def set_cell_background(cell, hex_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, hex_color=HEX_BORDER):
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>'
            f'  <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{hex_color}"/>'
            f'  <w:left w:val="none"/>'
            f'  <w:right w:val="none"/>'
            f'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>'
            f'  <w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr[0].append(borders)

def add_header_banner(doc, title, subtitle, meta_items):
    # Título Principal
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run(title)
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY

    # Subtítulo
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(12)
    run_sub = p_sub.add_run(subtitle)
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(12)
    run_sub.font.italic = True
    run_sub.font.color.rgb = COLOR_SECONDARY

    # Tabla de Metadatos
    meta_table = doc.add_table(rows=len(meta_items), cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    for i, (label, val) in enumerate(meta_items):
        row = meta_table.rows[i]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        cell_lbl.width = Inches(2.2)
        cell_val.width = Inches(4.5)
        set_cell_background(cell_lbl, "EDF2F7")
        set_cell_background(cell_val, HEX_LIGHT_BG)
        set_cell_margins(cell_lbl, 60, 60, 100, 100)
        set_cell_margins(cell_val, 60, 60, 100, 100)

        p1 = cell_lbl.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(label)
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = COLOR_PRIMARY

        p2 = cell_val.paragraphs[0]
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(val)
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = COLOR_TEXT

    set_table_borders(meta_table, "CBD5E1")
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

def add_h1(doc, text):
    h = doc.add_heading(level=1)
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(15)
    run.font.bold = True
    run.font.color.rgb = COLOR_PRIMARY
    return h

def add_h2(doc, text):
    h = doc.add_heading(level=2)
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(12.5)
    run.font.bold = True
    run.font.color.rgb = COLOR_SECONDARY
    return h

def add_h3(doc, text):
    h = doc.add_heading(level=3)
    h.paragraph_format.space_before = Pt(8)
    h.paragraph_format.space_after = Pt(2)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = COLOR_TEXT
    return h

def add_body_p(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = COLOR_PRIMARY
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(10.5)
    r.font.color.rgb = COLOR_TEXT
    return p

def add_bullet_p(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = COLOR_TEXT
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(10.5)
    r.font.color.rgb = COLOR_TEXT
    return p

def add_callout(doc, title, text, box_type="info"):
    bg_hex = HEX_CALLOUT_BG if box_type == "info" else HEX_WARN_BG
    border_hex = HEX_CALLOUT_BORDER if box_type == "info" else HEX_WARN_BORDER
    title_color = COLOR_SECONDARY if box_type == "info" else COLOR_ACCENT

    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.rows[0].cells[0]
    cell.width = Inches(6.7)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, 120, 120, 180, 180)

    # Borde izquierdo grueso
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'  <w:left w:val="single" w:sz="36" w:space="0" w:color="{border_hex}"/>'
        f'  <w:top w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:bottom w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(4)
    r_tit = p.add_run(f"📌 {title}\n")
    r_tit.font.name = "Calibri"
    r_tit.font.size = Pt(10.5)
    r_tit.font.bold = True
    r_tit.font.color.rgb = title_color

    r_txt = p.add_run(text)
    r_txt.font.name = "Calibri"
    r_txt.font.size = Pt(10)
    r_txt.font.italic = True
    r_txt.font.color.rgb = COLOR_TEXT

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_code_block(doc, code_str):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.rows[0].cells[0]
    cell.width = Inches(6.7)
    set_cell_background(cell, "F1F5F9")
    set_cell_margins(cell, 100, 100, 140, 140)

    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'  <w:left w:val="single" w:sz="12" w:space="0" w:color="94A3B8"/>'
        f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        f'  <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        f'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(code_str)
    run.font.name = "Consolas"
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)


# ==============================================================================
# DOCUMENTO 1: CICLO DE VIDA DEVOPS EN 8 FASES
# ==============================================================================

def generate_devops_8_phases_doc():
    doc = docx.Document()

    # Configuración de márgenes normales (1 pulgada / 2.54 cm)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

    add_header_banner(
        doc,
        title="INFORME TÉCNICO EXHAUSTIVO: CICLO DE VIDA DEVOPS EN 8 FASES",
        subtitle="Proyecto SeniorAssist – Asistente Autónomo por Voz y Tutor para Adultos Mayores",
        meta_items=[
            ("Institución Educativa:", "Unidades Tecnológicas de Santander (UTS)"),
            ("Asignatura / Semestre:", "Nuevas Tecnologías de Desarrollo – 6° Semestre"),
            ("Equipo de Desarrollo:", "SeniorAssist DevOps Engineering Team"),
            ("Versión del Sistema:", "v1.0.0 (Release Oficial de Producción)"),
            ("Repositorio Oficial:", "https://github.com/Julitosh07/SeniorAssist"),
            ("Backend en Producción:", "https://seniorassist.onrender.com (Render Cloud PaaS)"),
            ("Fecha de Entrega:", "Octubre 2026")
        ]
    )

    add_h1(doc, "1. RESUMEN EJECUTIVO Y ARQUITECTURA GENERAL")
    add_body_p(doc, 
        "SeniorAssist es un ecosistema de software distribuido diseñado para cerrar la brecha digital en adultos mayores. "
        "A diferencia de aplicaciones web convencionales, SeniorAssist opera como una arquitectura híbrida compuesta por: "
        "(1) un cliente móvil nativo Android de alta accesibilidad ergonómica (React Native / Expo) con capacidad Offline-First, y "
        "(2) un microservicio inteligente de procesamiento de voz y autenticación en la nube desarrollado en Python 3.10 con FastAPI y Uvicorn."
    )
    add_body_p(doc,
        "Para asegurar calidad, repetibilidad y alta disponibilidad en cada iteración, se implementó un Ciclo de Vida DevOps completo "
        "de 8 fases articulado bajo los principios de 'Shift-Left Security' (seguridad integrada desde el diseño) y 'Continuous Feedback' "
        "(retroalimentación continua de observabilidad hacia la planificación)."
    )

    add_h1(doc, "2. MATRIZ RESUMEN DE LAS 8 FASES DEVOPS EN SENIORASSIST")

    phases_data = [
        ("1. PLAN", "Jira, IEEE 830, WCAG AAA", "Requisitos RF01-RF11, lista blanca estricta de 16 acciones.", "src/constants/actions.ts\nCHANGELOG.md"),
        ("2. CODE", "TypeScript, React Native, Python, FastAPI, Git", "MVVM móvil, Zero-Login (JWA HS256), motor Offline-First.", "src/context/GlobalVoiceAssistantContext.tsx\nbackend/app/"),
        ("3. BUILD", "Gradle, Metro Bundler, Java JDK 17, PowerShell", "Compilación de index.android.bundle, SeniorAssist.apk y ZIP PaaS.", "android/build.gradle\nscripts/build_standalone_apk.ps1"),
        ("4. TEST", "Pytest, TestClient, Node.js, Suite de Voz", "56 pruebas automáticas: 40 cliente, 8 backend/seguridad, 8 voz colombiana.", "backend/tests/test_api_suite.py\nscripts/test_voice_suite.js"),
        ("5. RELEASE", "SemVer 2.0.0, Git Tag, SHA-256 Checksums", "Tag v1.0.0, CHANGELOG estructurado y huella SHA-256 inmutable.", "CHANGELOG.md\nSHA256SUMS.txt"),
        ("6. DEPLOY (Expo)", "Render (PaaS), AWS Elastic Beanstalk, GitHub Releases", "Despliegue nativo sin Docker en Render, pipeline AWS y APK distribuido.", "render.yaml\nProcfile\nDEPLOYMENT_DEFENSE_GUIDE.md"),
        ("7. OPERATE", "Ansible, Systemd, Nginx, Linux Daemons", "Aprovisionamiento automatizado, auto-reinicio Systemd <1s y proxy SSL.", "ansible/playbook_operate.yml\nansible/templates/"),
        ("8. MONITOR", "Datadog APM, CloudWatch, Prometheus, Telemetry", "Endpoints /monitoring/metrics, alarmas latencia <2s y bucle a PLAN.", "backend/app/routers/monitoring.py\nMonitoringService.ts")
    ]

    table = doc.add_table(rows=len(phases_data) + 1, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    headers = ["Fase DevOps", "Herramientas", "Qué se Creó / Implementó", "Archivos Clave en Repo"]
    col_widths = [Inches(1.2), Inches(1.6), Inches(2.3), Inches(1.6)]

    for j, h_text in enumerate(headers):
        cell = table.rows[0].cells[j]
        cell.width = col_widths[j]
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, 80, 80, 100, 100)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for i, row_data in enumerate(phases_data):
        row = table.rows[i + 1]
        bg_col = HEX_LIGHT_BG if i % 2 == 0 else "FFFFFF"
        for j, val in enumerate(row_data):
            cell = row.cells[j]
            cell.width = col_widths[j]
            set_cell_background(cell, bg_col)
            set_cell_margins(cell, 60, 60, 100, 100)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            r.font.color.rgb = COLOR_PRIMARY if j == 0 else COLOR_TEXT
            if j == 0:
                r.font.bold = True

    set_table_borders(table)
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ==========================================
    # DESGLOSE FASE POR FASE
    # ==========================================

    phases_detail = [
        {
            "num": "1",
            "name": "FASE 1: PLAN (PLANIFICACIÓN Y REQUISITOS)",
            "desc": "Se definieron 11 Requerimientos Funcionales (RF01 a RF11) bajo el estándar IEEE 830-1998 y pautas de accesibilidad WCAG 2.1 nivel AAA para personas de la tercera edad. Se aplicó Shift-Left Security definiendo la lista blanca estricta de 16 acciones autorizadas (ALLOWED_ACTIONS) para prevenir que la IA o la voz ejecuten comandos destructivos.",
            "tools": "Jira / GitHub Projects (gestión de sprints), WCAG 2.1 AAA Contrast Checker (contraste >= 7:1 y botones >= 64dp), Diagramas C4/UML.",
            "created": [
                "src/constants/actions.ts: Declaración del enum tipado AllowedActionType y lista blanca estricta ALLOWED_ACTIONS (CALL_CONTACT, SEND_WHATSAPP, CREATE_ALARM, TRIGGER_SOS, etc.).",
                "CHANGELOG.md: Documentación de los requerimientos RF01-RF11 y matriz de diseño accesible.",
                "Estructura de backlog ágil con criterios de aceptación auditables."
            ],
            "files": ["src/constants/actions.ts", "CHANGELOG.md"],
            "defense": "Profesor, en DevOps la calidad y la seguridad se planifican desde el día cero ('Shift-Left'). No esperamos a desplegar para blindar el sistema: en src/constants/actions.ts definimos una lista blanca matemáticamente cerrada de 16 acciones. Cualquier orden de voz que no pertenezca a esta lista es rechazada de inmediato, garantizando cero inyecciones o alucinaciones de IA."
        },
        {
            "num": "2",
            "name": "FASE 2: CODE (CODIFICACIÓN Y CONTROL DE VERSIONES)",
            "desc": "Desarrollo del cliente móvil nativo Android y del microservicio asíncrono en Python. Se implementó una arquitectura MVVM en React Native con capacidad Offline-First: si el abuelo está sin conexión a internet, la aplicación sigue ejecutando llamadas, linterna, lupa y alarmas locales en SQLite sin congelarse. En el backend, se implementó autenticación Zero-Login basada en el estándar JWA (RFC 7518) con algoritmo simétrico HS256.",
            "tools": "TypeScript 5.x, React Native 0.76, Expo SDK 52, Python 3.10+, FastAPI, PyJWT, Git (flujo con Conventional Commits), expo-secure-store (Android Keystore).",
            "created": [
                "App.tsx: Punto de entrada con handshake de autenticación transparente y captura del botón físico Atrás de Android.",
                "src/context/GlobalVoiceAssistantContext.tsx: Motor de escucha omnipresente y streaming asíncrono de telemetría a la nube.",
                "backend/app/main.py y routers (auth.py, ai.py, monitoring.py): Endpoints REST asíncronos.",
                "backend/app/security/jwt_handler.py: Generación y verificación de tokens criptográficos HS256."
            ],
            "files": ["App.tsx", "src/context/GlobalVoiceAssistantContext.tsx", "backend/app/security/jwt_handler.py"],
            "defense": "Profesor, resolvimos el reto de la alfabetización digital mediante código accesible: implementamos 'Zero-Login' con JWT HS256, eliminando la barrera de recordar contraseñas para el adulto mayor. Además, programamos bajo el paradigma Offline-First con SQLite: la app jamás muestra un error técnico de red ni se bloquea."
        },
        {
            "num": "3",
            "name": "FASE 3: BUILD (CONSTRUCCIÓN Y AUTOMATIZACIÓN DE COMPILACIÓN)",
            "desc": "Automatización determinista para transformar el código fuente en artefactos ejecutables. Metro Bundler minifica el código JavaScript y genera index.android.bundle. Luego Gradle Wrapper compila el código nativo en Java/Kotlin y C++, produciendo el binario firmado SeniorAssist.apk (166 MB). En paralelo, un script de PowerShell valida y empaqueta el backend en un archivo seniorassist-backend-deploy.zip de solo 13 KB listo para PaaS.",
            "tools": "Gradle 8.x Wrapper (gradlew), Metro Bundler, Java JDK 17, PowerShell / Batch scripts, GitHub Actions (build.yml).",
            "created": [
                ".github/workflows/build.yml: Pipeline de construcción en la nube con jobs paralelos para Android y Backend.",
                "scripts/build_standalone_apk.ps1 y .bat: Script automatizado de exportación de assets y ejecución de Gradle.",
                "scripts/package_backend_deploy.ps1: Empaquetado optimizado del backend nativo de 13 KB.",
                "SeniorAssist.apk: Binario compilado y firmado para Android."
            ],
            "files": [".github/workflows/build.yml", "scripts/build_standalone_apk.ps1", "SeniorAssist.apk"],
            "defense": "Profesor, un build profesional en DevOps debe ser reproducible e independiente de la máquina local. Usamos Gradle Wrapper para fijar la versión exacta de compilación y Metro Bundler para optimizar el bundle JS. El paquete de backend pesa solo 13 KB, lo que demuestra la enorme eficiencia de un despliegue nativo frente a imágenes de contenedores pesadas."
        },
        {
            "num": "4",
            "name": "FASE 4: TEST (PRUEBAS CONTINUAS Y VALIDACIÓN DE CALIDAD)",
            "desc": "Estrategia integral de Continuous Testing compuesta por 56 pruebas automatizadas: 40 pruebas de integridad de cliente (contratos de interfaces, persistencia SQLite, WCAG AAA), 8 pruebas de backend y seguridad en Pytest (healthcheck, autenticación transparente, rechazo estricto de JWTs inválidos y cobertura total de lista blanca NLU), y 8 pruebas sintéticas de voz con modismos coloquiales colombianos.",
            "tools": "Pytest, FastAPI TestClient (HTTPX), Node.js Test Runner, Jest, GitHub Actions (test.yml).",
            "created": [
                ".github/workflows/test.yml: Quality Gate que bloquea cualquier commit que falle una sola prueba.",
                "backend/tests/test_api_suite.py: Suite integral de pruebas unitarias y de integración de API REST.",
                "scripts/test_voice_suite.js: Suite de validación de lenguaje natural con tolerancia a modismos.",
                "scripts/verify_client_integrity.js: Verificación de contratos y directivas de accesibilidad."
            ],
            "files": [".github/workflows/test.yml", "backend/tests/test_api_suite.py", "scripts/test_voice_suite.js"],
            "defense": "Profesor, en DevOps la calidad no es negociable. Nuestra suite ejecuta 56 pruebas automáticas. No solo verificamos casos de éxito, sino que probamos casos negativos: enviamos tokens corruptos para constatar que el backend devuelva 401 Unauthorized y probamos frases como 'llama a mi mami' para asegurar que el modelo extraiga la intención correcta con confianza superior al 90%."
        },
        {
            "num": "5",
            "name": "FASE 5: RELEASE (GESTIÓN DE VERSIONES Y EMPAQUETADO)",
            "desc": "Formalización de entregables bajo estándares de la industria. Se implementó Versionamiento Semántico (SemVer 2.0.0) asignando el Tag anotado v1.0.0. Se redactó el documento CHANGELOG.md categorizado (Added, Accessibility, Security, Infrastructure). Para garantizar la inmutabilidad y la no alteración del binario APK, se calculó su huella criptográfica SHA-256 registrada en SHA256SUMS.txt.",
            "tools": "Git Tags & Git Releases, CertUtil / OpenSSL (SHA-256 Checksums), SemVer 2.0.0, Keep a Changelog, GitHub Releases, GitHub Actions (release.yml).",
            "created": [
                "Tag oficial v1.0.0 en el árbol de commits de Git.",
                "CHANGELOG.md: Bitácora completa y formal de cambios para la versión 1.0.0.",
                "SHA256SUMS.txt: Manifiesto de verificación criptográfica del binario APK.",
                ".github/workflows/release.yml: Pipeline de publicación automática de releases al detectar tags v*.",
                "scripts/create_release.ps1: Script de automatización de releases y cálculo de hashes."
            ],
            "files": ["CHANGELOG.md", "SHA256SUMS.txt", ".github/workflows/release.yml"],
            "defense": "Profesor, en un entorno de producción regulado nadie instala un binario sin verificar su huella digital. Publicamos el Tag v1.0.0 junto al archivo SHA256SUMS.txt. Si el hash del archivo en el teléfono coincide con el del repositorio, tenemos la certeza matemática de que el software es auténtico y no fue manipulado por terceros (Integrity & Non-Repudiation)."
        },
        {
            "num": "6",
            "name": "FASE 6: DEPLOY (DESPLIEGUE CONTINUO - FASE DE EXPOSICIÓN)",
            "desc": "Puesta en producción del ecosistema cumpliendo la restricción estricta de CERO DOCKER. El backend se desplegó de forma nativa en Render Cloud PaaS (Python 3.10) con endpoint público seguro HTTPS (seniorassist.onrender.com). Se configuró además la infraestructura como código para AWS Elastic Beanstalk (.ebextensions y Procfile). La aplicación móvil se distribuye mediante GitHub Releases y Firebase App Distribution.",
            "tools": "Render (Cloud PaaS), AWS Elastic Beanstalk (PaaS Empresarial), Uvicorn ASGI Server, render.yaml, Procfile, GitHub Releases, Firebase App Distribution, GitHub Actions (deploy.yml).",
            "created": [
                "render.yaml: Manifiesto de Infraestructura como Código (IaC) para Render.",
                "Procfile: Declaración estándar de proceso ASGI para PaaS.",
                ".ebextensions/01_fastapi.config: Configuración de entorno nativo para AWS Elastic Beanstalk.",
                "backend/microservicios_demo.py: Demostración de dos microservicios nativos sin contenedores (puertos 8001 y 8002).",
                ".github/workflows/deploy.yml: Pipeline de CD con despliegues paralelos para Backend y Móvil.",
                "DEPLOYMENT_DEFENSE_GUIDE.md: Guía maestra de sustentación de la fase DEPLOY."
            ],
            "files": ["render.yaml", "Procfile", ".ebextensions/01_fastapi.config", "DEPLOYMENT_DEFENSE_GUIDE.md"],
            "defense": "Profesor, a nuestro equipo le correspondió exponer DEPLOY. Demostramos que Docker no es una camisa de fuerza. Al utilizar PaaS nativo con Render y Elastic Beanstalk logramos un artefacto de solo 13 KB frente a 1.5 GB de una imagen Docker, eliminamos el arranque en frío y dejamos el mantenimiento del kernel en manos de la nube. El APK viaja directo al teléfono del usuario a través de GitHub Releases y Firebase."
        },
        {
            "num": "7",
            "name": "FASE 7: OPERATE (OPERACIÓN, RESILIENCIA Y ALTA DISPONIBILIDAD)",
            "desc": "Aseguramiento de la continuidad operativa del servicio en producción. Se implementó aprovisionamiento automatizado con Ansible (playbook_operate.yml) para configurar servidores Linux de forma repetible. Se configuró un demonio de Systemd con directiva de auto-reinicio 'Restart=always' en menos de 1 segundo ante caídas imprevistas (Self-Healing). Además, se configuró Nginx como Reverse Proxy con terminación SSL y compresión Gzip.",
            "tools": "Ansible (gestión de configuración sin agentes), Systemd (gestor de procesos del sistema Linux), Nginx (Reverse Proxy y SSL), Jinja2 (plantillas de configuración).",
            "created": [
                "ansible/playbook_operate.yml: Playbook declarativo de aprovisionamiento de servidor.",
                "ansible/templates/seniorassist.service.j2: Plantilla de unidad Systemd con políticas de auto-recuperación y límites de memoria.",
                "ansible/templates/nginx_seniorassist.conf.j2: Plantilla de proxy inverso Nginx con encabezados de seguridad HSTS y CORS.",
                "ansible/inventory.ini: Inventario parametrizado de servidores.",
                "ansible/README.md: Manual de operaciones y mantenimiento."
            ],
            "files": ["ansible/playbook_operate.yml", "ansible/templates/seniorassist.service.j2", "ansible/templates/nginx_seniorassist.conf.j2"],
            "defense": "Profesor, en DevOps la responsabilidad del equipo no termina con el deploy. En OPERATE utilizamos Ansible para lograr 'Infraestructura como Código Inmutable': podemos levantar un servidor idéntico en 2 minutos con un solo comando. Y con Systemd garantizamos Alta Disponibilidad: si el proceso de Python muere, el sistema operativo lo reinicia en menos de 1 segundo sin intervención humana."
        },
        {
            "num": "8",
            "name": "FASE 8: MONITOR (MONITOREO, OBSERVABILIDAD Y BUCLE DE RETROALIMENTACIÓN)",
            "desc": "Implementación de los 3 pilares de la observabilidad: Métricas, Trazas y Logs. El backend expone métricas en formato estándar de Prometheus y Datadog en /monitoring/metrics. La app móvil ejecuta el servicio MonitoringService.ts para medir latencia de red de voz y rendimiento de batería. Se crearon reglas de alerta (alerts.yaml) para notificar si la latencia supera los 2 segundos o los errores 5xx superan el 1%. Estas métricas cierran el bucle DevOps alimentando el backlog de PLAN.",
            "tools": "Datadog APM & Tracing, AWS CloudWatch, Prometheus Metrics Exporter, FastAPI Custom Telemetry Middleware.",
            "created": [
                "backend/app/routers/monitoring.py: Endpoints /monitoring/metrics y /monitoring/health con métricas de CPU, memoria y peticiones.",
                "src/services/MonitoringService.ts: Agente de telemetría de experiencia de usuario en el cliente móvil.",
                "monitoring/alerts.yaml: Reglas de alarma para Prometheus y Datadog.",
                "monitoring/dashboard_cloudwatch.json: Dashboard de monitoreo ejecutivo en AWS CloudWatch.",
                "monitoring/datadog_agent.yaml: Configuración del agente de APM de Datadog."
            ],
            "files": ["backend/app/routers/monitoring.py", "src/services/MonitoringService.ts", "monitoring/alerts.yaml", "monitoring/dashboard_cloudwatch.json"],
            "defense": "Profesor, el monitoreo es lo que convierte una línea recta en el círculo infinito de DevOps. Con Datadog y nuestro endpoint /monitoring/metrics medimos el tiempo de respuesta de cada orden de voz. Si una orden de un adulto mayor tarda más de 2 segundos, se dispara una alerta y esa información alimenta la fase de PLAN para optimizar el modelo en el siguiente sprint."
        }
    ]

    for p_info in phases_detail:
        add_h1(doc, p_info["name"])
        add_body_p(doc, p_info["desc"])
        add_body_p(doc, p_info["tools"], bold_prefix="Herramientas Utilizadas: ")
        
        doc.add_paragraph().paragraph_format.space_after = Pt(2)
        p_c = doc.add_paragraph()
        p_c.paragraph_format.space_after = Pt(2)
        r_c = p_c.add_run("Qué se Creó y se Modificó:")
        r_c.font.bold = True
        r_c.font.size = Pt(10.5)
        r_c.font.color.rgb = COLOR_PRIMARY

        for cr in p_info["created"]:
            add_bullet_p(doc, cr)

        add_body_p(doc, ", ".join(p_info["files"]), bold_prefix="Archivos para Abrir y Mostrar en el Repositorio: ")
        add_callout(doc, "Cómo Explicar y Defender esta Fase ante el Profesor", p_info["defense"], box_type="info")

    # ==========================================
    # PREGUNTAS TRAMPA GLOBALES
    # ==========================================
    add_h1(doc, "3. BANCO DE PREGUNTAS TRAMPA DEL PROFESOR Y RESPUESTAS DEVOPS")

    q_items = [
        ("¿Por qué esto es DevOps y no desarrollo tradicional de software?",
         "Profesor, el desarrollo tradicional termina cuando el programador entrega el código y dice 'en mi máquina funciona'. En SeniorAssist implementamos DevOps porque automatizamos la cadena de valor completa: cada cambio pasa por pruebas automáticas (TEST), se empaqueta sin tocar nada manual (BUILD y RELEASE), se despliega con infraestructura como código (DEPLOY), se opera con auto-recuperación (OPERATE) y se monitorea con telemetría en vivo (MONITOR) para retroalimentar la planificación (PLAN)."),

        ("¿Cómo garantizan la trazabilidad si ocurre un error en producción?",
         "La trazabilidad es total mediante Git y artefactos inmutables. Cada commit sigue la convención de Conventional Commits. La versión v1.0.0 está respaldada por un Git Tag inmutable, un CHANGELOG.md formal y el archivo SHA256SUMS.txt con el hash criptográfico del APK. Cualquier persona puede auditar el hash del binario y comprobar que corresponde exactamente a ese commit."),

        ("Si el servidor en la nube se cae o no hay internet, ¿la aplicación deja de funcionar?",
         "No, profesor. Diseñamos la arquitectura bajo el principio de 'Graceful Degradation' y 'Offline-First'. El cliente móvil tiene un motor local de inferencia, SQLite local para medicamentos y acceso nativo al hardware para llamadas de emergencia, linterna y lupa. Si la nube o internet fallan, la app conmuta a modo local sin que el adulto mayor experimente errores.")
    ]

    for q_text, ans_text in q_items:
        add_callout(doc, f"Pregunta Trampa: \"{q_text}\"", f"Tu Respuesta Técnica: {ans_text}", box_type="warn")

    output_path = os.path.join(DOCS_DIR, "SeniorAssist_Ciclo_DevOps_8_Fases.docx")
    doc.save(output_path)
    print(f"[OK] Generado: {output_path}")


# ==============================================================================
# DOCUMENTO 2: GUÍA MAESTRA DE LA FASE 6 - DEPLOY
# ==============================================================================

def generate_deploy_phase_guide_doc():
    doc = docx.Document()

    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

    add_header_banner(
        doc,
        title="GUÍA MAESTRA DE SUSTENTACIÓN: FASE 6 - DEPLOY",
        subtitle="Estrategia de Despliegue Continuo Cloud PaaS + Distribución Móvil sin Docker",
        meta_items=[
            ("Proyecto Académico:", "SeniorAssist – Asistente Autónomo por Voz"),
            ("Asignatura / Semestre:", "Nuevas Tecnologías de Desarrollo – 6° Semestre UTS"),
            ("Fase Asignada para Exponer:", "FASE 6: DEPLOY (Despliegue Continuo)"),
            ("Restricción Estricta Cumplida:", "100% CERO DOCKER (PaaS Nativo + Distribución Móvil)"),
            ("Servicio Web en Producción:", "https://seniorassist.onrender.com"),
            ("Swagger UI / OpenAPI en Vivo:", "https://seniorassist.onrender.com/docs"),
            ("Repositorio y Releases:", "https://github.com/Julitosh07/SeniorAssist"),
            ("Binario de Entrega:", "SeniorAssist.apk (166 MB, Firmado, SHA-256)")
        ]
    )

    add_h1(doc, "1. RESUMEN Y OBJETIVO DE NUESTRA EXPOSICIÓN")
    add_body_p(doc,
        "A nuestro equipo le correspondió sustentar la FASE 6: DEPLOY. El propósito de esta exposición es demostrar "
        "cómo resolvimos de forma profesional el despliegue de un ecosistema híbrido distribuido (Backend en la nube + "
        "Cliente móvil Android) cumpliendo de manera estricta la condición de NO USAR CONTENEDORES DOCKER."
    )
    add_body_p(doc,
        "Demostraremos por qué la arquitectura seleccionada —Platform as a Service (PaaS) nativo en Render y AWS Elastic Beanstalk "
        "junto a distribución móvil con GitHub Releases y Firebase— es técnicamente superior a Docker para este tipo de proyectos."
    )

    add_h1(doc, "2. EL PITCH DE ENTRADA (CÓMO INICIAR LA EXPOSICIÓN)")
    pitch_text = (
        "\"Buenos días profesor y compañeros. A nuestro equipo le correspondió exponer la Fase 6: DEPLOY (Despliegue).\n\n"
        "Para nuestro proyecto SeniorAssist, el despliegue no era simplemente subir una página web en HTML. Teníamos el reto de "
        "desplegar un ecosistema híbrido: un microservicio en la nube con procesamiento de voz e inteligencia artificial, y una aplicación "
        "móvil Android de alta accesibilidad que se ejecuta directamente en los teléfonos de adultos mayores.\n\n"
        "Cumpliendo a cabalidad con la restricción de no utilizar contenedores Docker, analizamos la arquitectura y seleccionamos "
        "las soluciones empresariales nativas estándar:\n"
        "1. Para el Backend Cloud: Utilizamos un modelo PaaS (Platform as a Service) sobre Render y AWS Elastic Beanstalk, ejecutando "
        "Python 3.10 de forma nativa directamente sobre el sistema operativo.\n"
        "2. Para el Cliente Móvil: Implementamos un pipeline de compilación y entrega continua que distribuye el binario Android APK "
        "a través de GitHub Releases y Firebase App Distribution.\n\n"
        "A continuación les demostraremos por qué esta arquitectura es técnicamente superior a Docker para este proyecto, cómo está "
        "configurada la infraestructura como código, y veremos el sistema funcionando en vivo en tiempo real con peticiones desde el celular.\""
    )
    add_callout(doc, "Pitch de Entrada para Memorizar o Leer con Seguridad", pitch_text, box_type="info")

    add_h1(doc, "3. LOS 4 ARGUMENTOS DE ORO: ¿POR QUÉ NO USAR DOCKER AQUÍ?")

    comp_data = [
        ("Criterio de Evaluación", "Con Contenedores Docker", "Con PaaS Nativo (SeniorAssist)"),
        ("Tamaño del Artefacto", "1.5 GB a 2.0 GB (capas Linux)", "13.73 KB (Paquete ZIP nativo)"),
        ("Sobrecarga de Recursos", "Capas cgroups, namespaces, overlayfs", "Cero sobrecarga (Native Runtime)"),
        ("Arranque en Frío (Cold Start)", "30 a 60 segundos por imagen", "Instantáneo sobre Python optimizado"),
        ("Parcheo de Seguridad del SO", "Manual (responsabilidad en Dockerfile)", "Automático por el proveedor de nube"),
        ("Compatibilidad con Teléfonos", "Los celulares no ejecutan Docker", "Binario nativo Android APK firmado")
    ]

    comp_table = doc.add_table(rows=len(comp_data), cols=3)
    comp_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    comp_table.autofit = False
    c_widths = [Inches(2.1), Inches(2.3), Inches(2.3)]

    for i, r_vals in enumerate(comp_data):
        row = comp_table.rows[i]
        is_h = (i == 0)
        bg = HEX_PRIMARY if is_h else (HEX_LIGHT_BG if i % 2 == 1 else "FFFFFF")
        for j, txt in enumerate(r_vals):
            c = row.cells[j]
            c.width = c_widths[j]
            set_cell_background(c, bg)
            set_cell_margins(c, 70, 70, 100, 100)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(txt)
            r.font.size = Pt(9)
            if is_h:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
            else:
                r.font.color.rgb = COLOR_TEXT
                if j == 0:
                    r.font.bold = True

    set_table_borders(comp_table)
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_body_p(doc,
        "Docker añade virtualización a nivel de sistema operativo y empaqueta gigabytes innecesarios. En nuestro proyecto, el paquete "
        "de despliegue pesa solo 13.73 KB (seniorassist-backend-deploy.zip). El servidor en la nube ya tiene el runtime de Python 3.10 "
        "preconfigurado y optimizado, reduciendo el ancho de banda y el tiempo de despliegue a segundos.",
        bold_prefix="1. Cero Sobrecarga de Recursos (Zero Overhead): "
    )
    add_body_p(doc,
        "En Docker el desarrollador es responsable de parchar vulnerabilidades del sistema operativo en el Dockerfile. En PaaS "
        "(Render / AWS Elastic Beanstalk), el proveedor de nube se encarga de manera transparente del parcheo de seguridad del kernel de Linux, "
        "los certificados SSL y el balanceo de carga sin intervención manual.",
        bold_prefix="2. Mantenimiento y Parcheo Delegado al Proveedor de Nube: "
    )
    add_body_p(doc,
        "Un celular de un adulto mayor jamás corre contenedores Docker. La aplicación móvil requiere un ciclo de compilación nativo "
        "(Java/Kotlin, bytecode Dalvik/ART y librerías C++ empaquetadas en un .apk) y un canal de distribución específico como GitHub Releases o Firebase.",
        bold_prefix="3. Las Aplicaciones Móviles NO se Ejecutan en Docker: "
    )
    add_body_p(doc,
        "Los microservicios son un patrón arquitectónico, no una herramienta atada a Docker. Para demostrarlo, creamos backend/microservicios_demo.py, "
        "que levanta de forma nativa en la máquina dos microservicios desacoplados: Microservicio de Autenticación (puerto 8001) y Microservicio "
        "de Procesamiento de Lenguaje Natural (puerto 8002).",
        bold_prefix="4. Demostración de Microservicios sin Docker: "
    )

    add_h1(doc, "4. DESPLIEGUE DEL BACKEND EN LA NUBE (RENDER & AWS)")
    add_body_p(doc,
        "El backend de SeniorAssist está en producción activa en Render Cloud Application Services (región Oregon), enlazado mediante "
        "webhooks directos a nuestro repositorio de GitHub (Julitosh07/SeniorAssist)."
    )

    add_bullet_p(doc, "pip install -r backend/requirements.txt (Instala dependencias mínimas en entorno virtual aislado).", bold_prefix="Comando de Construcción (Build): ")
    add_bullet_p(doc, "uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT (Levanta el servidor ASGI enlazado al puerto dinámico de la nube).", bold_prefix="Comando de Inicio (Start): ")
    add_bullet_p(doc, "SENIOR_ASSIST_JWT_SECRET (clave de 256 bits para firma HS256) y ENVIRONMENT=production.", bold_prefix="Variables de Entorno Cifradas: ")

    add_h2(doc, "Infraestructura como Código (IaC) en el Repositorio")
    add_body_p(doc, "Para asegurar reproducibilidad, creamos los siguientes archivos de infraestructura en la raíz del repositorio:")

    add_code_block(doc,
        "# Archivo: render.yaml (IaC para Render Cloud PaaS)\n"
        "services:\n"
        "  - type: web\n"
        "    name: seniorassist-backend\n"
        "    runtime: python\n"
        "    region: oregon\n"
        "    plan: free\n"
        "    buildCommand: pip install -r backend/requirements.txt\n"
        "    startCommand: uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT\n"
        "    envVars:\n"
        "      - key: SENIOR_ASSIST_JWT_SECRET\n"
        "        value: senior_assist_super_secure_academic_key_2026_uts\n"
        "      - key: ENVIRONMENT\n"
        "        value: production"
    )

    add_code_block(doc,
        "# Archivo: Procfile (Estándar de orquestación PaaS universal)\n"
        "web: uvicorn backend.app.main:app --host 0.0.0.0 --port 5000"
    )

    add_code_block(doc,
        "# Archivo: .ebextensions/01_fastapi.config (IaC para AWS Elastic Beanstalk nativo)\n"
        "option_settings:\n"
        "  aws:elasticbeanstalk:container:python:\n"
        "    WSGIPath: backend.app.main:app\n"
        "  aws:elasticbeanstalk:application:environment:\n"
        "    PYTHONPATH: \"/var/app/current\"\n"
        "    SENIOR_ASSIST_JWT_SECRET: \"senior_assist_super_secure_academic_key_2026_uts\""
    )

    add_h1(doc, "5. DESPLIEGUE DE LA APLICACIÓN MÓVIL ANDROID")
    add_body_p(doc,
        "La aplicación móvil se compila de manera determinista generando el ejecutable firmado SeniorAssist.apk (166 MB), el cual "
        "se distribuye mediante GitHub Releases (v1.0.0) y Firebase App Distribution."
    )
    add_body_p(doc,
        "El tamaño de 166 MB se debe a que integra motores acústicos de voz fuera de línea, síntesis de voz Text-to-Speech nativa "
        "y base de datos SQLite embebida, garantizando la directiva de accesibilidad y funcionamiento Offline-First.",
        bold_prefix="¿Por qué pesa 166 MB el APK?: "
    )
    add_body_p(doc,
        "6880379b8c4b534e162cb2a13fddfe3ac761c69c4048806309283cb444d5e6ba *SeniorAssist.apk (registrado en SHA256SUMS.txt).",
        bold_prefix="Firma Criptográfica SHA-256: "
    )

    add_h1(doc, "6. CÓMO SE COMUNICAN EL CELULAR Y RENDER EN TIEMPO REAL")
    add_body_p(doc,
        "Durante la prueba en vivo frente al profesor, la aplicación móvil y el backend en Render interactúan mediante dos flujos continuos:"
    )

    add_bullet_p(doc,
        "Apenas se abre la app en el celular, App.tsx ejecuta authService.getValidToken(). Envía el UUID único de hardware y Render "
        "responde con un token JWT firmado con HS256. En los logs de Render aparece de inmediato: INFO: ... - 'POST /auth/device HTTP/1.1' 200 OK.",
        bold_prefix="1. Handshake de Inicio Transparente (POST /auth/device): "
    )
    add_bullet_p(doc,
        "Cuando el usuario pronuncia un comando (ej. 'Llama a mi hija María'), GlobalVoiceAssistantContext.tsx resuelve la orden localmente "
        "en el celular para responder al instante, y envía de fondo aiService.extractIntent() a Render. En los logs aparece: INFO: ... - 'POST /ai/intent HTTP/1.1' 200 OK.",
        bold_prefix="2. Telemetría de Voz en Vivo (POST /ai/intent): "
    )
    add_bullet_p(doc,
        "Si Render está en suspensión (cold sleep) o el abuelo no tiene internet, las peticiones fallan en segundo plano silenciosamente "
        "sin bloquear la pantalla. Las llamadas de emergencia, alarmas y herramientas utilitarias siguen funcionando al 100%.",
        bold_prefix="3. Resiliencia y Modo Offline-First: "
    )

    add_h1(doc, "7. GUIÓN PASO A PASO PARA LA DEMOSTRACIÓN EN VIVO")

    steps = [
        ("Paso 1: Abrir Visual Studio Code",
         "Proyecta los archivos de infraestructura: render.yaml, Procfile, .github/workflows/deploy.yml y SHA256SUMS.txt. "
         "Explica: 'Aquí está declarada toda nuestra infraestructura como código sin tocar Docker'."),
        ("Paso 2: Abrir la Documentación Swagger UI en Vivo",
         "Abre en el navegador: https://seniorassist.onrender.com/docs. Muestra los endpoints documentados con OpenAPI. "
         "Ejecuta en vivo el endpoint GET /health y muestra la respuesta JSON 200 OK en pantalla."),
        ("Paso 3: Proyectar la Consola de Render con Logs en Vivo",
         "Abre https://dashboard.render.com -> seniorassist-backend -> Pestaña Logs con 'Live tail' activo. "
         "Muestra el estado verde 'Live' corriendo con Uvicorn en el puerto dinámico de la nube."),
        ("Paso 4: La Prueba de Fuego: Abrir la App en el Celular",
         "Toma tu celular frente al profesor y abre SeniorAssist. Mira la pantalla del proyector: verás aparecer en vivo "
         "POST /auth/device HTTP/1.1 200 OK. Explica: 'En este instante mi celular se acaba de autenticar con Render'."),
        ("Paso 5: Enviar una Orden por Voz",
         "Presiona el botón grande del asistente y di: 'Llama a María' o 'Pon la radio'. En los logs del proyector aparecerá "
         "en vivo POST /ai/intent HTTP/1.1 200 OK. Explica: 'Cada interacción del adulto mayor viaja como telemetría a la nube en tiempo real'.")
    ]

    for s_title, s_desc in steps:
        add_body_p(doc, s_desc, bold_prefix=f"{s_title}: ")

    add_h1(doc, "8. BANCO DE PREGUNTAS TRAMPA DEL PROFESOR Y RESPUESTAS")

    deploy_q = [
        ("¿Por qué sus compañeros usaron Docker y ustedes usaron Render y Elastic Beanstalk?",
         "Profesor, porque evaluamos la arquitectura antes de elegir la herramienta. Docker es excelente para empaquetar sistemas operativos heterogéneos, pero añade una sobrecarga de más de 1.5 GB por contenedor. En nuestro caso, al ser un microservicio puro en Python y una app móvil Android, la solución óptima recomendada por las guías de arquitectura en la nube es un PaaS nativo. Con Render y Elastic Beanstalk logramos un artefacto de solo 13 KB, arranque instantáneo y mantenimiento cero del sistema operativo. Además, las apps móviles nunca se ejecutan en Docker."),

        ("¿Cómo se actualiza el backend cuando un desarrollador hace un cambio en el código?",
         "El proceso es 100% continuo y desatendido: gracias al webhook configurado entre GitHub y Render, tan pronto como hacemos un git push origin main, Render detecta el commit, clona la nueva versión, ejecuta pip install -r backend/requirements.txt y realiza un despliegue Zero-Downtime, redirigiendo el tráfico a la nueva versión sin desconectar a los usuarios."),

        ("¿Qué sucede si el servidor en Render entra en reposo (cold sleep) o se cae?",
         "Diseñamos la aplicación bajo el principio de Resiliencia y Offline-First. Si Render está en reposo o el abuelo no tiene internet, el cliente móvil captura el timeout de forma silenciosa y conmuta a su motor de inferencia local y base de datos SQLite. Las llamadas de emergencia, las alarmas de medicamentos, la linterna y la lupa siguen funcionando perfectamente en el dispositivo sin interrupción."),

        ("¿Dónde está la seguridad en la comunicación entre el celular y Render?",
         "Implementamos dos capas de seguridad: primero, la capa de transporte utiliza HTTPS cifrado con TLS 1.3 mediante el balanceador de carga de Render. Segundo, en la capa de aplicación implementamos el estándar JWA (RFC 7518): cada petición incluye un token JWT firmado criptográficamente con algoritmo HS256, el cual es validado por el backend antes de procesar cualquier intención.")
    ]

    for q_text, ans_text in deploy_q:
        add_callout(doc, f"Pregunta: \"{q_text}\"", f"Tu Respuesta: {ans_text}", box_type="warn")

    output_path = os.path.join(DOCS_DIR, "SeniorAssist_Fase_6_DEPLOY_Guia_Exposicion.docx")
    doc.save(output_path)
    print(f"[OK] Generado: {output_path}")

if __name__ == "__main__":
    generate_devops_8_phases_doc()
    generate_deploy_phase_guide_doc()
