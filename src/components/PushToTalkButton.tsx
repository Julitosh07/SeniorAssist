import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Pressable, 
  StyleSheet, 
  Animated, 
  Platform 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AccessibleText } from './AccessibleText';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing } from '../constants/theme';
import { AssistantState } from '../types/intents';
import { voiceService } from '../services/VoiceService';

export interface PushToTalkButtonProps {
  state: AssistantState;
  onPressIn: () => void;
  onPressOut: () => void;
  onClickToggle?: () => void; // Alternativa por toque simple para accesibilidad motriz
}

export const PushToTalkButton: React.FC<PushToTalkButtonProps> = ({
  state,
  onPressIn,
  onPressOut,
  onClickToggle,
}) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const pressInTime = useRef<number>(0);
  const handlePressIn = async () => {
    // Cortar de inmediato cualquier locución del asistente para que no se escuche encima del usuario
    voiceService.stopSpeaking();

    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch {}

    if (isListening) {
      // Si ya está escuchando y el usuario vuelve a tocar, procesar
      onPressOut();
      return;
    }

    pressInTime.current = Date.now();
    try {
      onPressIn();
    } catch (e) {
      console.warn('Error ejecutando onPressIn:', e);
    }
  };

  const handlePressOut = async () => {
    const elapsed = Date.now() - pressInTime.current;

    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {}

    if (elapsed < 350) {
      // Toque rápido: no cortar, dejar que el motor reconozca y auto-ejecute al terminar de hablar
      return;
    }

    // Fue pulsación sostenida: procesar lo dicho al soltar
    try {
      onPressOut();
    } catch (e) {
      console.warn('Error ejecutando onPressOut:', e);
    }
  };

  // Texto y estilo según estado
  const getButtonContent = () => {
    if (isListening) {
      return {
        label: 'Escuchando...',
        sublabel: 'Habla tu orden, se ejecutará sola',
        bgColor: theme.listening,
        icon: '🎙️',
        borderColor: '#1E40AF',
      };
    }
    if (isProcessing) {
      return {
        label: 'Ejecutando...',
        sublabel: 'Procesando tu orden inmediatamente',
        bgColor: theme.primary,
        icon: '⏳',
        borderColor: '#1E3A8A',
      };
    }
    return {
      label: 'Toca para Hablar',
      sublabel: 'O mantén presionado si prefieres',
      bgColor: theme.primary,
      icon: '🎤',
      borderColor: '#1D4ED8',
    };
  };

  const current = getButtonContent();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedWrapper,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onClickToggle}
          accessibilityRole="button"
          accessibilityLabel={`Botón principal de voz: ${current.label}`}
          accessibilityHint="Mantén presionado para hablarle al asistente y suelta al terminar"
          style={({ pressed }) => [
            styles.circleButton,
            {
              backgroundColor: current.bgColor,
              borderColor: current.borderColor,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <AccessibleText style={styles.iconText}>
              {current.icon}
            </AccessibleText>
          </View>
          <AccessibleText
            variant="button"
            weight="heavy"
            color="#FFFFFF"
            align="center"
            style={styles.actionLabel}
          >
            {current.label}
          </AccessibleText>
        </Pressable>
      </Animated.View>

      <View style={styles.helperTextContainer}>
        <AccessibleText
          variant="bodyLarge"
          weight="semibold"
          color={theme.textSecondary}
          align="center"
        >
          {current.sublabel}
        </AccessibleText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  animatedWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButton: {
    width: 170,
    height: 170,
    borderRadius: borderRadius.full,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 4,
  },
  iconText: {
    fontSize: 48,
    lineHeight: 54,
  },
  actionLabel: {
    marginTop: 2,
    fontSize: 19,
    lineHeight: 22,
  },
  helperTextContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
