"""
Script generador del documento Word (.docx) y Markdown (.md):
GUÍA DE ARQUITECTURA DE MICROSERVICIOS TIPO SOFTWARE (3 CAPAS) - SENIORASSIST
"""

import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_styled_table(doc, headers, data, col_widths=None):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], "0F2C59")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=150, right=150)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.size = Pt(9.5)
            run.font.name = 'Calibri'

    # Data Rows
    for row_idx, row_data in enumerate(data):
        row_cells = table.rows[row_idx + 1].cells
        bg_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = str(cell_value)
            set_cell_background(row_cells[col_idx], bg_color)
            set_cell_margins(row_cells[col_idx], top=100, bottom=100, left=140, right=140)
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.size = Pt(9)
                run.font.name = 'Calibri'
                run.font.color.rgb = RGBColor(30, 41, 59)

    # Set Column Widths if provided
    if col_widths:
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)

    return table

def add_callout_box(doc, text, title="NOTA TÉCNICA CLAVE"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, "F0F9FF")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    run_title = p.add_run(f"📌 {title}: ")
    run_title.bold = True
    run_title.font.size = Pt(10)
    run_title.font.color.rgb = RGBColor(2, 132, 199)

    run_text = p.add_run(text)
    run_text.font.size = Pt(9.5)
    run_text.font.italic = True
    run_text.font.color.rgb = RGBColor(15, 23, 42)

def generate_documents():
    output_docx = r"d:\NUEVAS TECNOLOGIAS\FINAL\SeniorAssist\SeniorAssist\Documentos\SeniorAssist_Guia_Arquitectura_Microservicios_3_Capas.docx"
    output_md = r"d:\NUEVAS TECNOLOGIAS\FINAL\SeniorAssist\SeniorAssist\Documentos\SeniorAssist_Guia_Arquitectura_Microservicios_3_Capas.md"
    os.makedirs(os.path.dirname(output_docx), exist_ok=True)

    doc = Document()

    # Configurar Márgenes
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # TITULO PRINCIPAL
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    title_run = title_p.add_run("GUÍA MAESTRA DE ARQUITECTURA DE MICROSERVICIOS")
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(15, 44, 89)
    title_run.font.name = 'Calibri'

    subtitle_p = doc.add_paragraph()
    subtitle_p.paragraph_format.space_after = Pt(14)
    sub_run = subtitle_p.add_run("Implementación Tipo Software Desacoplado en 3 Capas (Validador, Microservicio y Endpoint)\nSin Docker • Python 3.10+ • Puertos Independientes 8001 a 8004")
    sub_run.font.size = Pt(12)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(71, 85, 105)

    # METADATOS DEL PROYECTO
    meta_headers = ["Campo", "Detalle Institucional y de Entrega"]
    meta_data = [
        ["Proyecto Académico:", "SeniorAssist – Asistente Autónomo por Voz y Tutor para Adultos Mayores"],
        ["Asignatura / Semestre:", "Nuevas Tecnologías de Desarrollo – 6° Semestre UTS"],
        ["Requerimiento Docente:", "Microservicios tipo software con Endpoint, Validador y Microservicio independiente"],
        ["Cantidad de Microservicios:", "4 Microservicios Autónomos (Puertos 8001, 8002, 8003 y 8004)"],
        ["Restricción Cumplida:", "100% CERO DOCKER (Software Nativo en Procesos Aislados y PaaS en Nube)"],
        ["Servicio Activo en Producción:", "https://seniorassist.onrender.com (API Gateway Unificado)"],
        ["Repositorio Oficial:", "https://github.com/Julitosh07/SeniorAssist"]
    ]
    create_styled_table(doc, meta_headers, meta_data, col_widths=[2.2, 4.6])

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 1. RESUMEN EJECUTIVO Y JUSTIFICACIÓN TEÓRICA
    h1 = doc.add_heading("1. RESUMEN EJECUTIVO Y JUSTIFICACIÓN ARQUITECTÓNICA", level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    
    doc.add_paragraph(
        "En la ingeniería de software moderna y en la computación en la nube, un microservicio no es un contenedor Docker, "
        "sino un patrón arquitectónico de diseño basado en la separación de responsabilidades (Single Responsibility Principle) "
        "y el desacoplamiento de software. La creencia de que un microservicio requiere obligatoriamente Docker es un error conceptual: "
        "Docker es únicamente una herramienta de virtualización liviana a nivel de sistema operativo, mientras que los microservicios "
        "son componentes autónomos de software que se comunican mediante protocolos estándares (HTTP REST / JSON) a través de sockets y puertos de red."
    )

    doc.add_paragraph(
        "Para responder con el más alto rigor académico a las exigencias del docente, en SeniorAssist desacoplamos la lógica del sistema "
        "en 4 microservicios independientes como tipo software. Cada uno cuenta de forma explícita y visible en su código con las 3 capas solicitadas:"
    )

    p_capas = doc.add_paragraph()
    p_capas.add_run("1. El Validador (Validation Layer):\n").bold = True
    p_capas.add_run("   Esquemas basados en Pydantic que realizan validación estricta de tipos de datos, longitudes, rangos y obligatoriedad antes de que el microservicio procese la petición. Si los datos son erróneos o incompletos, la petición se rechaza con código HTTP 422 Unprocessable Entity.\n\n")
    p_capas.add_run("2. El Microservicio (Business Logic Layer):\n").bold = True
    p_capas.add_run("   Clase pura de Python desacoplada de la capa web. Contiene las reglas del negocio, análisis de expresiones regulares, clasificación de intenciones, heurísticas pedagógicas o cálculos criptográficos HMAC-SHA256.\n\n")
    p_capas.add_run("3. El Endpoint (Transport / Controller Layer):\n").bold = True
    p_capas.add_run("   Ruta HTTP expuesta con FastAPI (@app.post, @app.get). Conecta el protocolo de red con el Validador y la clase del Microservicio, serializando las respuestas en formato JSON estándar.")

    add_callout_box(
        doc,
        "Cada microservicio se ejecuta en su propio proceso de sistema operativo y puerto TCP independiente (8001 a 8004). "
        "Si uno de los microservicios se detiene, los demás continúan funcionando sin interrupción, demostrando aislamiento y tolerancia a fallos.",
        "PRINCIPIO DE INDEPENDENCIA Y ALTA DISPONIBILIDAD"
    )

    # 2. UBICACIÓN FÍSICA DE ARCHIVOS EN EL REPOSITORIO
    h2 = doc.add_heading("2. UBICACIÓN DE ARCHIVOS EN EL REPOSITORIO", level=1)
    h2.paragraph_format.space_before = Pt(16)
    h2.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Todos los archivos de los microservicios fueron organizados en la carpeta backend/ y los lanzadores de ejecución en scripts/:"
    )

    files_headers = ["Microservicio", "Archivo del Script", "Puerto", "Lanzador Rápido (.bat)"]
    files_data = [
        ["Microservicio 1: NLU y Voz", "backend/microservicio_1_voz.py", "8001", "scripts/iniciar_microservicio_1.bat"],
        ["Microservicio 2: Auth Zero-Login", "backend/microservicio_2_auth.py", "8002", "scripts/iniciar_microservicio_2.bat"],
        ["Microservicio 3: Tutor Pedagógico", "backend/microservicio_3_learning.py", "8003", "scripts/iniciar_microservicio_3.bat"],
        ["Microservicio 4: Observabilidad APM", "backend/microservicio_4_monitoring.py", "8004", "scripts/iniciar_microservicio_4.bat"],
        ["Suite de Pruebas de Consumo", "backend/probar_microservicios.py", "Cliente", "scripts/probar_microservicios.bat"],
        ["Lanzador Maestro de los 4", "scripts/iniciar_todos_microservicios.bat", "Todos", "Abre las 4 terminales en 1 clic"],
        ["API Gateway (Nube Render)", "backend/app/main.py", "10000 / $PORT", "Unifica los 4 routers en producción"]
    ]
    create_styled_table(doc, files_headers, files_data, col_widths=[2.1, 2.3, 0.8, 1.8])

    # 3. DETALLE EXHAUSTIVO DE LOS 4 MICROSERVICIOS
    h3 = doc.add_heading("3. DESGLOSE DE LAS 3 CAPAS EN CADA MICROSERVICIO", level=1)
    h3.paragraph_format.space_before = Pt(16)
    h3.paragraph_format.space_after = Pt(6)

    # Microservicio 1
    doc.add_heading("3.1. Microservicio 1: NLU y Procesamiento de Voz (Puerto 8001)", level=2)
    doc.add_paragraph(
        "• Objetivo: Recibir la voz del adulto mayor transcrita a texto, sanear la entrada y clasificar la orden bajo una lista blanca estricta de 9 acciones permitidas.\n"
        "• Archivo: backend/microservicio_1_voz.py | Puerto: 8001 | Swagger: http://localhost:8001/docs\n"
        "• Separación en 3 Capas:"
    )
    p_m1 = doc.add_paragraph()
    p_m1.add_run("  1. Capa Validador: ").bold = True
    p_m1.add_run("VoiceValidationRequest define 'text: str = Field(..., min_length=2, max_length=500)' y 'device_id: str'. Impide procesar textos vacíos o ataques de desbordamiento.\n")
    p_m1.add_run("  2. Capa Microservicio: ").bold = True
    p_m1.add_run("Clase VoiceNLUMicroservice con el método execute_intent_inference(). Evalúa expresiones regulares y modismos colombianos ('Llama a mi hija María', 'Pon la radio', 'Auxilio me caí') clasificando la intención con nivel de confianza.\n")
    p_m1.add_run("  3. Capa Endpoint: ").bold = True
    p_m1.add_run("@app.post('/api/v1/voice/process-intent', response_model=VoiceValidationResponse). Expone el microservicio, ejecuta la lógica y devuelve la respuesta JSON con la respuesta sonora (TTS).")

    # Microservicio 2
    doc.add_heading("3.2. Microservicio 2: Seguridad y Autenticación Zero-Login (Puerto 8002)", level=2)
    doc.add_paragraph(
        "• Objetivo: Gestionar la identidad del adulto mayor sin exigirle ingresar contraseñas cognitivamente complejas, firmando tokens JWT criptográficos vinculados a su hardware.\n"
        "• Archivo: backend/microservicio_2_auth.py | Puerto: 8002 | Swagger: http://localhost:8002/docs\n"
        "• Separación en 3 Capas:"
    )
    p_m2 = doc.add_paragraph()
    p_m2.add_run("  1. Capa Validador: ").bold = True
    p_m2.add_run("DeviceAuthValidationRequest exige 'device_id: str = Field(..., min_length=4, max_length=120)'. Rechaza identificadores nulos o corruptos.\n")
    p_m2.add_run("  2. Capa Microservicio: ").bold = True
    p_m2.add_run("Clase DeviceAuthMicroservice que implementa el estándar JWA RFC 7518. Genera un token JWT firmado simétricamente con HMAC-SHA256 (HS256) con 30 días de vigencia transparente y método verify_token_integrity().\n")
    p_m2.add_run("  3. Capa Endpoint: ").bold = True
    p_m2.add_run("@app.post('/api/v1/auth/device-session', response_model=TokenValidationResponse). Retorna el access_token, tipo bearer y algoritmo HS256.")

    # Microservicio 3
    doc.add_heading("3.3. Microservicio 3: Tutor Pedagógico y Adaptación IA (Puerto 8003)", level=2)
    doc.add_paragraph(
        "• Objetivo: Evaluar el ritmo de aprendizaje del adulto mayor en simuladores (WhatsApp, cámara, llamadas) y modular dinámicamente la velocidad de habla y dificultad.\n"
        "• Archivo: backend/microservicio_3_learning.py | Puerto: 8003 | Swagger: http://localhost:8003/docs\n"
        "• Separación en 3 Capas:"
    )
    p_m3 = doc.add_paragraph()
    p_m3.add_run("  1. Capa Validador: ").bold = True
    p_m3.add_run("PedagogyEvaluationRequest valida 'lesson_id: str', 'errors_count: int >= 0', 'hints_requested: int >= 0' y 'total_time_seconds: float > 0'.\n")
    p_m3.add_run("  2. Capa Microservicio: ").bold = True
    p_m3.add_run("Clase PedagogicalLearningMicroservice con heurística de ritmo cognitivo: si errors_count >= 2 o total_time > 45s, ajusta difficulty a 'easy', reduce la velocidad de voz (speech_rate = 0.75x) y activa pistas instantáneas.\n")
    p_m3.add_run("  3. Capa Endpoint: ").bold = True
    p_m3.add_run("@app.post('/api/v1/learning/evaluate-performance') y @app.get('/api/v1/learning/catalog'). Entrega la configuración pedagógica personalizada y catálogo de módulos.")

    # Microservicio 4
    doc.add_heading("3.4. Microservicio 4: Observabilidad, Salud y Métricas APM (Puerto 8004)", level=2)
    doc.add_paragraph(
        "• Objetivo: Monitorear la salud y el rendimiento en tiempo real, calcular latencias percentil 95 (P95) y exponer métricas en formato estándar Prometheus / Datadog.\n"
        "• Archivo: backend/microservicio_4_monitoring.py | Puerto: 8004 | Swagger: http://localhost:8004/docs\n"
        "• Separación en 3 Capas:"
    )
    p_m4 = doc.add_paragraph()
    p_m4.add_run("  1. Capa Validador: ").bold = True
    p_m4.add_run("MetricIngestRequest valida 'event_type: str', 'latency_ms: float >= 0.0' y 'success: bool'.\n")
    p_m4.add_run("  2. Capa Microservicio: ").bold = True
    p_m4.add_run("Clase ObservabilityMicroservice. Agrega telemetría en series de tiempo, calcula la latencia P95 y compila el payload oficial compatible con el exportador de Prometheus.\n")
    p_m4.add_run("  3. Capa Endpoint: ").bold = True
    p_m4.add_run("@app.post('/api/v1/monitoring/ingest') para recepción de eventos y @app.get('/api/v1/monitoring/prometheus') con Content-Type: text/plain; version=0.0.4.")

    # 4. CÓMO EJECUTARLOS Y PROBARLOS (GUÍA PASO A PASO)
    h4 = doc.add_heading("4. GUÍA DE DEMOSTRACIÓN PRÁCTICA EN VIVO", level=1)
    h4.paragraph_format.space_before = Pt(16)
    h4.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Para realizar la sustentación frente al jurado o docente de manera fluida y sin contratiempos, sigue estos pasos:"
    )

    steps_headers = ["Paso", "Acción a Ejecutar", "Resultado Esperado frente al Proyector"]
    steps_data = [
        ["1. Levantar Servicios", "Doble clic en scripts/iniciar_todos_microservicios.bat", "Se abren 4 terminales con Uvicorn corriendo en 8001, 8002, 8003 y 8004."],
        ["2. Proyectar Swagger", "Abrir en navegador: http://localhost:8001/docs a 8004/docs", "Muestra la documentación OpenAPI generada automáticamente para cada microservicio."],
        ["3. Ejecutar Pruebas", "Doble clic en scripts/probar_microservicios.bat", "El cliente HTTP consume los 4 microservicios en vivo e imprime los resultados en colores."],
        ["4. Probar el Validador", "Ver la Prueba 5 en la salida de consola", "Muestra cómo el Validador rechaza una petición defectuosa con HTTP 422 Unprocessable Entity."],
        ["5. Mostrar Producción", "Abrir https://seniorassist.onrender.com/docs", "Demuestra cómo en la nube de Render los microservicios operan unificados bajo el API Gateway."]
    ]
    create_styled_table(doc, steps_headers, steps_data, col_widths=[1.5, 2.6, 2.7])

    # 5. BANCO DE PREGUNTAS TRAMPA DEL PROFESOR
    h5 = doc.add_heading("5. BANCO DE PREGUNTAS TRAMPA DEL PROFESOR Y RESPUESTAS", level=1)
    h5.paragraph_format.space_before = Pt(16)
    h5.paragraph_format.space_after = Pt(6)

    q1 = doc.add_paragraph()
    q1.add_run("❓ Pregunta 1: \"¿Por qué dicen que son microservicios si no usaron Docker Compose ni contenedores separados?\"\n").bold = True
    q1.add_run("👉 Respuesta: ").bold = True
    q1.add_run("\"Profesor, porque los microservicios son un patrón de diseño arquitectónico de desacoplamiento de software y procesos de red, no una herramienta atada a Docker. Aquí tenemos 4 microservicios que corren en puertos de red independientes (8001 al 8004) en procesos separados del sistema operativo. Si el microservicio de voz se cae, el de autenticación y el de monitoreo siguen respondiendo sin afectación. No usamos Docker porque sobrecargaría el sistema con 2 GB por imagen cuando cada microservicio nativo en Python pesa solo kilobytes y arranca de inmediato.\"")

    q2 = doc.add_paragraph()
    q2.add_run("❓ Pregunta 2: \"¿Dónde está exactamente la separación entre el Endpoint, el Validador y el Microservicio?\"\n").bold = True
    q2.add_run("👉 Respuesta: ").bold = True
    q2.add_run("\"En cada archivo de script tenemos los comentarios rotulados: Primero, la Capa 1 es la clase Pydantic que valida tipos, campos obligatorios y rangos. Segundo, la Capa 2 es la clase de lógica de negocio pura (desacoplada de HTTP). Y tercero, la Capa 3 es la función decorada con @app.post() que actúa como controlador REST. El Endpoint nunca procesa reglas de negocio directamente, delega siempre en el microservicio tras pasar por el Validador.\"")

    q3 = doc.add_paragraph()
    q3.add_run("❓ Pregunta 3: \"¿Qué pasa si un usuario envía datos corruptos o campos faltantes?\"\n").bold = True
    q3.add_run("👉 Respuesta: ").bold = True
    q3.add_run("\"La Capa 1 (El Validador) intercepta la petición antes de que consuma memoria en el microservicio y rechaza la solicitud de forma automática con un código HTTP 422 Unprocessable Entity, especificando exactamente qué campo violó la restricción de validación.\"")

    # Guardar DOCX
    doc.save(output_docx)
    print(f"[OK] Documento Word generado exitosamente: {output_docx}")

    # Guardar Versión Markdown
    with open(output_md, "w", encoding="utf-8") as f:
        f.write("# GUÍA MAESTRA DE ARQUITECTURA DE MICROSERVICIOS\n")
        f.write("## Implementación Tipo Software Desacoplado en 3 Capas (Validador, Microservicio y Endpoint)\n")
        f.write("**Proyecto:** SeniorAssist – Asistente Autónomo por Voz para Adultos Mayores  \n")
        f.write("**Materia:** Nuevas Tecnologías de Desarrollo – 6° Semestre UTS  \n")
        f.write("**Restricción Cumplida:** 100% Cero Docker (Procesos Nativos en Puertos 8001 a 8004 + PaaS Render)  \n\n---\n\n")
        f.write("## 1. RESUMEN EJECUTIVO Y JUSTIFICACIÓN ARQUITECTÓNICA\n")
        f.write("En la ingeniería de software moderna, un microservicio no es un contenedor Docker, sino un patrón de diseño basado en la separación de responsabilidades y el desacoplamiento de software. Cada microservicio cuenta con sus 3 capas explícitas:\n")
        f.write("1. **El Validador (Pydantic Schema):** Valida tipos, longitudes y restricciones; rechaza datos corruptos con HTTP 422.\n")
        f.write("2. **El Microservicio (Lógica de Negocio):** Clase pura de Python con reglas de negocio desacopladas del framework web.\n")
        f.write("3. **El Endpoint (Controlador REST FastAPI):** Expone las rutas HTTP (@app.post, @app.get) y serializa respuestas en JSON.\n\n---\n\n")
        f.write("## 2. UBICACIÓN DE ARCHIVOS EN EL REPOSITORIO\n\n")
        f.write("| Microservicio | Archivo del Script | Puerto | Lanzador Rápido (.bat) |\n")
        f.write("| :--- | :--- | :--- | :--- |\n")
        f.write("| **1. NLU y Voz** | `backend/microservicio_1_voz.py` | **8001** | `scripts/iniciar_microservicio_1.bat` |\n")
        f.write("| **2. Auth Zero-Login** | `backend/microservicio_2_auth.py` | **8002** | `scripts/iniciar_microservicio_2.bat` |\n")
        f.write("| **3. Tutor Pedagógico** | `backend/microservicio_3_learning.py` | **8003** | `scripts/iniciar_microservicio_3.bat` |\n")
        f.write("| **4. Observabilidad APM** | `backend/microservicio_4_monitoring.py` | **8004** | `scripts/iniciar_microservicio_4.bat` |\n")
        f.write("| **Suite de Pruebas** | `backend/probar_microservicios.py` | Cliente | `scripts/probar_microservicios.bat` |\n")
        f.write("| **Lanzador Maestro** | `scripts/iniciar_todos_microservicios.bat` | Todos | Abre las 4 terminales a la vez |\n")
        f.write("| **API Gateway Cloud** | `backend/app/main.py` | Producción | Unifica los 4 routers en Render |\n\n---\n\n")
        f.write("## 3. DETALLE DE LAS 3 CAPAS EN CADA MICROSERVICIO\n\n")
        f.write("### 3.1. Microservicio 1: NLU y Voz (Puerto 8001)\n")
        f.write("- **Validador:** `VoiceValidationRequest` (valida texto mínimo 2 y máximo 500 caracteres).\n")
        f.write("- **Microservicio:** `VoiceNLUMicroservice` (clasifica 9 intenciones autorizadas como llamadas, SOS, radio, linterna).\n")
        f.write("- **Endpoint:** `@app.post('/api/v1/voice/process-intent')`.\n\n")
        f.write("### 3.2. Microservicio 2: Auth Zero-Login (Puerto 8002)\n")
        f.write("- **Validador:** `DeviceAuthValidationRequest` (valida UUID de hardware móvil).\n")
        f.write("- **Microservicio:** `DeviceAuthMicroservice` (criptografía JWA RFC 7518 con firma HMAC-SHA256).\n")
        f.write("- **Endpoint:** `@app.post('/api/v1/auth/device-session')`.\n\n")
        f.write("### 3.3. Microservicio 3: Tutor Pedagógico (Puerto 8003)\n")
        f.write("- **Validador:** `PedagogyEvaluationRequest` (errores, pistas y tiempo invertido).\n")
        f.write("- **Microservicio:** `PedagogicalLearningMicroservice` (heurística cognitiva sensible: adapta velocidad de voz a 0.75x).\n")
        f.write("- **Endpoint:** `@app.post('/api/v1/learning/evaluate-performance')` y catálogo.\n\n")
        f.write("### 3.4. Microservicio 4: Observabilidad APM (Puerto 8004)\n")
        f.write("- **Validador:** `MetricIngestRequest` (latencia en ms, eventos y estado).\n")
        f.write("- **Microservicio:** `ObservabilityMicroservice` (cálculo de percentil 95 y exportador Prometheus).\n")
        f.write("- **Endpoint:** `@app.post('/api/v1/monitoring/ingest')` y `@app.get('/api/v1/monitoring/prometheus')`.\n\n---\n\n")
        f.write("## 4. GUÍA DE DEMOSTRACIÓN PRÁCTICA EN VIVO\n")
        f.write("1. Ejecutar `scripts/iniciar_todos_microservicios.bat` para levantar las 4 consolas.\n")
        f.write("2. Abrir en el navegador `http://localhost:8001/docs` a `http://localhost:8004/docs` para mostrar la documentación Swagger.\n")
        f.write("3. Ejecutar `scripts/probar_microservicios.bat` para evidenciar el consumo y la validación con rechazo HTTP 422.\n")
        f.write("4. Abrir `https://seniorassist.onrender.com/docs` para demostrar cómo opera el API Gateway en la nube.\n")

    print(f"[OK] Documento Markdown generado exitosamente: {output_md}")

if __name__ == "__main__":
    generate_documents()
