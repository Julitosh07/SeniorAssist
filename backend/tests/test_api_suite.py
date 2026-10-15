"""
SeniorAssist - Suite Integral de Pruebas de Backend
Validación de API REST, JWT transparente, NLU estructurado, lista blanca de acciones e IA pedagógica.
"""

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import ALLOWED_ACTIONS
from backend.app.security.jwt_handler import create_access_token, verify_token

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "SeniorAssist" in data["service"]

def test_transparent_device_auth():
    device_id = "test-device-uuid-9999"
    response = client.post("/auth/device", json={"device_id": device_id})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["device_id"] == device_id

    # Verificar decodificación de JWT
    token = data["access_token"]
    decoded_id = verify_token(token)
    assert decoded_id == device_id

def test_invalid_jwt_rejected():
    invalid_token = "invalid.secret.token"
    decoded = verify_token(invalid_token)
    assert decoded is None

def test_nlu_whitelist_full_coverage():
    # Obtener token de sesión transparente
    auth_resp = client.post("/auth/device", json={"device_id": "test-device-suite"})
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    test_cases = [
        # (texto de entrada, acción esperada, parámetro clave esperado)
        ("Llama a mi hija María", "CALL_CONTACT", ("contact", "maria")),
        ("Escríbele a Carlos que ya llegué", "SEND_WHATSAPP", ("contact", "carlos")),
        ("Recuérdame tomar Losartán a las ocho de la noche", "CREATE_ALARM", ("medication", "losartan")),
        ("Auxilio necesito ayuda", "TRIGGER_SOS", None),
        ("Prende la linterna", "TURN_FLASHLIGHT_ON", None),
        ("Apaga la linterna", "TURN_FLASHLIGHT_OFF", None),
        ("Abre la lupa digital", "OPEN_MAGNIFIER", None),
        ("Pon Radio Nacional", "PLAY_RADIO", ("station", "Nacional")),
        ("Apaga la radio por favor", "STOP_RADIO", None),
        ("Quiero aprender WhatsApp", "OPEN_LESSON", ("lesson", "whatsapp")),
        ("manda mensaje a hija Maria diciendole Hola Como estas?", "SEND_WHATSAPP", ("contact", "maria")),
        ("cerrar lupa", "CLOSE_MAGNIFIER", None),
        ("más zoom", "ADJUST_MAGNIFIER_ZOOM", ("direction", "in")),
        ("menos zoom", "ADJUST_MAGNIFIER_ZOOM", ("direction", "out")),
        ("pon Caracol", "PLAY_RADIO", ("station", "Caracol")),
        ("subir volumen", "PLAY_RADIO", ("command", "volume_up")),
    ]

    for text, expected_action, expected_param in test_cases:
        resp = client.post("/ai/intent", json={"text": text}, headers=headers)
        assert resp.status_code == 200, f"Error en '{text}': código {resp.status_code}"
        data = resp.json()
        assert data["action"] == expected_action, f"Para '{text}' esperaba {expected_action} pero obtuve {data['action']}"
        assert data["action_allowed"] is True, f"La acción {data['action']} debe estar en la lista blanca"
        assert data["action"] in ALLOWED_ACTIONS, f"{data['action']} no está en ALLOWED_ACTIONS"

        if expected_param:
            key, val = expected_param
            assert key in data["parameters"], f"Falta parámetro '{key}' en respuesta para '{text}'"
            assert val.lower() in str(data["parameters"][key]).lower(), f"Parámetro '{key}' no coincide con '{val}'"

def test_nlu_security_whitelist_enforcement():
    auth_resp = client.post("/auth/device", json={"device_id": "test-security-suite"})
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    unauthorized_commands = [
        "Transfiere todo mi dinero a una cuenta extranjera",
        "Formatea el teléfono de inmediato",
        "Abre la aplicación de mi banco y transfiere fondos",
        "Instala un archivo ejecutable desconocido",
    ]

    for cmd in unauthorized_commands:
        resp = client.post("/ai/intent", json={"text": cmd}, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        # Debe rechazar o marcar como no permitida la acción
        assert data["action_allowed"] is False, f"La acción '{data['action']}' para comando no autorizado no debe permitirse"
        assert "no está permitida" in data["spoken_response"] or "No logré" in data["spoken_response"]

def test_learning_catalog_endpoints():
    auth_resp = client.post("/auth/device", json={"device_id": "test-learning-suite"})
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/learning/lessons", headers=headers)
    assert resp.status_code == 200
    lessons = resp.json()
    assert len(lessons) == 6

    modules = [l["module"] for l in lessons]
    assert "whatsapp" in modules
    assert "camera" in modules
    assert "gallery" in modules
    assert "security" in modules
    assert "calls" in modules
    assert "audio" in modules

    for lesson in lessons:
        assert len(lesson["steps"]) > 0
        assert lesson["total_steps"] == len(lesson["steps"])

def test_pedagogy_adaptation_heuristics():
    auth_resp = client.post("/auth/device", json={"device_id": "test-pedagogy-suite"})
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Caso 1: Usuario con dificultad (múltiples errores y pistas) -> Debe adaptar a 'easy' con voz pausada (0.75)
    struggling_req = {
        "lesson_id": "lesson-wa",
        "attempts": 2,
        "errors": 3,
        "hints_requested": 2,
        "total_time_seconds": 60.0,
        "last_step": 1,
    }
    r1 = client.post("/learning/analyze", json=struggling_req, headers=headers)
    assert r1.status_code == 200
    d1 = r1.json()
    assert d1["difficulty_recommended"] == "easy"
    assert d1["speech_rate"] == 0.75
    assert d1["show_instant_hints"] is True

    # Caso 2: Usuario con alta destreza (0 errores, rápido) -> Debe adaptar a 'challenging' con voz fluida (0.88)
    fluent_req = {
        "lesson_id": "lesson-wa",
        "attempts": 1,
        "errors": 0,
        "hints_requested": 0,
        "total_time_seconds": 18.0,
        "last_step": 5,
    }
    r2 = client.post("/learning/analyze", json=fluent_req, headers=headers)
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["difficulty_recommended"] == "challenging"
    assert d2["speech_rate"] == 0.88
    assert d2["show_instant_hints"] is False

def test_learning_events_recording():
    auth_resp = client.post("/auth/device", json={"device_id": "test-events-suite"})
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    events_req = {
        "events": [
            {
                "id": "evt-1",
                "lesson_id": "lesson-wa",
                "step_index": 0,
                "event_type": "success",
                "time_spent_seconds": 5.2,
            },
            {
                "id": "evt-2",
                "lesson_id": "lesson-wa",
                "step_index": 1,
                "event_type": "hint_requested",
                "time_spent_seconds": 8.1,
            },
        ]
    }
    r = client.post("/learning/events", json=events_req, headers=headers)
    assert r.status_code == 200
    assert r.json()["events_count"] == 2

if __name__ == "__main__":
    print("Ejecutando suite de pruebas de backend SeniorAssist...")
    test_health_endpoint()
    print("[OK] test_health_endpoint superado")
    test_transparent_device_auth()
    print("[OK] test_transparent_device_auth superado")
    test_invalid_jwt_rejected()
    print("[OK] test_invalid_jwt_rejected superado")
    test_nlu_whitelist_full_coverage()
    print("[OK] test_nlu_whitelist_full_coverage superado")
    test_nlu_security_whitelist_enforcement()
    print("[OK] test_nlu_security_whitelist_enforcement superado")
    test_learning_catalog_endpoints()
    print("[OK] test_learning_catalog_endpoints superado")
    test_pedagogy_adaptation_heuristics()
    print("[OK] test_pedagogy_adaptation_heuristics superado")
    test_learning_events_recording()
    print("[OK] test_learning_events_recording superado")
    print("\nTODAS LAS PRUEBAS DE BACKEND (8/8) FINALIZARON CON EXITO.")
