import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSOSViewModel } from '../../viewmodels/useSOSViewModel';
import { HeaderBar } from '../../components/HeaderBar';
import { AccessibleText } from '../../components/AccessibleText';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleCard } from '../../components/AccessibleCard';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../constants/theme';
import { callService } from '../../services/CallService';

export const SOSView: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { emergencyContact, isActivating, sosResult, triggerSOS } = useSOSViewModel();

  const handleCall123 = async () => {
    await callService.makeCall('123', 'Línea de Emergencias 123');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Emergencia SOS" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <AccessibleCard style={{ borderColor: theme.emergency }}>
          <AccessibleText variant="title" weight="heavy" color={theme.emergency}>
            🚨 Botón de Auxilio Inmediato
          </AccessibleText>
          <AccessibleText variant="bodyLarge" weight="medium" style={styles.cardText}>
            Presiona el botón rojo para enviar tu ubicación GPS por mensaje de texto a tu familia e iniciar una llamada de socorro.
          </AccessibleText>
        </AccessibleCard>

        {/* Botón Gigante de Auxilio */}
        <View style={styles.bigButtonWrapper}>
          <AccessibleButton
            title={isActivating ? '⏳ ENVIANDO ALERTA...' : '🚨 PEDIR AUXILIO AHORA'}
            subtitle={isActivating ? 'Obteniendo GPS y llamando' : 'Toca para enviar auxilio inmediato'}
            variant="emergency"
            minHeight={120}
            onPress={triggerSOS}
            disabled={isActivating}
            accessibilityLabel="Botón de emergencia para pedir auxilio"
            accessibilityHint="Envía tu ubicación exacta por mensaje y llama a tu contacto de emergencia"
          />
        </View>

        {/* Notificación de envío de socorro */}
        {sosResult ? (
          <AccessibleCard elevated style={{ borderColor: theme.success }}>
            <AccessibleText variant="title" weight="heavy" color={theme.success}>
              ✅ Alerta de Socorro Enviada
            </AccessibleText>
            <AccessibleText variant="body" weight="medium" color={theme.textSecondary} style={styles.cardText}>
              • Mensaje de auxilio con GPS preparado para: {sosResult.contact ? sosResult.contact.name : 'Contacto configurado'}
            </AccessibleText>
            <AccessibleText variant="caption" weight="bold" color={theme.primary}>
              Ubicación: {sosResult.location.latitude.toFixed(4)}, {sosResult.location.longitude.toFixed(4)}
            </AccessibleText>
          </AccessibleCard>
        ) : null}

        {/* Contactos de Emergencia Vinculados */}
        <AccessibleText variant="title" weight="heavy" color={theme.textPrimary} style={styles.sectionTitle}>
          Tus Contactos de Emergencia:
        </AccessibleText>

        <AccessibleCard elevated>
          <AccessibleText variant="title" weight="bold">
            {emergencyContact ? emergencyContact.name : 'Cargando contacto...'}
          </AccessibleText>
          <AccessibleText variant="bodyLarge" weight="medium" color={theme.textSecondary}>
            Parentesco: {emergencyContact?.relationship || 'Contacto principal'}
          </AccessibleText>
          <AccessibleText variant="body" weight="bold" color={theme.primary}>
            Teléfono: {emergencyContact?.phoneNumber || 'No configurado'}
          </AccessibleText>

          {emergencyContact ? (
            <View style={styles.callContactBtn}>
              <AccessibleButton
                title={`📞 Llamar a ${emergencyContact.name}`}
                variant="primary"
                minHeight={60}
                onPress={() => callService.makeCall(emergencyContact.phoneNumber, emergencyContact.name)}
              />
            </View>
          ) : null}
        </AccessibleCard>

        {/* Botón de Emergencia Nacional 123 */}
        <View style={styles.emergency123Wrapper}>
          <AccessibleButton
            title="🚑 Llamar a Emergencias (123)"
            subtitle="Policía, Ambulancia y Bomberos"
            variant="secondary"
            minHeight={72}
            onPress={handleCall123}
          />
        </View>
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
  },
  cardText: {
    marginTop: spacing.xs,
  },
  bigButtonWrapper: {
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  callContactBtn: {
    marginTop: spacing.md,
  },
  emergency123Wrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
