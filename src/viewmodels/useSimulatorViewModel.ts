import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { learningRepository, LessonWithProgress } from '../repositories/LearningRepository';
import { pedagogyService } from '../services/PedagogyService';
import { voiceService } from '../services/VoiceService';
import { SimulatorStep, LearningEvent, PedagogyProfile } from '../models';

export const useSimulatorViewModel = (lessonId: string) => {
  const [lesson, setLesson] = useState<LessonWithProgress | null>(null);
  const [steps, setSteps] = useState<SimulatorStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [highlightTarget, setHighlightTarget] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'warning'>('info');
  const [pedagogyProfile, setPedagogyProfile] = useState<PedagogyProfile>(pedagogyService.getProfile());

  // Estado del sandbox para WhatsApp
  const [chatOpened, setChatOpened] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'other'; type?: 'text' | 'audio'; time?: string; status?: string }>>([
    { id: '1', text: 'Hola mamá, ¿cómo estás hoy? Recuerda que te quiero mucho ❤️', sender: 'other', type: 'text', time: '10:42 a. m.' },
  ]);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [videoCallActive, setVideoCallActive] = useState<boolean>(false);

  // Estado de reproducción de notas de voz (lesson-audio y WhatsApp)
  const [voiceNotePlaying, setVoiceNotePlaying] = useState<boolean>(false);
  const [voiceNoteProgress, setVoiceNoteProgress] = useState<number>(0);
  const [voiceNoteSpeed, setVoiceNoteSpeed] = useState<'1x' | '1.5x' | '2x'>('1x');

  // Estado del sandbox para Cámara
  const [cameraFocused, setCameraFocused] = useState<boolean>(false);
  const [focusCoords, setFocusCoords] = useState<{ x: number; y: number } | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [isShutterFlashing, setIsShutterFlashing] = useState<boolean>(false);
  const [photoTaken, setPhotoTaken] = useState<boolean>(false);
  const [photoPreviewModal, setPhotoPreviewModal] = useState<boolean>(false);

  // Estado del sandbox para Galería
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [photoZoomLevel, setPhotoZoomLevel] = useState<number>(1);
  const [photoShared, setPhotoShared] = useState<boolean>(false);

  // Estado del sandbox para Seguridad
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizExplanation, setQuizExplanation] = useState<string>('');

  // Estado del sandbox para Llamadas Telefónicas (lesson-call)
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isSpeakerActive, setIsSpeakerActive] = useState<boolean>(false);
  const [isCallEnded, setIsCallEnded] = useState<boolean>(false);
  const [callSeconds, setCallSeconds] = useState<number>(0);

  // Métricas pedagógicas
  const stepStartTimeRef = useRef<number>(Date.now());
  const lessonStartTimeRef = useRef<number>(Date.now());
  const errorsCountRef = useRef<number>(0);
  const hintsCountRef = useRef<number>(0);
  const sessionEventsRef = useRef<LearningEvent[]>([]);

  // Cargar lección y pasos
  useEffect(() => {
    const init = async () => {
      const foundLesson = await learningRepository.getLessonById(lessonId);
      const loadedSteps = learningRepository.getLessonSteps(lessonId);
      setLesson(foundLesson);
      setSteps(loadedSteps);
      setCurrentStepIndex(0);
      setIsCompleted(false);
      setFeedback('');

      stepStartTimeRef.current = Date.now();
      lessonStartTimeRef.current = Date.now();
      errorsCountRef.current = 0;
      hintsCountRef.current = 0;
      sessionEventsRef.current = [];

      if (loadedSteps.length > 0) {
        const firstStep = loadedSteps[0];
        setFeedback(firstStep.instruction);
        setFeedbackType('info');
        await voiceService.speak(`Bienvenido a la lección. ${firstStep.instruction}`);
      }
    };
    init();
  }, [lessonId]);

  const currentStep = steps[currentStepIndex] || null;

  // Solicitar pista
  const requestHint = useCallback(async () => {
    if (!currentStep) return;
    hintsCountRef.current += 1;
    setHintVisible(true);
    setHighlightTarget(true);

    const timeSpent = (Date.now() - stepStartTimeRef.current) / 1000;
    const event: LearningEvent = {
      id: `ev-${Date.now()}`,
      lessonId,
      stepIndex: currentStepIndex,
      eventType: 'hint_requested',
      timeSpentSeconds: timeSpent,
    };
    sessionEventsRef.current.push(event);
    await learningRepository.recordEvent(lessonId, currentStepIndex, 'hint_requested', timeSpent);

    await voiceService.speak(`Pista: ${currentStep.hint}`);
  }, [currentStep, currentStepIndex, lessonId]);

  // Manejar acción del usuario en el simulador
  const handleAction = useCallback(async (action: string) => {
    if (!currentStep || isCompleted) return;

    const timeSpent = (Date.now() - stepStartTimeRef.current) / 1000;

    if (action === currentStep.targetAction) {
      // Acierto
      setFeedbackType('success');
      setFeedback(currentStep.completedExplanation);
      setHintVisible(false);
      setHighlightTarget(false);

      const event: LearningEvent = {
        id: `ev-${Date.now()}`,
        lessonId,
        stepIndex: currentStepIndex,
        eventType: 'success',
        timeSpentSeconds: timeSpent,
      };
      sessionEventsRef.current.push(event);
      await learningRepository.recordEvent(lessonId, currentStepIndex, 'success', timeSpent);

      await voiceService.speak(currentStep.completedExplanation);

      // Avanzar al siguiente paso o finalizar
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStepIndex(nextIndex);
        stepStartTimeRef.current = Date.now();
        const nextStep = steps[nextIndex];
        setTimeout(async () => {
          setFeedback(nextStep.instruction);
          setFeedbackType('info');
          await voiceService.speak(nextStep.instruction);
        }, 1200);
      } else {
        // Lección finalizada con éxito
        setIsCompleted(true);
        const totalDuration = (Date.now() - lessonStartTimeRef.current) / 1000;
        const finalScore = Math.max(10, 100 - errorsCountRef.current * 15);

        // Análisis pedagógico adaptativo
        const profile = await pedagogyService.analyzeSession(
          lessonId,
          1,
          errorsCountRef.current,
          hintsCountRef.current,
          totalDuration,
          steps.length
        );
        setPedagogyProfile(profile);

        await learningRepository.updateProgress(
          lessonId,
          true,
          finalScore,
          steps.length,
          profile.difficultyRecommended
        );

        // Sincronizar eventos al backend
        await pedagogyService.syncEvents(sessionEventsRef.current);

        const victoryMsg = `¡Felicitaciones! Has completado con éxito la lección. ${profile.encouragementText}`;
        setFeedback(victoryMsg);
        await voiceService.speak(victoryMsg);
      }
    } else {
      // Error no punitivo y empático
      errorsCountRef.current += 1;
      setFeedbackType('warning');
      const retryMsg = `Está bien, no te preocupes. Inténtalo nuevamente. Recuerda: ${currentStep.hint}`;
      setFeedback(retryMsg);

      if (errorsCountRef.current >= 2) {
        setHighlightTarget(true);
      }

      const event: LearningEvent = {
        id: `ev-${Date.now()}`,
        lessonId,
        stepIndex: currentStepIndex,
        eventType: 'error',
        timeSpentSeconds: timeSpent,
        errorDetails: `Acción ejecutada: ${action}, esperada: ${currentStep.targetAction}`,
      };
      sessionEventsRef.current.push(event);
      await learningRepository.recordEvent(
        lessonId,
        currentStepIndex,
        'error',
        timeSpent,
        `Acción recibida: ${action}`
      );

      await voiceService.speak(retryMsg);
    }
  }, [currentStep, currentStepIndex, isCompleted, lessonId, steps]);

  // Métodos específicos del sandbox
  const handleSelectContact = () => {
    setChatOpened(true);
    handleAction('SELECT_CONTACT');
  };

  const handleInputFocus = () => {
    setInputText('Hola hija, ya llegué');
    handleAction('TAP_INPUT');
  };

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputText.trim() || 'Hola hija, ya llegué';
    const now = new Date();
    const timeStr = `${now.getHours() % 12 || 12}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()} ${now.getHours() >= 12 ? 'p. m.' : 'a. m.'}`;

    setMessages(prev => [
      ...prev,
      { id: `user-${Date.now()}`, text: textToSend, sender: 'user', type: 'text', time: timeStr, status: 'read' },
    ]);
    setInputText('');
    handleAction('TAP_SEND');

    // Simular respuesta interactiva y cariñosa de María tras 1.4 segundos
    setTimeout(async () => {
      const replyTime = `${new Date().getHours() % 12 || 12}:${new Date().getMinutes() < 10 ? '0' : ''}${new Date().getMinutes()} ${new Date().getHours() >= 12 ? 'p. m.' : 'a. m.'}`;
      setMessages(prev => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          text: '¡Qué alegría saludarte, mami! Me alegra que estés practicando en tu celular ❤️ ¿Cómo te has sentido hoy?',
          sender: 'other',
          type: 'text',
          time: replyTime,
        },
      ]);
      if (Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    }, 1400);
  };

  const handleStartRecording = () => {
    setIsRecordingAudio(true);
    setRecordingSeconds(1);
  };

  const handleStopRecording = () => {
    if (isRecordingAudio) {
      setIsRecordingAudio(false);
      const now = new Date();
      const timeStr = `${now.getHours() % 12 || 12}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()} ${now.getHours() >= 12 ? 'p. m.' : 'a. m.'}`;
      setMessages(prev => [
        ...prev,
        { id: `audio-${Date.now()}`, text: 'Nota de voz (0:05)', sender: 'user', type: 'audio', time: timeStr, status: 'read' },
      ]);
      handleAction('RECORD_AUDIO');
    }
  };

  const handleStartVideoCall = () => {
    setVideoCallActive(true);
    handleAction('START_VIDEO_CALL');
  };

  const handleEndVideoCall = () => {
    setVideoCallActive(false);
  };

  const handleFocusCamera = (x?: number, y?: number) => {
    setCameraFocused(true);
    if (x !== undefined && y !== undefined) {
      setFocusCoords({ x, y });
    } else {
      setFocusCoords({ x: 160, y: 180 });
    }
    setTimeout(() => setFocusCoords(null), 2500);
    handleAction('FOCUS_VIEW');
  };

  const handleTakePhoto = async () => {
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 160);
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
    setPhotoTaken(true);
    handleAction('TAKE_PHOTO');
  };

  const handleFlipCamera = () => {
    setCameraFacing(prev => (prev === 'back' ? 'front' : 'back'));
    handleAction('FLIP_CAMERA');
  };

  const handlePreviewPhoto = () => {
    setPhotoPreviewModal(true);
    handleAction('PREVIEW_PHOTO');
  };

  const handleDeletePhoto = () => {
    setPhotoTaken(false);
    setPhotoPreviewModal(false);
    handleAction('DELETE_PHOTO');
  };

  const handleSelectGalleryPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    handleAction('SELECT_PHOTO');
  };

  const handleZoomPhoto = () => {
    setPhotoZoomLevel(prev => (prev === 1 ? 1.5 : 1));
    handleAction('ZOOM_PHOTO');
  };

  const handleSharePhoto = () => {
    setPhotoShared(true);
    handleAction('SHARE_PHOTO');
  };

  const handleAnswerQuiz = (selectedAction: string, explanation: string) => {
    setQuizExplanation(explanation);
    setQuizAnswered(true);
    handleAction(selectedAction);
  };

  // Handlers para notas de voz de WhatsApp (lesson-audio)
  const handlePlayVoiceNote = () => {
    setVoiceNotePlaying(true);
    handleAction('PLAY_VOICE_NOTE');
  };

  const handlePauseVoiceNote = () => {
    setVoiceNotePlaying(false);
    handleAction('PAUSE_VOICE_NOTE');
  };

  const handleSpeedVoiceNote = () => {
    setVoiceNoteSpeed(prev => (prev === '1x' ? '1.5x' : prev === '1.5x' ? '2x' : '1x'));
    handleAction('SPEED_VOICE_NOTE');
  };

  // Handlers para llamadas entrantes (lesson-call)
  const handleIdentifyCaller = () => {
    handleAction('IDENTIFY_CALLER');
  };

  const handleAnswerCall = () => {
    setIsCallActive(true);
    handleAction('ANSWER_CALL');
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerActive(prev => !prev);
    handleAction('TOGGLE_SPEAKER');
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setIsCallEnded(true);
    handleAction('END_CALL');
  };

  const resetLesson = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setHintVisible(false);
    setHighlightTarget(false);
    setChatOpened(false);
    setInputText('');
    setVideoCallActive(false);
    setVoiceNotePlaying(false);
    setVoiceNoteProgress(0);
    setVoiceNoteSpeed('1x');
    setCameraFocused(false);
    setFocusCoords(null);
    setCameraFacing('back');
    setIsShutterFlashing(false);
    setPhotoTaken(false);
    setPhotoPreviewModal(false);
    setSelectedPhotoIndex(null);
    setPhotoZoomLevel(1);
    setPhotoShared(false);
    setQuizAnswered(false);
    setIsCallActive(false);
    setIsSpeakerActive(false);
    setIsCallEnded(false);
    setCallSeconds(0);
    errorsCountRef.current = 0;
    hintsCountRef.current = 0;
    stepStartTimeRef.current = Date.now();
    lessonStartTimeRef.current = Date.now();

    if (steps.length > 0) {
      setFeedback(steps[0].instruction);
      setFeedbackType('info');
      voiceService.speak(steps[0].instruction);
    }
  };

  return {
    lesson,
    steps,
    currentStep,
    currentStepIndex,
    isCompleted,
    hintVisible,
    highlightTarget,
    feedback,
    feedbackType,
    pedagogyProfile,
    // Sandbox states
    chatOpened,
    inputText,
    setInputText,
    messages,
    isRecordingAudio,
    recordingSeconds,
    videoCallActive,
    voiceNotePlaying,
    voiceNoteProgress,
    voiceNoteSpeed,
    cameraFocused,
    focusCoords,
    cameraFacing,
    isShutterFlashing,
    photoTaken,
    photoPreviewModal,
    selectedPhotoIndex,
    photoZoomLevel,
    photoShared,
    quizAnswered,
    quizExplanation,
    isCallActive,
    isSpeakerActive,
    isCallEnded,
    callSeconds,
    // Actions
    requestHint,
    handleAction,
    resetLesson,
    // Sandbox handlers
    handleSelectContact,
    handleInputFocus,
    handleSendMessage,
    handleStartRecording,
    handleStopRecording,
    handleStartVideoCall,
    handleEndVideoCall,
    handleFocusCamera,
    handleTakePhoto,
    handleFlipCamera,
    handlePreviewPhoto,
    handleDeletePhoto,
    handleSelectGalleryPhoto,
    handleZoomPhoto,
    handleSharePhoto,
    handleAnswerQuiz,
    handlePlayVoiceNote,
    handlePauseVoiceNote,
    handleSpeedVoiceNote,
    handleIdentifyCaller,
    handleAnswerCall,
    handleToggleSpeaker,
    handleEndCall,
  };
};
