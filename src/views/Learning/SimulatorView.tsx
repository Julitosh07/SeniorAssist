import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { HeaderBar } from '../../components/HeaderBar';
import { AccessibleText } from '../../components/AccessibleText';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleCard } from '../../components/AccessibleCard';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius } from '../../constants/theme';
import { useSimulatorViewModel } from '../../viewmodels/useSimulatorViewModel';

type SimulatorRouteProp = RouteProp<RootStackParamList, 'Simulator'>;

export const SimulatorView: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<SimulatorRouteProp>();
  const { lessonId } = route.params;
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const {
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
    videoCallActive,
    voiceNotePlaying,
    voiceNoteSpeed,
    cameraFocused,
    focusCoords,
    cameraFacing,
    isShutterFlashing,
    photoTaken,
    photoPreviewModal,
    selectedPhotoIndex,
    photoZoomLevel,
    quizAnswered,
    isCallActive,
    isSpeakerActive,
    isCallEnded,
    // Actions
    requestHint,
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
  } = useSimulatorViewModel(lessonId);

  const getBorderColorForTarget = (isTarget: boolean) => {
    if (highlightTarget && isTarget) {
      return '#FFD700'; // Dorado de alto contraste para guiar al adulto mayor
    }
    return 'transparent';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar
        title={lesson ? lesson.title : 'Simulador Práctico'}
        subtitle={`Paso ${currentStepIndex + 1} de ${steps.length || 1}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Tarjeta Superior de Instrucción Pedagógica */}
        <AccessibleCard
          style={[
            styles.instructionCard,
            {
              borderColor:
                feedbackType === 'success'
                  ? theme.success
                  : feedbackType === 'warning'
                  ? theme.warning
                  : theme.learning,
              backgroundColor: theme.surface,
            },
          ]}
        >
          <View style={styles.instructionHeader}>
            <View style={{ flex: 1, paddingRight: spacing.xs }}>
              <AccessibleText variant="title" weight="heavy" color={theme.learning}>
                Paso {currentStepIndex + 1}: {currentStep ? currentStep.title : 'Cargando...'}
              </AccessibleText>
            </View>

            <View style={styles.instructionHeaderActions}>
              <TouchableOpacity
                onPress={requestHint}
                style={[styles.hintPillBtn, { backgroundColor: '#FEF3C7', borderColor: '#D97706' }]}
                accessibilityLabel="Pedir una pista"
              >
                <AccessibleText variant="caption" weight="bold" color="#B45309">
                  💡 Pista
                </AccessibleText>
              </TouchableOpacity>
            </View>
          </View>

          <AccessibleText variant="bodyLarge" weight="bold" color={theme.textPrimary} style={styles.instructionText}>
            👉 {currentStep ? currentStep.instruction : ''}
          </AccessibleText>

          {hintVisible && currentStep?.hint ? (
            <View style={[styles.hintBox, { backgroundColor: '#FEF9C3', borderColor: '#CA8A04' }]}>
              <AccessibleText variant="body" weight="heavy" color="#854D0E">
                💡 Consejo: {currentStep.hint}
              </AccessibleText>
            </View>
          ) : null}

          {feedback ? (
            <View
              style={[
                styles.feedbackBox,
                {
                  backgroundColor:
                    feedbackType === 'success' ? '#DCFCE7' : feedbackType === 'warning' ? '#FEF2F2' : '#EFF6FF',
                  borderColor:
                    feedbackType === 'success' ? '#16A34A' : feedbackType === 'warning' ? '#DC2626' : '#2563EB',
                },
              ]}
            >
              <AccessibleText
                variant="body"
                weight="bold"
                color={
                  feedbackType === 'success' ? '#166534' : feedbackType === 'warning' ? '#991B1B' : '#1E40AF'
                }
              >
                {feedback}
              </AccessibleText>
            </View>
          ) : null}
        </AccessibleCard>

        {/* ======================================================== */}
        {/* SANDBOX 1: SIMULADOR DE WHATSAPP (AUTÉNTICO)              */}
        {/* ======================================================== */}
        {lesson?.module === 'whatsapp' && (
          <View style={styles.deviceFrame}>
            {!chatOpened ? (
              // Vista 1: Lista de Chats de WhatsApp
              <View style={styles.waContainer}>
                {/* Barra verde oficial de WhatsApp */}
                <View style={styles.waTopBar}>
                  <AccessibleText variant="title" weight="heavy" color="#FFFFFF">
                    WhatsApp
                  </AccessibleText>
                  <View style={styles.waTopBarIcons}>
                    <AccessibleText variant="bodyLarge" color="#FFFFFF">🔍</AccessibleText>
                    <AccessibleText variant="bodyLarge" color="#FFFFFF" style={{ marginLeft: 16 }}>⋮</AccessibleText>
                  </View>
                </View>

                {/* Pestañas CHATS / ESTADOS / LLAMADAS */}
                <View style={styles.waTabsRow}>
                  <View style={styles.waTabActive}>
                    <AccessibleText variant="caption" weight="heavy" color="#FFFFFF">
                      CHATS (1)
                    </AccessibleText>
                  </View>
                  <View style={styles.waTabInactive}>
                    <AccessibleText variant="caption" weight="bold" color="#A7F3D0">
                      ESTADOS
                    </AccessibleText>
                  </View>
                  <View style={styles.waTabInactive}>
                    <AccessibleText variant="caption" weight="bold" color="#A7F3D0">
                      LLAMADAS
                    </AccessibleText>
                  </View>
                </View>

                <View style={styles.waListBody}>
                  <AccessibleText variant="caption" weight="bold" color="#64748B" style={styles.waNoticeText}>
                    👇 Toca la conversación con tu hija para abrir el chat:
                  </AccessibleText>

                  {/* Elemento de chat con María */}
                  <TouchableOpacity
                    style={[
                      styles.waChatItem,
                      highlightTarget && currentStep?.targetAction === 'SELECT_CONTACT' && styles.highlightGlow,
                    ]}
                    onPress={handleSelectContact}
                    activeOpacity={0.7}
                  >
                    <View style={styles.waAvatarCircle}>
                      <AccessibleText variant="title" weight="heavy">👩</AccessibleText>
                      <View style={styles.waOnlineDot} />
                    </View>

                    <View style={styles.waChatInfo}>
                      <View style={styles.waChatNameRow}>
                        <AccessibleText variant="subtitle" weight="heavy" color="#111827">
                          María Gómez (Hija)
                        </AccessibleText>
                        <AccessibleText variant="caption" color="#16A34A" weight="bold">
                          10:42 a. m.
                        </AccessibleText>
                      </View>
                      <View style={styles.waChatPreviewRow}>
                        <AccessibleText variant="body" color="#4B5563" numberOfLines={1} style={{ flex: 1 }}>
                          Hola mamá, ¿cómo estás hoy? ❤️
                        </AccessibleText>
                        <View style={styles.waUnreadBadge}>
                          <AccessibleText variant="caption" weight="heavy" color="#FFFFFF">
                            1
                          </AccessibleText>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Vista 2: Conversación Abierta Realista
              <View style={styles.waContainer}>
                {/* Cabecera del chat auténtico */}
                <View style={styles.waChatHeader}>
                  <TouchableOpacity
                    style={styles.waBackBtn}
                    onPress={() => resetLesson()}
                    accessibilityLabel="Volver a lista de chats"
                  >
                    <AccessibleText variant="title" weight="heavy" color="#FFFFFF">
                      ←
                    </AccessibleText>
                  </TouchableOpacity>

                  <View style={styles.waHeaderAvatar}>
                    <AccessibleText variant="subtitle">👩</AccessibleText>
                  </View>

                  <View style={styles.waHeaderTitleCol}>
                    <AccessibleText variant="subtitle" weight="heavy" color="#FFFFFF" numberOfLines={1}>
                      María Gómez (Hija)
                    </AccessibleText>
                    <AccessibleText variant="caption" weight="medium" color="#A7F3D0">
                      en línea
                    </AccessibleText>
                  </View>

                  {/* Iconos de llamada y videollamada */}
                  <View style={styles.waHeaderActions}>
                    <TouchableOpacity
                      style={[
                        styles.waHeaderIconBtn,
                        highlightTarget && currentStep?.targetAction === 'START_VIDEO_CALL' && styles.highlightGlow,
                      ]}
                      onPress={handleStartVideoCall}
                      accessibilityLabel="Videollamada"
                    >
                      <AccessibleText variant="title" color="#FFFFFF">📹</AccessibleText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.waHeaderIconBtn} accessibilityLabel="Llamada">
                      <AccessibleText variant="title" color="#FFFFFF">📞</AccessibleText>
                    </TouchableOpacity>
                    <AccessibleText variant="title" color="#FFFFFF" style={{ marginLeft: 6 }}>⋮</AccessibleText>
                  </View>
                </View>

                {/* Fondo de Wallpaper de WhatsApp */}
                <View style={styles.waWallpaper}>
                  {/* Fecha centrada */}
                  <View style={styles.waDatePill}>
                    <AccessibleText variant="caption" weight="bold" color="#475569">
                      HOY
                    </AccessibleText>
                  </View>

                  <ScrollView style={styles.waMessagesScroll} contentContainerStyle={{ paddingVertical: spacing.sm }}>
                    {messages.map(m => {
                      const isUser = m.sender === 'user';
                      return (
                        <View
                          key={m.id}
                          style={[
                            styles.waMessageRow,
                            isUser ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' },
                          ]}
                        >
                          <View
                            style={[
                              styles.waBubble,
                              isUser ? styles.waBubbleUser : styles.waBubbleOther,
                            ]}
                          >
                            {m.type === 'audio' ? (
                              <View style={styles.waAudioBubbleContent}>
                                <TouchableOpacity style={styles.waAudioPlayBtn}>
                                  <AccessibleText variant="bodyLarge" color="#FFFFFF">▶️</AccessibleText>
                                </TouchableOpacity>
                                <View style={styles.waWaveformSim}>
                                  <View style={styles.waWaveBar} />
                                  <View style={[styles.waWaveBar, { height: 18 }]} />
                                  <View style={[styles.waWaveBar, { height: 12 }]} />
                                  <View style={[styles.waWaveBar, { height: 22 }]} />
                                  <View style={[styles.waWaveBar, { height: 14 }]} />
                                  <View style={styles.waWaveBar} />
                                </View>
                                <AccessibleText variant="caption" color="#0F766E" weight="bold">
                                  0:05
                                </AccessibleText>
                              </View>
                            ) : (
                              <AccessibleText variant="bodyLarge" weight="medium" color="#111827">
                                {m.text}
                              </AccessibleText>
                            )}

                            <View style={styles.waBubbleMeta}>
                              <AccessibleText variant="caption" color="#64748B" style={{ fontSize: 11 }}>
                                {m.time || '10:43 a. m.'}
                              </AccessibleText>
                              {isUser && (
                                <AccessibleText variant="caption" weight="heavy" color="#0284C7" style={{ marginLeft: 4, fontSize: 12 }}>
                                  ✓✓
                                </AccessibleText>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* Sugerencias Rápidas de Texto para el Adulto Mayor */}
                  <View style={styles.waQuickChipsRow}>
                    <TouchableOpacity
                      style={styles.waChip}
                      onPress={() => setInputText('Hola hija, ya llegué')}
                    >
                      <AccessibleText variant="caption" weight="bold" color="#0F766E">
                        💬 "Hola hija, ya llegué"
                      </AccessibleText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.waChip}
                      onPress={() => setInputText('Te quiero mucho ❤️')}
                    >
                      <AccessibleText variant="caption" weight="bold" color="#0F766E">
                        ❤️ "Te quiero mucho"
                      </AccessibleText>
                    </TouchableOpacity>
                  </View>

                  {/* Barra de Entrada WhatsApp auténtica */}
                  <View style={styles.waInputBarContainer}>
                    <View
                      style={[
                        styles.waInputCapsule,
                        highlightTarget && currentStep?.targetAction === 'TAP_INPUT' && styles.highlightGlow,
                      ]}
                    >
                      <AccessibleText variant="title" style={styles.waInputIcon}>😊</AccessibleText>
                      <TextInput
                        style={styles.waRealInput}
                        value={inputText}
                        onChangeText={setInputText}
                        onFocus={handleInputFocus}
                        placeholder="Mensaje"
                        placeholderTextColor="#94A3B8"
                      />
                      <AccessibleText variant="title" style={styles.waInputIcon}>📎</AccessibleText>
                      <AccessibleText variant="title" style={styles.waInputIcon}>📷</AccessibleText>
                    </View>

                    {/* Botón flotante verde: Micrófono o Flecha de Enviar */}
                    {inputText.trim().length > 0 ? (
                      <TouchableOpacity
                        style={[
                          styles.waFabBtn,
                          highlightTarget && currentStep?.targetAction === 'TAP_SEND' && styles.highlightGlow,
                        ]}
                        onPress={() => handleSendMessage()}
                        accessibilityLabel="Enviar mensaje"
                      >
                        <AccessibleText variant="title" weight="heavy" color="#FFFFFF">
                          ➤
                        </AccessibleText>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.waFabBtn,
                          isRecordingAudio && { backgroundColor: '#DC2626' },
                          highlightTarget && currentStep?.targetAction === 'RECORD_AUDIO' && styles.highlightGlow,
                        ]}
                        onPressIn={handleStartRecording}
                        onPressOut={handleStopRecording}
                        accessibilityLabel="Mantener presionado para enviar nota de voz"
                      >
                        <AccessibleText variant="title" color="#FFFFFF">
                          {isRecordingAudio ? '🔴' : '🎤'}
                        </AccessibleText>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ======================================================== */}
        {/* SANDBOX 2: SIMULADOR DE CÁMARA AUTÉNTICA                 */}
        {/* ======================================================== */}
        {lesson?.module === 'camera' && (
          <View style={styles.cameraDeviceContainer}>
            {/* Barra superior de cámara */}
            <View style={styles.cameraTopControls}>
              <AccessibleText variant="caption" weight="heavy" color="#FACC15">⚡ AUTO</AccessibleText>
              <AccessibleText variant="caption" weight="heavy" color="#FFFFFF">⏱️ OFF</AccessibleText>
              <AccessibleText variant="caption" weight="heavy" color="#FFFFFF">4:3</AccessibleText>
              <AccessibleText variant="caption" weight="heavy" color="#FFFFFF">⚙️</AccessibleText>
            </View>

            {/* Visor central de la cámara */}
            <TouchableOpacity
              activeOpacity={0.95}
              style={styles.cameraViewfinderArea}
              onPress={(e) => {
                const { locationX, locationY } = e.nativeEvent;
                handleFocusCamera(locationX, locationY);
              }}
            >
              {cameraPermission?.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing={cameraFacing}
                />
              ) : (
                <View style={styles.cameraFallbackScene}>
                  <AccessibleText variant="title" weight="heavy" style={{ fontSize: 60, textAlign: 'center' }}>
                    🌻🌷🪴
                  </AccessibleText>
                  <AccessibleText variant="bodyLarge" weight="heavy" color="#FFFFFF" align="center" style={{ marginTop: 8 }}>
                    Jarrones con Flores en la Sala
                  </AccessibleText>
                  {!cameraPermission?.granted && (
                    <TouchableOpacity
                      style={styles.cameraPermBtn}
                      onPress={requestCameraPermission}
                    >
                      <AccessibleText variant="caption" weight="heavy" color="#FFFFFF">
                        📷 Toca aquí para ver tu cámara real
                      </AccessibleText>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Cuadrícula de tercios fotográfica */}
              <View style={styles.cameraGridLines} pointerEvents="none">
                <View style={styles.cameraGridRow}>
                  <View style={styles.cameraGridCell} />
                  <View style={styles.cameraGridCell} />
                  <View style={styles.cameraGridCell} />
                </View>
                <View style={styles.cameraGridRow}>
                  <View style={styles.cameraGridCell} />
                  <View style={styles.cameraGridCell} />
                  <View style={styles.cameraGridCell} />
                </View>
              </View>

              {/* Recuadro de Enfoque Táctil Amarillo */}
              {cameraFocused && (
                <View
                  style={[
                    styles.focusBoxSquare,
                    focusCoords
                      ? { left: Math.max(20, focusCoords.x - 40), top: Math.max(20, focusCoords.y - 40) }
                      : { alignSelf: 'center', top: '35%' },
                  ]}
                  pointerEvents="none"
                >
                  <View style={styles.focusCornerTL} />
                  <View style={styles.focusCornerTR} />
                  <View style={styles.focusCornerBL} />
                  <View style={styles.focusCornerBR} />
                  <AccessibleText variant="caption" weight="heavy" color="#FACC15" style={styles.focusSunIcon}>
                    ☀️
                  </AccessibleText>
                </View>
              )}

              {/* Destello de Flash blanco al disparar */}
              {isShutterFlashing && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FFFFFF' }]} />
              )}
            </TouchableOpacity>

            {/* Selector de Modos (FOTO / VIDEO / RETRATO) */}
            <View style={styles.cameraModesBar}>
              <AccessibleText variant="caption" weight="bold" color="#94A3B8">NOCHE</AccessibleText>
              <AccessibleText variant="caption" weight="bold" color="#94A3B8">VIDEO</AccessibleText>
              <View style={styles.cameraActiveMode}>
                <AccessibleText variant="caption" weight="heavy" color="#FACC15">FOTO</AccessibleText>
                <View style={styles.activeModeDot} />
              </View>
              <AccessibleText variant="caption" weight="bold" color="#94A3B8">RETRATO</AccessibleText>
            </View>

            {/* Fila de Obturador Gigante y Controles Inferiores */}
            <View style={styles.cameraBottomShutterBar}>
              {/* Miniatura de Galería */}
              <TouchableOpacity
                style={[
                  styles.cameraThumbPreview,
                  highlightTarget && currentStep?.targetAction === 'PREVIEW_PHOTO' && styles.highlightGlow,
                ]}
                onPress={handlePreviewPhoto}
                accessibilityLabel="Ver foto tomada"
              >
                {photoTaken ? (
                  <AccessibleText variant="title">🌻</AccessibleText>
                ) : (
                  <AccessibleText variant="caption" color="#94A3B8">Vacío</AccessibleText>
                )}
              </TouchableOpacity>

              {/* Botón Obturador Gigante con Anillo */}
              <TouchableOpacity
                style={[
                  styles.shutterOuterRing,
                  highlightTarget && currentStep?.targetAction === 'TAKE_PHOTO' && styles.highlightGlow,
                ]}
                onPress={handleTakePhoto}
                accessibilityLabel="Tomar fotografía"
              >
                <View style={styles.shutterInnerCircle} />
              </TouchableOpacity>

              {/* Botón de Cambiar Cámara (Selfie) */}
              <TouchableOpacity
                style={[
                  styles.cameraFlipBtn,
                  highlightTarget && currentStep?.targetAction === 'FLIP_CAMERA' && styles.highlightGlow,
                ]}
                onPress={handleFlipCamera}
                accessibilityLabel="Cambiar entre cámara trasera y delantera"
              >
                <AccessibleText variant="title" color="#FFFFFF">🔄</AccessibleText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* SANDBOX 3: SIMULADOR DE LLAMADAS (lesson-call)            */}
        {/* ======================================================== */}
        {lesson?.module === 'calls' && (
          <View style={styles.callScreenContainer}>
            {!isCallActive && !isCallEnded ? (
              // Pantalla de Llamada Entrante
              <View style={styles.incomingCallBox}>
                <View style={styles.callerAvatarWrapper}>
                  <AccessibleText variant="title" style={{ fontSize: 72 }}>👨‍⚕️</AccessibleText>
                </View>

                <TouchableOpacity
                  style={[
                    styles.callerInfoGroup,
                    highlightTarget && currentStep?.targetAction === 'IDENTIFY_CALLER' && styles.highlightGlow,
                  ]}
                  onPress={handleIdentifyCaller}
                >
                  <AccessibleText variant="header" weight="heavy" color="#FFFFFF" align="center">
                    Doctor Martínez
                  </AccessibleText>
                  <AccessibleText variant="subtitle" weight="bold" color="#60A5FA" align="center" style={{ marginTop: 4 }}>
                    Cardiología - Hospital Central
                  </AccessibleText>
                  <AccessibleText variant="body" color="#94A3B8" align="center" style={{ marginTop: 2 }}>
                    📞 +57 310 456 7890
                  </AccessibleText>
                  <View style={styles.ringingPill}>
                    <AccessibleText variant="caption" weight="heavy" color="#FACC15">
                      📳 LLAMADA ENTRANTE...
                    </AccessibleText>
                  </View>
                </TouchableOpacity>

                <View style={styles.callIncomingActions}>
                  <TouchableOpacity
                    style={[styles.callCircleBtn, { backgroundColor: '#DC2626' }]}
                    onPress={handleEndCall}
                  >
                    <AccessibleText variant="title" color="#FFFFFF">🔴</AccessibleText>
                    <AccessibleText variant="caption" weight="heavy" color="#FFFFFF">Rechazar</AccessibleText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.callCircleBtn,
                      { backgroundColor: '#16A34A', transform: [{ scale: 1.1 }] },
                      highlightTarget && currentStep?.targetAction === 'ANSWER_CALL' && styles.highlightGlow,
                    ]}
                    onPress={handleAnswerCall}
                  >
                    <AccessibleText variant="title" color="#FFFFFF">📞</AccessibleText>
                    <AccessibleText variant="caption" weight="heavy" color="#FFFFFF">CONTESTAR</AccessibleText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : isCallActive ? (
              // Pantalla de Llamada en Curso
              <View style={styles.activeCallBox}>
                <AccessibleText variant="title" style={{ fontSize: 56, textAlign: 'center' }}>👨‍⚕️</AccessibleText>
                <AccessibleText variant="header" weight="heavy" color="#FFFFFF" align="center">
                  Doctor Martínez
                </AccessibleText>
                <AccessibleText variant="subtitle" weight="bold" color="#4ADE80" align="center" style={{ marginTop: 4 }}>
                  00:18 ⏱️ En línea
                </AccessibleText>

                {/* Utilidades de la llamada */}
                <View style={styles.activeCallGrid}>
                  <TouchableOpacity style={styles.activeCallUtilBtn}>
                    <AccessibleText variant="title">🔇</AccessibleText>
                    <AccessibleText variant="caption" color="#FFFFFF" weight="bold">Silenciar</AccessibleText>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.activeCallUtilBtn}>
                    <AccessibleText variant="title">🔢</AccessibleText>
                    <AccessibleText variant="caption" color="#FFFFFF" weight="bold">Teclado</AccessibleText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.activeCallUtilBtn,
                      isSpeakerActive && { backgroundColor: '#16A34A', borderColor: '#4ADE80', borderWidth: 3 },
                      highlightTarget && currentStep?.targetAction === 'TOGGLE_SPEAKER' && styles.highlightGlow,
                    ]}
                    onPress={handleToggleSpeaker}
                  >
                    <AccessibleText variant="title">🔊</AccessibleText>
                    <AccessibleText variant="caption" color="#FFFFFF" weight="heavy">
                      {isSpeakerActive ? 'ALTAVOZ ON' : 'ALTAVOZ'}
                    </AccessibleText>
                  </TouchableOpacity>
                </View>

                {/* Botón de Colgar */}
                <TouchableOpacity
                  style={[
                    styles.endCallBigBtn,
                    highlightTarget && currentStep?.targetAction === 'END_CALL' && styles.highlightGlow,
                  ]}
                  onPress={handleEndCall}
                >
                  <AccessibleText variant="title" color="#FFFFFF">🔴 COLGAR LLAMADA</AccessibleText>
                </TouchableOpacity>
              </View>
            ) : (
              // Llamada Finalizada
              <View style={styles.callEndedBox}>
                <AccessibleText variant="title" weight="heavy" color="#4ADE80" align="center">
                  ✅ Llamada Finalizada
                </AccessibleText>
                <AccessibleText variant="bodyLarge" color="#CBD5E1" align="center" style={{ marginTop: 8 }}>
                  Has aprendido cómo identificar quién te llama, contestar y poner el altavoz para hablar con comodidad.
                </AccessibleText>
                <AccessibleButton
                  title="🔄 Practicar Otra Llamada"
                  variant="secondary"
                  minHeight={60}
                  onPress={resetLesson}
                  style={{ marginTop: spacing.md }}
                />
              </View>
            )}
          </View>
        )}

        {/* ======================================================== */}
        {/* SANDBOX 4: SIMULADOR DE AUDIOS DE WHATSAPP (lesson-audio) */}
        {/* ======================================================== */}
        {lesson?.module === 'audio' && (
          <View style={styles.waContainer}>
            <View style={styles.waChatHeader}>
              <View style={styles.waHeaderAvatar}>
                <AccessibleText variant="subtitle">👩</AccessibleText>
              </View>
              <View style={styles.waHeaderTitleCol}>
                <AccessibleText variant="subtitle" weight="heavy" color="#FFFFFF">
                  María Gómez (Hija)
                </AccessibleText>
                <AccessibleText variant="caption" color="#A7F3D0">
                  en línea
                </AccessibleText>
              </View>
            </View>

            <View style={[styles.waWallpaper, { padding: spacing.md }]}>
              <AccessibleText variant="caption" weight="bold" color="#475569" align="center" style={{ marginBottom: spacing.md }}>
                👇 Aprende a escuchar notas de voz de tu familia:
              </AccessibleText>

              {/* Burbuja interactiva de Nota de Voz */}
              <View style={[styles.waBubble, styles.waBubbleOther, { padding: spacing.md }]}>
                <View style={styles.waAudioPlayerRow}>
                  <TouchableOpacity
                    style={[
                      styles.waBigPlayBtn,
                      highlightTarget &&
                        (currentStep?.targetAction === 'PLAY_VOICE_NOTE' || currentStep?.targetAction === 'PAUSE_VOICE_NOTE') &&
                        styles.highlightGlow,
                    ]}
                    onPress={voiceNotePlaying ? handlePauseVoiceNote : handlePlayVoiceNote}
                  >
                    <AccessibleText variant="title" color="#FFFFFF">
                      {voiceNotePlaying ? '⏸️' : '▶️'}
                    </AccessibleText>
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
                    {/* Barra de progreso de audio */}
                    <View style={styles.waAudioTrackBg}>
                      <View style={[styles.waAudioTrackFill, { width: voiceNotePlaying ? '65%' : '0%' }]} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <AccessibleText variant="caption" color="#64748B" weight="bold">
                        {voiceNotePlaying ? '0:03' : '0:00'}
                      </AccessibleText>
                      <AccessibleText variant="caption" color="#64748B">
                        0:07
                      </AccessibleText>
                    </View>
                  </View>

                  {/* Botón de Velocidad (1x / 1.5x / 2x) */}
                  <TouchableOpacity
                    style={[
                      styles.waSpeedBtn,
                      highlightTarget && currentStep?.targetAction === 'SPEED_VOICE_NOTE' && styles.highlightGlow,
                    ]}
                    onPress={handleSpeedVoiceNote}
                  >
                    <AccessibleText variant="caption" weight="heavy" color="#0F766E">
                      {voiceNoteSpeed}
                    </AccessibleText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tarjeta de Consejo Accesible */}
              <View style={styles.audioTipCard}>
                <AccessibleText variant="body" weight="heavy" color="#1E3A8A">
                  💡 Consejo de Oído Privado:
                </AccessibleText>
                <AccessibleText variant="caption" color="#1E40AF" style={{ marginTop: 4 }}>
                  Si te llevas el celular a la oreja mientras suena el audio, la pantalla se apaga y el audio suena solo para ti, sin que nadie más escuche.
                </AccessibleText>
              </View>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* SANDBOX 5: SIMULADOR DE GALERÍA (lesson-gal)              */}
        {/* ======================================================== */}
        {lesson?.module === 'gallery' && (
          <AccessibleCard style={[styles.sandboxCard, { borderColor: theme.border }]}>
            <AccessibleText variant="subtitle" weight="heavy" color={theme.textPrimary} style={styles.sandboxTitle}>
              🖼️ Galería de Recuerdos Familiares
            </AccessibleText>

            {selectedPhotoIndex === null ? (
              <View style={styles.galleryGrid}>
                <TouchableOpacity
                  style={[
                    styles.photoGridCard,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: getBorderColorForTarget(currentStep?.targetAction === 'SELECT_PHOTO'),
                      borderWidth: highlightTarget && currentStep?.targetAction === 'SELECT_PHOTO' ? 4 : 2,
                    },
                  ]}
                  onPress={() => handleSelectGalleryPhoto(0)}
                >
                  <AccessibleText variant="title" weight="heavy">🎂</AccessibleText>
                  <AccessibleText variant="subtitle" weight="heavy" color={theme.textPrimary}>
                    Cumpleaños Familiar
                  </AccessibleText>
                  <AccessibleText variant="body" color={theme.textSecondary}>
                    Toca para ver en grande
                  </AccessibleText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.photoGridCard, { backgroundColor: theme.surfaceElevated }]}
                  onPress={() => handleSelectGalleryPhoto(1)}
                >
                  <AccessibleText variant="title" weight="heavy">🌳</AccessibleText>
                  <AccessibleText variant="subtitle" weight="heavy" color={theme.textPrimary}>
                    Paseo al Parque
                  </AccessibleText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoDetailContainer}>
                <View
                  style={[
                    styles.largePhotoView,
                    { transform: [{ scale: photoZoomLevel }] },
                  ]}
                >
                  <AccessibleText variant="title" weight="heavy" style={{ fontSize: 64 }}>
                    🎂👨‍👩‍👧‍👦
                  </AccessibleText>
                  <AccessibleText variant="subtitle" weight="heavy" color="#FFFFFF">
                    Cumpleaños en Familia
                  </AccessibleText>
                </View>

                <View style={styles.galleryControls}>
                  <AccessibleButton
                    title={photoZoomLevel > 1 ? '🔍 Alejar Foto (-)' : '🔍 Acercar Foto (+)'}
                    variant="secondary"
                    minHeight={64}
                    onPress={handleZoomPhoto}
                  />

                  <AccessibleButton
                    title="📤 Compartir con María"
                    subtitle="Enviar foto a WhatsApp"
                    variant="learning"
                    minHeight={68}
                    onPress={handleSharePhoto}
                  />
                </View>
              </View>
            )}
          </AccessibleCard>
        )}

        {/* ======================================================== */}
        {/* SANDBOX 6: SIMULADOR DE SEGURIDAD (lesson-sec)            */}
        {/* ======================================================== */}
        {lesson?.module === 'security' && (
          <AccessibleCard style={[styles.sandboxCard, { borderColor: theme.border }]}>
            <AccessibleText variant="subtitle" weight="heavy" color={theme.textPrimary} style={styles.sandboxTitle}>
              🛡️ Prueba de Seguridad: ¿Qué debes hacer?
            </AccessibleText>

            {currentStepIndex === 0 && (
              <View style={styles.securityScenario}>
                <View style={[styles.scamCard, { borderColor: '#D32F2F', backgroundColor: '#FFEBEE' }]}>
                  <AccessibleText variant="subtitle" weight="heavy" color="#B71C1C">
                    ⚠️ Mensaje de Texto Sospechoso:
                  </AccessibleText>
                  <AccessibleText variant="bodyLarge" weight="bold" color="#000000" style={{ marginTop: spacing.xs }}>
                    "BANCO: Su cuenta bancaria ha sido BLOQUEADA temporalmente. Ingrese a este link urgente para validar su clave: www.banco-seguro-falso.com"
                  </AccessibleText>
                </View>

                <AccessibleText variant="subtitle" weight="heavy" color={theme.textPrimary} style={{ marginVertical: spacing.md }}>
                  ¿Cuál es la decisión correcta?
                </AccessibleText>

                <View style={styles.quizButtons}>
                  <AccessibleButton
                    title="🚫 NO ABRIR EL ENLACE Y BORRARLO"
                    subtitle="Mi banco nunca pide claves por mensaje"
                    variant="learning"
                    minHeight={84}
                    onPress={() =>
                      handleAnswerQuiz(
                        'REJECT_SCAM_SMS',
                        '¡Excelente decisión! Los bancos nunca envían enlaces para pedir claves. Siempre consulta directamente en la sucursal.'
                      )
                    }
                  />

                  <AccessibleButton
                    title="⚠️ Entrar al enlace y poner mi clave"
                    subtitle="Tengo miedo de que me bloqueen la cuenta"
                    variant="secondary"
                    minHeight={84}
                    onPress={() =>
                      handleAnswerQuiz(
                        'WRONG_OPEN_LINK',
                        '¡Peligro! Si pones tu clave en enlaces desconocidos, personas malintencionadas pueden robar tu dinero.'
                      )
                    }
                  />
                </View>
              </View>
            )}

            {currentStepIndex === 1 && (
              <View style={styles.securityScenario}>
                <View style={[styles.scamCard, { borderColor: '#FF9800', backgroundColor: '#FFF3E0' }]}>
                  <AccessibleText variant="subtitle" weight="heavy" color="#E65100">
                    📞 Llamada de Supuesto Familiar:
                  </AccessibleText>
                  <AccessibleText variant="bodyLarge" weight="bold" color="#000000" style={{ marginTop: spacing.xs }}>
                    "¡Tío! ¡Por favor ayúdame, tuve un accidente en la carretera y necesito que me consignes 200.000 pesos ya mismo a esta cuenta!"
                  </AccessibleText>
                </View>

                <AccessibleText variant="subtitle" weight="heavy" color={theme.textPrimary} style={{ marginVertical: spacing.md }}>
                  ¿Cómo debes actuar?
                </AccessibleText>

                <View style={styles.quizButtons}>
                  <AccessibleButton
                    title="📞 COLGAR Y LLAMAR DIRECTAMENTE"
                    subtitle="Marcar al número que ya tengo guardado de ese familiar para verificar"
                    variant="learning"
                    minHeight={88}
                    onPress={() =>
                      handleAnswerQuiz(
                        'VERIFY_FAMILY_CALL',
                        '¡Muy bien! Siempre cuelga y marca tú mismo. Las estafas de falsos familiares son muy comunes.'
                      )
                    }
                  />

                  <AccessibleButton
                    title="💸 Consignarle de inmediato sin preguntar"
                    subtitle="Pobre familiar, está en apuros"
                    variant="secondary"
                    minHeight={84}
                    onPress={() =>
                      handleAnswerQuiz(
                        'WRONG_SEND_MONEY',
                        'No consignes de afán. Los estafadores fingen la voz o fingen llorar para asustarte y engañarte.'
                      )
                    }
                  />
                </View>
              </View>
            )}

            {currentStepIndex === 2 && (
              <View style={styles.securityScenario}>
                <View style={[styles.scamCard, { borderColor: '#1976D2', backgroundColor: '#E3F2FD' }]}>
                  <AccessibleText variant="subtitle" weight="heavy" color="#0D47A1">
                    🎉 Supuesto Premio Millonario:
                  </AccessibleText>
                  <AccessibleText variant="bodyLarge" weight="bold" color="#000000" style={{ marginTop: spacing.xs }}>
                    "¡Felicitaciones! Ha ganado una camioneta último modelo en el concurso nacional. Para reclamarla, consigne $50.000 para gastos de transporte."
                  </AccessibleText>
                </View>

                <AccessibleText variant="subtitle" weight="heavy" color={theme.textPrimary} style={{ marginVertical: spacing.md }}>
                  ¿Qué debes responder?
                </AccessibleText>

                <View style={styles.quizButtons}>
                  <AccessibleButton
                    title="🛑 ES UNA ESTAFA, NUNCA PAGAR"
                    subtitle="Nadie pide plata para entregar un premio real"
                    variant="learning"
                    minHeight={84}
                    onPress={() =>
                      handleAnswerQuiz(
                        'REJECT_PRIZE_SCAM',
                        '¡Perfecto! Ningún premio verdadero te exige consignar dinero previo. Estás protegido.'
                      )
                    }
                  />

                  <AccessibleButton
                    title="💳 Consignar los 50.000 pesos"
                    subtitle="Para que me traigan la camioneta"
                    variant="secondary"
                    minHeight={84}
                    onPress={() =>
                      handleAnswerQuiz(
                        'WRONG_PAY_PRIZE',
                        'Cuidado. Si pagas, se quedarán con tu dinero y no te entregarán nada. Es un engaño clásico.'
                      )
                    }
                  />
                </View>
              </View>
            )}
          </AccessibleCard>
        )}
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL DE VIDEOLLAMADA SIMULADA (WhatsApp)                */}
      {/* ======================================================== */}
      <Modal visible={videoCallActive} transparent animationType="slide">
        <View style={styles.videoCallModalContainer}>
          <View style={styles.videoCallHeader}>
            <AccessibleText variant="title" weight="heavy" color="#FFFFFF">
              📹 Videollamada con María
            </AccessibleText>
            <View style={styles.videoCallBadge}>
              <AccessibleText variant="caption" weight="heavy" color="#4ADE80">
                00:15 En directo
              </AccessibleText>
            </View>
          </View>

          {/* Escena simulada de videollamada con María saludando */}
          <View style={styles.videoCallFeedSim}>
            <AccessibleText variant="title" style={{ fontSize: 90, textAlign: 'center' }}>
              👩‍🦰👋
            </AccessibleText>
            <AccessibleText variant="title" weight="heavy" color="#FFFFFF" align="center" style={{ marginTop: 12 }}>
              "¡Hola mamá! Te veo muy bien ❤️"
            </AccessibleText>
            <AccessibleText variant="body" color="#A7F3D0" align="center" style={{ marginTop: 4 }}>
              Cámara en vivo conectada
            </AccessibleText>
          </View>

          {/* Botón rojo para colgar la videollamada */}
          <View style={styles.videoCallFooter}>
            <AccessibleButton
              title="🔴 FINALIZAR VIDEOLLAMADA"
              variant="emergency"
              minHeight={66}
              onPress={handleEndVideoCall}
            />
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL DE REVISIÓN DE FOTO DE CÁMARA                      */}
      {/* ======================================================== */}
      <Modal visible={photoPreviewModal} transparent animationType="fade">
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalCard}>
            <AccessibleText variant="title" weight="heavy" color="#FFFFFF" align="center">
              🖼️ Fotografía Capturada
            </AccessibleText>
            <View style={styles.photoModalPreviewScene}>
              <AccessibleText variant="title" style={{ fontSize: 80, textAlign: 'center' }}>
                🌻🌺🌿
              </AccessibleText>
              <AccessibleText variant="subtitle" weight="heavy" color="#FFFFFF" align="center" style={{ marginTop: 8 }}>
                Jarrones con Flores
              </AccessibleText>
              <AccessibleText variant="caption" color="#CBD5E1" align="center">
                Guardada en tu memoria
              </AccessibleText>
            </View>
            <View style={styles.photoModalActions}>
              <AccessibleButton
                title="🗑️ Borrar Foto de Prueba"
                variant="emergency"
                minHeight={60}
                onPress={handleDeletePhoto}
              />
              <AccessibleButton
                title="Cerrar Vista"
                variant="secondary"
                minHeight={56}
                onPress={() => handlePreviewPhoto()}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL DE CELEBRACIÓN AL COMPLETAR LA LECCIÓN             */}
      {/* ======================================================== */}
      <Modal visible={isCompleted} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.celebrationModal, { backgroundColor: theme.surface }]}>
            <AccessibleText variant="title" weight="heavy" color={theme.learning} style={{ textAlign: 'center' }}>
              🏆 ¡Lección Completada con Éxito!
            </AccessibleText>

            <AccessibleText variant="bodyLarge" weight="medium" color={theme.textPrimary} style={styles.modalBody}>
              {pedagogyProfile.encouragementText}
            </AccessibleText>

            <View style={[styles.pedagogyBadge, { backgroundColor: theme.surfaceElevated }]}>
              <AccessibleText variant="subtitle" weight="heavy" color={theme.learning}>
                Nivel Recomendado: {pedagogyProfile.difficultyRecommended.toUpperCase()}
              </AccessibleText>
              <AccessibleText variant="body" color={theme.textSecondary}>
                {pedagogyProfile.feedbackMessage}
              </AccessibleText>
            </View>

            <View style={styles.modalButtons}>
              <AccessibleButton
                title="🔄 Practicar Nuevamente"
                variant="secondary"
                minHeight={64}
                onPress={resetLesson}
              />

              <AccessibleButton
                title="⬅️ Volver a Lecciones"
                variant="learning"
                minHeight={64}
                onPress={() => navigation.goBack()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  instructionCard: {
    borderWidth: 3,
    marginBottom: spacing.md,
  },
  instructionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintPillBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  instructionText: {
    marginTop: spacing.sm,
  },
  hintBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  feedbackBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  highlightGlow: {
    borderWidth: 4,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },

  // ==========================================
  // ESTILOS DE WHATSAPP AUTÉNTICO
  // ==========================================
  deviceFrame: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#075E54',
    elevation: 4,
  },
  waContainer: {
    backgroundColor: '#ECE5DD',
    minHeight: 480,
  },
  waTopBar: {
    backgroundColor: '#075E54',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waTopBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waTabsRow: {
    backgroundColor: '#075E54',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  waTabActive: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#FFFFFF',
  },
  waTabInactive: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  waListBody: {
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    minHeight: 400,
  },
  waNoticeText: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  waChatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  waAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  waOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  waChatInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  waChatNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waChatPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  waUnreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },

  // Vista dentro del chat
  waChatHeader: {
    backgroundColor: '#075E54',
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waBackBtn: {
    paddingRight: 6,
  },
  waHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waHeaderTitleCol: {
    flex: 1,
    marginLeft: 8,
  },
  waHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waHeaderIconBtn: {
    padding: 6,
    borderRadius: borderRadius.sm,
  },
  waWallpaper: {
    flex: 1,
    backgroundColor: '#ECE5DD',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  waDatePill: {
    alignSelf: 'center',
    backgroundColor: '#D1E7DD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: spacing.xs,
  },
  waMessagesScroll: {
    maxHeight: 280,
  },
  waMessageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  waBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  waBubbleOther: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
  },
  waBubbleUser: {
    backgroundColor: '#D9FDD3',
    borderTopRightRadius: 2,
  },
  waBubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  waAudioBubbleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waAudioPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waWaveformSim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waWaveBar: {
    width: 4,
    height: 16,
    backgroundColor: '#0F766E',
    borderRadius: 2,
  },
  waQuickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
  },
  waChip: {
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  waInputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  waInputCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 12,
    minHeight: 48,
    elevation: 2,
  },
  waInputIcon: {
    paddingHorizontal: 4,
  },
  waRealInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    paddingHorizontal: 6,
  },
  waFabBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A884',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  // ==========================================
  // ESTILOS DE CÁMARA AUTÉNTICA
  // ==========================================
  cameraDeviceContainer: {
    backgroundColor: '#000000',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minHeight: 520,
  },
  cameraTopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    backgroundColor: '#000000',
  },
  cameraViewfinderArea: {
    height: 340,
    width: '100%',
    position: 'relative',
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  cameraFallbackScene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  cameraPermBtn: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  cameraGridLines: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  cameraGridRow: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  cameraGridCell: {
    flex: 1,
    borderRightWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  focusBoxSquare: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 14,
    height: 14,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FACC15',
  },
  focusCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FACC15',
  },
  focusCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 14,
    height: 14,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FACC15',
  },
  focusCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FACC15',
  },
  focusSunIcon: {
    fontSize: 16,
  },
  cameraModesBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 10,
    backgroundColor: '#000000',
  },
  cameraActiveMode: {
    alignItems: 'center',
  },
  activeModeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FACC15',
    marginTop: 2,
  },
  cameraBottomShutterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#000000',
  },
  cameraThumbPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shutterOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  cameraFlipBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ==========================================
  // ESTILOS DE LLAMADAS TELEFÓNICAS
  // ==========================================
  callScreenContainer: {
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.lg,
    minHeight: 460,
    padding: spacing.md,
    justifyContent: 'center',
  },
  incomingCallBox: {
    alignItems: 'center',
  },
  callerAvatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    borderWidth: 3,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  callerInfoGroup: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  ringingPill: {
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FACC15',
    marginTop: spacing.md,
  },
  callIncomingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  callCircleBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  activeCallBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  activeCallGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: spacing.xl,
  },
  activeCallUtilBtn: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallBigBtn: {
    backgroundColor: '#DC2626',
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  callEndedBox: {
    padding: spacing.lg,
    alignItems: 'center',
  },

  // ==========================================
  // ESTILOS DE AUDIOS DE WHATSAPP
  // ==========================================
  waAudioPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waBigPlayBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waAudioTrackBg: {
    height: 8,
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  waAudioTrackFill: {
    height: '100%',
    backgroundColor: '#0F766E',
    borderRadius: 4,
  },
  waSpeedBtn: {
    backgroundColor: '#CCFBF1',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#0F766E',
  },
  audioTipCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },

  // Modales
  videoCallModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  videoCallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  videoCallBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  videoCallFeedSim: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCallFooter: {
    marginBottom: spacing.xl,
  },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  photoModalCard: {
    backgroundColor: '#1E293B',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  photoModalPreviewScene: {
    height: 240,
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  photoModalActions: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  celebrationModal: {
    width: '100%',
    maxWidth: 460,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    elevation: 8,
  },
  modalBody: {
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  pedagogyBadge: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    gap: spacing.sm,
  },

  // Sandbox Galería y Seguridad
  sandboxCard: {
    borderWidth: 2,
    padding: spacing.md,
  },
  sandboxTitle: {
    marginBottom: spacing.sm,
  },
  galleryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoGridCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  photoDetailContainer: {
    alignItems: 'center',
  },
  largePhotoView: {
    width: '100%',
    height: 220,
    backgroundColor: '#374151',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  galleryControls: {
    width: '100%',
    gap: spacing.sm,
  },
  securityScenario: {
    marginTop: spacing.xs,
  },
  scamCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  quizButtons: {
    gap: spacing.md,
  },
});
