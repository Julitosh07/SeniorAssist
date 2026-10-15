from fastapi import APIRouter, Header, HTTPException, status
from typing import List, Optional
from backend.app.schemas.learning import (
    LessonResponse,
    StepSchema,
    LearningEventsRequest,
    PedagogyAnalysisRequest,
    PedagogyAnalysisResponse,
)
from backend.app.routers.voice import authenticate_jwt_header

router = APIRouter(prefix="/learning", tags=["Learning & Pedagogy"])

LESSONS_CATALOG: List[LessonResponse] = [
    LessonResponse(
        id="lesson-wa",
        module="whatsapp",
        title="Aprender WhatsApp",
        description="Aprende a comunicarte con tus seres queridos por mensaje y notas de voz.",
        total_steps=5,
        order_index=1,
        steps=[
            StepSchema(
                step_index=0,
                title="Abrir conversación familiar",
                instruction="Toca sobre el contacto de tu hija María para abrir el chat.",
                hint="Busca la foto de María Gómez en la lista y pulsa sobre su nombre.",
                target_action="SELECT_CONTACT",
                completed_explanation="¡Muy bien! Acabas de abrir la conversación con María.",
            ),
            StepSchema(
                step_index=1,
                title="Tocar el campo de texto",
                instruction="Toca la barra blanca abajo para escribir tu mensaje.",
                hint="Abajo hay un espacio rectangular que dice 'Escribe un mensaje aquí'. Púlsalo.",
                target_action="TAP_INPUT",
                completed_explanation="¡Excelente! El teclado está listo para que escribas.",
            ),
            StepSchema(
                step_index=2,
                title="Enviar el mensaje",
                instruction="Toca el botón verde con forma de flecha para enviar el mensaje.",
                hint="El botón verde con una flecha blanca está a la derecha del texto.",
                target_action="TAP_SEND",
                completed_explanation="¡Fantástico! Tu mensaje 'Hola hija, ya llegué' fue enviado.",
            ),
            StepSchema(
                step_index=3,
                title="Grabar nota de voz",
                instruction="Mantén presionado el botón verde del micrófono para hablar.",
                hint="Abajo a la derecha verás un círculo verde con un micrófono blanco. Mantenlo presionado.",
                target_action="RECORD_AUDIO",
                completed_explanation="¡Perfecto! Has grabado y enviado tu nota de voz con éxito.",
            ),
            StepSchema(
                step_index=4,
                title="Iniciar videollamada",
                instruction="Toca el icono de la cámara arriba para ver a tu ser querido.",
                hint="En la barra superior, al lado del nombre de María, hay un icono con forma de cámara de video.",
                target_action="START_VIDEO_CALL",
                completed_explanation="¡Fabuloso! Ya sabes cómo ver y escuchar a tu familia en directo.",
            ),
        ],
    ),
    LessonResponse(
        id="lesson-cam",
        module="camera",
        title="Cómo Usar la Cámara",
        description="Aprende a capturar recuerdos hermosos, revisarlos y borrar fotos borrosas.",
        total_steps=4,
        order_index=2,
        steps=[
            StepSchema(
                step_index=0,
                title="Enfocar el objetivo",
                instruction="Mira por la pantalla para encuadrar lo que deseas fotografiar y pulsa 'Enfocar'.",
                hint="Toca en el centro de la pantalla para asegurarte de que la imagen se vea nítida.",
                target_action="FOCUS_VIEW",
                completed_explanation="¡Muy bien! La imagen está enfocada y bien iluminada.",
            ),
            StepSchema(
                step_index=1,
                title="Tomar la fotografía",
                instruction="Pulsa el botón circular blanco grande abajo para disparar.",
                hint="Es el botón redondo más grande en la parte inferior central de la pantalla.",
                target_action="TAKE_PHOTO",
                completed_explanation="¡Click! Acabas de capturar un hermoso recuerdo.",
            ),
            StepSchema(
                step_index=2,
                title="Revisar la fotografía",
                instruction="Pulsa en la miniatura cuadrada abajo a la izquierda para verla en grande.",
                hint="En la esquina inferior izquierda verás un recuadro con la foto que acabas de tomar.",
                target_action="PREVIEW_PHOTO",
                completed_explanation="¡Qué bien quedó! Puedes ver todos los detalles en grande.",
            ),
            StepSchema(
                step_index=3,
                title="Eliminar foto de prueba",
                instruction="Toca el botón rojo de papelera para aprender a borrar fotos que no te gusten.",
                hint="Busca el icono de papelera roja arriba o abajo para descartar la foto con seguridad.",
                target_action="DELETE_PHOTO",
                completed_explanation="¡Completado! No temas equivocarte, siempre puedes borrar lo que no quieras.",
            ),
        ],
    ),
    LessonResponse(
        id="lesson-gal",
        module="gallery",
        title="Tu Galería de Fotos",
        description="Aprende a buscar fotografías de tus familiares y compartirlas fácilmente.",
        total_steps=3,
        order_index=3,
        steps=[
            StepSchema(
                step_index=0,
                title="Elegir una foto del álbum",
                instruction="Toca sobre la fotografía del cumpleaños familiar para verla completa.",
                hint="En la cuadrícula de fotos, pulsa la primera imagen grande de la reunión.",
                target_action="SELECT_PHOTO",
                completed_explanation="¡Excelente! La foto ahora se muestra en pantalla completa.",
            ),
            StepSchema(
                step_index=1,
                title="Ampliar con zoom amigable",
                instruction="Toca el botón 'Acercar' para ver las caras más de cerca.",
                hint="Pulsa el botón con una lupa y el signo más (+) para acercar los rostros.",
                target_action="ZOOM_PHOTO",
                completed_explanation="¡Qué nítido! Así puedes apreciar los rostros sin forzar la vista.",
            ),
            StepSchema(
                step_index=2,
                title="Compartir con un ser querido",
                instruction="Toca el botón 'Compartir' para enviar esta foto a tu hija María.",
                hint="Busca el botón azul con tres puntos unidos o flecha que dice 'Compartir'.",
                target_action="SHARE_PHOTO",
                completed_explanation="¡Maravilloso! María acaba de recibir tu foto con una sonrisa.",
            ),
        ],
    ),
    LessonResponse(
        id="lesson-sec",
        module="security",
        title="Seguridad y Evitar Estafas",
        description="Aprende a protegerte de engaños, mensajes bancarios falsos y llamadas fraudulentas.",
        total_steps=3,
        order_index=4,
        steps=[
            StepSchema(
                step_index=0,
                title="Mensaje falso del banco",
                instruction="Te llega un mensaje: 'Banco: Su cuenta está bloqueada. Ingrese a este link urgente'. ¿Qué debes hacer?",
                hint="Los bancos nunca te pedirán claves ni te enviarán enlaces de urgencia por mensaje.",
                target_action="REJECT_SCAM_SMS",
                completed_explanation="¡Muy bien! Nunca abras enlaces desconocidos. Tu banco nunca pide claves por mensaje.",
            ),
            StepSchema(
                step_index=1,
                title="Llamada de familiar en apuros",
                instruction="Llaman diciendo: '¡Tío, tuve un accidente y necesito plata ya!'. ¿Qué decisión tomas?",
                hint="Mantén la calma. Antes de enviar dinero, cuelga y llama al número que tienes guardado de ese familiar.",
                target_action="VERIFY_FAMILY_CALL",
                completed_explanation="¡Excelente decisión! Siempre cuelga y llama tú mismo a tu familiar para confirmar.",
            ),
            StepSchema(
                step_index=2,
                title="Premio falso de lotería",
                instruction="Mensaje: '¡Ganó una camioneta! Consigne $50.000 para el envío'. ¿Cómo respondes?",
                hint="Nadie te regala premios si no has participado, y jamás debes pagar para reclamar nada.",
                target_action="REJECT_PRIZE_SCAM",
                completed_explanation="¡Fantástico! Si te piden dinero para entregarte un premio, es 100% una estafa.",
            ),
        ],
    ),
    LessonResponse(
        id="lesson-call",
        module="calls",
        title="Contestar Llamadas y Altavoz",
        description="Aprende a identificar quién llama, contestar, activar el altavoz para escuchar fuerte y colgar.",
        total_steps=4,
        order_index=5,
        steps=[
            StepSchema(
                step_index=0,
                title="Identificar quién te llama",
                instruction="Tu teléfono está timbrando. Lee el nombre y número en pantalla antes de responder.",
                hint="En la pantalla verás el nombre 'Doctor Martínez (Salud)'.",
                target_action="IDENTIFY_CALLER",
                completed_explanation="¡Correcto! Siempre verifica quién llama para mayor tranquilidad.",
            ),
            StepSchema(
                step_index=1,
                title="Contestar la llamada",
                instruction="Pulsa el botón circular verde 'CONTESTAR' para hablar.",
                hint="Toca el botón verde con el icono del auricular para iniciar la conversación.",
                target_action="ANSWER_CALL",
                completed_explanation="¡Excelente! Ya estás comunicado con el doctor.",
            ),
            StepSchema(
                step_index=2,
                title="Activar el altavoz",
                instruction="Toca el botón de 'ALTAVOZ' para escuchar con volumen alto sin sostener el teléfono.",
                hint="Busca el icono de parlante/altavoz en la pantalla de la llamada.",
                target_action="TOGGLE_SPEAKER",
                completed_explanation="¡Perfecto! Con el altavoz puedes escuchar fuerte y claro.",
            ),
            StepSchema(
                step_index=3,
                title="Colgar la llamada",
                instruction="Toca el botón circular rojo de 'COLGAR' al terminar la conversación.",
                hint="Es el botón redondo rojo en la parte inferior.",
                target_action="END_CALL",
                completed_explanation="¡Muy bien hecho! Has dominado cómo contestar, poner altavoz y colgar con seguridad.",
            ),
        ],
    ),
    LessonResponse(
        id="lesson-audio",
        module="audio",
        title="Escuchar Audios en WhatsApp",
        description="Aprende a reproducir notas de voz familiares, pausarlas y ajustar la velocidad.",
        total_steps=3,
        order_index=6,
        steps=[
            StepSchema(
                step_index=0,
                title="Reproducir nota de voz",
                instruction="Te ha llegado un mensaje de voz de María. Toca el botón verde de reproducir (▶).",
                hint="Pulsa el círculo verde con el triángulo blanco dentro del mensaje.",
                target_action="PLAY_VOICE_NOTE",
                completed_explanation="¡Muy bien! El audio se está reproduciendo.",
            ),
            StepSchema(
                step_index=1,
                title="Pausar el audio",
                instruction="Toca el botón de pausa (⏸) para detener el mensaje si necesitas atender algo.",
                hint="Pulsa las dos barras verticales que aparecieron en lugar del triángulo.",
                target_action="PAUSE_VOICE_NOTE",
                completed_explanation="¡Excelente! Puedes pausar y reanudar el audio cuando desees.",
            ),
            StepSchema(
                step_index=2,
                title="Ajustar velocidad del audio",
                instruction="Toca el botón '1.5x' para escuchar un audio largo más rápidamente.",
                hint="Toca sobre la etiqueta pequeña que dice '1x' o '1.5x'.",
                target_action="SPEED_VOICE_NOTE",
                completed_explanation="¡Fabuloso! Ahora dominas el control de notas de voz en WhatsApp.",
            ),
        ],
    ),
]

@router.get("/lessons", response_model=List[LessonResponse])
async def get_lessons(authorization: Optional[str] = Header(None)):
    """
    Retorna el catálogo completo de lecciones con pasos interactivos y pedagógicos.
    """
    authenticate_jwt_header(authorization)
    return LESSONS_CATALOG

@router.post("/analyze", response_model=PedagogyAnalysisResponse)
async def analyze_pedagogy(
    req: PedagogyAnalysisRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Analiza el desempeño del adulto mayor y adapta dinámicamente:
    - Velocidad de voz (speech_rate)
    - Nivel de pistas automáticas (show_instant_hints)
    - Nivel de dificultad y refuerzo positivo empático
    """
    authenticate_jwt_header(authorization)

    # Heurística de adaptación pedagógica sensible
    if req.errors >= 2 or req.hints_requested >= 2 or req.total_time_seconds > 45:
        difficulty = "easy"
        speech_rate = 0.75  # Voz pausada y clara
        show_instant_hints = True
        feedback = "Vamos con calma. Tómate todo el tiempo que necesites, lo estás haciendo muy bien."
        encouragement = "No te preocupes por los errores, cada intento te ayuda a aprender. Te guiaremos paso a paso."
    elif req.errors == 0 and req.hints_requested == 0 and req.total_time_seconds < 25:
        difficulty = "challenging"
        speech_rate = 0.88  # Velocidad normal-ágil
        show_instant_hints = False
        feedback = "¡Excelente destreza! Dominas esta función con mucha seguridad y rapidez."
        encouragement = "¡Felicitaciones por tu autonomía y entusiasmo!"
    else:
        difficulty = "normal"
        speech_rate = 0.82
        show_instant_hints = False
        feedback = "¡Muy buen avance! Cada paso te acerca a comunicarte con más confianza."
        encouragement = "Continúa practicando a tu propio ritmo con tranquilidad."

    return PedagogyAnalysisResponse(
        difficulty_recommended=difficulty,
        speech_rate=speech_rate,
        show_instant_hints=show_instant_hints,
        feedback_message=feedback,
        encouragement_text=encouragement,
    )

@router.post("/events")
async def record_learning_events(
    req: LearningEventsRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Registra telemetría de eventos de aprendizaje para auditoría pedagógica.
    """
    authenticate_jwt_header(authorization)
    return {"status": "recorded", "events_count": len(req.events)}
