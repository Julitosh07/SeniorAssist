/**
 * Lista blanca estricta de acciones permitidas para el Asistente por Voz.
 * Cualquier intención fuera de esta lista debe ser rechazada de inmediato.
 */
export const ALLOWED_ACTIONS = [
  'CALL_CONTACT',
  'SEND_WHATSAPP',
  'CREATE_ALARM',
  'TRIGGER_SOS',
  'TURN_FLASHLIGHT_ON',
  'TURN_FLASHLIGHT_OFF',
  'OPEN_MAGNIFIER',
  'CLOSE_MAGNIFIER',
  'ADJUST_MAGNIFIER_ZOOM',
  'PLAY_RADIO',
  'STOP_RADIO',
  'OPEN_LESSON',
] as const;

export type AllowedActionType = typeof ALLOWED_ACTIONS[number];

export function isActionAllowed(action: string): action is AllowedActionType {
  return (ALLOWED_ACTIONS as readonly string[]).includes(action);
}

export const ACTION_DESCRIPTIONS: Record<AllowedActionType, string> = {
  CALL_CONTACT: 'Llamar a un contacto',
  SEND_WHATSAPP: 'Enviar un mensaje por WhatsApp',
  CREATE_ALARM: 'Crear recordatorio de medicamento',
  TRIGGER_SOS: 'Activar alerta de emergencia SOS',
  TURN_FLASHLIGHT_ON: 'Encender la linterna',
  TURN_FLASHLIGHT_OFF: 'Apagar la linterna',
  OPEN_MAGNIFIER: 'Abrir la lupa digital',
  CLOSE_MAGNIFIER: 'Cerrar la lupa digital',
  ADJUST_MAGNIFIER_ZOOM: 'Ajustar aumento de la lupa',
  PLAY_RADIO: 'Reproducir emisora de radio',
  STOP_RADIO: 'Detener o pausar la radio',
  OPEN_LESSON: 'Abrir lección del tutor',
};
