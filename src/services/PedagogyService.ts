import { PedagogyProfile, LearningEvent } from '../models';
import { authService } from './AuthService';
import { voiceService } from './VoiceService';

export class PedagogyService {
  private static instance: PedagogyService;
  private currentProfile: PedagogyProfile = {
    difficultyRecommended: 'normal',
    speechRate: 0.82,
    showInstantHints: false,
    feedbackMessage: '¡Muy bien! Vamos a practicar con calma.',
    encouragementText: 'Aprender algo nuevo requiere tiempo. Lo estás haciendo excelente.',
  };

  private constructor() {}

  public static getInstance(): PedagogyService {
    if (!PedagogyService.instance) {
      PedagogyService.instance = new PedagogyService();
    }
    return PedagogyService.instance;
  }

  public getProfile(): PedagogyProfile {
    return { ...this.currentProfile };
  }

  /**
   * Analiza el desempeño del usuario adaptando la velocidad de voz y asistencia
   */
  public async analyzeSession(
    lessonId: string,
    attempts: number,
    errors: number,
    hintsRequested: number,
    totalTimeSeconds: number,
    lastStep: number
  ): Promise<PedagogyProfile> {
    try {
      const authHeader = await authService.getAuthHeader();
      const response = await fetch('http://localhost:8000/learning/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          attempts,
          errors,
          hints_requested: hintsRequested,
          total_time_seconds: totalTimeSeconds,
          last_step: lastStep,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.currentProfile = {
          difficultyRecommended: data.difficulty_recommended,
          speechRate: data.speech_rate,
          showInstantHints: data.show_instant_hints,
          feedbackMessage: data.feedback_message,
          encouragementText: data.encouragement_text,
        };
        return this.currentProfile;
      }
    } catch {
      // Fallback offline autónomo si el backend no está disponible
    }

    // Heurística pedagógica local (offline)
    if (errors >= 2 || hintsRequested >= 2 || totalTimeSeconds > 45) {
      this.currentProfile = {
        difficultyRecommended: 'easy',
        speechRate: 0.75, // Voz más pausada
        showInstantHints: true,
        feedbackMessage: 'Vamos con calma. Tómate todo el tiempo que necesites, lo estás haciendo muy bien.',
        encouragementText: 'No te preocupes por equivocarte, cada paso te ayuda a aprender.',
      };
    } else if (errors === 0 && hintsRequested === 0 && totalTimeSeconds < 25) {
      this.currentProfile = {
        difficultyRecommended: 'challenging',
        speechRate: 0.88,
        showInstantHints: false,
        feedbackMessage: '¡Excelente destreza! Dominas esta función con mucha seguridad.',
        encouragementText: '¡Felicitaciones por tu rapidez y autonomía!',
      };
    } else {
      this.currentProfile = {
        difficultyRecommended: 'normal',
        speechRate: 0.82,
        showInstantHints: false,
        feedbackMessage: '¡Muy buen avance! Cada paso te acerca a comunicarte con más confianza.',
        encouragementText: 'Continúa practicando a tu propio ritmo con tranquilidad.',
      };
    }

    return this.currentProfile;
  }

  /**
   * Reproduce voz con la velocidad adaptativa calculada por la IA
   */
  public async speakAdaptive(text: string): Promise<void> {
    await voiceService.speak(text);
  }

  /**
   * Sincroniza eventos de telemetría de aprendizaje al backend
   */
  public async syncEvents(events: LearningEvent[]): Promise<void> {
    if (!events || events.length === 0) return;
    try {
      const authHeader = await authService.getAuthHeader();
      await fetch('http://localhost:8000/learning/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          events: events.map(e => ({
            id: e.id,
            lesson_id: e.lessonId,
            step_index: e.stepIndex,
            event_type: e.eventType,
            time_spent_seconds: e.timeSpentSeconds,
            error_details: e.errorDetails,
          })),
        }),
      });
    } catch {
      // Registro silencioso en offline; los eventos ya están persistidos en SQLite local
    }
  }
}

export const pedagogyService = PedagogyService.getInstance();
