import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AssistantState } from '../types/intents';
import { voiceService } from '../services/VoiceService';
import { callService } from '../services/CallService';
import { whatsAppService } from '../services/WhatsAppService';
import { flashlightService } from '../services/FlashlightService';
import { magnifierService } from '../services/MagnifierService';
import { radioService } from '../services/RadioService';
import { alarmService } from '../services/AlarmService';
import { aiService } from '../services/AIService';
import { sosService } from '../services/SOSService';
import { navigateGlobal, goBackGlobal } from '../navigation/AppNavigator';
import { AccessibleText } from '../components/AccessibleText';
import { borderRadius, spacing } from '../constants/theme';

interface PendingDisambiguation {
  action: 'SEND_WHATSAPP' | 'CALL_CONTACT';
  contactQuery: string;
  messageText?: string;
  candidates: Array<{ id: string; name: string; phoneNumber: string }>;
}

export interface GlobalVoiceAssistantContextType {
  state: AssistantState;
  transcript: string;
  isHandsFree: boolean;
  toggleHandsFree: () => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetToIdleAndListen: () => void;
}

const GlobalVoiceAssistantContext = createContext<GlobalVoiceAssistantContextType | null>(null);

export interface ParsedWhatsAppCommand {
  isMatch: boolean;
  recipient: string;
  message: string;
}

export function parseWhatsAppVoiceCommand(spokenText: string): ParsedWhatsAppCommand | null {
  if (!spokenText) return null;
  let text = spokenText.trim();

  // Quitar invocaciones iniciales si vienen pegadas
  text = text.replace(/^(?:oye\s+asistente|hola\s+asistente|asistente|asistenta|asistentes|asistencia|asiste|por\s+favor)\s*[,:\.]?\s*/i, '').trim();

  const prefixRegex = /^(?:m[aá]nda(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|env[ií]a(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|escr[ií]be(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)?\s*a|whatsapp\s+a|mensaje\s+a)\s+/i;
  const prefixMatch = text.match(prefixRegex);
  if (!prefixMatch) return null;

  const afterPrefix = text.substring(prefixMatch[0].length).trim();
  if (!afterPrefix) return null;

  // 1. Separador explícito: diciéndole, diciendo que, diciendo, que diga, etc.
  const sepRegex = /^(.*?)\s+(?:dici[eé]ndole(?:\s+que)?|diciendo\s+que|diciendo|dile\s+que|dile|que\s+diga|que\s+dice|con\s+el\s+mensaje|con\s+el\s+texto)\s+(.*)$/i;
  const sepMatch = afterPrefix.match(sepRegex);
  if (sepMatch) {
    const recipient = sepMatch[1].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
    const message = sepMatch[2].trim();
    if (recipient && message) {
      return { isMatch: true, recipient, message };
    }
  }

  // 2. Conector "que ": "Carlos que ya voy para allá"
  const queRegex = /^(.*?)\s+que\s+(.*)$/i;
  const queMatch = afterPrefix.match(queRegex);
  if (queMatch) {
    const candidateRecipient = queMatch[1].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
    const message = queMatch[2].trim();
    const words = candidateRecipient.split(/\s+/);
    if (words.length <= 4 && candidateRecipient.length > 0 && message.length > 0) {
      return { isMatch: true, recipient: candidateRecipient, message };
    }
  }

  // 3. Saludos comunes: "Carlos hola cómo estás"
  const saludoRegex = /^(.*?)\s+(hola.*|buenos\s+d[ií]as.*|buenas\s+tardes.*|buenas\s+noches.*)$/i;
  const saludoMatch = afterPrefix.match(saludoRegex);
  if (saludoMatch) {
    const candidateRecipient = saludoMatch[1].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
    const message = saludoMatch[2].trim();
    const words = candidateRecipient.split(/\s+/);
    if (words.length <= 4 && candidateRecipient.length > 0 && message.length > 0) {
      return { isMatch: true, recipient: candidateRecipient, message };
    }
  }

  // 4. Frase compuesta sin conector explícito: e.g. "Carlos voy para allá"
  const tokens = afterPrefix.split(/\s+/);
  if (tokens.length >= 2) {
    const candidateRecipient = tokens[0].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
    const candidateMessage = tokens.slice(1).join(' ').trim();
    if (candidateRecipient.length > 0 && candidateMessage.length > 0) {
      return { isMatch: true, recipient: candidateRecipient, message: candidateMessage };
    }
  }

  // 5. Sólo el contacto: "manda un mensaje a Carlos"
  const singleRecipient = afterPrefix.replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
  return {
    isMatch: true,
    recipient: singleRecipient,
    message: 'Hola, te escribo con SeniorAssist',
  };
}

export interface ParsedCallCommand {
  isMatch: boolean;
  contact: string;
}

export function parseCallVoiceCommand(spokenText: string): ParsedCallCommand | null {
  if (!spokenText) return null;
  let text = spokenText.trim();

  // Quitar invocaciones iniciales si vienen pegadas
  text = text.replace(/^(?:oye\s+asistente|hola\s+asistente|asistente|asistenta|asistentes|asistencia|asiste|por\s+favor)\s*[,:\.]?\s*/i, '').trim();

  const callRegex = /^(?:(?:por\s+favor\s+)?(?:quiero\s+)?(?:hacer\s+una\s+llamada\s+a|haz\s+una\s+llamada\s+a|ll[aá]ma(?:le)?\s+a|llamar\s+a|marca(?:r)?\s+a|comun[ií]came\s+con|hablar\s+con|llamar|llama))\s+/i;
  const match = text.match(callRegex);
  if (!match) return null;

  let afterPrefix = text.substring(match[0].length).trim();
  if (!afterPrefix) return null;

  // Quitar conectores como "a mi", "a la", "a", "al", "mi", "el", "la"
  const cleanContact = afterPrefix.replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
  const finalContact = cleanContact.replace(/[.,?!¿¡]/g, '').trim();

  if (finalContact.length > 0) {
    return {
      isMatch: true,
      contact: finalContact,
    };
  }

  return null;
}

export const GlobalVoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AssistantState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [recognizedVoiceText, setRecognizedVoiceText] = useState<string>('');
  const recognizedRef = useRef<string>('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isHandsFree, setIsHandsFree] = useState<boolean>(true);
  const isHandsFreeRef = useRef<boolean>(true);
  const stateRef = useRef<AssistantState>('idle');
  const handsFreeRestartTimer = useRef<NodeJS.Timeout | null>(null);
  const startWakeWordRef = useRef<() => Promise<void>>(async () => {});
  const lastAudioActivityRef = useRef<number>(Date.now());

  // Desambiguación multiturno para contactos repetidos (ej: dos "Carlos")
  const pendingDisambiguationRef = useRef<PendingDisambiguation | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  /**
   * Procesa la orden por voz a través de IA o reglas locales con ejecución en cualquier módulo
   */
  const processVoiceInput = useCallback(async (spokenText: string) => {
    clearSilenceTimer();
    setState('processing');
    setTranscript(`"${spokenText}"`);

    const cleanSpoken = spokenText.toLowerCase().trim();

    // Notificar en segundo plano al backend en Render para telemetría e intención en tiempo real
    aiService.extractIntent(spokenText).catch(() => {});

    // 0. Manejo de desambiguación activa si se preguntó previamente por el contacto
    if (pendingDisambiguationRef.current) {
      const pending = pendingDisambiguationRef.current;

      if (cleanSpoken.includes('cancela') || cleanSpoken.includes('ninguno') || cleanSpoken === 'no') {
        pendingDisambiguationRef.current = null;
        setState('idle');
        setTranscript('Operación cancelada');
        await voiceService.speak('Entendido, operación cancelada.');
        return;
      }

      const matched = pending.candidates.find(c => {
        const nameLower = c.name.toLowerCase();
        if (cleanSpoken.includes(nameLower) || nameLower.includes(cleanSpoken)) return true;
        const tokens = nameLower.split(/\s+/).filter(t => t.length >= 3);
        return tokens.some(tok => cleanSpoken.includes(tok));
      });

      if (matched) {
        pendingDisambiguationRef.current = null;
        if (pending.action === 'SEND_WHATSAPP') {
          setState('success');
          setTranscript(`Abriendo WhatsApp para ${matched.name}`);
          await whatsAppService.openWhatsAppToNumber(
            matched.phoneNumber,
            matched.name,
            pending.messageText || 'Hola, te escribo con SeniorAssist'
          );
          return;
        } else if (pending.action === 'CALL_CONTACT') {
          setState('success');
          setTranscript(`Llamando a ${matched.name}`);
          await callService.makeCall(matched.phoneNumber, matched.name);
          return;
        }
      } else {
        const names = pending.candidates.map(c => c.name).join(' o ');
        const clarify = `Por favor dime si es para ${names}, o di cancelar.`;
        setTranscript(`Dime: ${names}`);
        await voiceService.speakAsync(clarify);
        if (pendingDisambiguationRef.current) {
          startListening();
        }
        return;
      }
    }

    // 0.1 Manejo prioritario y local de WhatsApp sin demoras de red ni alucinaciones
    const waCommand = parseWhatsAppVoiceCommand(cleanSpoken);
    if (waCommand && waCommand.recipient) {
      const waResult = await whatsAppService.prepareMessage(waCommand.recipient, waCommand.message);
      if (waResult.multipleMatches && waResult.matches && waResult.matches.length > 1) {
        pendingDisambiguationRef.current = {
          action: 'SEND_WHATSAPP',
          contactQuery: waCommand.recipient,
          messageText: waCommand.message,
          candidates: waResult.matches,
        };
        stateRef.current = 'listening';
        setState('listening');
        setTranscript(waResult.message);
        await voiceService.speakAsync(waResult.message);
        if (pendingDisambiguationRef.current) {
          startListening();
        }
        return;
      }
      if (waResult.success) {
        setState('success');
        setTranscript(`WhatsApp preparado para ${waCommand.recipient}`);
      } else {
        setState('error');
      }
      return;
    }

    // 0.2 Manejo prioritario y local de Llamadas telefónicas directas
    const callCmd = parseCallVoiceCommand(cleanSpoken);
    if (callCmd && callCmd.contact) {
      const callResult = await callService.callByNameOrRelation(callCmd.contact);
      if (callResult.multipleMatches && callResult.matches && callResult.matches.length > 1) {
        pendingDisambiguationRef.current = {
          action: 'CALL_CONTACT',
          contactQuery: callCmd.contact,
          candidates: callResult.matches,
        };
        stateRef.current = 'listening';
        setState('listening');
        setTranscript(callResult.message);
        await voiceService.speakAsync(callResult.message);
        if (pendingDisambiguationRef.current) {
          startListening();
        }
        return;
      }
      if (callResult.success) {
        setState('success');
        setTranscript(callResult.message);
      } else {
        setState('error');
      }
      return;
    }

    // 0.3 Creación directa de Alarmas de salud
    if ((cleanSpoken.includes('alarma') || cleanSpoken.includes('recordatorio') || cleanSpoken.includes('pastilla') || cleanSpoken.includes('medicamento')) &&
        !cleanSpoken.includes('apaga') && !cleanSpoken.includes('ya tome') && !cleanSpoken.includes('ya tomé')) {
      const alarmDetails = aiService.extractAlarmDetails(spokenText);
      if (alarmDetails && alarmDetails.medication && alarmDetails.time) {
        try {
          await alarmService.addAlarm(alarmDetails.medication, alarmDetails.time, 'daily');
          const displayTime = alarmService.formatTimeForDisplay(alarmDetails.time);
          await voiceService.speak(`Alarma programada para tomar ${alarmDetails.medication} a las ${displayTime}.`);
          navigateGlobal('Alarms');
          setState('success');
          return;
        } catch {}
      }
    }

    // 1. Comandos directos de navegación y salida rápida
    if (
      cleanSpoken === 'inicio' ||
      cleanSpoken === 'ir al inicio' ||
      cleanSpoken === 'pantalla principal' ||
      cleanSpoken === 'ir a inicio' ||
      cleanSpoken === 'menú principal' ||
      cleanSpoken === 'salir' ||
      cleanSpoken === 'atrás' ||
      cleanSpoken === 'atras' ||
      cleanSpoken === 'volver'
    ) {
      navigateGlobal('Home');
      setState('success');
      await voiceService.speak('Volviendo a la pantalla principal.');
      return;
    }

    // 2. Apagar alarma de medicamento que esté sonando
    if (cleanSpoken.includes('apaga la alarma') || cleanSpoken.includes('apagar alarma') || cleanSpoken.includes('ya tome la pastilla') || cleanSpoken.includes('ya tomé la pastilla') || cleanSpoken.includes('ya tome el medicamento')) {
      await alarmService.stopAlarmAlert();
      setState('success');
      return;
    }

    // 2.1 Comandos directos de linterna
    if (cleanSpoken.includes('apaga la linterna') || cleanSpoken.includes('apagar linterna') || cleanSpoken.includes('apagar la linterna') || cleanSpoken.includes('desactiva linterna')) {
      await flashlightService.turnOff();
      setState('success');
      await voiceService.speak('Linterna apagada.');
      return;
    }
    if (cleanSpoken.includes('prende la linterna') || cleanSpoken.includes('prender linterna') || cleanSpoken.includes('prender la linterna') || cleanSpoken.includes('enciende la linterna') || cleanSpoken.includes('encender linterna') || cleanSpoken.includes('encender la linterna') || cleanSpoken.includes('activa linterna')) {
      await flashlightService.turnOn();
      setState('success');
      await voiceService.speak('Linterna encendida.');
      return;
    }

    // 2.2 Comandos directos de Radio
    if (
      cleanSpoken.includes('apaga la radio') ||
      cleanSpoken.includes('apagar la radio') ||
      cleanSpoken.includes('apagar radio') ||
      cleanSpoken.includes('apaga radio') ||
      cleanSpoken.includes('deten la radio') ||
      cleanSpoken.includes('detén la radio') ||
      cleanSpoken.includes('detener la radio') ||
      cleanSpoken.includes('detener radio') ||
      cleanSpoken.includes('cerrar radio') ||
      cleanSpoken.includes('cierra la radio')
    ) {
      await radioService.stop();
      setState('success');
      return;
    }

    if (
      cleanSpoken.includes('pausa la radio') ||
      cleanSpoken.includes('pausar la radio') ||
      cleanSpoken.includes('pausar radio') ||
      cleanSpoken.includes('pausa radio') ||
      cleanSpoken.includes('silencia la radio') ||
      cleanSpoken.includes('silenciar radio')
    ) {
      await radioService.pause();
      setState('success');
      return;
    }

    if (
      cleanSpoken.includes('reanuda la radio') ||
      cleanSpoken.includes('reanudar la radio') ||
      cleanSpoken.includes('reproduce la radio') ||
      cleanSpoken.includes('reproducir la radio') ||
      cleanSpoken.includes('pon la radio') ||
      cleanSpoken.includes('prende la radio') ||
      cleanSpoken.includes('inicia la radio') ||
      cleanSpoken.includes('activar radio') ||
      cleanSpoken.includes('activa la radio')
    ) {
      navigateGlobal('Radio');
      await radioService.play();
      setState('success');
      return;
    }

    if (
      cleanSpoken.includes('sube el volumen') ||
      cleanSpoken.includes('subir volumen') ||
      cleanSpoken.includes('más volumen') ||
      cleanSpoken.includes('mas volumen') ||
      cleanSpoken.includes('aumenta el volumen') ||
      cleanSpoken.includes('aumentar volumen')
    ) {
      await radioService.increaseVolume();
      setState('success');
      return;
    }

    if (
      cleanSpoken.includes('baja el volumen') ||
      cleanSpoken.includes('bajar volumen') ||
      cleanSpoken.includes('menos volumen') ||
      cleanSpoken.includes('disminuye el volumen') ||
      cleanSpoken.includes('disminuye volumen') ||
      cleanSpoken.includes('disminuir volumen')
    ) {
      await radioService.decreaseVolume();
      setState('success');
      return;
    }

    if (
      cleanSpoken.includes('cambia a') ||
      cleanSpoken.includes('cambiar a') ||
      cleanSpoken.includes('cambia de emisora') ||
      cleanSpoken.includes('cambiar de emisora') ||
      cleanSpoken.includes('sintoniza') ||
      cleanSpoken.includes('sintonizar') ||
      cleanSpoken.includes('pon caracol') ||
      cleanSpoken.includes('pon rcn') ||
      cleanSpoken.includes('pon olimpica') ||
      cleanSpoken.includes('pon olímpica') ||
      cleanSpoken.includes('pon besame') ||
      cleanSpoken.includes('pon bésame') ||
      cleanSpoken.includes('pon blu') ||
      cleanSpoken.includes('pon nacional') ||
      cleanSpoken.includes('radio caracol') ||
      cleanSpoken.includes('radio nacional') ||
      cleanSpoken.includes('radio rcn')
    ) {
      navigateGlobal('Radio');
      await radioService.playStationByName(cleanSpoken);
      setState('success');
      return;
    }

    if (cleanSpoken.includes('abre la radio') || cleanSpoken.includes('abrir radio') || cleanSpoken === 'radio') {
      navigateGlobal('Radio');
      setState('success');
      await voiceService.speak('Abriendo la radio.');
      return;
    }

    // 3. Comandos rápidos de Lupa
    if (cleanSpoken.includes('cierra la lupa') || cleanSpoken.includes('cerrar lupa') || cleanSpoken.includes('quitar lupa') || cleanSpoken.includes('salir de la lupa')) {
      navigateGlobal('Home');
      setState('success');
      await voiceService.speak('Lupa cerrada.');
      return;
    }

    if (cleanSpoken.includes('congela') || cleanSpoken.includes('congelar') || cleanSpoken.includes('pausa') || cleanSpoken.includes('reanuda') || cleanSpoken.includes('descongela')) {
      magnifierService.triggerFreezeToggle();
      setState('success');
      return;
    }

    if (cleanSpoken.includes('más zoom') || cleanSpoken.includes('mas zoom') || cleanSpoken.includes('acerca') || cleanSpoken.includes('aumenta el zoom') || cleanSpoken.includes('aumentar zoom') || cleanSpoken.includes('aumenta zoom') || cleanSpoken.includes('aumento')) {
      await magnifierService.increaseZoom();
      setState('success');
      return;
    }

    if (cleanSpoken.includes('menos zoom') || cleanSpoken.includes('aleja') || cleanSpoken.includes('disminuye zoom') || cleanSpoken.includes('disminuir zoom') || cleanSpoken.includes('bajar zoom')) {
      await magnifierService.decreaseZoom();
      setState('success');
      return;
    }

    // 4. Extracción con motor IA / NLU
    try {
      const intentResponse = await aiService.extractIntent(spokenText);
      const action = intentResponse.action;
      const params = intentResponse.parameters;

      if (action === 'TRIGGER_SOS') {
        navigateGlobal('SOS');
        await voiceService.speak('Abriendo auxilio.');
        setState('success');
        await sosService.triggerEmergencyProtocol();
      } else if (action === 'TURN_FLASHLIGHT_ON') {
        await flashlightService.turnOn();
        navigateGlobal('Flashlight');
        await voiceService.speak('Linterna encendida.');
        setState('success');
      } else if (action === 'TURN_FLASHLIGHT_OFF') {
        await flashlightService.turnOff();
        await voiceService.speak('Linterna apagada.');
        setState('success');
      } else if (action === 'OPEN_MAGNIFIER') {
        navigateGlobal('Magnifier');
        setState('success');
        if (params.action === 'freeze') {
          setTimeout(() => {
            magnifierService.triggerFreezeToggle();
          }, 700);
        } else {
          await voiceService.speak('Abriendo lupa digital.');
        }
      } else if (action === 'CLOSE_MAGNIFIER') {
        navigateGlobal('Home');
        setState('success');
        await voiceService.speak('Lupa cerrada.');
      } else if (action === 'ADJUST_MAGNIFIER_ZOOM') {
        const dir = params.direction || 'in';
        setState('success');
        if (dir === 'out') {
          await magnifierService.decreaseZoom();
        } else {
          await magnifierService.increaseZoom();
        }
      } else if (action === 'CALL_CONTACT') {
        const contactToCall = params.contact;
        if (contactToCall) {
          const callResult = await callService.callByNameOrRelation(contactToCall);
          if (callResult.multipleMatches && callResult.matches && callResult.matches.length > 1) {
            pendingDisambiguationRef.current = {
              action: 'CALL_CONTACT',
              contactQuery: contactToCall,
              candidates: callResult.matches,
            };
            stateRef.current = 'listening';
            setState('listening');
            setTranscript(callResult.message);
            await voiceService.speakAsync(callResult.message);
            if (pendingDisambiguationRef.current) {
              startListening();
            }
            return;
          }
          setState('success');
        } else {
          setState('error');
          await voiceService.speak('¿A quién deseas llamar? Di por ejemplo: llamar a Carlos.');
        }
      } else if (action === 'SEND_WHATSAPP') {
        const contactWa = params.contact;
        if (contactWa) {
          const msgWa = params.message || 'Hola, te escribo con SeniorAssist';
          const waResult = await whatsAppService.prepareMessage(contactWa, msgWa);
          if (waResult.multipleMatches && waResult.matches && waResult.matches.length > 1) {
            pendingDisambiguationRef.current = {
              action: 'SEND_WHATSAPP',
              contactQuery: contactWa,
              messageText: msgWa,
              candidates: waResult.matches,
            };
            stateRef.current = 'listening';
            setState('listening');
            setTranscript(waResult.message);
            await voiceService.speakAsync(waResult.message);
            if (pendingDisambiguationRef.current) {
              startListening();
            }
            return;
          }
          setState('success');
        } else {
          setState('error');
          await voiceService.speak('¿A quién deseas escribir? Di por ejemplo: mensaje a María diciéndole hola.');
        }
      } else if (action === 'CREATE_ALARM') {
        const med = params.medication;
        const timeVal = params.time;
        if (med && timeVal) {
          try {
            await alarmService.addAlarm(med, timeVal, 'daily');
            const displayTime = alarmService.formatTimeForDisplay(timeVal);
            await voiceService.speak(`Alarma programada para tomar ${med} a las ${displayTime}.`);
            navigateGlobal('Alarms');
            setState('success');
          } catch {
            navigateGlobal('Alarms');
            setState('success');
          }
        } else {
          navigateGlobal('Alarms');
          setState('success');
        }
      } else if (action === 'PLAY_RADIO') {
        const cmd = params.command || 'play';
        if (cmd === 'volume_up') {
          await radioService.increaseVolume();
          await radioService.play();
          setState('success');
        } else if (cmd === 'volume_down') {
          await radioService.decreaseVolume();
          await radioService.play();
          setState('success');
        } else {
          const stationName = params.station || 'Radio Nacional';
          navigateGlobal('Radio');
          await radioService.playStationByName(stationName);
          setState('success');
        }
      } else if (action === 'STOP_RADIO') {
        await radioService.stop();
        await voiceService.speak('Radio apagada.');
        setState('success');
      } else if (action === 'OPEN_LESSON') {
        navigateGlobal('Learning');
        setState('success');
      } else {
        setState('error');
        const errNotice = intentResponse.spoken_response || 'No logré reconocer la orden.';
        await voiceService.speak(errNotice);
      }
    } catch (e) {
      console.warn('Error procesando voz en asistente global:', e);
      setState('error');
    } finally {
      // Si hay una desambiguación activa esperando respuesta del usuario, NO tocar el estado ni borrar transcript!
      if (pendingDisambiguationRef.current) {
        return;
      }
      if (handsFreeRestartTimer.current) clearTimeout(handsFreeRestartTimer.current);
      handsFreeRestartTimer.current = setTimeout(() => {
        if (pendingDisambiguationRef.current) return;
        stateRef.current = 'idle';
        setState('idle');
        setTranscript('');
        if (isHandsFreeRef.current) {
          startWakeWordRef.current();
        }
      }, 3000);
    }
  }, [clearSilenceTimer]);

  /**
   * Inicia la captura del micrófono de forma activa
   */
  const startListening = useCallback(async () => {
    try {
      clearSilenceTimer();
      voiceService.stopSpeaking();

      // Si la radio está sonando o sintonizando, pausarla para no saturar el micrófono
      if (radioService.getStatus() === 'playing' || radioService.getStatus() === 'loading') {
        try {
          await radioService.pause();
        } catch {}
      }

      stateRef.current = 'listening';
      setState('listening');
      setTranscript('Escuchando tu orden...');
      recognizedRef.current = '';
      setRecognizedVoiceText('');
      lastAudioActivityRef.current = Date.now();

      await voiceService.startListening(
        (text: string, isFinal?: boolean) => {
          lastAudioActivityRef.current = Date.now();
          recognizedRef.current = text;
          setRecognizedVoiceText(text);
          setTranscript(`"${text}"`);

          clearSilenceTimer();

          // Fin de frase detectado
          if (isFinal && text.trim().length > 0) {
            clearSilenceTimer();
            voiceService.stopListening();
            processVoiceInput(text.trim());
            return;
          }

          // Detección por pausa de 1.3s
          if (text.trim().length > 0) {
            clearSilenceTimer();
            silenceTimerRef.current = setTimeout(() => {
              const phrase = recognizedRef.current.trim();
              if (phrase) {
                clearSilenceTimer();
                voiceService.stopListening();
                processVoiceInput(phrase);
              }
            }, 1300);
          }
        },
        (err) => {
          clearSilenceTimer();
          // Si hay una desambiguación en curso, darle tiempo al adulto mayor para responder sin cancelar abruptamente
          if (pendingDisambiguationRef.current) {
            setTimeout(() => {
              if (pendingDisambiguationRef.current) {
                startListening();
              }
            }, 600);
            return;
          }
          stateRef.current = 'idle';
          setState('idle');
          setTranscript('');
          if (isHandsFreeRef.current) {
            if (handsFreeRestartTimer.current) clearTimeout(handsFreeRestartTimer.current);
            handsFreeRestartTimer.current = setTimeout(() => {
              if (isHandsFreeRef.current && stateRef.current === 'idle') {
                startWakeWordRef.current();
              }
            }, 600);
          }
        }
      );
    } catch (err) {
      clearSilenceTimer();
      if (pendingDisambiguationRef.current) {
        setTimeout(() => {
          if (pendingDisambiguationRef.current) {
            startListening();
          }
        }, 600);
        return;
      }
      stateRef.current = 'idle';
      setState('idle');
      setTranscript('');
      if (isHandsFreeRef.current) {
        if (handsFreeRestartTimer.current) clearTimeout(handsFreeRestartTimer.current);
        handsFreeRestartTimer.current = setTimeout(() => {
          if (isHandsFreeRef.current && stateRef.current === 'idle') {
            startWakeWordRef.current();
          }
        }, 600);
      }
    }
  }, [clearSilenceTimer, processVoiceInput]);

  /**
   * Detiene la captura manual
   */
  const stopListening = useCallback(() => {
    clearSilenceTimer();
    try {
      if (state !== 'listening') return;
      voiceService.stopListening();

      setTimeout(async () => {
        const command = (recognizedRef.current || recognizedVoiceText).trim();
        if (command) {
          await processVoiceInput(command);
        } else {
          stateRef.current = 'idle';
          setState('idle');
          setTranscript('');
          await voiceService.speak('No logré escucharte. Di "Asistente" para volver a intentar.');
          if (isHandsFreeRef.current) {
            startWakeWordRef.current();
          }
        }
      }, 250);
    } catch {
      stateRef.current = 'idle';
      setState('idle');
      setTranscript('');
    }
  }, [state, recognizedVoiceText, processVoiceInput, clearSilenceTimer]);

  /**
   * Reinicia de forma limpia el estado del asistente a idle y reactiva la escucha de "Asistente"
   */
  const resetToIdleAndListen = useCallback(() => {
    clearSilenceTimer();
    voiceService.stopSpeaking();
    if (handsFreeRestartTimer.current) {
      clearTimeout(handsFreeRestartTimer.current);
      handsFreeRestartTimer.current = null;
    }
    stateRef.current = 'idle';
    setState('idle');
    setTranscript('');
    if (isHandsFreeRef.current) {
      setTimeout(() => {
        if (isHandsFreeRef.current && stateRef.current === 'idle') {
          startWakeWordRef.current();
        }
      }, 250);
    }
  }, [clearSilenceTimer]);

  /**
   * Bucle global para detectar la palabra clave "Asistente" en cualquier módulo
   */
  const startWakeWordListening = useCallback(async () => {
    if (!isHandsFreeRef.current) return;
    if (stateRef.current === 'processing' || stateRef.current === 'listening') return;

    try {
      await voiceService.startListening(
        async (text: string, isFinal?: boolean) => {
          lastAudioActivityRef.current = Date.now();
          const lower = text.toLowerCase().trim();

          // Detección de la palabra clave Asistente y variaciones fonéticas comunes
          const isWakeWord =
            /\b(asistente|asistenta|asistentes|asistencia|asiste|asisteme)\b/i.test(lower) ||
            lower.includes('asistente') ||
            lower.includes('asistenta') ||
            lower.includes('asistentes') ||
            lower.includes('asistencia') ||
            lower.includes('asiste');

          if (isWakeWord) {
            voiceService.stopSpeaking();
            await voiceService.cancelListening();

            // Si la radio estuviese activa o cargando, pausarla de inmediato
            if (radioService.getStatus() === 'playing' || radioService.getStatus() === 'loading') {
              try {
                await radioService.pause();
              } catch {}
            }

            if (Platform.OS !== 'web') {
              try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              } catch {}
            }

            const parts = lower.split(/asistente|asistenta|asistentes|asistencia|asiste|asisteme/i);
            const remainder = (parts[parts.length - 1] || '').trim();

            if (remainder.length >= 3) {
              await processVoiceInput(remainder);
            } else {
              stateRef.current = 'listening';
              setState('listening');
              setTranscript('¿En qué te puedo ayudar?');
              setTimeout(() => {
                startListening();
              }, 120);
            }
            return;
          }

          // Si terminó de hablar pero no dijo asistente, reiniciar escucha pasiva
          if (isFinal && isHandsFreeRef.current) {
            voiceService.stopListening();
            if (handsFreeRestartTimer.current) clearTimeout(handsFreeRestartTimer.current);
            handsFreeRestartTimer.current = setTimeout(() => {
              if (isHandsFreeRef.current && stateRef.current === 'idle') {
                startWakeWordListening();
              }
            }, 400);
          }
        },
        (err) => {
          if (isHandsFreeRef.current) {
            if (handsFreeRestartTimer.current) clearTimeout(handsFreeRestartTimer.current);
            handsFreeRestartTimer.current = setTimeout(() => {
              if (isHandsFreeRef.current && stateRef.current === 'idle') {
                startWakeWordListening();
              }
            }, 600);
          }
        }
      );
    } catch (e) {
      console.warn('Error en bucle global startWakeWordListening:', e);
    }
  }, [processVoiceInput, startListening]);

  useEffect(() => {
    startWakeWordRef.current = startWakeWordListening;
  }, [startWakeWordListening]);

  /**
   * Conmutador global de modo Manos Libres
   */
  const toggleHandsFree = useCallback(async () => {
    const next = !isHandsFree;
    setIsHandsFree(next);
    isHandsFreeRef.current = next;

    if (handsFreeRestartTimer.current) {
      clearTimeout(handsFreeRestartTimer.current);
      handsFreeRestartTimer.current = null;
    }

    if (next) {
      await voiceService.speak('Modo manos libres activado. Di: "Asistente" en cualquier momento.');
      setTimeout(() => {
        if (isHandsFreeRef.current && stateRef.current === 'idle') {
          startWakeWordListening();
        }
      }, 2000);
    } else {
      voiceService.stopListening();
      await voiceService.speak('Modo manos libres desactivado.');
    }
  }, [isHandsFree, startWakeWordListening]);

  // Coordinar con la radio: mantener la alerta para escuchar "Asistente" en cualquier estado de reproducción
  useEffect(() => {
    const unsubRadio = radioService.addListener(() => {
      if (isHandsFreeRef.current && stateRef.current === 'idle') {
        if (handsFreeRestartTimer.current) {
          clearTimeout(handsFreeRestartTimer.current);
          handsFreeRestartTimer.current = null;
        }
        handsFreeRestartTimer.current = setTimeout(() => {
          if (isHandsFreeRef.current && stateRef.current === 'idle') {
            startWakeWordListening();
          }
        }, 350);
      }
    });

    return () => {
      unsubRadio();
    };
  }, [startWakeWordListening]);

  // Iniciar automáticamente la escucha global al montar la aplicación
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isHandsFreeRef.current) {
      timer = setTimeout(() => {
        if (isHandsFreeRef.current && stateRef.current === 'idle') {
          startWakeWordListening();
        }
      }, 800);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (handsFreeRestartTimer.current) clearTimeout(handsFreeRestartTimer.current);
      voiceService.stopListening();
    };
  }, [startWakeWordListening]);

  // Watchdog de supervisión continua: garantiza que la escucha de "Asistente" nunca quede inactiva
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (!isHandsFreeRef.current) return;
      if (stateRef.current !== 'idle') return;
      if (pendingDisambiguationRef.current) return;

      const isVoiceListening = voiceService.getIsListening();
      const timeSinceLastActivity = Date.now() - lastAudioActivityRef.current;

      // Si el servicio nativo no está escuchando o si pasaron más de 12 segundos sin respuesta de voz
      if (!isVoiceListening || timeSinceLastActivity > 12000) {
        lastAudioActivityRef.current = Date.now();
        if (isVoiceListening) {
          voiceService.stopListening();
        }
        startWakeWordRef.current();
      }
    }, 3500);

    return () => {
      clearInterval(watchdog);
    };
  }, []);

  return (
    <GlobalVoiceAssistantContext.Provider
      value={{
        state,
        transcript,
        isHandsFree,
        toggleHandsFree,
        startListening,
        stopListening,
        resetToIdleAndListen,
      }}
    >
      {children}

      {/* Indicador flotante accesible en pantalla cuando el asistente está activo */}
      {(state === 'listening' || state === 'processing') && (
        <View style={styles.floatingBanner} pointerEvents="none">
          <AccessibleText variant="bodyLarge" weight="heavy" color="#FFFFFF" align="center">
            {state === 'listening' ? '🎙️ Asistente escuchando tu orden...' : '⏳ Procesando orden...'}
          </AccessibleText>
          {transcript ? (
            <AccessibleText variant="caption" weight="bold" color="#FEF08A" align="center" style={{ marginTop: 2 }}>
              {transcript}
            </AccessibleText>
          ) : null}
        </View>
      )}
    </GlobalVoiceAssistantContext.Provider>
  );
};

export const useGlobalVoiceAssistant = () => {
  const context = useContext(GlobalVoiceAssistantContext);
  if (!context) {
    throw new Error('useGlobalVoiceAssistant debe usarse dentro de GlobalVoiceAssistantProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  floatingBanner: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 44 : 54,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
    borderWidth: 3,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
});
