import { authService } from './AuthService';
import { isActionAllowed, AllowedActionType } from '../constants/actions';
import { VoiceIntentResponse } from '../types/intents';

const PRODUCTION_BACKEND_URL = 'https://seniorassist.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:8000';
const BACKEND_URL = PRODUCTION_BACKEND_URL;

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Envía el texto capturado por voz al backend de IA para extraer la intención estructurada
   */
  public async extractIntent(spokenText: string): Promise<VoiceIntentResponse> {
    const token = await authService.getValidToken();

    try {
      const response = await fetch(`${BACKEND_URL}/ai/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: spokenText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Verificación de Lista Blanca en el cliente (Requisito IEEE 830)
        if (isActionAllowed(data.action)) {
          return {
            action: data.action as AllowedActionType,
            parameters: data.parameters || {},
            confidence: data.confidence,
            spoken_response: data.spoken_response,
          };
        } else {
          console.warn(`Acción rechazada por lista blanca del cliente: ${data.action}`);
        }
      }
    } catch (err) {
      console.warn('Backend no disponible, ejecutando motor NLU local de contingencia:', err);
    }

    // Motor NLU de contingencia local si el backend está desconectado (Offline First)
    return this.fallbackLocalNLU(spokenText);
  }

  /**
   * Helper para extraer el nombre del contacto después de palabras clave
   */
  private extractContactName(text: string, triggers: string[]): string {
    let lower = text.toLowerCase();
    for (const trigger of triggers) {
      const idx = lower.indexOf(trigger);
      if (idx !== -1) {
        const after = text.substring(idx + trigger.length).trim();
        // Quitar artículos y conectores iniciales como "a mi", "a la", "a", "al", "mi", "con"
        const cleaned = after.replace(/^(a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|con\s+)/i, '');
        // Quitar signos de puntuación
        return cleaned.replace(/[.,?!¿¡]/g, '').trim();
      }
    }
    return '';
  }

  /**
   * Extrae contacto y cuerpo de mensaje en órdenes de WhatsApp
   */
  private extractWhatsAppDetails(spokenText: string): { contact: string; message: string } {
    const cleanSpoken = spokenText.replace(/^(?:oye\s+asistente|hola\s+asistente|asistente|asistenta|por\s+favor)\s*[,:\.]?\s*/i, '').trim();

    // 1. Patrón con separador explícito: "diciéndole", "diciendo", "que diga", etc.
    const sepRegex = /(?:manda(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|env[ií]a(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|escr[ií]be(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)?\s*a|whatsapp\s+a|mensaje\s+a)\s+(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+?)\s+(?:dici[eé]ndole(?:\s+que)?|diciendo\s+que|diciendo|dile\s+que|dile|que\s+diga|que\s+dice|con\s+el\s+mensaje|con\s+el\s+texto)\s+(.*)/i;
    const match = cleanSpoken.match(sepRegex);
    if (match) {
      return {
        contact: match[1].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+)/i, '').trim(),
        message: match[2].trim(),
      };
    }

    // 2. Patrón con conector "que ": "manda un mensaje a Carlos que voy para allá"
    const queRegex = /(?:manda(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|env[ií]a(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|escr[ií]be(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)?\s*a|whatsapp\s+a|mensaje\s+a)\s+(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+?)\s+que\s+(.*)/i;
    const matchQue = cleanSpoken.match(queRegex);
    if (matchQue) {
      const contactCand = matchQue[1].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+)/i, '').trim();
      const words = contactCand.split(/\s+/);
      if (words.length <= 4) {
        return {
          contact: contactCand,
          message: matchQue[2].trim(),
        };
      }
    }

    // 3. Patrón con saludo: "manda un mensaje a Carlos hola cómo estás"
    const saludoRegex = /(?:manda(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|env[ií]a(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|escr[ií]be(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)?\s*a|whatsapp\s+a|mensaje\s+a)\s+(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+?)\s+(hola.*|buenos\s+d[ií]as.*|buenas\s+tardes.*|buenas\s+noches.*)/i;
    const matchSaludo = cleanSpoken.match(saludoRegex);
    if (matchSaludo) {
      const contactCand = matchSaludo[1].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+)/i, '').trim();
      const words = contactCand.split(/\s+/);
      if (words.length <= 4) {
        return {
          contact: contactCand,
          message: matchSaludo[2].trim(),
        };
      }
    }

    // 4. Patrón simple: "manda un mensaje a Carlos"
    const simpleRegex = /(?:manda(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|env[ií]a(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|escr[ií]be(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)?\s*a|whatsapp\s+a|mensaje\s+a)\s+(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+)$/i;
    const matchSimple = cleanSpoken.match(simpleRegex);
    if (matchSimple) {
      return {
        contact: matchSimple[1].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+)/i, '').trim(),
        message: 'Hola, te escribo con SeniorAssist.',
      };
    }

    return {
      contact: '',
      message: 'Hola, te escribo con SeniorAssist.',
    };
  }

  /**
   * Extrae medicamento y hora para alarmas de salud
   * Ejemplo: "Programa una alarma para tomar acetaminofen a las 8 de la noche"
   */
  public extractAlarmDetails(spokenText: string): { medication?: string; time?: string } {
    const lower = spokenText.toLowerCase();

    // 1. Extraer la hora
    const wordNumbers: Record<string, number> = {
      una: 1, un: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
      seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12,
    };

    const timeRegex = /a\s+las?\s+(\d{1,2}|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)(?::(\d{2}))?/i;
    const timeMatch = lower.match(timeRegex);

    let time: string | undefined = undefined;

    if (timeMatch) {
      const rawHour = timeMatch[1].toLowerCase();
      let hourNum = wordNumbers[rawHour] !== undefined ? wordNumbers[rawHour] : parseInt(rawHour, 10);
      let minStr = timeMatch[2] || '00';

      if (lower.includes('media')) minStr = '30';
      else if (lower.includes('cuarto')) minStr = '15';

      const isPM = lower.includes('noche') || lower.includes('tarde') || lower.includes('pm') || lower.includes('p.m.');
      const isAM = lower.includes('mañana') || lower.includes('madrugada') || lower.includes('am') || lower.includes('a.m.');

      if (isPM && hourNum < 12) {
        hourNum += 12;
      } else if (isAM && hourNum === 12) {
        hourNum = 0;
      }

      const hStr = hourNum < 10 ? `0${hourNum}` : `${hourNum}`;
      time = `${hStr}:${minStr}`;
    }

    // 2. Extraer nombre del medicamento (considerando si la hora va primero o el medicamento primero)
    let medication = '';
    const timePos = timeMatch ? timeMatch.index ?? 9999 : 9999;
    const textBeforeTime = timePos < spokenText.length ? spokenText.substring(0, timePos) : spokenText;
    const textAfterTime = timePos < spokenText.length ? spokenText.substring(timePos) : '';

    const medFirstRegex = /(?:tengo\s+que\s+(?:tomar|tomas)\s+(?:una\s+pastilla\s+de\s+|pastilla\s+de\s+|pastilla\s+|una\s+pastilla\s+)?|para\s+(?:tomar\s+|tomas\s+)?(?:mi\s+|la\s+)?|tomar\s+(?:mi\s+|la\s+)?|tomas\s+(?:mi\s+|la\s+)?)([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+?)(?:\s+a\s+las|\s+a\s+la|\s+todos|\s+cada|\s+en\s+la|\s+en\s+el|$)/i;
    const timeFirstMedRegex = /(?:de\s+tomar\s+(?:una\s+pastilla\s+de\s+|pastilla\s+de\s+|pastilla\s+|una\s+pastilla\s+)?|tomar\s+(?:una\s+pastilla\s+de\s+|pastilla\s+de\s+|pastilla\s+|el\s+medicamento\s+de\s+|medicamento\s+de\s+|medicamento\s+|mi\s+|la\s+)?|tomas\s+(?:una\s+pastilla\s+de\s+|pastilla\s+de\s+|pastilla\s+)?|para\s+la\s+|para\s+el\s+)([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+?)(?:\s+todos|\s+cada|$)/i;

    if (textBeforeTime.includes('tomar') || textBeforeTime.includes('tomas') || textBeforeTime.includes('pastilla') || textBeforeTime.includes('medicamento')) {
      const m = textBeforeTime.match(medFirstRegex);
      if (m && m[1].trim()) medication = m[1].trim();
    } else if (textAfterTime) {
      const m = textAfterTime.match(timeFirstMedRegex);
      if (m && m[1].trim()) medication = m[1].trim();
    }

    if (!medication) {
      const fbMatch = spokenText.match(/(?:pastilla|medicamento|remedio)\s+(?:de\s+)?([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]+)/i);
      if (fbMatch && fbMatch[1].trim()) medication = fbMatch[1].trim();
    }

    // Limpiar prefijos de "una pastilla de", etc.
    medication = medication
      .replace(/^(?:tengo\s+que\s+(?:tomar|tomas)\s+)?(?:una\s+|la\s+|mi\s+)?(?:pastilla\s+de\s+|pastilla\s+|medicamento\s+de\s+|medicamento\s+|remedio\s+de\s+|remedio\s+|dosis\s+de\s+)/i, '')
      .replace(/^(?:de\s+tomar\s+|tomar\s+|tomas\s+)/i, '')
      .trim();

    if (medication) {
      medication = medication.charAt(0).toUpperCase() + medication.slice(1);
    }

    return {
      medication: medication || undefined,
      time,
    };
  }

  /**
   * Motor de reglas NLU local para garantizar funcionamiento offline y privado
   */
  private fallbackLocalNLU(spokenText: string): VoiceIntentResponse {
    let lower = spokenText.toLowerCase().trim();

    // Eliminar prefijos de invocación como "asistente", "oye asistente", "hola asistente"
    lower = lower
      .replace(/^(?:oye\s+asistente|hola\s+asistente|asistente|por\s+favor\s+asistente|asistenta)\s*[,:\.]?\s*/i, '')
      .trim();

    // 1. SOS y Auxilio
    if (lower.includes('auxilio') || lower.includes('emergencia') || lower.includes('sos') || lower.includes('ayuda') || lower.includes('socorro')) {
      return {
        action: 'TRIGGER_SOS',
        parameters: {},
        confidence: 0.95,
        spoken_response: 'Activando pantalla de auxilio y llamada de emergencia.',
      };
    }

    // 2. Linterna
    if (lower.includes('linterna') || lower.includes('luz')) {
      const isOff = lower.includes('apaga') || lower.includes('apagar') || lower.includes('desactiva') || lower.includes('quitar');
      return {
        action: isOff ? 'TURN_FLASHLIGHT_OFF' : 'TURN_FLASHLIGHT_ON',
        parameters: {},
        confidence: 0.95,
        spoken_response: isOff ? 'Apagando la linterna.' : 'Encendiendo la linterna.',
      };
    }

    // 3. Lupa (Cerrar, Zoom, Congelar o Abrir)
    if (lower.includes('cerrar lupa') || lower.includes('cierra la lupa') || lower.includes('cierra lupa') || lower.includes('salir de la lupa') || lower.includes('quitar lupa') || lower.includes('cerrar camara')) {
      return {
        action: 'CLOSE_MAGNIFIER',
        parameters: {},
        confidence: 0.95,
        spoken_response: 'Cerrando la lupa digital.',
      };
    }

    if (lower.includes('congela la imagen') || lower.includes('congelar la imagen') || lower.includes('congela imagen') || lower.includes('congelar imagen') || lower.includes('congela') || lower.includes('congelar')) {
      return {
        action: 'OPEN_MAGNIFIER',
        parameters: { action: 'freeze' },
        confidence: 0.95,
        spoken_response: 'Abriendo la lupa y congelando imagen.',
      };
    }

    if (lower.includes('más zoom') || lower.includes('mas zoom') || lower.includes('acercar lupa') || lower.includes('acerca la lupa') || lower.includes('acercar') || lower.includes('hacer zoom') || lower.includes('aumentar lupa') || lower.includes('aumentar zoom') || lower.includes('más aumento') || lower.includes('mas aumento') || lower.includes('aumenta') || lower.includes('aumentar') || lower.includes('aumenta el zoom')) {
      return {
        action: 'ADJUST_MAGNIFIER_ZOOM',
        parameters: { direction: 'in' },
        confidence: 0.95,
        spoken_response: 'Aumentando el zoom de la lupa.',
      };
    }

    if (lower.includes('menos zoom') || lower.includes('alejar lupa') || lower.includes('aleja la lupa') || lower.includes('alejar') || lower.includes('disminuir lupa') || lower.includes('disminuir zoom') || lower.includes('quitar zoom') || lower.includes('menos aumento') || lower.includes('disminuye') || lower.includes('disminuir') || lower.includes('disminuye zoom') || lower.includes('disminuir zoom')) {
      return {
        action: 'ADJUST_MAGNIFIER_ZOOM',
        parameters: { direction: 'out' },
        confidence: 0.95,
        spoken_response: 'Disminuyendo el zoom de la lupa.',
      };
    }

    if (lower.includes('lupa') || lower.includes('agrandar') || lower.includes('ampliar')) {
      return {
        action: 'OPEN_MAGNIFIER',
        parameters: {},
        confidence: 0.95,
        spoken_response: 'Abriendo la lupa digital.',
      };
    }

    // 4. Aprendizaje y simuladores (alta prioridad si solicita aprender)
    if (lower.includes('aprender') || lower.includes('tutor') || lower.includes('lección') || lower.includes('leccion') || lower.includes('simulador')) {
      let lesson = '';
      if (lower.includes('whatsapp') || lower.includes('mensaje')) lesson = 'whatsapp';
      else if (lower.includes('cámara') || lower.includes('camara')) lesson = 'cámara';
      else if (lower.includes('galería') || lower.includes('galeria') || lower.includes('foto')) lesson = 'galería';
      else if (lower.includes('seguridad') || lower.includes('estafa')) lesson = 'seguridad';

      return {
        action: 'OPEN_LESSON',
        parameters: { lesson },
        confidence: 0.95,
        spoken_response: lesson ? `Abriendo la lección de ${lesson}.` : 'Abriendo el tutor de aprendizaje.',
      };
    }

    // 5. WhatsApp
    const waTriggers = [
      'manda un mensaje a',
      'mandale un mensaje a',
      'mándale un mensaje a',
      'envia un mensaje a',
      'envía un mensaje a',
      'enviale un mensaje a',
      'envíale un mensaje a',
      'manda un whatsapp a',
      'mandale un whatsapp a',
      'mándale un whatsapp a',
      'envia un whatsapp a',
      'envía un whatsapp a',
      'enviale un whatsapp a',
      'envíale un whatsapp a',
      'mensaje de whatsapp a',
      'manda mensaje a',
      'mandale mensaje a',
      'mándale mensaje a',
      'envia mensaje a',
      'envía mensaje a',
      'escríbele a',
      'escribele a',
      'escribe a',
      'whatsapp a',
      'mensaje a',
    ];
    const isWhatsAppIntent = waTriggers.some(t => lower.includes(t)) || lower.startsWith('escribe ') || lower.startsWith('whatsapp ');
    if (isWhatsAppIntent) {
      const details = this.extractWhatsAppDetails(spokenText);
      const contact = details.contact || this.extractContactName(spokenText, waTriggers);
      return {
        action: 'SEND_WHATSAPP',
        parameters: {
          contact: contact || undefined,
          message: details.message || 'Hola, te escribo con SeniorAssist.',
        },
        confidence: 0.95,
        spoken_response: contact ? `Preparando WhatsApp para ${contact}.` : '¿A quién deseas escribir por WhatsApp?',
      };
    }

    // 6. Llamadas telefónicas
    const callTriggers = ['llámale a', 'llamale a', 'llamar a', 'llama a', 'marcar a', 'marca a', 'comunícame con', 'comunicame con', 'hablar con', 'llamar', 'llama'];
    for (const trigger of callTriggers) {
      if (lower.includes(trigger)) {
        const contact = this.extractContactName(spokenText, [trigger]);
        return {
          action: 'CALL_CONTACT',
          parameters: { contact: contact || undefined },
          confidence: 0.95,
          spoken_response: contact ? `Llamando a ${contact}.` : '¿A quién deseas llamar?',
        };
      }
    }

    // 7. Alarmas y Medicamentos
    if (lower.includes('alarma') || lower.includes('medicamento') || lower.includes('pastilla') || lower.includes('remedio') || lower.includes('recordatorio') || lower.includes('tengo que tomar') || lower.includes('tengo que tomas') || lower.includes('tomar pastilla') || lower.includes('tomas pastilla') || lower.includes('tomar una pastilla') || lower.includes('pon recordatorio')) {
      const details = this.extractAlarmDetails(spokenText);
      return {
        action: 'CREATE_ALARM',
        parameters: {
          medication: details.medication,
          time: details.time,
        },
        confidence: 0.95,
        spoken_response: details.medication && details.time
          ? `Configurando alarma para tomar ${details.medication} a las ${details.time}.`
          : 'Abriendo tus recordatorios de salud.',
      };
    }

    // 8. Radio
    if (lower.includes('radio') || lower.includes('emisora') || lower.includes('volumen') || lower.includes('caracol') || lower.includes('rcn') || lower.includes('olímpica') || lower.includes('olimpica') || lower.includes('bésame') || lower.includes('besame') || lower.includes('blu') || lower.includes('cambia de radio') || lower.includes('cambiar de radio') || lower.includes('cambia la radio') || lower.includes('cambia a') || lower.includes('cambiar a') || lower.includes('sintoniza') || lower.includes('sintonizar')) {
      if (lower.includes('apaga') || lower.includes('deten') || lower.includes('pausa') || lower.includes('para') || lower.includes('quita') || lower.includes('silencio')) {
        return {
          action: 'STOP_RADIO',
          parameters: {},
          confidence: 0.95,
          spoken_response: 'Deteniendo la radio.',
        };
      }
      if (lower.includes('sube') || lower.includes('más volumen') || lower.includes('mas volumen') || lower.includes('subir volumen')) {
        return {
          action: 'PLAY_RADIO',
          parameters: { command: 'volume_up' },
          confidence: 0.95,
          spoken_response: 'Subiendo el volumen de la radio.',
        };
      }
      if (lower.includes('baja') || lower.includes('menos volumen') || lower.includes('bajar volumen')) {
        return {
          action: 'PLAY_RADIO',
          parameters: { command: 'volume_down' },
          confidence: 0.95,
          spoken_response: 'Bajando el volumen de la radio.',
        };
      }

      let station = 'Radio Nacional de Colombia';
      if (lower.includes('caracol')) station = 'Caracol Radio';
      else if (lower.includes('rcn')) station = 'RCN Radio';
      else if (lower.includes('olimpica') || lower.includes('olímpica')) station = 'Olímpica Stereo';
      else if (lower.includes('besame') || lower.includes('bésame')) station = 'Bésame Radio';
      else if (lower.includes('blu')) station = 'Blu Radio';

      return {
        action: 'PLAY_RADIO',
        parameters: { station, command: 'play' },
        confidence: 0.95,
        spoken_response: `Sintonizando ${station}.`,
      };
    }

    // 8. Aprendizaje y simuladores
    if (lower.includes('aprender') || lower.includes('tutor') || lower.includes('lección') || lower.includes('leccion') || lower.includes('simulador')) {
      let lesson = '';
      if (lower.includes('whatsapp') || lower.includes('mensaje')) lesson = 'whatsapp';
      else if (lower.includes('cámara') || lower.includes('camara')) lesson = 'cámara';
      else if (lower.includes('galería') || lower.includes('galeria') || lower.includes('foto')) lesson = 'galería';
      else if (lower.includes('seguridad') || lower.includes('estafa')) lesson = 'seguridad';

      return {
        action: 'OPEN_LESSON',
        parameters: { lesson },
        confidence: 0.95,
        spoken_response: lesson ? `Abriendo la lección de ${lesson}.` : 'Abriendo el tutor de aprendizaje.',
      };
    }

    // Si no reconoció ninguna acción, NO abrir lección por defecto. Notificar amablemente.
    return {
      action: 'UNKNOWN' as any,
      parameters: { rawText: spokenText },
      confidence: 0.1,
      spoken_response: `Escuché "${spokenText}", pero no reconozco esa orden. Puedes decir: "Llamar a [nombre]", "Prender linterna" o "Auxilio".`,
    };
  }
}

export const aiService = AIService.getInstance();
