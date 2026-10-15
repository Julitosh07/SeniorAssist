import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderBar } from '../../components/HeaderBar';
import { AccessibleText } from '../../components/AccessibleText';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleCard } from '../../components/AccessibleCard';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../constants/theme';

export const SettingsView: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Ajustes y Ayuda" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <AccessibleCard elevated>
          <AccessibleText variant="title" weight="heavy">
            Contraste de Pantalla
          </AccessibleText>
          <AccessibleText variant="bodyLarge" weight="medium" color={theme.textSecondary} style={styles.cardDesc}>
            Actualmente está en modo: {isDark ? 'Oscuro (Letras blancas, fondo negro)' : 'Claro (Letras negras, fondo claro)'}
          </AccessibleText>
          <AccessibleButton
            title={isDark ? 'Cambiar a Modo Claro ☀️' : 'Cambiar a Modo Oscuro 🌙'}
            variant="secondary"
            minHeight={64}
            onPress={toggleTheme}
          />
        </AccessibleCard>

        <AccessibleCard elevated>
          <AccessibleText variant="title" weight="heavy">
            Identificador Seguro de la Aplicación
          </AccessibleText>
          <AccessibleText variant="body" weight="medium" color={theme.textSecondary} style={styles.cardDesc}>
            SeniorAssist está configurado con acceso directo sin requerir usuario ni contraseña manual.
          </AccessibleText>
        </AccessibleCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  cardDesc: {
    marginVertical: spacing.sm,
  },
});
