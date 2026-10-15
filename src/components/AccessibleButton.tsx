import React from 'react';
import { 
  Pressable, 
  StyleSheet, 
  ViewStyle, 
  StyleProp, 
  Platform 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AccessibleText } from './AccessibleText';
import { borderRadius, spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

export interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'emergency' | 'flashlight' | 'magnifier' | 'radio' | 'learning' | 'alarms' | 'secondary';
  icon?: React.ReactNode;
  subtitle?: string;
  disabled?: boolean;
  minHeight?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  subtitle,
  disabled = false,
  minHeight = 64, // Superior al requisito mínimo de 48dp para adultos mayores
  style,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  const lastPressTime = React.useRef<number>(0);

  const handlePress = async () => {
    if (disabled) return;
    const now = Date.now();
    if (now - lastPressTime.current < 600) {
      // Antirrebote: evitar ejecución repetida por doble toque accidental
      return;
    }
    lastPressTime.current = now;

    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // Si haptics no está disponible en la plataforma, continuar
    }
    onPress();
  };

  // Asignar colores según variante
  const getColors = () => {
    switch (variant) {
      case 'emergency':
        return { bg: theme.emergency, text: theme.emergencyContrast, border: '#7F1D1D' };
      case 'flashlight':
        return { bg: theme.flashlight, text: theme.flashlightContrast, border: '#78350F' };
      case 'magnifier':
        return { bg: theme.magnifier, text: theme.magnifierContrast, border: '#0C4A6E' };
      case 'radio':
        return { bg: theme.radio, text: theme.radioContrast, border: '#4C1D95' };
      case 'learning':
        return { bg: theme.learning, text: theme.learningContrast, border: '#064E3B' };
      case 'alarms':
        return { bg: theme.alarms, text: theme.alarmsContrast, border: '#7C2D12' };
      case 'secondary':
        return { bg: theme.surfaceElevated, text: theme.textPrimary, border: theme.border };
      case 'primary':
      default:
        return { bg: theme.primary, text: theme.primaryContrast, border: '#1E3A8A' };
    }
  };

  const { bg, text, border } = getColors();

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? theme.border : bg,
          borderColor: border,
          minHeight,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {icon && <>{icon}</>}
      <AccessibleText
        variant="button"
        weight="bold"
        color={disabled ? theme.textSecondary : text}
        align="center"
      >
        {title}
      </AccessibleText>
      {subtitle ? (
        <AccessibleText
          variant="caption"
          weight="medium"
          color={disabled ? theme.textSecondary : text}
          align="center"
          style={styles.subtitle}
        >
          {subtitle}
        </AccessibleText>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.9,
  },
});
