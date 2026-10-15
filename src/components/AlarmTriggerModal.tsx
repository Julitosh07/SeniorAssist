import React, { useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  Animated, 
  Platform 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AccessibleText } from './AccessibleText';
import { AccessibleButton } from './AccessibleButton';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing } from '../constants/theme';
import { alarmService } from '../services/AlarmService';

export interface AlarmTriggerModalProps {
  visible: boolean;
  medicationName: string;
  onDismiss: () => void;
}

export const AlarmTriggerModal: React.FC<AlarmTriggerModalProps> = ({
  visible,
  medicationName,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => {
        pulse.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [visible, pulseAnim]);

  const handleTurnOffAlarm = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    await alarmService.stopAlarmAlert();
    onDismiss();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleTurnOffAlarm}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: '#DC2626' }]}>
          {/* Icono de Alarma Pulsante */}
          <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <AccessibleText style={styles.bellIcon}>⏰💊</AccessibleText>
          </Animated.View>

          {/* Título de Alarma */}
          <AccessibleText
            variant="hero"
            weight="heavy"
            align="center"
            color="#DC2626"
            style={styles.title}
          >
            ¡HORA DE TU MEDICAMENTO!
          </AccessibleText>

          {/* Nombre de la Medicina */}
          <View style={[styles.medBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <AccessibleText
              variant="title"
              weight="heavy"
              align="center"
              color={theme.textPrimary}
              style={styles.medName}
            >
              {medicationName}
            </AccessibleText>
          </View>

          {/* Indicación amigable */}
          <AccessibleText
            variant="bodyLarge"
            weight="semibold"
            align="center"
            color={theme.textSecondary}
            style={styles.instruction}
          >
            Es momento de tomar tu medicina con un buen vaso de agua para cuidar tu salud.
          </AccessibleText>

          {/* Botón Gigante de Apagado */}
          <View style={styles.buttonWrapper}>
            <AccessibleButton
              title="✅ YA LO TOMÉ / APAGAR ALARMA"
              subtitle="Toca aquí para apagar el sonido de la alarma"
              variant="emergency"
              minHeight={84}
              onPress={handleTurnOffAlarm}
              accessibilityLabel="Botón para apagar la alarma y confirmar que tomaste tu medicina"
              accessibilityHint="Apaga el tono de alarma sonora"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: borderRadius.lg,
    borderWidth: 4,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
  },
  iconWrapper: {
    marginBottom: spacing.sm,
  },
  bellIcon: {
    fontSize: 64,
    lineHeight: 70,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: spacing.md,
  },
  medBox: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  medName: {
    fontSize: 24,
    lineHeight: 28,
  },
  instruction: {
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  buttonWrapper: {
    width: '100%',
  },
});
