import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFlashlightViewModel } from '../../viewmodels/useFlashlightViewModel';
import { HeaderBar } from '../../components/HeaderBar';
import { AccessibleText } from '../../components/AccessibleText';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleCard } from '../../components/AccessibleCard';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius } from '../../constants/theme';

export const FlashlightView: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { isOn, toggle, isListeningVoice, voiceFeedback, handleVoiceCommand } = useFlashlightViewModel(() => navigation.goBack());

  return (
    <View style={[styles.container, { backgroundColor: isOn ? '#FFFFFF' : theme.background }]}>
      <HeaderBar title="Linterna" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <AccessibleCard style={{ borderColor: theme.flashlight }}>
          <AccessibleText variant="title" weight="heavy" color={theme.flashlight}>
            {isOn ? '💡 Linterna Encendida' : '🌑 Linterna Apagada'}
          </AccessibleText>
          <AccessibleText variant="bodyLarge" weight="medium" style={styles.cardText}>
            {isOn
              ? 'La luz está iluminando tu camino. Toca el botón o usa la voz para apagarla.'
              : 'Presiona el botón grande o usa tu voz para iluminar lugares oscuros.'}
          </AccessibleText>
          {voiceFeedback ? (
            <AccessibleText variant="body" weight="bold" style={{ marginTop: 8, color: '#2563EB' }}>
              🎙️ {voiceFeedback}
            </AccessibleText>
          ) : null}
        </AccessibleCard>

        {/* Efecto visual de antorcha / reflector */}
        <View
          style={[
            styles.bulbCircle,
            {
              backgroundColor: isOn ? '#FEF08A' : theme.surfaceElevated,
              borderColor: isOn ? '#FACC15' : theme.border,
            },
          ]}
        >
          <AccessibleText style={styles.bulbIcon}>
            {isOn ? '🔦' : '💡'}
          </AccessibleText>
          <AccessibleText
            variant="hero"
            weight="heavy"
            color={isOn ? '#854D0E' : theme.textSecondary}
          >
            {isOn ? 'LUZ ACTIVA' : 'APAGADA'}
          </AccessibleText>
        </View>

        <View style={styles.buttonWrapper}>
          <AccessibleButton
            title={isOn ? '🛑 APAGAR LINTERNA' : '✨ ENCENDER LINTERNA'}
            subtitle={isOn ? 'Presiona para apagar la luz' : 'Presiona para iluminar'}
            variant={isOn ? 'secondary' : 'flashlight'}
            minHeight={80}
            onPress={toggle}
            accessibilityLabel={isOn ? 'Apagar la linterna' : 'Encender la linterna'}
            accessibilityHint="Controla la luz de tu teléfono"
            style={{ marginBottom: 12 }}
          />

          <AccessibleButton
            title={isListeningVoice ? '🎙️ Escuchando orden...' : '🎙️ CONTROL POR VOZ'}
            subtitle={isListeningVoice ? 'Di "apagar linterna" o "salir"' : 'Toca y di "apagar", "encender" o "salir"'}
            variant={isListeningVoice ? 'secondary' : 'primary'}
            minHeight={75}
            onPress={handleVoiceCommand}
            accessibilityLabel="Controlar linterna por voz"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardText: {
    marginTop: spacing.xs,
  },
  bulbCircle: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.full,
    borderWidth: 4,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bulbIcon: {
    fontSize: 64,
    marginBottom: 4,
  },
  buttonWrapper: {
    marginBottom: spacing.xl,
  },
});
