import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { alarmRepository } from '../repositories/AlarmRepository';
import { MedicationAlarm } from '../models';
import { voiceService } from './VoiceService';
import { SeniorSpeechModule } from '../native/SeniorSpeechModule';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export class AlarmService {
  private static instance: AlarmService;
  private notificationIds: Record<string, string> = {};
  private alarmListeners: Array<(medicationName: string) => void> = [];
  private isAlarmRinging: boolean = false;
  private activeTicker: any = null;
  private lastTriggeredMinute: string = '';

  private constructor() {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    this.lastTriggeredMinute = `${hh}:${mm}`;

    this.setupNotificationChannel();
    this.startActiveAlarmTicker();
  }

  public static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  private async setupNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('medication-alarms', {
          name: 'Recordatorios de Medicamentos',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 500, 500],
          sound: 'default',
          enableVibrate: true,
          bypassDnd: true,
        });
      } catch {}
    }

    if (Platform.OS !== 'web') {
      try {
        // Escuchar exclusivamente notificaciones de medicamentos, nunca la permanente del asistente
        Notifications.addNotificationReceivedListener((notification) => {
          const data = notification.request.content.data;
          if (data && data.isMedicationAlarm && data.medicationName) {
            this.triggerAlarmAlert(String(data.medicationName));
          }
        });

        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          if (data && data.isMedicationAlarm && data.medicationName) {
            this.triggerAlarmAlert(String(data.medicationName));
          }
        });
      } catch (err) {
        console.warn('Error configurando listeners de notificaciones:', err);
      }
    }
  }

  /**
   * Monitor activo para cuando la app está en primer plano: dispara al minuto exacto
   */
  private startActiveAlarmTicker(): void {
    if (this.activeTicker) return;
    this.activeTicker = setInterval(async () => {
      try {
        const now = new Date();
        const hh = now.getHours().toString().padStart(2, '0');
        const mm = now.getMinutes().toString().padStart(2, '0');
        const currentMinute = `${hh}:${mm}`;

        if (currentMinute === this.lastTriggeredMinute) return;

        const alarms = await alarmRepository.getAllAlarms();
        const matchingAlarm = alarms.find(a => a.isActive && a.time === currentMinute);

        if (matchingAlarm) {
          this.lastTriggeredMinute = currentMinute;
          await this.triggerAlarmAlert(matchingAlarm.medicationName);
        }
      } catch {}
    }, 15000);
  }

  /**
   * Suscripción a eventos de disparo de alarma para mostrar modal o banner en pantalla
   */
  public onAlarmTriggered(listener: (medicationName: string) => void): () => void {
    this.alarmListeners.push(listener);
    return () => {
      this.alarmListeners = this.alarmListeners.filter(l => l !== listener);
    };
  }

  /**
   * Dispara la alarma sonora de sistema y el anuncio hablado
   */
  public async triggerAlarmAlert(medicationName: string): Promise<void> {
    this.isAlarmRinging = true;

    // 1. Notificar a la interfaz para desplegar el modal de alarma táctil
    for (const listener of this.alarmListeners) {
      try {
        listener(medicationName);
      } catch {}
    }

    // 2. Disparar tono de alarma del sistema (RingtoneManager.TYPE_ALARM)
    try {
      if (Platform.OS === 'android') {
        await SeniorSpeechModule.playSystemAlarm();
      }
    } catch (e) {
      console.warn('Error reproduciendo alarma nativa:', e);
    }

    // 3. Reproducir anuncio por voz de alta prioridad
    const alertText = `¡Atención! Es momento de tomar tu medicamento: ${medicationName}. Recuerda tomarlo con agua.`;
    try {
      await voiceService.speak(alertText, true);
    } catch {}
  }

  /**
   * Detiene la alarma sonora, la voz y el ringtone del sistema
   */
  public async stopAlarmAlert(): Promise<void> {
    this.isAlarmRinging = false;

    if (Platform.OS === 'android') {
      try {
        await SeniorSpeechModule.stopSystemAlarm();
      } catch {}
    }

    voiceService.stopSpeaking();
    await voiceService.speak('Alarma apagada. Recuerda tomar tu medicina con agua.');
  }

  public isRinging(): boolean {
    return this.isAlarmRinging;
  }

  /**
   * Obtiene la lista de alarmas activas
   */
  public async getAlarms(): Promise<MedicationAlarm[]> {
    return alarmRepository.getAllAlarms();
  }

  /**
   * Prueba el sonido de la alarma de inmediato para que el adulto mayor lo escuche
   */
  public async testAlarmSound(medicationName: string): Promise<void> {
    if (Platform.OS !== 'web') {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ ¡HORA DE TU MEDICAMENTO!',
            body: `Es momento de tomar: ${medicationName}. Recuerda tomarlo con agua.`,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.MAX,
            channelId: 'medication-alarms',
            vibrate: [0, 500, 500, 500],
            data: { isMedicationAlarm: true, medicationName },
          } as any,
          trigger: null, // Inmediato
        });
      } catch (err) {
        console.warn('Error al disparar notificación de prueba:', err);
      }
    }

    await this.triggerAlarmAlert(medicationName);
  }

  /**
   * Programa una notificación en segundo plano
   */
  private async scheduleBackgroundNotification(alarmId: string, medicationName: string, time: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const [hoursStr, minutesStr] = time.split(':');
      const hour = parseInt(hoursStr, 10);
      const minute = parseInt(minutesStr, 10);

      // Cancelar notificación previa si existía
      if (this.notificationIds[alarmId]) {
        await Notifications.cancelScheduledNotificationAsync(this.notificationIds[alarmId]);
      }

      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ ¡HORA DE TU MEDICAMENTO!',
          body: `Es momento de tomar: ${medicationName}. Recuerda tomarlo con agua.`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          channelId: 'medication-alarms',
          vibrate: [0, 500, 500, 500],
          data: { isMedicationAlarm: true, medicationName },
        } as any,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'medication-alarms',
        },
      });

      this.notificationIds[alarmId] = notifId;
    } catch (e) {
      console.warn('Error programando alarma nativa:', e);
    }
  }

  /**
   * Crea una alarma e informa por voz al adulto mayor
   */
  public async addAlarm(medicationName: string, time: string, frequency: 'daily' | 'specific_days' = 'daily'): Promise<MedicationAlarm> {
    const newAlarm = await alarmRepository.createAlarm({
      medicationId: `med-${Date.now()}`,
      medicationName,
      time,
      frequency,
      isActive: true,
    });

    await this.scheduleBackgroundNotification(newAlarm.id, medicationName, time);

    const displayTime = this.formatTimeForDisplay(time);
    await voiceService.speak(`Recordatorio guardado para tomar ${medicationName} a las ${displayTime}.`);
    return newAlarm;
  }

  /**
   * Actualiza una alarma existente
   */
  public async updateAlarm(alarm: MedicationAlarm): Promise<void> {
    await alarmRepository.updateAlarm(alarm);
    if (alarm.isActive) {
      await this.scheduleBackgroundNotification(alarm.id, alarm.medicationName, alarm.time);
    } else if (this.notificationIds[alarm.id]) {
      await Notifications.cancelScheduledNotificationAsync(this.notificationIds[alarm.id]);
    }
    const displayTime = this.formatTimeForDisplay(alarm.time);
    await voiceService.speak(`Alarma actualizada para ${alarm.medicationName} a las ${displayTime}.`);
  }

  /**
   * Alterna el estado de una alarma con confirmación auditiva
   */
  public async toggleAlarmState(alarm: MedicationAlarm): Promise<void> {
    const nextState = !alarm.isActive;
    alarm.isActive = nextState;
    await alarmRepository.toggleAlarm(alarm.id, nextState);
    if (nextState) {
      await this.scheduleBackgroundNotification(alarm.id, alarm.medicationName, alarm.time);
    } else if (this.notificationIds[alarm.id]) {
      await Notifications.cancelScheduledNotificationAsync(this.notificationIds[alarm.id]);
    }
    const statusMsg = nextState ? 'activada' : 'desactivada';
    await voiceService.speak(`Alarma de ${alarm.medicationName} ${statusMsg}.`);
  }

  /**
   * Elimina una alarma con confirmación auditiva
   */
  public async removeAlarm(alarm: MedicationAlarm): Promise<void> {
    if (this.notificationIds[alarm.id]) {
      try {
        await Notifications.cancelScheduledNotificationAsync(this.notificationIds[alarm.id]);
      } catch {}
      delete this.notificationIds[alarm.id];
    }
    await alarmRepository.deleteAlarm(alarm.id);
    await voiceService.speak(`Recordatorio de ${alarm.medicationName} eliminado.`);
  }

  /**
   * Convierte 12h (1..12), minutos y AM/PM a 24h ('HH:MM')
   */
  public convert12To24(hour12: number, minutes: string, period: 'AM' | 'PM'): string {
    let hour24 = hour12 % 12;
    if (period === 'PM') {
      hour24 += 12;
    }
    const hourStr = hour24 < 10 ? `0${hour24}` : `${hour24}`;
    return `${hourStr}:${minutes}`;
  }

  /**
   * Convierte 24h ('HH:MM') a componentes de 12h
   */
  public convert24To12(time24: string): { hour: number; minute: string; period: 'AM' | 'PM' } {
    const [hStr, mStr] = time24.split(':');
    const h24 = parseInt(hStr, 10);
    const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    let hour12 = h24 % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour: hour12, minute: mStr || '00', period };
  }

  /**
   * Formatea la hora en formato legible para adultos mayores (12 horas am/pm)
   */
  public formatTimeForDisplay(time24: string): string {
    const { hour, minute, period } = this.convert24To12(time24);
    const formattedHours = hour < 10 ? `0${hour}` : `${hour}`;
    return `${formattedHours}:${minute} ${period}`;
  }
}

export const alarmService = AlarmService.getInstance();
