import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AccessibleText } from './AccessibleText';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius } from '../constants/theme';

import { voiceService } from '../services/VoiceService';

import { useGlobalVoiceAssistant } from '../context/GlobalVoiceAssistantContext';

export interface HeaderBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightAction,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  let globalAssistant: any = null;
  try {
    globalAssistant = useGlobalVoiceAssistant();
  } catch {}

  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 24 : 10);

  const handleBack = async () => {
    // Detener de inmediato cualquier locución en curso y rearmar la escucha del asistente
    voiceService.stopSpeaking();
    if (globalAssistant && typeof globalAssistant.resetToIdleAndListen === 'function') {
      globalAssistant.resetToIdleAndListen();
    }

    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
    if (onBack) onBack();
  };

  const hasBackButton = showBack && !!onBack;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
          paddingTop: topInset + spacing.xs,
        },
      ]}
      accessibilityRole="header"
    >
      <View style={[styles.leftContainer, !hasBackButton && styles.emptyLeftContainer]}>
        {hasBackButton && (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Volver a la pantalla anterior"
            accessibilityHint="Regresa a la pantalla principal"
          >
            <AccessibleText variant="title" weight="bold" color={theme.textPrimary}>
              ←
            </AccessibleText>
            <AccessibleText variant="body" weight="semibold" color={theme.textPrimary} style={styles.backLabel}>
              Atrás
            </AccessibleText>
          </Pressable>
        )}
      </View>

      <View style={styles.titleContainer}>
        <AccessibleText
          variant={subtitle ? 'title' : 'title'}
          weight="heavy"
          align="center"
          numberOfLines={1}
          adjustsFontSizeToFit
          color={theme.textPrimary}
        >
          {title}
        </AccessibleText>
        {subtitle ? (
          <AccessibleText
            variant="caption"
            weight="bold"
            align="center"
            numberOfLines={1}
            color={theme.learning}
          >
            {subtitle}
          </AccessibleText>
        ) : null}
      </View>

      <View style={styles.rightContainer}>
        {rightAction ? (
          rightAction
        ) : (
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.themeToggle,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <AccessibleText variant="body" weight="bold">
              {isDark ? '☀️ Claro' : '🌙 Oscuro'}
            </AccessibleText>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  leftContainer: {
    minWidth: 80,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  emptyLeftContainer: {
    minWidth: 80,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  rightContainer: {
    minWidth: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    minHeight: 44,
    minWidth: 72,
    justifyContent: 'center',
  },
  backLabel: {
    marginLeft: 4,
  },
  themeToggle: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    minHeight: 44,
    minWidth: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
