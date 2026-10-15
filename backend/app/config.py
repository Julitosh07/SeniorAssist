import os

# Configuración de seguridad JWT
JWT_SECRET = os.getenv("SENIOR_ASSIST_JWT_SECRET", "senior_assist_super_secure_academic_key_2026_uts")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30  # Sesiones prolongadas transparentes para adultos mayores

# Lista blanca estricta de acciones permitidas (IEEE 830)
ALLOWED_ACTIONS = [
    "CALL_CONTACT",
    "SEND_WHATSAPP",
    "CREATE_ALARM",
    "TRIGGER_SOS",
    "TURN_FLASHLIGHT_ON",
    "TURN_FLASHLIGHT_OFF",
    "OPEN_MAGNIFIER",
    "CLOSE_MAGNIFIER",
    "ADJUST_MAGNIFIER_ZOOM",
    "PLAY_RADIO",
    "STOP_RADIO",
    "OPEN_LESSON",
]

