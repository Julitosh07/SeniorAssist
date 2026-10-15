import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const ASSISTANT_CHANNEL_ID = 'seniorassist-assistant';
const ASSISTANT_NOTIFICATION_ID = 'seniorassist-persistent-assistant';

type AutoListenCallback = () => void;

export class BackgroundAssistantService {
  private static instance: BackgroundAssistantService;
  private autoListenCallbacks: Set<AutoListenCallback> = new Set();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): BackgroundAssistantService {
    if (!BackgroundAssistantService.instance) {
      BackgroundAssistantService.instance = new BackgroundAssistantService();
    }
    return BackgroundAssistantService.instance;
  }

  /**
   * Registra un callback para iniciar escucha automática de voz
   */
  public onAutoListen(callback: AutoListenCallback): () => void {
    this.autoListenCallbacks.add(callback);
    return () => {
      this.autoListenCallbacks.delete(callback);
    };
  }

  /**
   * Dispara los callbacks de escucha automática
   */
  public triggerAutoListen(): void {
    this.autoListenCallbacks.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.warn('Error en callback autoListen:', err);
      }
    });
  }

  /**
   * Configura la notificación permanente de acceso rápido al asistente
   */
  public async setupPersistentAssistant(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(ASSISTANT_CHANNEL_ID, {
          name: 'Asistente de Voz SeniorAssist',
          importance: Notifications.AndroidImportance.MAX,
          sound: undefined,
          enableVibrate: false,
          showBadge: false,
          bypassDnd: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }

      // Presentar la notificación persistente accesible
      await Notifications.scheduleNotificationAsync({
        identifier: ASSISTANT_NOTIFICATION_ID,
        content: {
          title: '🎙️ SeniorAssist: Manos Libres Activo',
          body: 'Di "Asistente" en cualquier momento para dar una orden',
          data: { persistentService: true },
          sticky: true,
          autoDismiss: false,
          sound: false,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });

      if (!this.isInitialized) {
        this.isInitialized = true;
      }
    } catch (err) {
      console.warn('Error configurando notificación persistente del asistente:', err);
    }
  }
}

export const backgroundAssistantService = BackgroundAssistantService.getInstance();
