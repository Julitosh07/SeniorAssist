import { getDatabase } from '../storage/database';
import { Lesson, LearningProgress, SimulatorStep } from '../models';

export interface LessonWithProgress extends Lesson {
  progress?: LearningProgress;
}

export class LearningRepository {
  private static instance: LearningRepository;

  private constructor() {}

  public static getInstance(): LearningRepository {
    if (!LearningRepository.instance) {
      LearningRepository.instance = new LearningRepository();
    }
    return LearningRepository.instance;
  }

  public async getAllLessons(): Promise<LessonWithProgress[]> {
    const db = await getDatabase();
    let lessons = await db.getAllAsync<any>('SELECT * FROM lessons ORDER BY order_index ASC');

    if (lessons.length < 6) {
      await this.seedInitialLessons();
      lessons = await db.getAllAsync<any>('SELECT * FROM lessons ORDER BY order_index ASC');
    }

    const progressList = await db.getAllAsync<any>('SELECT * FROM learning_progress');

    return lessons.map(l => {
      const p = progressList.find(prog => prog.lesson_id === l.id);
      return {
        id: l.id,
        module: l.module,
        title: l.title,
        description: l.description,
        totalSteps: l.total_steps,
        orderIndex: l.order_index,
        progress: p
          ? {
              lessonId: p.lesson_id,
              completed: Boolean(p.completed),
              score: p.score,
              attempts: p.attempts,
              lastStepCompleted: p.last_step_completed,
              difficultyLevel: p.difficulty_level || 'normal',
              updatedAt: p.updated_at,
            }
          : undefined,
      };
    });
  }

  public async recordEvent(
    lessonId: string,
    stepIndex: number,
    eventType: 'success' | 'error' | 'retry' | 'hint_requested',
    timeSpentSeconds: number,
    errorDetails?: string
  ): Promise<void> {
    const db = await getDatabase();
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.runAsync(
      `INSERT INTO learning_events (id, lesson_id, step_index, event_type, time_spent_seconds, error_details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventId, lessonId, stepIndex, eventType, timeSpentSeconds, errorDetails || null]
    );
  }

  public async updateProgress(
    lessonId: string,
    completed: boolean,
    score: number,
    lastStepCompleted: number,
    difficultyLevel: 'easy' | 'normal' | 'challenging' = 'normal'
  ): Promise<void> {
    const db = await getDatabase();
    const existing = await db.getAllAsync<any>('SELECT * FROM learning_progress WHERE lesson_id = ?', [lessonId]);
    const previousAttempts = existing.length > 0 ? existing[0].attempts : 0;
    const attempts = previousAttempts + 1;

    await db.runAsync(
      `INSERT OR REPLACE INTO learning_progress (lesson_id, completed, score, attempts, last_step_completed, difficulty_level)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [lessonId, completed ? 1 : 0, score, attempts, lastStepCompleted, difficultyLevel]
    );
  }

  public async getLessonById(lessonId: string): Promise<LessonWithProgress | null> {
    const all = await this.getAllLessons();
    return all.find(l => l.id === lessonId) || null;
  }

  public getLessonSteps(lessonId: string): SimulatorStep[] {
    switch (lessonId) {
      case 'lesson-wa':
        return [
          {
            stepIndex: 0,
            title: 'Abrir conversación familiar',
            instruction: 'Toca sobre el contacto de tu hija María para abrir el chat.',
            hint: 'Busca la foto de María Gómez en la lista y pulsa sobre su nombre.',
            targetAction: 'SELECT_CONTACT',
            completedExplanation: '¡Muy bien! Acabas de abrir la conversación con María.',
          },
          {
            stepIndex: 1,
            title: 'Tocar el campo de texto',
            instruction: 'Toca la barra blanca abajo para escribir tu mensaje.',
            hint: 'Abajo hay un espacio rectangular que dice "Escribe un mensaje aquí". Púlsalo.',
            targetAction: 'TAP_INPUT',
            completedExplanation: '¡Excelente! El teclado simulado está listo para escribir.',
          },
          {
            stepIndex: 2,
            title: 'Enviar el mensaje',
            instruction: 'Toca el botón verde con forma de flecha para enviar el mensaje.',
            hint: 'El botón verde con una flecha blanca está a la derecha del texto.',
            targetAction: 'TAP_SEND',
            completedExplanation: '¡Fantástico! Tu mensaje "Hola hija, ya llegué" fue enviado.',
          },
          {
            stepIndex: 3,
            title: 'Grabar nota de voz',
            instruction: 'Mantén presionado el botón verde del micrófono para hablar.',
            hint: 'Abajo a la derecha verás un círculo verde con un micrófono blanco. Mantenlo presionado.',
            targetAction: 'RECORD_AUDIO',
            completedExplanation: '¡Perfecto! Has grabado y enviado tu nota de voz con éxito.',
          },
          {
            stepIndex: 4,
            title: 'Iniciar videollamada',
            instruction: 'Toca el icono de la cámara arriba para ver a tu ser querido.',
            hint: 'En la barra superior, al lado del nombre de María, hay un icono con forma de cámara de video.',
            targetAction: 'START_VIDEO_CALL',
            completedExplanation: '¡Fabuloso! Ya sabes cómo ver y escuchar a tu familia en directo.',
          },
        ];

      case 'lesson-cam':
        return [
          {
            stepIndex: 0,
            title: 'Enfocar el objetivo',
            instruction: 'Toca en la pantalla sobre lo que quieres enfocar para asegurarte de que se vea nítido.',
            hint: 'Toca en el centro del visor para que aparezca el recuadro amarillo de enfoque.',
            targetAction: 'FOCUS_VIEW',
            completedExplanation: '¡Muy bien! La imagen está enfocada y nítida.',
          },
          {
            stepIndex: 1,
            title: 'Tomar la fotografía',
            instruction: 'Pulsa el botón circular blanco grande abajo para disparar.',
            hint: 'Es el botón redondo más grande en la parte inferior central de la pantalla.',
            targetAction: 'TAKE_PHOTO',
            completedExplanation: '¡Click! Acabas de capturar un hermoso recuerdo.',
          },
          {
            stepIndex: 2,
            title: 'Cambiar a cámara frontal (Selfie)',
            instruction: 'Toca el botón con dos flechas giratorias para verte a ti mismo.',
            hint: 'Está a la derecha del botón blanco de disparar.',
            targetAction: 'FLIP_CAMERA',
            completedExplanation: '¡Genial! Ahora la cámara te enfoca a ti para tomarte una selfie.',
          },
          {
            stepIndex: 3,
            title: 'Revisar la fotografía',
            instruction: 'Pulsa en la miniatura redonda abajo a la izquierda para verla en grande.',
            hint: 'En la esquina inferior izquierda verás la foto que acabas de tomar.',
            targetAction: 'PREVIEW_PHOTO',
            completedExplanation: '¡Qué bien quedó! Puedes ver todos los detalles en grande.',
          },
          {
            stepIndex: 4,
            title: 'Eliminar foto de prueba',
            instruction: 'Toca el botón rojo de papelera para aprender a borrar fotos que no te gusten.',
            hint: 'Busca el icono de papelera roja para descartar la foto con tranquilidad.',
            targetAction: 'DELETE_PHOTO',
            completedExplanation: '¡Completado! No temas equivocarte, siempre puedes borrar lo que no quieras.',
          },
        ];

      case 'lesson-gal':
        return [
          {
            stepIndex: 0,
            title: 'Elegir una foto del álbum',
            instruction: 'Toca sobre la fotografía del cumpleaños familiar para verla completa.',
            hint: 'En la cuadrícula de fotos, pulsa la primera imagen grande de la reunión.',
            targetAction: 'SELECT_PHOTO',
            completedExplanation: '¡Excelente! La foto ahora se muestra en pantalla completa.',
          },
          {
            stepIndex: 1,
            title: 'Ampliar con zoom amigable',
            instruction: 'Toca el botón "Acercar" para ver las caras más de cerca.',
            hint: 'Pulsa el botón con una lupa y el signo más (+) para acercar los rostros.',
            targetAction: 'ZOOM_PHOTO',
            completedExplanation: '¡Qué nítido! Así puedes apreciar los rostros sin forzar la vista.',
          },
          {
            stepIndex: 2,
            title: 'Compartir con un ser querido',
            instruction: 'Toca el botón "Compartir" para enviar esta foto a tu hija María.',
            hint: 'Busca el botón azul que dice "Compartir con María".',
            targetAction: 'SHARE_PHOTO',
            completedExplanation: '¡Maravilloso! María acaba de recibir tu foto con una sonrisa.',
          },
        ];

      case 'lesson-sec':
        return [
          {
            stepIndex: 0,
            title: 'Mensaje falso del banco',
            instruction: 'Te llega un mensaje: "Banco: Su cuenta está bloqueada. Ingrese a este link urgente". ¿Qué debes hacer?',
            hint: 'Los bancos jamás te pedirán claves ni te enviarán enlaces de urgencia por mensaje.',
            targetAction: 'REJECT_SCAM_SMS',
            completedExplanation: '¡Muy bien! Nunca abras enlaces desconocidos. Tu banco nunca pide claves por mensaje.',
          },
          {
            stepIndex: 1,
            title: 'Llamada de familiar en apuros',
            instruction: 'Llaman diciendo: "¡Tío, tuve un accidente y necesito plata ya!". ¿Qué decisión tomas?',
            hint: 'Mantén la calma. Antes de enviar dinero, cuelga y llama al número guardado de ese familiar.',
            targetAction: 'VERIFY_FAMILY_CALL',
            completedExplanation: '¡Excelente decisión! Siempre cuelga y llama tú mismo a tu familiar para confirmar.',
          },
          {
            stepIndex: 2,
            title: 'Premio falso de lotería',
            instruction: 'Mensaje: "¡Ganó una camioneta! Consigne $50.000 para el envío". ¿Cómo respondes?',
            hint: 'Nadie te regala premios sin participar, y jamás debes pagar dinero para reclamar nada.',
            targetAction: 'REJECT_PRIZE_SCAM',
            completedExplanation: '¡Fantástico! Si te piden dinero para entregarte un premio, es 100% una estafa.',
          },
        ];

      case 'lesson-call':
        return [
          {
            stepIndex: 0,
            title: 'Identificar quién te llama',
            instruction: 'Tu teléfono está timbrando. Lee el nombre y número en pantalla antes de responder.',
            hint: 'En la pantalla verás el nombre "Doctor Martínez (Salud)".',
            targetAction: 'IDENTIFY_CALLER',
            completedExplanation: '¡Correcto! Siempre verifica quién llama para mayor tranquilidad.',
          },
          {
            stepIndex: 1,
            title: 'Contestar la llamada',
            instruction: 'Pulsa el botón circular verde "CONTESTAR" para hablar.',
            hint: 'Toca el botón verde con el icono del auricular para iniciar la conversación.',
            targetAction: 'ANSWER_CALL',
            completedExplanation: '¡Excelente! Ya estás comunicado con el doctor.',
          },
          {
            stepIndex: 2,
            title: 'Activar el altavoz',
            instruction: 'Toca el botón de "ALTAVOZ" para escuchar con volumen alto sin sostener el teléfono.',
            hint: 'Busca el icono de parlante/altavoz en la pantalla de la llamada.',
            targetAction: 'TOGGLE_SPEAKER',
            completedExplanation: '¡Perfecto! Con el altavoz puedes escuchar fuerte y claro.',
          },
          {
            stepIndex: 3,
            title: 'Colgar la llamada',
            instruction: 'Toca el botón circular rojo de "COLGAR" al terminar la conversación.',
            hint: 'Es el botón redondo rojo en la parte inferior.',
            targetAction: 'END_CALL',
            completedExplanation: '¡Muy bien hecho! Has dominado cómo contestar, poner altavoz y colgar con seguridad.',
          },
        ];

      case 'lesson-audio':
        return [
          {
            stepIndex: 0,
            title: 'Reproducir nota de voz',
            instruction: 'Te ha llegado un mensaje de voz de María. Toca el botón verde de reproducir (▶).',
            hint: 'Pulsa el círculo verde con el triángulo blanco dentro del mensaje.',
            targetAction: 'PLAY_VOICE_NOTE',
            completedExplanation: '¡Muy bien! El audio se está reproduciendo.',
          },
          {
            stepIndex: 1,
            title: 'Pausar el audio',
            instruction: 'Toca el botón de pausa (⏸) para detener el mensaje si necesitas atender algo.',
            hint: 'Pulsa las dos barras verticales que aparecieron en lugar del triángulo.',
            targetAction: 'PAUSE_VOICE_NOTE',
            completedExplanation: '¡Excelente! Puedes pausar y reanudar el audio cuando desees.',
          },
          {
            stepIndex: 2,
            title: 'Ajustar velocidad del audio',
            instruction: 'Toca el botón "1.5x" para escuchar un audio largo más rápidamente.',
            hint: 'Toca sobre la etiqueta pequeña que dice "1x" o "1.5x".',
            targetAction: 'SPEED_VOICE_NOTE',
            completedExplanation: '¡Fabuloso! Ahora dominas el control de notas de voz en WhatsApp.',
          },
        ];

      default:
        return [];
    }
  }

  public async getRecentEvents(lessonId: string): Promise<any[]> {
    const db = await getDatabase();
    return db.getAllAsync<any>(
      'SELECT * FROM learning_events WHERE lesson_id = ? ORDER BY id DESC LIMIT 20',
      [lessonId]
    );
  }

  public async seedInitialLessons(): Promise<void> {
    const db = await getDatabase();
    const initialLessons = [
      {
        id: 'lesson-wa',
        module: 'whatsapp',
        title: 'Aprender WhatsApp',
        description: 'Aprende a abrir una conversación, escribir y enviar notas de voz sin temor a equivocarte.',
        totalSteps: 5,
        orderIndex: 1,
      },
      {
        id: 'lesson-cam',
        module: 'camera',
        title: 'Cómo Usar la Cámara',
        description: 'Aprende a apuntar, enfocar, tomar fotos, cambiar a selfie y revisarlas con calma.',
        totalSteps: 5,
        orderIndex: 2,
      },
      {
        id: 'lesson-gal',
        module: 'gallery',
        title: 'Tu Galería de Fotos',
        description: 'Aprende a buscar recuerdos, verlos en pantalla grande y compartirlos con tu familia.',
        totalSteps: 3,
        orderIndex: 3,
      },
      {
        id: 'lesson-sec',
        module: 'security',
        title: 'Seguridad y Evitar Estafas',
        description: 'Aprende a detectar mensajes falsos, llamadas sospechosas y a proteger tu tranquilidad.',
        totalSteps: 3,
        orderIndex: 4,
      },
      {
        id: 'lesson-call',
        module: 'calls',
        title: 'Contestar Llamadas y Altavoz',
        description: 'Aprende a identificar quién llama, contestar, activar el altavoz para escuchar fuerte y colgar.',
        totalSteps: 4,
        orderIndex: 5,
      },
      {
        id: 'lesson-audio',
        module: 'audio',
        title: 'Escuchar Audios en WhatsApp',
        description: 'Aprende a reproducir notas de voz familiares, pausarlas y ajustar la velocidad.',
        totalSteps: 3,
        orderIndex: 6,
      },
    ];

    for (const l of initialLessons) {
      await db.runAsync(
        `INSERT OR REPLACE INTO lessons (id, module, title, description, total_steps, order_index)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [l.id, l.module, l.title, l.description, l.totalSteps, l.orderIndex]
      );
    }
  }
}

export const learningRepository = LearningRepository.getInstance();
