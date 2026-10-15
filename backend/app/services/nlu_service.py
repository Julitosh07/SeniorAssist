import re
import unicodedata
from typing import Dict, Any
from backend.app.config import ALLOWED_ACTIONS
from backend.app.schemas.intent import IntentResponse

def remove_accents(input_str: str) -> str:
    nfkd_form = unicodedata.normalize('NFD', input_str)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])

class NLUService:
    @staticmethod
    def process_text_intent(text: str) -> IntentResponse:
        cleaned_raw = text.lower().strip()
        # Eliminar prefijos de invocación como "asistente", "oye asistente", "hola asistente"
        cleaned_raw = re.sub(r"^(?:oye\s+asistente|hola\s+asistente|asistente|por\s+favor\s+asistente|asistenta)\s*[,:\.]?\s*", "", cleaned_raw, flags=re.IGNORECASE).strip()
        cleaned = remove_accents(cleaned_raw)

        action = "UNKNOWN_ACTION"
        params: Dict[str, Any] = {}
        spoken_response = "No logré comprender lo que necesitas. Por favor intenta de nuevo."
        confidence = 0.5

        # 1. SOS / Emergencia
        if any(w in cleaned for w in ["auxilio", "emergencia", "socorro", "ayuda", "sos", "cai", "caida"]):
            action = "TRIGGER_SOS"
            confidence = 0.98
            spoken_response = "Activando protocolo de auxilio de emergencia."

        # 2. Linterna
        elif "linterna" in cleaned or "luz" in cleaned:
            if any(w in cleaned for w in ["apaga", "apagar", "desactiva"]):
                action = "TURN_FLASHLIGHT_OFF"
                spoken_response = "Apagando la linterna."
            else:
                action = "TURN_FLASHLIGHT_ON"
                spoken_response = "Encendiendo la linterna."
            confidence = 0.95

        # 3. Lupa (Cerrar, Ajustar Zoom, Congelar o Abrir)
        elif any(w in cleaned for w in ["cerrar lupa", "cierra la lupa", "cierra lupa", "salir de la lupa", "quitar lupa", "cerrar camara"]):
            action = "CLOSE_MAGNIFIER"
            spoken_response = "Cerrando la lupa digital."
            confidence = 0.95

        elif any(w in cleaned for w in ["congela la imagen", "congelar la imagen", "congela imagen", "congelar imagen", "congela", "congelar"]):
            action = "OPEN_MAGNIFIER"
            params["action"] = "freeze"
            spoken_response = "Abriendo la lupa y congelando imagen."
            confidence = 0.95

        elif any(w in cleaned for w in ["mas zoom", "mas aumento", "acercar lupa", "acerca la lupa", "acercar", "hacer zoom", "aumenta", "aumentar", "aumenta la lupa", "aumentar lupa", "aumentar zoom", "aumenta el zoom"]):
            action = "ADJUST_MAGNIFIER_ZOOM"
            params["direction"] = "in"
            spoken_response = "Aumentando el zoom de la lupa."
            confidence = 0.95

        elif any(w in cleaned for w in ["menos zoom", "menos aumento", "alejar lupa", "aleja la lupa", "alejar", "disminuye", "disminuir", "disminuye zoom", "disminuir zoom", "disminuye la lupa", "disminuir lupa", "quitar zoom"]):
            action = "ADJUST_MAGNIFIER_ZOOM"
            params["direction"] = "out"
            spoken_response = "Disminuyendo el zoom de la lupa."
            confidence = 0.95

        elif any(w in cleaned for w in ["lupa", "agrandar", "aumento"]):
            action = "OPEN_MAGNIFIER"
            spoken_response = "Abriendo la lupa digital."
            confidence = 0.95

        # 4. Tutor, lecciones y simuladores (alta prioridad si el usuario pide aprender)
        elif any(w in cleaned for w in ["aprender", "tutor", "leccion", "lecciones", "ensena", "curso", "practicar", "simulador"]):
            action = "OPEN_LESSON"
            confidence = 0.95
            topic = ""
            for t in ["whatsapp", "camara", "galeria", "seguridad", "estafa", "fotos"]:
                if t in cleaned:
                    topic = t
                    break
            params["lesson"] = topic
            spoken_response = f"Abriendo la lección de {topic}." if topic else "Abriendo el tutor de aprendizaje."

        # 5. Llamadas telefónicas
        elif cleaned.startswith("llama") or cleaned.startswith("llamar") or "marca a" in cleaned or "marcar a" in cleaned:
            action = "CALL_CONTACT"
            confidence = 0.92
            # Extraer nombre o contacto
            contact_match = re.search(r"(?:llama a|llamar a|marca a|marcar a)\s+(?:mi\s+)?([a-z\s]+)", cleaned)
            contact_name = contact_match.group(1).strip() if contact_match else "contacto"
            # Preservar mayúscula inicial
            contact_name = contact_name.capitalize()
            params["contact"] = contact_name
            spoken_response = f"Buscando contacto {contact_name} para llamar."

        # 6. WhatsApp
        elif any(w in cleaned for w in ["escribe", "escribir", "whatsapp", "mensaje", "wasap", "manda mensaje", "mandale mensaje", "envia mensaje"]):
            action = "SEND_WHATSAPP"
            confidence = 0.95

            # Patrón 1: Con separador explícito como "diciendole", "que diga", "con el mensaje"
            # ej: "manda mensaje a hija Maria diciendole Hola Como estas?"
            wa_sep_match = re.search(
                r"(?:manda(?:le)?\s+(?:un\s+)?(?:mensaje|whatsapp)\s+a|env[ií]a(?:le)?\s+(?:un\s+)?(?:mensaje|whatsapp)\s+a|escr[ií]be(?:le)?\s+(?:un\s+)?(?:mensaje|whatsapp)?\s*a|whatsapp\s+a|mensaje\s+a)\s+(?:mi\s+|la\s+|el\s+)?([a-z0-9\s]+?)\s+(?:dici[eé]ndole|diciendo\s+que|diciendo|que\s+diga|que\s+dice|con\s+el\s+mensaje|con\s+el\s+texto|dile\s+que|dile)\s+(.*)",
                cleaned_raw,
                re.IGNORECASE
            )
            if wa_sep_match:
                recipient = wa_sep_match.group(1).strip()
                message_body = wa_sep_match.group(2).strip()
                params["contact"] = recipient.title()
                params["message"] = message_body
                spoken_response = f"Preparando mensaje de WhatsApp para {params['contact']}."
            else:
                # Patrón 2: Simple con "que": "escríbele a Carlos que ya llegué"
                wa_simple_match = re.search(
                    r"(?:escr[ií]be(?:le)?\s+a|mensaje\s+a|whatsapp\s+a|manda(?:le)?\s+(?:un\s+)?(?:mensaje|whatsapp)\s+a)\s+(?:mi\s+|la\s+|el\s+)?([a-z0-9\s]+?)(?:\s+que\s+(.*)|\s+(hola.*)|$)",
                    cleaned_raw,
                    re.IGNORECASE
                )
                if wa_simple_match:
                    recipient = wa_simple_match.group(1).strip()
                    msg = wa_simple_match.group(2) or wa_simple_match.group(3) or "Hola, te escribo con SeniorAssist."
                    params["contact"] = recipient.title()
                    params["message"] = msg.strip()
                    spoken_response = f"Preparando mensaje de WhatsApp para {params['contact']}."
                else:
                    params["contact"] = "Familia"
                    params["message"] = cleaned_raw
                    spoken_response = "Preparando mensaje de WhatsApp."

        # 7. Recordatorios / Alarmas de medicamentos
        # 7. Recordatorios / Alarmas de medicamentos
        elif any(w in cleaned for w in ["alarma", "medicamento", "pastilla", "recuerdame", "pastillas", "recordatorio", "tengo que tomar", "tengo que tomas", "tomar pastilla", "tomas pastilla", "pon recordatorio"]):
            action = "CREATE_ALARM"
            confidence = 0.95

            # Formato de hora en 24h
            time_val = "08:00"
            is_pm = any(w in cleaned for w in ["noche", "tarde", "pm", "p.m."])
            
            # Reconocimiento de horas comunes
            h_match = re.search(r"a\s+las?\s+(\d{1,2}|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)(?::(\d{2}))?", cleaned)
            if h_match:
                raw_h = h_match.group(1).lower()
                num_map = {
                    "una": 1, "uno": 1, "un": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5,
                    "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10, "once": 11, "doce": 12
                }
                h_num = num_map.get(raw_h, int(raw_h) if raw_h.isdigit() else 8)
                min_str = h_match.group(2) or "00"
                if "media" in cleaned:
                    min_str = "30"
                elif "cuarto" in cleaned:
                    min_str = "15"

                if is_pm and h_num < 12:
                    h_num += 12
                elif not is_pm and h_num == 12:
                    h_num = 0
                time_val = f"{h_num:02d}:{min_str}"
            elif "ocho" in cleaned or "8" in cleaned:
                time_val = "20:00" if is_pm else "08:00"
            elif "dos" in cleaned or "2" in cleaned:
                time_val = "14:00" if is_pm else "02:00"
            elif "nueve" in cleaned or "9" in cleaned:
                time_val = "21:00" if is_pm else "09:00"

            # Extraer medicamento contemplando hora primero o medicamento primero
            time_first_match = re.search(
                r"(?:de\s+tomar\s+(?:una\s+pastilla\s+de\s+|pastilla\s+de\s+|pastilla\s+|una\s+pastilla\s+)?|tomar\s+(?:una\s+pastilla\s+de\s+|pastilla\s+de\s+|pastilla\s+|el\s+medicamento\s+de\s+|medicamento\s+de\s+|medicamento\s+|mi\s+|la\s+)?|tomas\s+(?:una\s+pastilla\s+de\s+|pastilla\s+de\s+|pastilla\s+)?|para\s+la\s+|para\s+el\s+)([a-z0-9\s]+?)(?:\s+todos|\s+cada|$)",
                cleaned,
                re.IGNORECASE
            )
            med_first_match = re.search(
                r"(?:tengo\s+que\s+(?:tomar|tomas)\s+(?:una\s+pastilla\s+de\s+|pastilla\s+de\s+|pastilla\s+|una\s+pastilla\s+)?|para\s+(?:tomar\s+|tomas\s+)?(?:mi\s+|la\s+)?|tomar\s+(?:mi\s+|la\s+)?|tomas\s+(?:mi\s+|la\s+)?)([a-z0-9\s]+?)(?:\s+a\s+las|\s+a\s+la|\s+todos|\s+cada|\s+en\s+la|\s+en\s+el|$)",
                cleaned,
                re.IGNORECASE
            )
            h_pos = h_match.start() if h_match else 9999
            
            med_raw = ""
            if any(w in cleaned[:h_pos] for w in ["tomar", "pastilla", "medicamento", "tomas"]) and med_first_match:
                med_raw = med_first_match.group(1).strip()
            elif time_first_match:
                med_raw = time_first_match.group(1).strip()
            elif med_first_match:
                med_raw = med_first_match.group(1).strip()
            else:
                fb = re.search(r"(?:pastilla|medicamento|remedio)\s+(?:de\s+)?([a-z0-9]+)", cleaned)
                med_raw = fb.group(1) if fb else "Medicamento"

            # Limpiar prefijos de pastilla
            med_raw = re.sub(r"^(?:tengo\s+que\s+(?:tomar|tomas)\s+)?(?:una\s+|la\s+|mi\s+)?(?:pastilla\s+de\s+|pastilla\s+|medicamento\s+de\s+|medicamento\s+|remedio\s+de\s+|remedio\s+|dosis\s+de\s+)", "", med_raw, flags=re.IGNORECASE)
            med_raw = re.sub(r"^(?:de\s+tomar\s+|tomar\s+|tomas\s+)", "", med_raw, flags=re.IGNORECASE).strip()
            med_name = med_raw.capitalize() if med_raw else "Medicamento"

            params["medication"] = med_name
            params["time"] = time_val
            params["frequency"] = "daily"
            spoken_response = f"Configurando alarma para {med_name} a las {time_val}."

        # 8. Radio y Emisoras (RF07)
        elif any(w in cleaned for w in ["radio", "emisora", "sintoniza", "sintonizar", "cambia de radio", "cambiar de radio", "cambia a", "cambiar a", "volumen", "caracol", "rcn", "olimpica", "besame", "blu"]):
            confidence = 0.95
            if any(w in cleaned for w in ["apaga", "apagar", "deten", "detener", "para", "parar", "pausa", "pausar", "silencia", "silenciar", "quita", "quitar"]):
                action = "STOP_RADIO"
                spoken_response = "Deteniendo la radio."
            elif any(w in cleaned for w in ["sube", "subir", "aumenta", "aumentar", "mas volumen"]):
                action = "PLAY_RADIO"
                params["command"] = "volume_up"
                spoken_response = "Subiendo el volumen de la radio."
            elif any(w in cleaned for w in ["baja", "bajar", "disminuye", "disminuir", "menos volumen"]):
                action = "PLAY_RADIO"
                params["command"] = "volume_down"
                spoken_response = "Bajando el volumen de la radio."
            else:
                action = "PLAY_RADIO"
                params["command"] = "play"
                station = "Radio Nacional de Colombia"
                if "caracol" in cleaned:
                    station = "Caracol Radio"
                elif "rcn" in cleaned:
                    station = "RCN Radio"
                elif "olimpica" in cleaned:
                    station = "Olímpica Stereo"
                elif "besame" in cleaned:
                    station = "Bésame Radio"
                elif "blu" in cleaned:
                    station = "Blu Radio"
                elif "nacional" in cleaned or "colombia" in cleaned:
                    station = "Radio Nacional de Colombia"
                params["station"] = station
                spoken_response = f"Sintonizando {station} en la radio."

        # Validación estricta contra la lista blanca de acciones (IEEE 830)
        is_allowed = action in ALLOWED_ACTIONS

        if not is_allowed:
            spoken_response = "Esa acción no está permitida o no la reconozco en este momento."

        return IntentResponse(
            action=action,
            parameters=params,
            confidence=confidence,
            spoken_response=spoken_response,
            action_allowed=is_allowed
        )
