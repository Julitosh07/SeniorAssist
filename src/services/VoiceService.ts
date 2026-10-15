import * as Speech from 'expo-speech';
import { Platform, PermissionsAndroid } from 'react-native';
import { SeniorSpeechModule } from '../native/SeniorSpeechModule';

export class VoiceService {
  private static instance: VoiceService;
  private recognitionInstance: any = null;
  private isListening: boolean = false;
  private nativeSubscriptions: Array<{ remove: () => void }> = [];
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;

  private constructor() {}

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Reproduce una confirmación por voz para el adulto mayor (Text-to-Speech)
   */
  public async speak(text: string, force: boolean = false): Promise<void> {
    if (!text || !text.trim()) return;
    const now = Date.now();

    // Antirrebote de voz: si es el mismo texto y pasaron menos de 900ms, evitar hablar dos veces
    if (!force && text === this.lastSpokenText && (now - this.lastSpokenTime < 900)) {
      return;
    }
    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    try {
      Speech.stop();
      await Speech.speak(text, {
        language: 'es-ES',
        pitch: 1.0,
        rate: 0.85, // Ritmo pausado y claro para adultos mayores
      });
    } catch (err) {
      console.warn('Error al reproducir voz TTS:', err);
    }
  }

  /**
   * Reproduce una locución por voz y espera asíncronamente a que termine de hablar antes de resolver
   */
  public speakAsync(text: string): Promise<void> {
    if (!text || !text.trim()) return Promise.resolve();
    const now = Date.now();
    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    return new Promise<void>((resolve) => {
      let resolved = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      // Tiempo límite de seguridad basado en la cantidad de palabras
      const fallbackMs = Math.max(1800, (text.length / 10) * 1000);
      const timer = setTimeout(safeResolve, fallbackMs);

      try {
        Speech.stop();
        Speech.speak(text, {
          language: 'es-ES',
          pitch: 1.0,
          rate: 0.85,
          onDone: () => {
            clearTimeout(timer);
            safeResolve();
          },
          onError: () => {
            clearTimeout(timer);
            safeResolve();
          },
          onStopped: () => {
            clearTimeout(timer);
            safeResolve();
          },
        });
      } catch (err) {
        clearTimeout(timer);
        safeResolve();
      }
    });
  }

  /**
   * Detiene de inmediato cualquier locución en curso sin retardo
   */
  public stopSpeaking(): void {
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
    try {
      Speech.stop();
    } catch (err) {
      console.warn('Error al detener TTS:', err);
    }
  }

  /**
   * Solicita permisos de micrófono para reconocimiento de voz nativo
   */
  public async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    // 1. Android nativo: solicitar permiso explícito del sistema operativo
    if (Platform.OS === 'android') {
      try {
        const hasAudio = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (hasAudio) {
          return true;
        }
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permiso de Micrófono',
            message: 'SeniorAssist necesita acceso a tu micrófono para que puedas hablar y dar órdenes por voz.',
            buttonPositive: 'Permitir',
            buttonNegative: 'Cancelar',
          }
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Error solicitando permisos con PermissionsAndroid:', err);
        return true;
      }
    }

    return true;
  }

  /**
   * Inicia el reconocimiento de voz por micrófono (Speech-to-Text)
   */
  public async startListening(
    onResult: (text: string, isFinal?: boolean) => void,
    onError?: (err: any) => void
  ): Promise<boolean> {
    // Silenciar cualquier voz en curso de inmediato para no hacer eco en el micrófono
    this.stopSpeaking();

    // Si ya estaba escuchando (ej: bucle manos libres previo), cancelar limpiamente para enlazar los nuevos callbacks
    if (this.isListening) {
      await this.cancelListening();
      // Pequeña pausa de 80ms para que el hardware de AudioRecord en Android libere el buffer
      await new Promise(res => setTimeout(res, 80));
    }

    // Limpiar suscripciones nativas previas
    this.cleanupNativeListeners();

    // 1. Android Nativo Robusto con SeniorSpeechModule (SpeechRecognizer oficial sin bloqueos)
    if (Platform.OS === 'android') {
      try {
        const hasPerm = await this.requestPermissions();
        if (!hasPerm) {
          if (onError) onError('Permiso de micrófono denegado por el usuario');
          return false;
        }

        const subPartial = SeniorSpeechModule.onPartialResult((data) => {
          try {
            if (data?.text) {
              onResult(data.text, false);
            }
          } catch (e) {
            console.warn('Error en callback parcial:', e);
          }
        });

        const subResult = SeniorSpeechModule.onResult((data) => {
          try {
            if (data?.text) {
              onResult(data.text, true);
            }
          } catch (e) {
            console.warn('Error en callback final:', e);
          }
        });

        const subError = SeniorSpeechModule.onError((errorMsg) => {
          console.warn('Error en SeniorSpeechModule:', errorMsg);
          this.isListening = false;
          if (onError) onError(errorMsg);
        });

        const subEnd = SeniorSpeechModule.onEnd(() => {
          this.isListening = false;
        });

        if (subPartial) this.nativeSubscriptions.push(subPartial);
        if (subResult) this.nativeSubscriptions.push(subResult);
        if (subError) this.nativeSubscriptions.push(subError);
        if (subEnd) this.nativeSubscriptions.push(subEnd);

        const started = await SeniorSpeechModule.startListening();
        this.isListening = started;
        return started;
      } catch (err) {
        console.warn('Error iniciando SeniorSpeechModule:', err);
        this.isListening = false;
        if (onError) onError(err);
        return false;
      }
    }

    // 2. Soporte Web Speech API (Navegadores móviles y de escritorio)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'es-ES';
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }

            const currentText = finalTranscript || interimTranscript;
            if (currentText) {
              onResult(currentText, !!finalTranscript);
            }
          };

          recognition.onerror = (event: any) => {
            console.warn('Error en SpeechRecognition web:', event.error);
            this.isListening = false;
            if (onError) onError(event.error);
          };

          recognition.onend = () => {
            this.isListening = false;
          };

          recognition.start();
          this.recognitionInstance = recognition;
          this.isListening = true;
          return true;
        } catch (e) {
          console.warn('No fue posible iniciar SpeechRecognition web:', e);
        }
      }
    }

    this.isListening = true;
    return false;
  }

  private cleanupNativeListeners(): void {
    for (const sub of this.nativeSubscriptions) {
      try {
        sub.remove();
      } catch {}
    }
    this.nativeSubscriptions = [];
  }

  /**
   * Detiene la captura de voz del micrófono
   */
  public stopListening(): void {
    if (Platform.OS === 'android') {
      try {
        SeniorSpeechModule.stopListening();
      } catch (err) {
        console.warn('Error in SeniorSpeechModule.stopListening():', err);
      }
    }

    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch {}
      this.recognitionInstance = null;
    }

    this.cleanupNativeListeners();
    this.isListening = false;
  }

  /**
   * Cancela de inmediato la captura y libera el hardware de micrófono sin esperar eventos
   */
  public async cancelListening(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await SeniorSpeechModule.cancelListening();
      } catch (err) {
        console.warn('Error in SeniorSpeechModule.cancelListening():', err);
      }
    }

    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.abort?.() || this.recognitionInstance.stop?.();
      } catch {}
      this.recognitionInstance = null;
    }

    this.cleanupNativeListeners();
    this.isListening = false;
  }
}

export const voiceService = VoiceService.getInstance();
