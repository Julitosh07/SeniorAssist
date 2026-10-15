import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useHomeViewModel } from '../../viewmodels/useHomeViewModel';
import { HeaderBar } from '../../components/HeaderBar';
import { PushToTalkButton } from '../../components/PushToTalkButton';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleText } from '../../components/AccessibleText';
import { FeedbackModal } from '../../components/FeedbackModal';
import { AlarmTriggerModal } from '../../components/AlarmTriggerModal';
import { EmergencySetupModal } from '../../components/EmergencySetupModal';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../constants/theme';

export const HomeView: React.FC = () => {
  const { theme } = useTheme();
  const {
    state,
    transcript,
    modal,
    isHandsFree,
    toggleHandsFree,
    startListening,
    stopListening,
    dismissModal,
    navigateTo,
    emergencySetupVisible,
    handleEmergencySetupCompleted,
    alarmRingingMedication,
    dismissAlarmModal,
  } = useHomeViewModel();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="SeniorAssist" showBack={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección Central de Asistente de Voz (Push-to-Talk) */}
        <View style={styles.voiceSection}>
          <AccessibleText
            variant="title"
            weight="heavy"
            align="center"
            color={theme.textPrimary}
          >
            ¿En qué te puedo ayudar hoy?
          </AccessibleText>

          <PushToTalkButton
            state={state}
            onPressIn={startListening}
            onPressOut={stopListening}
          />

          {/* Botón de Modo Manos Libres (Detecta palabra "Asistente") */}
          <View style={{ marginTop: spacing.md, width: '100%' }}>
            <AccessibleButton
              title={isHandsFree ? '🗣️ MANOS LIBRES: SIEMPRE ACTIVO' : '🗣️ ACTIVAR MANOS LIBRES'}
              subtitle={
                isHandsFree
                  ? 'Escuchando la palabra "Asistente" sin tocar la pantalla'
                  : 'Toca para reactivar la escucha por voz sin manos'
              }
              variant={isHandsFree ? 'learning' : 'secondary'}
              minHeight={66}
              onPress={toggleHandsFree}
              accessibilityHint="Activa o desactiva la escucha continua de la palabra Asistente"
            />
          </View>

          {transcript ? (
            <View style={[styles.transcriptBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              <AccessibleText
                variant="bodyLarge"
                weight="bold"
                align="center"
                color={theme.primary}
              >
                {transcript}
              </AccessibleText>
            </View>
          ) : null}
        </View>

        {/* Separador de acceso directo */}
        <View style={styles.sectionHeader}>
          <AccessibleText
            variant="title"
            weight="heavy"
            color={theme.textPrimary}
          >
            O elige una opción con un toque:
          </AccessibleText>
        </View>

        {/* Cuadrícula de Acceso Rápido con Botones Gigantes */}
        <View style={styles.gridContainer}>
          {/* Botón de Emergencia SOS */}
          <View style={styles.fullWidthRow}>
            <AccessibleButton
              title="🚨 SOS / AUXILIO"
              subtitle="Llamada y mensaje de emergencia con tu ubicación"
              variant="emergency"
              minHeight={76}
              onPress={() => navigateTo('SOS')}
              accessibilityHint="Abre la pantalla de emergencia y activa la alerta de socorro"
            />
          </View>

          {/* Botón de Contactos y WhatsApp */}
          <View style={styles.fullWidthRow}>
            <AccessibleButton
              title="👥 Llamadas y WhatsApp"
              subtitle="Llama a tu familia o envía un mensaje guiado"
              variant="primary"
              minHeight={76}
              onPress={() => navigateTo('Contacts')}
              accessibilityHint="Abre tu lista de familiares y seres queridos para llamar o escribir"
            />
          </View>

          {/* Fila 1: Linterna y Lupa */}
          <View style={styles.twoColumnRow}>
            <View style={styles.columnItem}>
              <AccessibleButton
                title="🔦 Linterna"
                subtitle="Encender luz"
                variant="flashlight"
                minHeight={80}
                onPress={() => navigateTo('Flashlight')}
                accessibilityHint="Abre la linterna del teléfono"
              />
            </View>
            <View style={styles.columnItem}>
              <AccessibleButton
                title="🔍 Lupa"
                subtitle="Agrandar texto"
                variant="magnifier"
                minHeight={80}
                onPress={() => navigateTo('Magnifier')}
                accessibilityHint="Abre la cámara como lupa digital con aumento"
              />
            </View>
          </View>

          {/* Fila 2: Radio y Aprender */}
          <View style={styles.twoColumnRow}>
            <View style={styles.columnItem}>
              <AccessibleButton
                title="📻 Radio"
                subtitle="Emisoras en vivo"
                variant="radio"
                minHeight={80}
                onPress={() => navigateTo('Radio')}
                accessibilityHint="Abre el reproductor de radio accesible"
              />
            </View>
            <View style={styles.columnItem}>
              <AccessibleButton
                title="📖 Aprender"
                subtitle="Tutor y lecciones"
                variant="learning"
                minHeight={80}
                onPress={() => navigateTo('Learning')}
                accessibilityHint="Abre lecciones interactivas para aprender a usar el teléfono"
              />
            </View>
          </View>

          {/* Fila 3: Alarmas de Medicamentos */}
          <View style={styles.fullWidthRow}>
            <AccessibleButton
              title="💊 Alarmas de Medicamentos"
              subtitle="Ver y configurar tus recordatorios de pastillas"
              variant="alarms"
              minHeight={72}
              onPress={() => navigateTo('Alarms')}
              accessibilityHint="Abre la lista de recordatorios y alarmas de salud"
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal de retroalimentación amigable */}
      <FeedbackModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={dismissModal}
      />

      {/* Modal de Alarma Sonora de Medicamento con Botón Gigante de Apagado */}
      <AlarmTriggerModal
        visible={Boolean(alarmRingingMedication)}
        medicationName={alarmRingingMedication || 'tu medicamento'}
        onDismiss={dismissAlarmModal}
      />

      {/* Modal de Configuración Inicial de Emergencia (Primer Inicio Obligatorio) */}
      <EmergencySetupModal
        visible={emergencySetupVisible}
        onSaved={handleEmergencySetupCompleted}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  transcriptBox: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    maxWidth: '90%',
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  gridContainer: {
    gap: spacing.md,
  },
  fullWidthRow: {
    width: '100%',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  columnItem: {
    flex: 1,
  },
});
