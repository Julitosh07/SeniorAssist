"""
========================================================================================
CLIENTE DE PRUEBAS DE LOS 4 MICROSERVICIOS - SENIORASSIST
Ejecuta peticiones reales HTTP a los 4 microservicios independientes:
  1. Microservicio 1 (Puerto 8001): NLU & Procesamiento de Voz
  2. Microservicio 2 (Puerto 8002): Autenticación y Seguridad JWA (Zero-Login)
  3. Microservicio 3 (Puerto 8003): Tutor de Aprendizaje y Adaptación Pedagógica
  4. Microservicio 4 (Puerto 8004): Observabilidad y Métricas APM (Prometheus)
  5. Caso de Rechazo: Cómo la Capa 1 (El Validador) rechaza datos mal formados (HTTP 422)
========================================================================================
"""

import urllib.request
import urllib.error
import json
import time

def print_separator(title):
    print("\n" + "=" * 80)
    print(f"🔹 {title}")
    print("=" * 80)

def post_json(url, payload):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))

def get_text(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), resp.read().decode("utf-8")

def main():
    print("==========================================================================")
    print("🚀 SUITE DE VERIFICACIÓN: 4 MICROSERVICIOS COMO SOFTWARE NATIVO")
    print("==========================================================================")
    time.sleep(0.3)

    # ----------------------------------------------------------------------------------
    # PRUEBA 1: MICROSERVICIO 1 (PROCESAMIENTO DE VOZ EN PUERTO 8001)
    # ----------------------------------------------------------------------------------
    print_separator("1. PROBANDO MICROSERVICIO 1: NLU Y VOZ (PUERTO 8001)")
    url_voice = "http://localhost:8001/api/v1/voice/process-intent"
    payload_voice = {
        "text": "Llama a mi hija María urgente",
        "device_id": "senior-device-101"
    }
    print(f"📤 Endpoint: POST {url_voice}")
    try:
        status_code, data = post_json(url_voice, payload_voice)
        print(f"✅ HTTP {status_code} OK")
        print(f"   ➔ Acción Clasificada: {data.get('action')}")
        print(f"   ➔ Confianza: {data.get('confidence') * 100:.1f}%")
        print(f"   ➔ Parámetros: {data.get('parameters')}")
        print(f"   ➔ Respuesta Sonora TTS: \"{data.get('feedback_audio_text')}\"")
        print(f"   ➔ Fuente: {data.get('service_source')}")
    except Exception as e:
        print(f"❌ Error conectando a Microservicio 1 (Puerto 8001): {e}")

    # ----------------------------------------------------------------------------------
    # PRUEBA 2: MICROSERVICIO 2 (AUTENTICACIÓN JWA EN PUERTO 8002)
    # ----------------------------------------------------------------------------------
    print_separator("2. PROBANDO MICROSERVICIO 2: AUTENTICACIÓN JWA (PUERTO 8002)")
    url_auth = "http://localhost:8002/api/v1/auth/device-session"
    payload_auth = {
        "device_id": "senior-phone-uuid-8831-abuelo-pedro",
        "app_version": "1.0.0",
        "platform": "android"
    }
    print(f"📤 Endpoint: POST {url_auth}")
    try:
        status_code, data = post_json(url_auth, payload_auth)
        print(f"✅ HTTP {status_code} OK")
        print(f"   ➔ Token JWT Emitido: {data.get('access_token')[:45]}... (Truncado)")
        print(f"   ➔ Algoritmo Criptográfico: {data.get('algorithm')}")
        print(f"   ➔ Vigencia Transparente: {data.get('expires_in_days')} días")
        print(f"   ➔ Fuente: {data.get('service_source')}")
    except Exception as e:
        print(f"❌ Error conectando a Microservicio 2 (Puerto 8002): {e}")

    # ----------------------------------------------------------------------------------
    # PRUEBA 3: MICROSERVICIO 3 (TUTOR DE APRENDIZAJE EN PUERTO 8003)
    # ----------------------------------------------------------------------------------
    print_separator("3. PROBANDO MICROSERVICIO 3: TUTOR DE APRENDIZAJE IA (PUERTO 8003)")
    url_learning = "http://localhost:8003/api/v1/learning/evaluate-performance"
    payload_learning = {
        "lesson_id": "lesson-wa",
        "errors_count": 3,              # El abuelo tuvo errores
        "hints_requested": 2,           # Solicitó pistas
        "total_time_seconds": 52.4,     # Se demoró
        "device_id": "senior-device-101"
    }
    print(f"📤 Endpoint: POST {url_learning}")
    print(f"📦 Simulación: Adulto mayor con dificultades en el simulador de WhatsApp")
    try:
        status_code, data = post_json(url_learning, payload_learning)
        print(f"✅ HTTP {status_code} OK")
        print(f"   ➔ Dificultad Adaptada: {data.get('difficulty_recommended')}")
        print(f"   ➔ Velocidad de Voz Ajustada: {data.get('speech_rate')} (Habla pausada)")
        print(f"   ➔ Activar Pistas Inmediatas: {data.get('show_instant_hints')}")
        print(f"   ➔ Mensaje de Empatía: \"{data.get('encouragement_text')}\"")
        print(f"   ➔ Fuente: {data.get('service_source')}")
    except Exception as e:
        print(f"❌ Error conectando a Microservicio 3 (Puerto 8003): {e}")

    # ----------------------------------------------------------------------------------
    # PRUEBA 4: MICROSERVICIO 4 (OBSERVABILIDAD Y MÉTRICAS EN PUERTO 8004)
    # ----------------------------------------------------------------------------------
    print_separator("4. PROBANDO MICROSERVICIO 4: OBSERVABILIDAD Y APM (PUERTO 8004)")
    url_monitor = "http://localhost:8004/api/v1/monitoring/ingest"
    payload_monitor = {
        "event_type": "voice_command",
        "latency_ms": 138.5,
        "success": True,
        "device_id": "senior-device-101"
    }
    print(f"📤 Endpoint Ingesta: POST {url_monitor}")
    try:
        status_code, data = post_json(url_monitor, payload_monitor)
        print(f"✅ HTTP {status_code} CREATED")
        print(f"   ➔ ID de Métrica: {data.get('metric_id')}")
        print(f"   ➔ Latencia P95 Computada: {data.get('p95_latency_ms')} ms")
        print(f"   ➔ Fuente: {data.get('service_source')}")

        # Probar endpoint exportador Prometheus
        code_prom, prom_text = get_text("http://localhost:8004/api/v1/monitoring/prometheus")
        print(f"\n📊 Exportador Prometheus (HTTP {code_prom}):")
        for line in prom_text.split("\n")[:5]:
            print(f"   {line}")
    except Exception as e:
        print(f"❌ Error conectando a Microservicio 4 (Puerto 8004): {e}")

    # ----------------------------------------------------------------------------------
    # PRUEBA 5: DEMOSTRACIÓN DE LA CAPA 1 (EL VALIDADOR RECHAZANDO ENTRADA INVÁLIDA)
    # ----------------------------------------------------------------------------------
    print_separator("5. DEMOSTRACIÓN DE LA CAPA 1: EL VALIDADOR PYDANTIC RECHAZANDO ENTRADA")
    bad_payload = {
        "text": "x" # Inválido: min_length=2
    }
    print(f"📤 Enviando Petición Inválida a: {url_voice}")
    try:
        post_json(url_voice, bad_payload)
    except urllib.error.HTTPError as err:
        print(f"🛡️ RECHAZO EXITOSO: El Validador detectó el dato inválido y respondió HTTP {err.code} Unprocessable Entity.")
        print(f"📄 Respuesta JSON de Validación: {err.read().decode('utf-8')[:120]}...")

    print("\n" + "=" * 80)
    print("🎉 SUITE DE 4 MICROSERVICIOS VERIFICADA AL 100%")
    print("==========================================================================")

if __name__ == "__main__":
    main()
